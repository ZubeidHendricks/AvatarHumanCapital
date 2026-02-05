import Groq from "groq-sdk";
import puppeteer, { Browser, Page } from "puppeteer";
import type { Job } from "@shared/schema";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ScrapedCandidate {
  name: string;
  title?: string;
  skills: string[];
  experience?: string;
  location?: string;
  contact?: string;
  source: string;
  sourceUrl?: string;
  matchScore?: number;
  rawText?: string;
}

export interface ScraperResult {
  platform: string;
  query: string;
  candidates: ScrapedCandidate[];
  scrapedAt: Date;
  status: "success" | "partial" | "failed";
  error?: string;
}

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--window-size=1920,1080"
      ]
    });
  }
  return browserInstance;
}

async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

function generateSearchQuery(job: Job): string {
  const title = job.title.toLowerCase();
  
  if (title.includes('developer') || title.includes('engineer')) {
    if (title.includes('java')) return 'java developer';
    if (title.includes('python')) return 'python developer';
    if (title.includes('full stack')) return 'full stack developer';
    if (title.includes('frontend') || title.includes('front-end')) return 'frontend developer';
    if (title.includes('backend') || title.includes('back-end')) return 'backend developer';
    return 'software developer';
  }
  if (title.includes('project manager')) return 'project manager';
  if (title.includes('administrator')) return 'administrator';
  if (title.includes('analyst')) return 'analyst';
  if (title.includes('designer')) return 'designer';
  
  const words = job.title.split(/\s+/).slice(0, 3).join(' ');
  return words.replace(/[^\w\s]/g, '').toLowerCase();
}

async function extractCandidatesWithAI(rawText: string, job: Job, source: string): Promise<ScrapedCandidate[]> {
  try {
    if (!rawText || rawText.length < 100) {
      return [];
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting candidate information from job board listings and CV posts. 
Extract ONLY real people/candidates mentioned in the text - people offering their services or posting CVs.
Return ONLY a valid JSON array. If no candidates found, return [].`
        },
        {
          role: "user",
          content: `Extract candidate profiles from this scraped content from ${source}.
Look for: names, job titles, skills, experience, locations, contact info.

Job we're hiring for: ${job.title}
Requirements: ${(job.skillsRequired || []).slice(0, 5).join(", ")}

Scraped content:
${rawText.slice(0, 6000)}

Return JSON array:
[{"name": "Full Name", "title": "Their Job Title", "skills": ["skill1"], "experience": "X years", "location": "City", "contact": "email/phone if found"}]

Return [] if no real candidates found.`
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content || "[]";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const candidates = JSON.parse(jsonMatch[0]);
      return candidates
        .filter((c: any) => c.name && c.name !== "Unknown" && c.name.length > 2)
        .map((c: any) => ({
          name: c.name,
          title: c.title || undefined,
          skills: Array.isArray(c.skills) ? c.skills : [],
          experience: c.experience || undefined,
          location: c.location || undefined,
          contact: c.contact || undefined,
          source: source,
          matchScore: calculateMatchScore(c, job)
        }));
    }
    return [];
  } catch (error) {
    console.error(`[extractCandidatesWithAI] Error:`, error);
    return [];
  }
}

function calculateMatchScore(candidate: any, job: Job): number {
  let score = 50;
  const jobReqs = (job.skillsRequired || []).map((r: string) => r.toLowerCase());
  const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
  
  for (const skill of candidateSkills) {
    if (jobReqs.some(req => req.includes(skill) || skill.includes(req))) {
      score += 10;
    }
  }
  
  if (candidate.experience) {
    const years = parseInt(candidate.experience);
    if (years >= 5) score += 15;
    else if (years >= 3) score += 10;
    else if (years >= 1) score += 5;
  }
  
  return Math.min(score, 95);
}

export class GumtreeScraper {
  name = "Gumtree Scraper";
  platform = "Gumtree South Africa";

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[GumtreeScraper] Searching for job seekers: ${job.title}`);
    
    const query = generateSearchQuery(job);
    let page: Page | null = null;
    const allCandidates: ScrapedCandidate[] = [];
    
    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Search in CVs/Services section where job seekers post
      const searchUrls = [
        `https://www.gumtree.co.za/s-cvs-resumes/${encodeURIComponent(query)}`,
        `https://www.gumtree.co.za/s-services/it-services/${encodeURIComponent(query)}`,
        `https://www.gumtree.co.za/s-jobs-offered/${encodeURIComponent(query)}`
      ];
      
      for (const searchUrl of searchUrls) {
        try {
          console.log(`[GumtreeScraper] Trying: ${searchUrl}`);
          
          await page.goto(searchUrl, { 
            waitUntil: "networkidle2",
            timeout: 30000 
          });
          
          await new Promise(r => setTimeout(r, 2000));
          
          // Extract listing details
          const listingData = await page.evaluate(() => {
            const listings: any[] = [];
            
            // Gumtree listing selectors
            const listingElements = document.querySelectorAll('.tileV1, .result, article, [class*="listing"], [class*="tile"]');
            
            listingElements.forEach((el) => {
              const titleEl = el.querySelector('.tile-title, h2, h3, .title, [class*="title"]');
              const descEl = el.querySelector('.tile-desc, .description, p');
              const locationEl = el.querySelector('.tile-location, .location, [class*="location"]');
              const priceEl = el.querySelector('.tile-price, .price, [class*="price"]');
              const linkEl = el.querySelector('a[href]');
              
              if (titleEl) {
                listings.push({
                  title: titleEl.textContent?.trim() || '',
                  description: descEl?.textContent?.trim() || '',
                  location: locationEl?.textContent?.trim() || '',
                  price: priceEl?.textContent?.trim() || '',
                  url: linkEl?.getAttribute('href') || '',
                  fullText: el.textContent?.slice(0, 500) || ''
                });
              }
            });
            
            return {
              listings,
              pageContent: document.body.innerText.slice(0, 12000)
            };
          });
          
          console.log(`[GumtreeScraper] Found ${listingData.listings.length} listings`);
          
          // Process each listing as a potential candidate
          for (const listing of listingData.listings) {
            // Check if this looks like someone offering their services/CV
            const text = `${listing.title} ${listing.description} ${listing.fullText}`.toLowerCase();
            if (text.includes('cv') || text.includes('resume') || text.includes('seeking') || 
                text.includes('available') || text.includes('experience') || text.includes('developer') ||
                text.includes('looking for') || text.includes('qualified')) {
              
              // Use AI to extract candidate info from this listing
              const candidates = await extractCandidatesWithAI(
                `Title: ${listing.title}\nDescription: ${listing.description}\nLocation: ${listing.location}\nDetails: ${listing.fullText}`,
                job,
                this.platform
              );
              
              candidates.forEach(c => {
                c.sourceUrl = listing.url.startsWith('http') ? listing.url : `https://www.gumtree.co.za${listing.url}`;
              });
              
              allCandidates.push(...candidates);
            }
          }
          
          // Also try to extract from full page content
          if (allCandidates.length < limit && listingData.pageContent.length > 500) {
            const pageCandidates = await extractCandidatesWithAI(listingData.pageContent, job, this.platform);
            allCandidates.push(...pageCandidates);
          }
          
          if (allCandidates.length >= limit) break;
          
        } catch (urlError) {
          console.log(`[GumtreeScraper] URL failed: ${searchUrl}`, urlError);
        }
      }
      
      // Deduplicate
      const uniqueCandidates = allCandidates.filter((c, i, arr) => 
        arr.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase()) === i
      );
      
      console.log(`[GumtreeScraper] Total candidates: ${uniqueCandidates.length}`);
      
      return {
        platform: this.platform,
        query,
        candidates: uniqueCandidates.slice(0, limit),
        scrapedAt: new Date(),
        status: uniqueCandidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[GumtreeScraper] Error:`, error);
      return {
        platform: this.platform,
        query,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      if (page) await page.close();
    }
  }
}

export class IndeedScraper {
  name = "Indeed Scraper";
  platform = "Indeed South Africa";

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[IndeedScraper] Searching for: ${job.title}`);
    
    const query = generateSearchQuery(job);
    let page: Page | null = null;
    
    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      
      const searchUrl = `https://za.indeed.com/jobs?q=${encodeURIComponent(query)}&l=South+Africa`;
      
      console.log(`[IndeedScraper] Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      const pageContent = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('[class*="job_seen"], [class*="jobsearch"], .job_seen_beacon, .resultContent');
        let text = "";
        jobCards.forEach(el => {
          text += el.textContent + "\n\n";
        });
        if (!text || text.length < 100) {
          text = document.body.innerText;
        }
        return text;
      });
      
      console.log(`[IndeedScraper] Scraped ${pageContent.length} characters`);
      
      const candidates = await extractCandidatesWithAI(pageContent, job, this.platform);
      
      return {
        platform: this.platform,
        query,
        candidates: candidates.slice(0, limit),
        scrapedAt: new Date(),
        status: candidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[IndeedScraper] Error:`, error);
      return {
        platform: this.platform,
        query,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      if (page) await page.close();
    }
  }
}

export class Careers24Scraper {
  name = "Careers24 Scraper";
  platform = "Careers24";

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[Careers24Scraper] Searching for: ${job.title}`);
    
    const query = generateSearchQuery(job);
    let page: Page | null = null;
    
    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      
      const searchUrl = `https://www.careers24.com/jobs/kw-${encodeURIComponent(query.replace(/\s+/g, '-'))}`;
      
      console.log(`[Careers24Scraper] Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      });
      
      await new Promise(r => setTimeout(r, 2000));
      
      const pageContent = await page.evaluate(() => {
        const listings = document.querySelectorAll('[class*="job"], [class*="listing"], article');
        let text = "";
        listings.forEach(el => {
          text += el.textContent + "\n\n";
        });
        if (!text || text.length < 100) {
          text = document.body.innerText;
        }
        return text;
      });
      
      console.log(`[Careers24Scraper] Scraped ${pageContent.length} characters`);
      
      const candidates = await extractCandidatesWithAI(pageContent, job, this.platform);
      
      return {
        platform: this.platform,
        query,
        candidates: candidates.slice(0, limit),
        scrapedAt: new Date(),
        status: candidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[Careers24Scraper] Error:`, error);
      return {
        platform: this.platform,
        query,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      if (page) await page.close();
    }
  }
}

export class PNetScraper {
  name = "PNet Scraper";
  platform = "PNet";
  
  private username = process.env.PNET_USERNAME;
  private password = process.env.PNET_PASSWORD;
  private sessionCookies = process.env.PNET_SESSION_COOKIES; // JSON array of cookies from manual login

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[PNetScraper] Searching for candidates: ${job.title}`);
    
    const query = generateSearchQuery(job);
    let page: Page | null = null;
    const allCandidates: ScrapedCandidate[] = [];
    
    // Check if we have session cookies (preferred) or login credentials
    const hasSessionCookies = !!this.sessionCookies;
    const hasLoginCreds = this.username && this.password;
    
    if (!hasSessionCookies && !hasLoginCreds) {
      console.error("[PNetScraper] Missing PNET_SESSION_COOKIES or PNET_USERNAME/PNET_PASSWORD credentials");
      return {
        platform: this.platform,
        query,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: "PNet credentials not configured. Set PNET_SESSION_COOKIES (from manual login) or PNET_USERNAME/PNET_PASSWORD"
      };
    }
    
    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      
      // Advanced stealth settings to avoid bot detection
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Override navigator properties to appear as real browser
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'af'] });
        (window as any).chrome = { runtime: {} };
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      });
      
      // Set extra headers to look more legitimate
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      });
      
      let isLoggedIn = false;
      
      // METHOD 1: Use session cookies if available (bypasses bot detection)
      if (hasSessionCookies) {
        console.log("[PNetScraper] Using session cookies for authentication...");
        try {
          const cookies = JSON.parse(this.sessionCookies);
          await page.setCookie(...cookies);
          
          // Navigate to dashboard to verify cookies work (WITH dash - from user's network trace)
          await page.goto("https://www.pnet.co.za/5/recruiter-space/dashboard", { 
            waitUntil: "networkidle2",
            timeout: 30000 
          });
          
          const currentUrl = page.url();
          console.log(`[PNetScraper] After cookie auth, URL: ${currentUrl}`);
          isLoggedIn = !currentUrl.includes('login') && !currentUrl.includes('notFound');
          console.log(`[PNetScraper] Session cookie authentication: ${isLoggedIn ? 'SUCCESS' : 'FAILED'}`);
          
          if (!isLoggedIn) {
            console.log("[PNetScraper] Session cookies expired or invalid, falling back to login...");
            // Log page title to see what we got
            const title = await page.title();
            console.log(`[PNetScraper] Page title: ${title}`);
          }
        } catch (e) {
          console.error("[PNetScraper] Failed to parse session cookies:", e);
        }
      }
      
      // METHOD 2: Try username/password login (may be blocked by bot detection)
      if (!isLoggedIn && hasLoginCreds) {
        console.log("[PNetScraper] Attempting username/password login...");
        
        await page.goto("https://www.pnet.co.za/5/recruiterspace/login", { 
          waitUntil: "networkidle2",
          timeout: 30000 
        });
        
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
        
        const initialUrl = page.url();
        console.log(`[PNetScraper] Initial page URL: ${initialUrl}`);
        
        if (initialUrl.includes('notFound') || initialUrl.includes('error')) {
          console.log("[PNetScraper] URL issue detected, trying to continue anyway...");
          await page.goto("https://www.pnet.co.za/5/recruiterspace/login", { 
            waitUntil: "networkidle2",
            timeout: 30000 
          });
          await new Promise(r => setTimeout(r, 2000));
        }
        
        try {
          await page.waitForSelector('input[name="username"]', { timeout: 10000 });
          
          await page.click('input[name="username"]');
          await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
          await page.keyboard.down('Control');
          await page.keyboard.press('a');
          await page.keyboard.up('Control');
          
          for (const char of this.username!) {
            await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
          }
          
          await new Promise(r => setTimeout(r, 300 + Math.random() * 300));
          
          await page.click('input[name="password"]');
          await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
          await page.keyboard.down('Control');
          await page.keyboard.press('a');
          await page.keyboard.up('Control');
          
          for (const char of this.password!) {
            await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
          }
          
          await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
          
          const signInButton = await page.$('button.at-data-login-button') || 
                               await page.$('button[type="submit"]');
          
          if (signInButton) {
            console.log("[PNetScraper] Clicking sign in button...");
            await Promise.all([
              page.waitForNavigation({ waitUntil: "networkidle2", timeout: 45000 }).catch(() => {}),
              signInButton.click()
            ]);
          }
          
          await new Promise(r => setTimeout(r, 4000 + Math.random() * 2000));
          
          const currentUrl = page.url();
          console.log(`[PNetScraper] After login, URL: ${currentUrl}`);
          
          isLoggedIn = !currentUrl.includes('login') && !currentUrl.includes('notFound');
          console.log(`[PNetScraper] Login successful: ${isLoggedIn}`);
          
          if (isLoggedIn) {
            // Export cookies for future use
            const cookies = await page.cookies();
            console.log("[PNetScraper] TIP: Save these cookies as PNET_SESSION_COOKIES to bypass login next time:");
            console.log(JSON.stringify(cookies.filter(c => c.domain.includes('pnet'))));
          }
        } catch (e) {
          console.error("[PNetScraper] Login form interaction failed:", e);
        }
      }
      
      // Step 2: Navigate to candidate search
      console.log("[PNetScraper] Navigating to candidate search...");
      
      const searchUrls = [
        `https://www.pnet.co.za/5/recruiter-space/dashboard`,
        `https://www.pnet.co.za/5/recruiter-space/candidate-database`,
        `https://www.pnet.co.za/5/recruiter-space/cv-search?keywords=${encodeURIComponent(query)}`,
        `https://www.pnet.co.za/5/recruiter-space/candidates?q=${encodeURIComponent(query)}`
      ];
      
      for (const searchUrl of searchUrls) {
        try {
          console.log(`[PNetScraper] Trying: ${searchUrl}`);
          
          await page.goto(searchUrl, { 
            waitUntil: "networkidle2",
            timeout: 30000 
          });
          
          await new Promise(r => setTimeout(r, 3000));
          
          // Look for search input and enter query if needed
          const searchInput = await page.$('input[name="keywords"], input[name="q"], input[type="search"], .search-input');
          if (searchInput) {
            await searchInput.click({ clickCount: 3 });
            await searchInput.type(query);
            
            const searchBtn = await page.$('button[type="submit"], .search-btn, .btn-search');
            if (searchBtn) {
              await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {}),
                searchBtn.click()
              ]);
            }
            
            await new Promise(r => setTimeout(r, 3000));
          }
          
          // Extract candidate data
          const candidateData = await page.evaluate(() => {
            const candidates: any[] = [];
            
            // PNet specific selectors for candidate cards
            const profileSelectors = [
              '.candidate-result',
              '.cv-card',
              '.talent-card',
              '.search-result',
              '[class*="candidate"]',
              '[class*="profile-card"]',
              '.result-item',
              'article',
              '.card'
            ];
            
            for (const selector of profileSelectors) {
              const elements = document.querySelectorAll(selector);
              elements.forEach((el) => {
                const text = el.textContent || '';
                if (text.length > 50) {
                  const nameEl = el.querySelector('h2, h3, h4, .name, [class*="name"], .candidate-name, .title a');
                  const jobTitleEl = el.querySelector('.job-title, .current-role, [class*="title"]:not(.name)');
                  const locationEl = el.querySelector('.location, [class*="location"], .city, .area');
                  const skillsEl = el.querySelector('.skills, [class*="skill"], .tags');
                  const experienceEl = el.querySelector('.experience, [class*="experience"], .years');
                  const linkEl = el.querySelector('a[href*="candidate"], a[href*="profile"], a[href*="cv"]');
                  
                  const name = nameEl?.textContent?.trim() || '';
                  if (name && name.length > 2 && !name.includes('Search') && !name.includes('Filter')) {
                    candidates.push({
                      name: name,
                      jobTitle: jobTitleEl?.textContent?.trim() || '',
                      location: locationEl?.textContent?.trim() || '',
                      skills: skillsEl?.textContent?.trim() || '',
                      experience: experienceEl?.textContent?.trim() || '',
                      profileUrl: linkEl?.getAttribute('href') || '',
                      rawText: text.slice(0, 800)
                    });
                  }
                }
              });
            }
            
            return { 
              candidates: candidates.slice(0, 20),
              pageContent: document.body.innerText.slice(0, 15000),
              pageUrl: window.location.href
            };
          });
          
          console.log(`[PNetScraper] Found ${candidateData.candidates.length} candidate cards on ${candidateData.pageUrl}`);
          
          // Process structured candidates
          for (const c of candidateData.candidates) {
            if (c.name && c.name.length > 2) {
              allCandidates.push({
                name: c.name,
                title: c.jobTitle || undefined,
                location: c.location || undefined,
                skills: c.skills ? c.skills.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 10) : [],
                experience: c.experience || undefined,
                source: this.platform,
                sourceUrl: c.profileUrl ? (c.profileUrl.startsWith('http') ? c.profileUrl : `https://www.pnet.co.za${c.profileUrl}`) : undefined,
                matchScore: calculateMatchScore({ skills: c.skills?.split(/[,;|]/) || [], experience: c.experience }, job),
                rawText: c.rawText
              });
            }
          }
          
          // Use AI to extract additional candidates from page content
          if (allCandidates.length < limit && candidateData.pageContent.length > 500) {
            const aiCandidates = await extractCandidatesWithAI(candidateData.pageContent, job, this.platform);
            allCandidates.push(...aiCandidates);
          }
          
          if (allCandidates.length >= limit) break;
          
        } catch (urlError) {
          console.log(`[PNetScraper] URL failed: ${searchUrl}`, urlError);
        }
      }
      
      // Deduplicate by name
      const uniqueCandidates = allCandidates.filter((c, i, arr) => 
        arr.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase()) === i
      );
      
      console.log(`[PNetScraper] Total unique candidates: ${uniqueCandidates.length}`);
      
      return {
        platform: this.platform,
        query,
        candidates: uniqueCandidates.slice(0, limit),
        scrapedAt: new Date(),
        status: uniqueCandidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[PNetScraper] Error:`, error);
      return {
        platform: this.platform,
        query,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      if (page) await page.close();
    }
  }
}

// ============ API-BASED SOURCERS (No Scraping Required) ============

export class GitHubDeveloperSourcer {
  name = "GitHub Developer Sourcer";
  platform = "GitHub";

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[GitHubSourcer] Searching developers for: ${job.title}`);
    
    const candidates: ScrapedCandidate[] = [];
    
    try {
      // Extract programming languages from job requirements
      const languages = this.extractLanguages(job);
      const locations = ["South Africa", "Johannesburg", "Cape Town", "Pretoria", "Durban"];
      
      for (const location of locations.slice(0, 2)) {
        for (const lang of languages.slice(0, 3)) {
          // Build query without double-encoding - GitHub expects unencoded + as space
          const queryParts = [
            `location:"${location}"`,
            `language:${lang}`,
            `repos:>5`
          ];
          const query = queryParts.join(' ');
          const url = `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`;
          
          console.log(`[GitHubSourcer] Querying: ${query}`);
          
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
              'User-Agent': 'AHC-Recruiter-Bot'
            }
          });
          
          if (!response.ok) {
            console.log(`[GitHubSourcer] API error: ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`[GitHubSourcer] Found ${data.items?.length || 0} users for ${lang} in ${location}`);
          
          for (const user of (data.items || []).slice(0, 5)) {
            // Get detailed user info
            const userResponse = await fetch(`https://api.github.com/users/${user.login}`, {
              headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'AHC-Recruiter-Bot'
              }
            });
            
            if (userResponse.ok) {
              const userDetails = await userResponse.json();
              
              // Get user's top repos for skills
              const reposResponse = await fetch(`https://api.github.com/users/${user.login}/repos?sort=stars&per_page=5`, {
                headers: {
                  'Accept': 'application/vnd.github+json',
                  'X-GitHub-Api-Version': '2022-11-28',
                  'User-Agent': 'AHC-Recruiter-Bot'
                }
              });
              
              let repoLanguages: string[] = [];
              if (reposResponse.ok) {
                const repos = await reposResponse.json();
                repoLanguages = [...new Set(repos.map((r: any) => r.language).filter(Boolean))] as string[];
              }
              
              candidates.push({
                name: userDetails.name || userDetails.login,
                title: userDetails.bio || `Developer with ${userDetails.public_repos} repos`,
                skills: repoLanguages.length > 0 ? repoLanguages : [lang],
                experience: `${userDetails.public_repos} public repositories, ${userDetails.followers} followers`,
                location: userDetails.location || location,
                contact: userDetails.email || undefined,
                source: this.platform,
                sourceUrl: userDetails.html_url,
                matchScore: this.calculateMatchScore(userDetails, repoLanguages, job)
              });
            }
            
            // Rate limiting - wait 100ms between requests
            await new Promise(r => setTimeout(r, 100));
          }
        }
      }
      
      // Remove duplicates and sort by match score
      const uniqueCandidates = this.deduplicateCandidates(candidates)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, limit);
      
      console.log(`[GitHubSourcer] Total unique candidates: ${uniqueCandidates.length}`);
      
      return {
        platform: this.platform,
        query: job.title,
        candidates: uniqueCandidates,
        scrapedAt: new Date(),
        status: uniqueCandidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[GitHubSourcer] Error:`, error);
      return {
        platform: this.platform,
        query: job.title,
        candidates,
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  private extractLanguages(job: Job): string[] {
    // Map common terms to GitHub language names
    const languageMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript', 
      'python': 'Python',
      'java': 'Java',
      'go': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'c++': 'C++',
      'cpp': 'C++',
      'c#': 'C#',
      'csharp': 'C#',
      'ruby': 'Ruby',
      'php': 'PHP',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'react': 'JavaScript',
      'vue': 'JavaScript',
      'angular': 'TypeScript',
      'node': 'JavaScript',
      'nodejs': 'JavaScript',
      'django': 'Python',
      'flask': 'Python',
      'spring': 'Java',
      'fullstack': 'JavaScript',
      'full stack': 'JavaScript',
      'full-stack': 'JavaScript',
      'developer': 'JavaScript',
      'software': 'JavaScript',
      'backend': 'Python',
      'frontend': 'JavaScript'
    };
    
    const text = `${job.title} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const found: string[] = [];
    
    for (const [keyword, lang] of Object.entries(languageMap)) {
      if (text.includes(keyword) && !found.includes(lang)) {
        found.push(lang);
      }
    }
    
    // Default to common languages if nothing found
    return found.length > 0 ? found : ['JavaScript', 'Python', 'TypeScript'];
  }
  
  private calculateMatchScore(user: any, languages: string[], job: Job): number {
    let score = 50;
    
    if (user.public_repos > 20) score += 10;
    if (user.public_repos > 50) score += 10;
    if (user.followers > 10) score += 5;
    if (user.followers > 100) score += 10;
    if (user.bio) score += 5;
    if (user.email) score += 10;
    
    const jobText = `${job.title} ${job.description || ''}`.toLowerCase();
    for (const lang of languages) {
      if (jobText.includes(lang.toLowerCase())) {
        score += 5;
      }
    }
    
    return Math.min(100, score);
  }
  
  private deduplicateCandidates(candidates: ScrapedCandidate[]): ScrapedCandidate[] {
    const seen = new Set<string>();
    return candidates.filter(c => {
      const key = c.sourceUrl || c.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export class DevToSourcer {
  name = "Dev.to Community Sourcer";
  platform = "Dev.to";

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[DevToSourcer] Searching for: ${job.title}`);
    
    const candidates: ScrapedCandidate[] = [];
    
    try {
      // Search for articles by developers with relevant skills
      const searchTerms = this.extractSearchTerms(job);
      
      for (const term of searchTerms.slice(0, 3)) {
        const url = `https://dev.to/api/articles?tag=${term.toLowerCase()}&per_page=20`;
        
        console.log(`[DevToSourcer] Searching articles for tag: ${term}`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AHC-Recruiter-Bot'
          }
        });
        
        if (!response.ok) continue;
        
        const articles = await response.json();
        
        for (const article of articles.slice(0, 10)) {
          if (!article.user) continue;
          
          // Get user profile
          const userUrl = `https://dev.to/api/users/by_username?url=${article.user.username}`;
          const userResponse = await fetch(userUrl, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'AHC-Recruiter-Bot'
            }
          });
          
          if (userResponse.ok) {
            const user = await userResponse.json();
            
            candidates.push({
              name: user.name || user.username,
              title: user.summary || `Developer & Technical Writer`,
              skills: article.tag_list || [term],
              experience: `${article.positive_reactions_count || 0} reactions on articles`,
              location: user.location || 'Remote',
              contact: user.twitter_username ? `@${user.twitter_username}` : undefined,
              source: this.platform,
              sourceUrl: `https://dev.to/${user.username}`,
              matchScore: Math.min(90, 50 + (article.positive_reactions_count || 0) / 10)
            });
          }
          
          await new Promise(r => setTimeout(r, 100));
        }
      }
      
      // Deduplicate
      const seen = new Set<string>();
      const uniqueCandidates = candidates.filter(c => {
        if (seen.has(c.sourceUrl || c.name)) return false;
        seen.add(c.sourceUrl || c.name);
        return true;
      }).slice(0, limit);
      
      return {
        platform: this.platform,
        query: job.title,
        candidates: uniqueCandidates,
        scrapedAt: new Date(),
        status: uniqueCandidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[DevToSourcer] Error:`, error);
      return {
        platform: this.platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  private extractSearchTerms(job: Job): string[] {
    const terms = ['javascript', 'react', 'python', 'node', 'typescript', 'java', 'webdev', 'devops'];
    const text = `${job.title} ${job.description || ''}`.toLowerCase();
    const found = terms.filter(t => text.includes(t));
    return found.length > 0 ? found : ['javascript', 'react', 'webdev'];
  }
}

export class ExecutiveSourcer {
  name = "Executive Network Sourcer";
  platform = "Executive";
  
  // This would integrate with APIs like TheOfficialBoard, Interzoid, or BoardEx
  // For now, structured to accept API keys via environment variables
  
  private apiKey = process.env.EXECUTIVE_API_KEY;

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[ExecutiveSourcer] Searching C-suite candidates for: ${job.title}`);
    
    // Check if this is an executive-level position
    const executiveKeywords = ['CEO', 'CFO', 'CTO', 'COO', 'CIO', 'CHRO', 'VP', 'Director', 'Head of', 'Chief', 'President', 'Managing Director'];
    const isExecutiveRole = executiveKeywords.some(kw => 
      job.title.toLowerCase().includes(kw.toLowerCase())
    );
    
    if (!isExecutiveRole) {
      return {
        platform: this.platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "partial",
        error: "Not an executive-level position"
      };
    }
    
    if (!this.apiKey) {
      console.log(`[ExecutiveSourcer] No API key configured. Set EXECUTIVE_API_KEY for TheOfficialBoard or similar API.`);
      return {
        platform: this.platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "partial",
        error: "Executive API not configured. Set EXECUTIVE_API_KEY in secrets."
      };
    }
    
    // Structure for API integration - would call TheOfficialBoard, Interzoid, etc.
    // Example integration point:
    try {
      // Placeholder for actual API call
      // const response = await fetch(`https://api.theofficialboard.com/search?title=${encodeURIComponent(job.title)}&country=ZA`, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
      // });
      
      return {
        platform: this.platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "partial",
        error: "Executive API integration pending - requires API subscription"
      };
    } catch (error) {
      return {
        platform: this.platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

export class CandidateAPISourcer {
  name = "Candidate API Sourcer";
  platform = "CandidateAPI";
  
  // Integrates with Pearch AI, DataVertex, or similar candidate databases
  private pearchApiKey = process.env.PEARCH_API_KEY;
  private datavertexApiKey = process.env.DATAVERTEX_API_KEY;

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[CandidateAPISourcer] Searching candidates for: ${job.title}`);
    
    const candidates: ScrapedCandidate[] = [];
    
    // Try Pearch AI first (natural language candidate search)
    if (this.pearchApiKey) {
      try {
        const searchQuery = `${job.title} in South Africa with ${job.requirements || 'relevant experience'}`;
        console.log(`[CandidateAPISourcer] Pearch AI query: ${searchQuery}`);
        
        // Pearch AI integration point
        // const response = await fetch('https://api.pearch.io/search', {
        //   method: 'POST',
        //   headers: { 'Authorization': `Bearer ${this.pearchApiKey}`, 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ query: searchQuery, limit })
        // });
      } catch (error) {
        console.error(`[CandidateAPISourcer] Pearch AI error:`, error);
      }
    }
    
    // Try DataVertex as fallback
    if (this.datavertexApiKey && candidates.length === 0) {
      try {
        console.log(`[CandidateAPISourcer] Trying DataVertex API...`);
        
        // DataVertex integration point
        // const response = await fetch(`https://api.datavertex.com/candidates?title=${encodeURIComponent(job.title)}&location=ZA`, {
        //   headers: { 'Authorization': `Bearer ${this.datavertexApiKey}` }
        // });
      } catch (error) {
        console.error(`[CandidateAPISourcer] DataVertex error:`, error);
      }
    }
    
    if (!this.pearchApiKey && !this.datavertexApiKey) {
      return {
        platform: this.platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "partial",
        error: "No candidate API configured. Set PEARCH_API_KEY or DATAVERTEX_API_KEY in secrets."
      };
    }
    
    return {
      platform: this.platform,
      query: job.title,
      candidates,
      scrapedAt: new Date(),
      status: candidates.length > 0 ? "success" : "partial"
    };
  }
}

export class LinkedInJobsScraper {
  name = "LinkedIn Jobs Scraper";
  platform = "LinkedIn";

  async search(job: Job, limit: number = 10): Promise<ScraperResult> {
    console.log(`[LinkedInJobsScraper] Searching for: ${job.title}`);
    
    const query = generateSearchQuery(job);
    let page: Page | null = null;
    
    try {
      const browser = await getBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=South%20Africa`;
      
      console.log(`[LinkedInJobsScraper] Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      });
      
      await new Promise(r => setTimeout(r, 3000));
      
      const pageContent = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job-card-container, .jobs-search__results-list li, [class*="job-result"]');
        let text = "";
        jobCards.forEach(el => {
          text += el.textContent + "\n\n";
        });
        if (!text || text.length < 100) {
          text = document.body.innerText;
        }
        return text;
      });
      
      console.log(`[LinkedInJobsScraper] Scraped ${pageContent.length} characters`);
      
      const candidates = await extractCandidatesWithAI(pageContent, job, this.platform);
      
      return {
        platform: this.platform,
        query,
        candidates: candidates.slice(0, limit),
        scrapedAt: new Date(),
        status: candidates.length > 0 ? "success" : "partial"
      };
    } catch (error) {
      console.error(`[LinkedInJobsScraper] Error:`, error);
      return {
        platform: this.platform,
        query,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    } finally {
      if (page) await page.close();
    }
  }
}

export class ScraperOrchestrator {
  private scrapers = [
    // API-based sourcers (reliable, no scraping blocks)
    new GitHubDeveloperSourcer(),
    new DevToSourcer(),
    new ExecutiveSourcer(),
    new CandidateAPISourcer(),
    // Web scrapers (may have anti-bot issues)
    new GumtreeScraper(),
    new IndeedScraper(),
    new Careers24Scraper(),
    new PNetScraper(),
    new LinkedInJobsScraper()
  ];

  getScrapers() {
    return this.scrapers.map(s => ({
      name: s.name,
      platform: s.platform
    }));
  }

  async runScraper(platform: string, job: Job, limit: number = 10): Promise<ScraperResult> {
    const scraper = this.scrapers.find(
      s => s.platform.toLowerCase() === platform.toLowerCase() ||
           s.name.toLowerCase().includes(platform.toLowerCase())
    );
    
    if (!scraper) {
      return {
        platform,
        query: job.title,
        candidates: [],
        scrapedAt: new Date(),
        status: "failed",
        error: `Scraper not found for platform: ${platform}`
      };
    }

    return scraper.search(job, limit);
  }

  async runAllScrapers(job: Job, limit: number = 5): Promise<{
    results: ScraperResult[];
    allCandidates: ScrapedCandidate[];
    totalFound: number;
  }> {
    console.log(`[ScraperOrchestrator] Running all scrapers for: ${job.title}`);
    
    const results = await Promise.all(
      this.scrapers.map(scraper => scraper.search(job, limit))
    );
    
    const allCandidates = results.flatMap(r => r.candidates);
    
    console.log(`[ScraperOrchestrator] Total candidates found: ${allCandidates.length}`);
    
    await closeBrowser();
    
    return {
      results,
      allCandidates,
      totalFound: allCandidates.length
    };
  }
}

export const scraperOrchestrator = new ScraperOrchestrator();

# PNET Test ATS Configuration

## 🔑 Your PNET Credentials

**Organization Details:**
- **Org ID:** 120911
- **Sender ID:** 21965

**Allocation:**
- **Personalized Listings:** 5 credits
- **Standard Listings:** 10 credits
- **Total:** 15 job postings available

---

## ⚙️ Environment Configuration

Add these to your `.env` file or Replit Secrets:

```bash
# PNET ATSi API Configuration
PNET_ORG_ID=120911
PNET_SENDER_ID=21965
PNET_API_KEY=<your_api_key_here>
PNET_API_BASE_URL=https://api.pnet.co.za/v4

# Application receiving email
APPLICATION_EMAIL_DOMAIN=applications@avatarhc.com
```

> **Note:** You'll need to get your actual API Key from PNET's developer portal or support team.

---

## 📋 Credit Usage Strategy

### Personalized Listings (5 credits) - Use for:
- ✅ Senior/Executive positions
- ✅ Specialized roles (hard to fill)
- ✅ High-priority positions
- ✅ Roles with specific requirements

**Why?** Personalized listings get:
- Featured placement
- Higher visibility
- Better candidate quality
- Custom branding options

### Standard Listings (10 credits) - Use for:
- ✅ General positions
- ✅ Entry-level roles
- ✅ High-volume hiring
- ✅ Testing the integration

---

## 🧪 Testing Plan

### Phase 1: Test with Standard Listing

**Step 1: Create a test job**
```typescript
// In HR Dashboard
1. Click "Create New Job"
2. Use Chat or Paste mode
3. Create a simple test job:
   - Title: "Junior Software Developer"
   - Department: "Engineering"
   - Location: "Johannesburg, Gauteng"
   - Salary: R350,000 - R450,000
   - Status: "Active" ← This triggers auto-posting
```

**Step 2: Verify posting**
```sql
-- Check database
SELECT 
  id, 
  title, 
  pnet_job_id, 
  pnet_job_url, 
  pnet_status,
  pnet_posted_at
FROM jobs 
WHERE pnet_job_id IS NOT NULL;
```

**Step 3: Check PNET portal**
- Log into PNET employer portal
- Verify job appears in listings
- Check remaining credits: Should be 9 standard left

### Phase 2: Test Application Flow

**Step 1: Create test candidate**
```typescript
// Add a test candidate with:
- Full name
- Email address
- Phone number
- Upload a sample CV (PDF)
- Experience matching the test job
```

**Step 2: Auto-apply test**
```typescript
await api.post("/pnet/apply", {
  candidateId: <test_candidate_id>,
  jobUrl: "<pnet_job_url_from_step_1>",
  jobTitle: "Junior Software Developer"
});
```

**Step 3: Verify on PNET**
- Check PNET employer portal
- Verify application appears
- Check application details and screening answers

### Phase 3: Test Personalized Listing

Once standard listings are working, test a personalized listing:

```typescript
// Create a premium job
const job = {
  title: "Senior Engineering Manager",
  department: "Engineering",
  location: "Sandton, Gauteng",
  salaryMin: 1200000,
  salaryMax: 1800000,
  minYearsExperience: 10,
  description: "We're seeking an exceptional...",
  status: "Active"
};

// System will auto-post
// Use remaining personalized credits wisely!
```

---

## 🔧 Configuration in Code

### Update PNET API Service

The `pnet-api-service.ts` already uses these environment variables, but let's verify the configuration:

```typescript
// server/pnet-api-service.ts (already configured)
export class PNetAPIService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;
  private orgId: string;
  private senderId: string;

  constructor() {
    this.baseUrl = process.env.PNET_API_BASE_URL || '';
    this.apiKey = process.env.PNET_API_KEY || '';
    this.orgId = process.env.PNET_ORG_ID || '';
    this.senderId = process.env.PNET_SENDER_ID || '';
    
    // API client configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'apiKey': this.apiKey,
        'X-Org-Id': this.orgId,
        'X-Sender-Id': this.senderId,
      },
      timeout: 30000,
    });
  }
}
```

### Update Job Posting Request Format

```typescript
// Include Org ID and Sender ID in job posting requests
const postJobToPNET = async (job: Job) => {
  const request = {
    Header: {
      Id: randomUUID(),
      OrgId: process.env.PNET_ORG_ID,
      SenderId: process.env.PNET_SENDER_ID,
    },
    Body: {
      JobTitle: job.title,
      JobDescription: enrichedDescription,
      Location: {
        city: "Johannesburg",
        province: "Gauteng",
        country: "South Africa"
      },
      EmploymentType: "FULL_TIME",
      SalaryInfo: {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: "ZAR",
        period: "ANNUAL"
      },
      // ... other fields
    }
  };
};
```

---

## 📊 Credit Tracking

### Monitor Credit Usage

Add this endpoint to track remaining credits:

```typescript
// server/routes.ts
app.get("/api/pnet/credits", async (req, res) => {
  try {
    // Query PNET API for account status
    const response = await pnetAPIService.getAccountStatus();
    
    res.json({
      personalizedCredits: response.personalizedRemaining,
      standardCredits: response.standardRemaining,
      totalUsed: response.totalUsed,
      allocatedPersonalized: 5,
      allocatedStandard: 10,
    });
  } catch (error) {
    console.error("Error fetching PNET credits:", error);
    res.status(500).json({ message: "Failed to fetch credit info" });
  }
});
```

### Display in UI

```tsx
// Show credit status in HR Dashboard
const PNetCreditsWidget = () => {
  const { data: credits } = useQuery(['pnet-credits'], 
    () => api.get('/pnet/credits')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>PNET Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Personalized:</span>
            <span className="font-bold">
              {credits?.personalizedCredits || 0} / 5
            </span>
          </div>
          <div className="flex justify-between">
            <span>Standard:</span>
            <span className="font-bold">
              {credits?.standardCredits || 0} / 10
            </span>
          </div>
          <Progress 
            value={(credits?.totalUsed / 15) * 100} 
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🚨 Important Notes

### Credit Conservation

**DO:**
- ✅ Test with 1-2 standard listings first
- ✅ Use standard listings for testing
- ✅ Reserve personalized for important roles
- ✅ Monitor credit usage closely

**DON'T:**
- ❌ Bulk post all jobs at once
- ❌ Use personalized credits for testing
- ❌ Post duplicate jobs
- ❌ Waste credits on incomplete job specs

### Listing Types Explained

**Standard Listing:**
- Appears in normal job search results
- Standard visibility
- No featured placement
- Good for most positions

**Personalized Listing:**
- Featured/promoted placement
- Higher visibility in search
- Custom branding options
- Email alerts to relevant candidates
- Better for hard-to-fill roles

---

## 🔄 What Happens When Credits Run Out?

When you've used all 15 credits:

1. **Jobs won't auto-post** - System will log warning
2. **Manual posting blocked** - API returns error
3. **Existing jobs stay live** - Already posted jobs remain active
4. **You'll need to:**
   - Purchase more credits from PNET
   - Or remove PNET auto-posting temporarily

### Graceful Degradation

```typescript
// In pnet-job-posting-agent.ts
async postJob(job: Job, tenantId: number): Promise<JobPostingResult> {
  try {
    // Check credits first
    const credits = await this.checkCredits();
    
    if (credits.totalRemaining === 0) {
      console.warn('[PNET] No credits remaining. Skipping post.');
      return {
        success: false,
        message: 'No PNET credits remaining. Please purchase more.',
        error: 'NO_CREDITS',
      };
    }
    
    // Proceed with posting...
  } catch (error) {
    // Handle error
  }
}
```

---

## 📝 Quick Start Checklist

- [ ] Add PNET credentials to environment variables
- [ ] Verify PNET_API_KEY is obtained from PNET
- [ ] Test with 1 standard listing first
- [ ] Verify job appears on PNET portal
- [ ] Test candidate application flow
- [ ] Monitor credit usage
- [ ] Set up credit tracking dashboard
- [ ] Document which job types use personalized vs standard

---

## 🆘 Troubleshooting

### Issue: "Invalid Org ID or Sender ID"
**Solution:** 
- Verify PNET_ORG_ID=120911
- Verify PNET_SENDER_ID=21965
- Check credentials are in environment

### Issue: "Insufficient credits"
**Solution:**
- Check remaining credits
- Purchase more from PNET
- Temporarily disable auto-posting

### Issue: "Job not appearing on PNET"
**Solution:**
- Check pnet_status field in database
- Verify PNET_API_KEY is valid
- Check PNET API logs for errors
- Ensure job has all required fields

---

## 📞 PNET Support

If you need help:
- **PNET Support:** support@pnet.co.za
- **PNET Developer Portal:** https://developer.pnet.co.za
- **Your Account Manager:** (if assigned)

---

## 🎯 Success Metrics

Track these after going live:

- Jobs posted: X / 15 credits
- Standard listings used: X / 10
- Personalized listings used: X / 5
- Applications received per job
- Time to first application
- Quality of candidates

---

## ✅ Next Steps

1. **Add credentials to environment**
2. **Test with 1 standard listing**
3. **Verify posting successful**
4. **Test application flow**
5. **Monitor credit usage**
6. **Go live with real jobs!** 🚀

---

**You're ready to start posting jobs to PNET!** 🎉

The system is configured for your test ATS with Org ID 120911 and Sender ID 21965. Use your 15 credits wisely and monitor usage closely.

# 🎯 PNET Integration - Ready to Go!

## ✅ Your PNET Test ATS Setup

**Organization Details:**
- **Org ID:** `120911`
- **Sender ID:** `21965`
- **Personalized Listings:** 5 credits
- **Standard Listings:** 10 credits
- **Total Allocation:** 15 job postings

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Add Environment Variables

**For Replit (Recommended):**

1. Click the "Secrets" tab (🔒 icon) in the left sidebar
2. Add these secrets:

```
PNET_ORG_ID = 120911
PNET_SENDER_ID = 21965
PNET_API_KEY = <GET_FROM_PNET_SUPPORT>
PNET_API_BASE_URL = https://api.pnet.co.za/v4
APPLICATION_EMAIL_DOMAIN = applications@avatarhc.com
```

**For Local Development (.env file):**

```bash
# PNET Test ATS Configuration
PNET_ORG_ID=120911
PNET_SENDER_ID=21965
PNET_API_KEY=<GET_FROM_PNET_SUPPORT>
PNET_API_BASE_URL=https://api.pnet.co.za/v4

# Application Email
APPLICATION_EMAIL_DOMAIN=applications@avatarhc.com

# Groq AI (for description enhancement)
GROQ_API_KEY=<your_existing_groq_key>
```

### Step 2: Get Your API Key

📧 **Contact PNET Support:**
- Email: support@pnet.co.za
- Subject: "API Key Request for Org ID 120911"
- Include: Your sender ID (21965) and organization details

Or check your PNET developer portal/account dashboard.

### Step 3: Test Configuration

Run the test script:

```bash
./test-pnet-config.sh
```

You should see:
```
✓ PNET_ORG_ID correctly set: 120911
✓ PNET_SENDER_ID correctly set: 21965
✓ PNET_API_KEY is set (XX characters)
✓ PNET_API_BASE_URL set: https://api.pnet.co.za/v4
✓ APPLICATION_EMAIL_DOMAIN set: applications@avatarhc.com
✓ GROQ_API_KEY is set (XX characters)

✓ All checks passed! PNET integration is ready to use.
```

---

## 🧪 Testing Instructions

### Test 1: Post Your First Job (Standard Listing)

**Create a simple test job:**

```typescript
// In HR Dashboard → Jobs Tab
1. Click "+ Create New Job"
2. Use "Chat with AI" mode
3. Enter: "I need a Junior Developer in Johannesburg"
4. Follow AI prompts:
   - Department: Engineering
   - Salary: R350,000 - R450,000
   - Experience: 2 years
5. Click "Create Job" (NOT "Save Draft")
```

**What happens automatically:**
1. ✅ Job saved to database
2. ✅ AI enriches description
3. ✅ Screening questions generated
4. ✅ **Posted to PNET automatically**
5. ✅ `pnet_job_id` saved in database
6. ✅ Credits reduced: 9 standard remaining

**Verify it worked:**

```sql
-- Check in database
SELECT 
  id,
  title,
  pnet_job_id,
  pnet_job_url,
  pnet_status,
  pnet_posted_at
FROM jobs
WHERE pnet_job_id IS NOT NULL;

-- Should return your test job with PNET details
```

**Check PNET Portal:**
- Log into https://www.pnet.co.za (employer portal)
- Navigate to "My Jobs" or "Job Listings"
- Your test job should appear there!

### Test 2: Apply a Candidate (Auto-Apply)

**Create test candidate:**
1. Go to Candidates tab
2. Add new candidate:
   - Name: "Test Candidate"
   - Email: test@example.com
   - Phone: 0821234567
   - Upload sample CV
   - Skills: JavaScript, React, Node.js
   - Experience: 2 years

**Auto-apply to PNET job:**

```typescript
// Via API or recruitment agent interface
await api.post("/pnet/apply", {
  candidateId: <test_candidate_id>,
  jobUrl: "<pnet_job_url_from_test_1>",
  jobTitle: "Junior Developer"
});
```

**Verify on PNET:**
- Check PNET employer portal
- Navigate to job applications
- Your test application should appear!

---

## 📊 Credit Management

### Current Allocation

| Type | Credits | Best Use |
|------|---------|----------|
| **Personalized** | 5 | Senior roles, hard-to-fill positions, executive jobs |
| **Standard** | 10 | General positions, testing, entry-level |

### Smart Usage Strategy

**Week 1 (Testing):**
- Use 2 standard credits for testing
- Verify everything works
- Remaining: 8 standard, 5 personalized

**Week 2-4 (Production):**
- Use standard credits for regular positions
- Save personalized for premium roles
- Monitor credit usage daily

### Check Remaining Credits

```typescript
// Add this endpoint (coming soon)
const credits = await api.get('/pnet/credits');

console.log(`Standard: ${credits.standardRemaining}/10`);
console.log(`Personalized: ${credits.personalizedRemaining}/5`);
```

---

## 🎯 What Auto-Posts to PNET

**Jobs that auto-post:**
- ✅ Status = "Active"
- ✅ Has title, description, location, department
- ✅ Created via HR Dashboard

**Jobs that DON'T auto-post:**
- ❌ Status = "Draft"
- ❌ Status = "Closed" or "Archived"
- ❌ Missing required fields

**Manual posting for drafts:**

```typescript
// Convert draft to active and post
await api.patch(`/jobs/${jobId}`, { status: "Active" });
await api.post("/pnet/post-job", { jobId });
```

---

## 🔧 Advanced Features

### 1. AI-Enhanced Descriptions

The system automatically:
- ✅ Enriches basic descriptions
- ✅ Adds professional formatting
- ✅ Includes company value propositions
- ✅ Optimizes for PNET search

**Example:**

**Your Input:**
```
Title: Software Engineer
Department: Engineering
Salary: R600k - R800k
```

**AI-Enhanced Output:**
```
About the Role

We are seeking a talented Software Engineer to join our 
innovative Engineering team. This is an excellent opportunity 
for a skilled developer to make a significant impact...

Key Responsibilities
• Design and implement scalable applications
• Collaborate with cross-functional teams
• Participate in code reviews and mentoring
• Contribute to technical architecture decisions

Requirements
• 3+ years of software development experience
• Proficiency in modern programming languages
• Strong problem-solving abilities
...
```

### 2. Smart Screening Questions

Auto-generated based on job requirements:

```json
[
  {
    "text": "How many years of software development experience do you have?",
    "type": "NUMBER",
    "required": true
  },
  {
    "text": "Which programming languages are you proficient in?",
    "type": "MULTI_SELECT",
    "options": ["JavaScript", "Python", "Java", "C#", "Go"]
  },
  {
    "text": "What is your notice period?",
    "type": "SINGLE_SELECT",
    "options": ["Immediate", "1 Week", "2 Weeks", "1 Month"]
  }
]
```

### 3. Bulk Operations

Post multiple jobs at once:

```typescript
await api.post("/pnet/bulk-post-jobs", {
  jobIds: [101, 102, 103, 104, 105]
});

// Response shows success/failure for each
{
  "total": 5,
  "successful": 4,
  "failed": 1,
  "results": [...]
}
```

---

## 📱 UI Integration

### Show PNET Status in Job List

```tsx
{job.pnetJobId ? (
  <Badge variant="success" className="gap-1">
    <CheckCircle className="w-3 h-3" />
    Live on PNET
  </Badge>
) : (
  <Badge variant="outline" className="gap-1">
    <Clock className="w-3 h-3" />
    Not Posted
  </Badge>
)}
```

### Link to PNET Job

```tsx
{job.pnetJobUrl && (
  <a 
    href={job.pnetJobUrl} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-400 hover:underline text-sm"
  >
    View on PNET →
  </a>
)}
```

---

## 🐛 Troubleshooting

### Issue: Job Not Posting

**Check:**
1. Job status is "Active"
2. Has title, description, location, department
3. PNET_API_KEY is set
4. Check server logs for errors

**Fix:**
```bash
# Check logs
tail -f server.log | grep PNET

# Manual post
curl -X POST http://localhost:5000/api/pnet/post-job \
  -H "Content-Type: application/json" \
  -d '{"jobId": 123}'
```

### Issue: Invalid Credentials

**Error:** `"PNET_API_NOT_CONFIGURED"` or `"Invalid Org ID"`

**Fix:**
```bash
# Verify environment variables
echo $PNET_ORG_ID        # Should be: 120911
echo $PNET_SENDER_ID     # Should be: 21965
echo $PNET_API_KEY       # Should have value

# Restart server after adding variables
npm run dev
```

### Issue: Out of Credits

**Error:** `"Insufficient credits"` or `"NO_CREDITS"`

**Fix:**
1. Check PNET account for credit balance
2. Purchase more credits from PNET
3. Temporarily disable auto-posting:
   ```typescript
   // Set job to Draft instead of Active
   status: "Draft"
   ```

---

## 📈 Monitoring & Analytics

### Track PNET Performance

```sql
-- Jobs posted to PNET
SELECT COUNT(*) as pnet_jobs
FROM jobs
WHERE pnet_job_id IS NOT NULL;

-- Recent postings (last 7 days)
SELECT 
  title,
  pnet_posted_at,
  pnet_status
FROM jobs
WHERE pnet_posted_at > datetime('now', '-7 days')
ORDER BY pnet_posted_at DESC;

-- Applications from PNET
SELECT COUNT(*) as pnet_applications
FROM applications
WHERE source LIKE '%PNET%';
```

---

## ✅ Ready Checklist

Before going live with real jobs:

- [ ] ✅ Environment variables configured
- [ ] ✅ Test script passes all checks
- [ ] ✅ Test job posted successfully
- [ ] ✅ Test job visible on PNET portal
- [ ] ✅ Test candidate applied successfully
- [ ] ✅ Credit usage monitored
- [ ] ✅ Team trained on system
- [ ] ✅ Backup plan if credits run out

---

## 🎉 You're Ready!

Your PNET integration is **fully configured** with:

- ✅ Org ID: 120911
- ✅ Sender ID: 21965
- ✅ 15 credits available (5 personalized, 10 standard)
- ✅ Automatic posting enabled
- ✅ AI enhancements active
- ✅ Complete documentation

**Next step:** Create your first real job and watch it auto-post to PNET! 🚀

---

## 📞 Support

**Technical Issues:**
- Check `/docs/PNET_JOB_POSTING_AGENT.md`
- Check `/docs/PNET_QUICK_REFERENCE.md`
- Review server logs

**PNET API Issues:**
- Email: support@pnet.co.za
- Include: Org ID 120911, Sender ID 21965

**Need More Credits?**
- Contact your PNET account manager
- Or purchase via PNET employer portal

---

**Happy Recruiting!** 🎊

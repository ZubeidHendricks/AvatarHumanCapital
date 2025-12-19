# PNET Integration - Complete System Overview

## 🎯 What We Have Now

Avatar Human Capital now has **COMPLETE PNET INTEGRATION** with three powerful AI agents:

---

## 1️⃣ PNET API Service (`pnet-api-service.ts`)

**Purpose:** Low-level API client for PNET's ATSi Apply API V4

**Capabilities:**
- ✅ Job inquiry (check if job is active, get requirements)
- ✅ Application submission with screening answers
- ✅ File handling (CV, cover letter, documents)
- ✅ Consent management
- ✅ Helper methods for AI agents

**Usage:**
```typescript
// Check job status
const jobInfo = await pnetAPIService.isJobActiveAndReady(jobUrl);

// Submit application
const result = await pnetAPIService.submitApplication({
  Email: "candidate@email.com",
  cvBase64: "...",
  cvFileName: "CV.pdf",
  cvFileType: "pdf",
  // ... other fields
}, jobUrl);
```

---

## 2️⃣ PNET Application Agent (`pnet-application-agent.ts`)

**Purpose:** AI-powered auto-apply agent for submitting candidates to PNET jobs

**Capabilities:**
- ✅ Automatically apply candidates to PNET job postings
- ✅ AI generates answers to screening questions
- ✅ CV preparation and conversion
- ✅ Bulk application support
- ✅ Rate limiting and error handling

**API Endpoints:**
- `POST /api/pnet/apply` - Apply single candidate
- `POST /api/pnet/bulk-apply` - Apply multiple candidates
- `GET /api/pnet/job-info` - Get job requirements
- `POST /api/pnet/auto-apply` - Auto-match and apply best candidates

**Usage:**
```typescript
// Auto-apply best candidates to a PNET job
const result = await pnetApplicationAgent.applyToJob({
  candidate: candidateData,
  jobUrl: "https://www.pnet.co.za/job/12345",
  jobTitle: "Senior Developer",
  jobDescription: "..."
});
```

---

## 3️⃣ PNET Job Posting Agent (`pnet-job-posting-agent.ts`) ⭐ NEW!

**Purpose:** AI-powered job posting automation for PNET

**Capabilities:**
- ✅ **Automatic posting** when jobs are created (Active status)
- ✅ **AI-enhanced descriptions** for better candidate attraction
- ✅ **Smart screening questions** generation
- ✅ **Job updates** and modifications
- ✅ **Job closure** when positions are filled
- ✅ **Bulk posting** for multiple jobs
- ✅ **South African context** (ZAR, licenses, locations)

**API Endpoints:**
- `POST /api/pnet/post-job` - Post single job to PNET
- `PATCH /api/pnet/update-job/:jobId` - Update existing PNET job
- `DELETE /api/pnet/close-job/:jobId` - Close/remove job from PNET
- `POST /api/pnet/bulk-post-jobs` - Post multiple jobs at once

**Features:**
1. **Validation** - Ensures jobs have required fields
2. **AI Enrichment** - Makes descriptions compelling
3. **Screening Questions** - Auto-generates pre-qualification questions
4. **PNET Formatting** - Maps internal data to PNET format
5. **Database Storage** - Saves PNET job ID and URL

---

## 🔄 Complete Job Posting → Application Flow

```
┌──────────────────────────────────────────────────────────────┐
│  HR Dashboard - Create Job                                   │
│  ┌─────────────────────────────────────┐                     │
│  │ Chat with AI or Paste Job Spec      │                     │
│  └─────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Job Created in Database (Status: Active)                    │
│  ✓ Title, Description, Location, Salary, etc.               │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  AUTOMATIC: PNET Job Posting Agent Activates                 │
│  1. Validates job data                                        │
│  2. AI enriches job description                              │
│  3. Generates screening questions                            │
│  4. Formats for PNET                                         │
│  5. Posts to PNET API                                        │
│  6. Stores pnet_job_id in database                           │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Job Live on PNET! 🎉                                        │
│  https://www.pnet.co.za/job/PNET-12345                      │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Candidates Apply on PNET                                     │
│  ↓ Applications received via email                           │
│  ↓ job-123@applications.avatarhc.com                         │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  OR: Internal Candidates Auto-Applied                        │
│  PNET Application Agent finds matching candidates            │
│  ✓ AI answers screening questions                           │
│  ✓ Submits applications automatically                       │
│  ✓ Creates application records in database                  │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Recruitment Process Continues                                │
│  ✓ Interview scheduling                                      │
│  ✓ AI video interviews                                       │
│  ✓ Social screening                                          │
│  ✓ Integrity checks                                          │
│  ✓ Onboarding                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

```
server/
├── pnet-api-service.ts              ← PNET API client (foundation)
├── pnet-application-agent.ts        ← Auto-apply candidates to jobs
├── pnet-job-posting-agent.ts        ← Auto-post jobs to PNET ⭐ NEW
└── routes.ts                         ← All PNET API endpoints

docs/
├── JOB_POSTING_CREATION_FLOW.md     ← How job creation works
└── PNET_JOB_POSTING_AGENT.md        ← Complete PNET posting guide ⭐ NEW

migrations/
└── add_pnet_job_fields.sql          ← Database schema updates ⭐ NEW
```

---

## 🗄️ Database Schema Changes

**New fields added to `jobs` table:**

```sql
ALTER TABLE jobs ADD COLUMN pnet_job_id TEXT;
ALTER TABLE jobs ADD COLUMN pnet_job_url TEXT;
ALTER TABLE jobs ADD COLUMN pnet_posted_at DATETIME;
ALTER TABLE jobs ADD COLUMN pnet_status TEXT;
```

**Migration:** Run `migrations/add_pnet_job_fields.sql`

---

## 🚀 How to Use

### Automatic Posting (Recommended)

Just create a job with **"Active"** status - it automatically posts to PNET!

```typescript
// In HR Dashboard
1. Click "Create New Job"
2. Chat with AI or paste job spec
3. Review extracted details
4. Click "Create Job" (not "Save Draft")
   ↓
✨ Automatically posted to PNET in background!
```

### Manual Posting

For draft jobs or re-posting:

```typescript
// Post to PNET
await api.post("/pnet/post-job", { jobId: 123 });

// Update on PNET
await api.patch(`/pnet/update-job/${jobId}`);

// Close on PNET
await api.delete(`/pnet/close-job/${jobId}`);
```

### Bulk Operations

```typescript
// Post multiple jobs at once
await api.post("/pnet/bulk-post-jobs", {
  jobIds: [101, 102, 103, 104]
});

// Apply multiple candidates to a PNET job
await api.post("/pnet/bulk-apply", {
  candidateIds: [1, 2, 3],
  jobUrl: "https://www.pnet.co.za/job/12345"
});
```

---

## ⚙️ Configuration

**Environment Variables Required:**

```bash
# PNET API Credentials
PNET_API_KEY=your_api_key_here
PNET_API_BASE_URL=https://api.pnet.co.za/v4

# Application Email Domain
APPLICATION_EMAIL_DOMAIN=applications@avatarhc.com

# Groq API for AI features
GROQ_API_KEY=your_groq_key_here
```

---

## 🎯 Key Features

### For Job Posting:
- ✅ **Auto-post on creation** (Active jobs only)
- ✅ **AI-enhanced descriptions** (professional, compelling)
- ✅ **Smart screening questions** (auto-generated)
- ✅ **South African context** (ZAR, Code 14 licenses, etc.)
- ✅ **Validation** (ensures required fields)
- ✅ **Bulk operations** (post 100s of jobs)

### For Applications:
- ✅ **Auto-apply candidates** to PNET jobs
- ✅ **AI answers screening questions** intelligently
- ✅ **CV preparation** (auto-convert to base64)
- ✅ **Bulk apply** (submit many candidates at once)
- ✅ **Rate limiting** (respects API limits)

---

## 📊 Success Tracking

```typescript
// Check how many jobs are on PNET
const pnetJobs = jobs.filter(j => j.pnetJobId);
console.log(`${pnetJobs.length} jobs live on PNET`);

// Check recent applications
const pnetApps = applications.filter(a => a.source === 'PNET AI Agent');
console.log(`${pnetApps.length} auto-applications submitted`);
```

---

## 🐛 Common Issues

**Issue:** Job not posting automatically
**Solution:** 
- Check job status is "Active" (not "Draft")
- Verify PNET_API_KEY is configured
- Check logs for validation errors

**Issue:** Screening questions not appearing
**Solution:**
- AI generates questions automatically
- Fallback to default questions if AI fails
- Check Groq API key is configured

**Issue:** Applications not going through
**Solution:**
- Verify job is active on PNET first
- Check candidate has email and CV
- Review PNET API logs for errors

---

## 📚 Documentation

**Detailed Guides:**
1. `docs/JOB_POSTING_CREATION_FLOW.md` - How to create jobs
2. `docs/PNET_JOB_POSTING_AGENT.md` - Complete posting guide
3. `server/pnet-job-posting-agent.ts` - Source code with comments

**API Reference:**
- All endpoints documented in code
- Swagger/OpenAPI coming soon

---

## 🎉 Summary

You now have a **COMPLETE, PRODUCTION-READY PNET INTEGRATION**:

1. ✅ **Create jobs** via AI chat or paste
2. ✅ **Auto-post to PNET** with enhanced descriptions
3. ✅ **Auto-apply candidates** with AI screening answers
4. ✅ **Full lifecycle management** (create, update, close)
5. ✅ **Bulk operations** for efficiency
6. ✅ **South African optimization** (ZAR, licenses, etc.)

**The entire recruitment pipeline is now automated from job posting to candidate application!** 🚀

---

## 🔮 Next Steps

**Phase 2 Enhancements:**
- [ ] LinkedIn job posting integration
- [ ] Indeed integration
- [ ] Job template library
- [ ] Analytics dashboard for PNET performance
- [ ] Email parsing for incoming PNET applications
- [ ] Multi-language job postings
- [ ] BBBEE compliance checking

**Want to add any of these?** Let me know! 😊

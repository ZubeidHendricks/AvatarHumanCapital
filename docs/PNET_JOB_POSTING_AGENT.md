# PNET Job Posting Agent - Complete Guide

## Overview
The **PNET Job Posting Agent** automatically posts job openings to PNET (South Africa's leading job board), making them visible to thousands of job seekers.

---

## 🎯 Features

### ✅ Automated Job Posting
- Posts jobs to PNET immediately after creation (if status is "Active")
- Enriches job descriptions with AI for better candidate attraction
- Generates intelligent screening questions
- Handles all PNET formatting requirements

### ✅ AI-Powered Enhancements
- **Job Description Enrichment**: Uses AI to create compelling, professional descriptions
- **Screening Questions**: Automatically generates relevant pre-qualification questions
- **Smart Mapping**: Converts internal job data to PNET format

### ✅ Full Job Lifecycle Management
- **Post**: Create new job postings on PNET
- **Update**: Modify existing PNET job postings
- **Close**: Remove/close jobs when filled
- **Bulk Operations**: Post multiple jobs at once

---

## 🚀 How It Works

### Automatic Posting on Job Creation

When you create a job in the HR Dashboard:

```
Job Created (Active Status)
         ↓
┌────────────────────────────────────┐
│ 1. Validate Job Data                │
│    - Title, description, location  │
│    - Department, employment type   │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 2. AI Enrichment                   │
│    - Enhance job description       │
│    - Make it compelling for PNET   │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 3. Generate Screening Questions    │
│    - Experience verification       │
│    - License/certification checks  │
│    - Availability & salary         │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 4. Format for PNET                 │
│    - Map employment types          │
│    - Convert salary to ZAR format  │
│    - Structure location data       │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 5. Post to PNET API                │
│    - Submit job posting request    │
│    - Receive PNET job ID & URL     │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 6. Store PNET Details              │
│    - Save pnet_job_id in database  │
│    - Save pnet_job_url for link    │
│    - Update pnet_posted_at time    │
└────────────────────────────────────┘
         ↓
✅ Job Live on PNET!
```

---

## 📂 File Structure

```
server/
├── pnet-job-posting-agent.ts    ← Main posting agent
├── pnet-api-service.ts           ← PNET API client
├── pnet-application-agent.ts     ← Auto-apply candidates
└── routes.ts                      ← API endpoints
```

---

## 🔧 API Endpoints

### 1. Post Job to PNET

**Endpoint:** `POST /api/pnet/post-job`

**Request:**
```json
{
  "jobId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job posted to PNET successfully",
  "pnetJobId": "PNET-1234567890",
  "pnetUrl": "https://www.pnet.co.za/job/PNET-1234567890"
}
```

**Usage:**
```typescript
// Manual posting (if automatic posting failed or for drafts)
const response = await api.post("/pnet/post-job", { jobId: 123 });
```

---

### 2. Update Job on PNET

**Endpoint:** `PATCH /api/pnet/update-job/:jobId`

**Response:**
```json
{
  "success": true,
  "message": "Job updated on PNET successfully",
  "pnetJobId": "PNET-1234567890"
}
```

**Usage:**
```typescript
// When you edit a job that's already on PNET
const response = await api.patch(`/pnet/update-job/${jobId}`);
```

---

### 3. Close Job on PNET

**Endpoint:** `DELETE /api/pnet/close-job/:jobId`

**Response:**
```json
{
  "success": true,
  "message": "Job closed on PNET successfully",
  "pnetJobId": "PNET-1234567890"
}
```

**Usage:**
```typescript
// When job is filled or archived
const response = await api.delete(`/pnet/close-job/${jobId}`);
```

---

### 4. Bulk Post Jobs

**Endpoint:** `POST /api/pnet/bulk-post-jobs`

**Request:**
```json
{
  "jobIds": [101, 102, 103, 104]
}
```

**Response:**
```json
{
  "total": 4,
  "successful": 3,
  "failed": 1,
  "results": [
    {
      "jobId": 101,
      "jobTitle": "Senior Developer",
      "success": true,
      "message": "Job posted to PNET successfully",
      "pnetJobId": "PNET-111"
    },
    {
      "jobId": 102,
      "jobTitle": "Sales Manager",
      "success": true,
      "message": "Job posted to PNET successfully",
      "pnetJobId": "PNET-222"
    },
    {
      "jobId": 103,
      "jobTitle": "Marketing Specialist",
      "success": true,
      "message": "Job posted to PNET successfully",
      "pnetJobId": "PNET-333"
    },
    {
      "jobId": 104,
      "jobTitle": "Driver",
      "success": false,
      "message": "Job validation failed: Location is required"
    }
  ]
}
```

---

## 🤖 AI Components

### 1. Job Description Enrichment

**What it does:**
- Takes basic job details and creates a professional, compelling description
- Structures content into clear sections
- Optimizes for PNET's format and South African context

**Example:**

**Input (Basic):**
```
Title: Senior Software Engineer
Department: Engineering
Location: Johannesburg
Salary: R850,000 - R1,200,000
Experience: 5 years
```

**Output (AI-Enhanced):**
```
About the Role

We are looking for a talented Senior Software Engineer to join our 
growing Engineering team in Johannesburg. This is an excellent 
opportunity for an experienced developer to make a significant impact.

Key Responsibilities
• Design and implement scalable web applications
• Mentor junior developers and conduct code reviews
• Participate in architecture decisions and technical planning
• Collaborate with cross-functional teams
• Ensure code quality and performance optimization

Requirements
• 5+ years of software development experience
• Strong proficiency in modern web technologies
• Experience with React, Node.js, and TypeScript
• Excellent problem-solving skills
• Strong communication and teamwork abilities

What We Offer
• Competitive salary: R850,000 - R1,200,000 per annum
• Medical aid and retirement benefits
• Flexible working arrangements
• Career growth and development opportunities
```

---

### 2. Screening Questions Generation

**What it does:**
- Analyzes job requirements
- Creates 3-5 relevant pre-qualification questions
- Includes license/certification verification
- Adds availability and salary expectation questions

**Example Questions:**

**For Software Engineer:**
```json
[
  {
    "id": "experience_years",
    "text": "How many years of experience do you have as a Senior Software Engineer?",
    "type": "NUMBER",
    "required": true
  },
  {
    "id": "tech_stack",
    "text": "Which of the following technologies do you have experience with?",
    "type": "MULTI_SELECT",
    "required": true,
    "options": [
      { "id": "react", "label": "React" },
      { "id": "nodejs", "label": "Node.js" },
      { "id": "typescript", "label": "TypeScript" },
      { "id": "postgresql", "label": "PostgreSQL" }
    ]
  },
  {
    "id": "notice_period",
    "text": "What is your notice period?",
    "type": "SINGLE_SELECT",
    "required": true,
    "options": [
      { "id": "immediate", "label": "Immediate" },
      { "id": "1week", "label": "1 Week" },
      { "id": "2weeks", "label": "2 Weeks" },
      { "id": "1month", "label": "1 Month" }
    ]
  }
]
```

**For Truck Driver:**
```json
[
  {
    "id": "experience_years",
    "text": "How many years of truck driving experience do you have?",
    "type": "NUMBER",
    "required": true
  },
  {
    "id": "licenses",
    "text": "Do you have a valid Code 14 driver's license?",
    "type": "SINGLE_SELECT",
    "required": true,
    "options": [
      { "id": "yes", "label": "Yes" },
      { "id": "no", "label": "No" }
    ]
  },
  {
    "id": "prDP",
    "text": "Do you have a valid PrDP (Professional Driving Permit)?",
    "type": "SINGLE_SELECT",
    "required": true,
    "options": [
      { "id": "yes", "label": "Yes" },
      { "id": "no", "label": "No" }
    ]
  }
]
```

---

## 🗄️ Database Schema

### New Fields Added to `jobs` Table

```sql
ALTER TABLE jobs ADD COLUMN pnet_job_id TEXT;
ALTER TABLE jobs ADD COLUMN pnet_job_url TEXT;
ALTER TABLE jobs ADD COLUMN pnet_posted_at DATETIME;
ALTER TABLE jobs ADD COLUMN pnet_status TEXT;
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `pnet_job_id` | TEXT | Unique PNET job identifier |
| `pnet_job_url` | TEXT | Direct link to job on PNET |
| `pnet_posted_at` | DATETIME | When job was posted to PNET |
| `pnet_status` | TEXT | Status: 'posted', 'closed', 'error' |

---

## 🔄 Data Mapping

### Employment Type Mapping

| Internal Value | PNET Format |
|---------------|-------------|
| `full_time` | `FULL_TIME` |
| `part_time` | `PART_TIME` |
| `contract` | `CONTRACT` |
| `temporary` | `TEMPORARY` |
| `internship` | `INTERNSHIP` |

### Pay Rate Unit Mapping

| Internal Value | PNET Format |
|---------------|-------------|
| `hourly` | `HOURLY` |
| `daily` | `DAILY` |
| `monthly` | `MONTHLY` |
| `annual` | `ANNUAL` |

### Location Parsing

**Input:** `"Johannesburg, Gauteng"`

**Output:**
```json
{
  "city": "Johannesburg",
  "province": "Gauteng",
  "country": "South Africa"
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# PNET API Credentials (from PNET)
PNET_API_KEY=your_pnet_api_key_here
PNET_API_BASE_URL=https://api.pnet.co.za/v4

# Application Email Domain (for receiving applications)
APPLICATION_EMAIL_DOMAIN=applications@avatarhc.com
```

### Application Email Format

When a job is posted, applications are sent to:
```
job-{jobId}@{APPLICATION_EMAIL_DOMAIN}

Examples:
- job-123@applications@avatarhc.com
- job-456@applications@avatarhc.com
```

This allows tracking which job each application is for.

---

## 🎨 Frontend Integration

### Adding "Post to PNET" Button

In your job details page:

```typescript
import { api } from "@/lib/api";

const handlePostToPNET = async (jobId: number) => {
  try {
    const response = await api.post("/pnet/post-job", { jobId });
    
    if (response.data.success) {
      toast.success(`Job posted to PNET: ${response.data.pnetUrl}`);
      // Refresh job details to show PNET URL
      refreshJob();
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    toast.error("Failed to post job to PNET");
  }
};

// In your JSX:
<Button onClick={() => handlePostToPNET(job.id)}>
  📢 Post to PNET
</Button>
```

### Showing PNET Status

```typescript
{job.pnetJobId && (
  <div className="flex items-center gap-2 text-green-500">
    <CheckCircle className="w-4 h-4" />
    <a 
      href={job.pnetJobUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="underline hover:text-green-400"
    >
      View on PNET
    </a>
  </div>
)}
```

---

## 🔍 Validation Rules

Jobs must have the following to be posted to PNET:

| Field | Required | Notes |
|-------|----------|-------|
| Title | ✅ Yes | Cannot be empty |
| Description | ✅ Yes | Min 50 characters recommended |
| Location | ✅ Yes | Format: "City, Province" |
| Department | ✅ Yes | Can be inferred from title |
| Employment Type | ⚠️ Optional | Defaults to "Full-time" |
| Salary Range | ⚠️ Optional | But highly recommended |

---

## 📊 Success Metrics

Track PNET posting performance:

```typescript
// Get jobs posted to PNET
const pnetJobs = await storage.getJobs(tenantId).then(jobs => 
  jobs.filter(job => job.pnetJobId !== null)
);

console.log(`Total jobs on PNET: ${pnetJobs.length}`);

// Get recent postings
const recentPosts = pnetJobs.filter(job => {
  const postedDate = new Date(job.pnetPostedAt);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return postedDate > weekAgo;
});

console.log(`Posted in last 7 days: ${recentPosts.length}`);
```

---

## 🐛 Error Handling

### Common Errors

**1. Validation Error**
```json
{
  "success": false,
  "message": "Job validation failed: Location is required",
  "error": "VALIDATION_ERROR"
}
```
**Solution:** Ensure job has all required fields

**2. PNET API Not Configured**
```json
{
  "success": false,
  "error": "PNET_API_NOT_CONFIGURED"
}
```
**Solution:** Add `PNET_API_KEY` and `PNET_API_BASE_URL` to environment

**3. Job Already Posted**
```json
{
  "success": false,
  "message": "Job already posted to PNET",
  "pnetJobId": "PNET-123456"
}
```
**Solution:** Use update endpoint instead of post

---

## 🚀 Usage Examples

### Example 1: Auto-Post on Job Creation

Already implemented! When you create a job with "Active" status, it automatically posts to PNET.

### Example 2: Manual Post (Draft → Active)

```typescript
// Update draft to active and post to PNET
await api.patch(`/jobs/${jobId}`, { status: "Active" });
await api.post("/pnet/post-job", { jobId });
```

### Example 3: Update Job Details

```typescript
// Update job locally
await api.patch(`/jobs/${jobId}`, { 
  title: "Updated Title",
  description: "Updated description"
});

// Sync changes to PNET
await api.patch(`/pnet/update-job/${jobId}`);
```

### Example 4: Archive Job

```typescript
// Archive locally
await api.post(`/jobs/${jobId}/archive`, { 
  reason: "Position filled" 
});

// Close on PNET
await api.delete(`/pnet/close-job/${jobId}`);
```

---

## 🎯 Best Practices

### 1. **Always Include Salary**
Jobs with salary information get 3x more applications on PNET.

### 2. **Use AI Description Enhancement**
The AI enrichment creates more professional, attractive postings.

### 3. **Add Screening Questions**
Pre-qualify candidates to save time in the hiring process.

### 4. **Monitor PNET Status**
Regularly check `pnet_status` field to ensure jobs are live.

### 5. **Close Jobs When Filled**
Remove filled positions from PNET to maintain a good employer brand.

---

## 📝 Summary

**The PNET Job Posting Agent provides:**

✅ **Automatic posting** when jobs are created  
✅ **AI-enhanced descriptions** for better candidate attraction  
✅ **Smart screening questions** for pre-qualification  
✅ **Full lifecycle management** (post, update, close)  
✅ **Bulk operations** for efficiency  
✅ **South African context** (ZAR, licenses, locations)  

**Where it runs:**
- Backend: `server/pnet-job-posting-agent.ts`
- Triggered: Automatically on job creation (Active status)
- Manual: Via API endpoints for drafts or re-posting

**Result:** Your jobs reach thousands of candidates on South Africa's #1 job board! 🚀

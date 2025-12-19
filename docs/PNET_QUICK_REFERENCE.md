# PNET Quick Reference Card

## 🚀 Quick Start

### Post a Job to PNET
```typescript
await api.post("/pnet/post-job", { jobId: 123 });
```

### Apply Candidate to PNET Job
```typescript
await api.post("/pnet/apply", {
  candidateId: 456,
  jobUrl: "https://www.pnet.co.za/job/12345",
  jobTitle: "Senior Developer"
});
```

---

## 📡 API Endpoints

### Job Posting
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pnet/post-job` | POST | Post job to PNET |
| `/api/pnet/update-job/:jobId` | PATCH | Update PNET job |
| `/api/pnet/close-job/:jobId` | DELETE | Close PNET job |
| `/api/pnet/bulk-post-jobs` | POST | Bulk post jobs |

### Applications
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pnet/apply` | POST | Apply candidate |
| `/api/pnet/bulk-apply` | POST | Bulk apply candidates |
| `/api/pnet/auto-apply` | POST | Auto-match & apply |
| `/api/pnet/job-info` | GET | Get job requirements |

---

## 🔧 Common Tasks

### Task 1: Post Job When Created
**Already automatic!** Jobs with "Active" status auto-post to PNET.

### Task 2: Post Draft Job Manually
```typescript
// Update to active
await api.patch(`/jobs/${jobId}`, { status: "Active" });

// Post to PNET
await api.post("/pnet/post-job", { jobId });
```

### Task 3: Apply Best Candidates
```typescript
await api.post("/pnet/auto-apply", {
  jobUrl: "https://www.pnet.co.za/job/12345",
  maxCandidates: 10
});
```

### Task 4: Bulk Post All Draft Jobs
```typescript
const draftJobs = jobs.filter(j => j.status === "Draft");
const jobIds = draftJobs.map(j => j.id);

await api.post("/pnet/bulk-post-jobs", { jobIds });
```

### Task 5: Close Filled Position
```typescript
// Archive locally
await api.post(`/jobs/${jobId}/archive`, { 
  reason: "Position filled" 
});

// Close on PNET
await api.delete(`/pnet/close-job/${jobId}`);
```

---

## 💾 Database Fields

### Jobs Table (New Fields)
```typescript
{
  pnetJobId: string | null,      // "PNET-1234567890"
  pnetJobUrl: string | null,     // "https://www.pnet.co.za/job/..."
  pnetPostedAt: Date | null,     // When posted
  pnetStatus: string | null      // "posted", "closed", "error"
}
```

---

## 🎯 Request/Response Examples

### Post Job Request
```json
{
  "jobId": 123
}
```

### Post Job Response (Success)
```json
{
  "success": true,
  "message": "Job posted to PNET successfully",
  "pnetJobId": "PNET-1234567890",
  "pnetUrl": "https://www.pnet.co.za/job/PNET-1234567890"
}
```

### Apply Candidate Request
```json
{
  "candidateId": 456,
  "jobUrl": "https://www.pnet.co.za/job/12345",
  "jobTitle": "Senior Developer",
  "jobDescription": "We are looking for..."
}
```

### Apply Candidate Response
```json
{
  "success": true,
  "message": "Application submitted successfully to PNET",
  "pnetApplicationId": "uuid-here"
}
```

---

## ⚠️ Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `VALIDATION_ERROR` | Missing required fields | Add title, description, location |
| `PNET_API_NOT_CONFIGURED` | API key missing | Add PNET_API_KEY to env |
| `JOB_NOT_ACTIVE` | Job is inactive on PNET | Check job status first |
| `PNET_API_ERROR` | PNET server error | Check PNET API status |

---

## 🧪 Testing

### Test Job Posting
```typescript
// Create test job
const job = await api.post("/jobs", {
  title: "Test Job",
  department: "Engineering",
  description: "Test description",
  location: "Johannesburg, Gauteng",
  status: "Active"
});

// Should auto-post to PNET
// Check job.pnetJobId is set
```

### Test Application
```typescript
// Apply test candidate
const result = await api.post("/pnet/apply", {
  candidateId: testCandidateId,
  jobUrl: "https://www.pnet.co.za/job/test-job",
  jobTitle: "Test Position"
});

// Check result.success === true
```

---

## 📝 Code Snippets

### Check if Job Posted to PNET
```typescript
const job = await api.get(`/jobs/${jobId}`);
const isOnPNet = !!job.pnetJobId;

if (isOnPNet) {
  console.log(`View on PNET: ${job.pnetJobUrl}`);
}
```

### Show PNET Badge in UI
```tsx
{job.pnetJobId && (
  <Badge variant="success">
    <ExternalLink className="w-3 h-3 mr-1" />
    Live on PNET
  </Badge>
)}
```

### Post Job Button Component
```tsx
const PostToPNetButton = ({ jobId }: { jobId: number }) => {
  const [posting, setPosting] = useState(false);
  
  const handlePost = async () => {
    setPosting(true);
    try {
      const result = await api.post("/pnet/post-job", { jobId });
      if (result.data.success) {
        toast.success("Posted to PNET!");
        // Refresh job data
      }
    } catch (error) {
      toast.error("Failed to post to PNET");
    } finally {
      setPosting(false);
    }
  };
  
  return (
    <Button onClick={handlePost} disabled={posting}>
      {posting ? "Posting..." : "📢 Post to PNET"}
    </Button>
  );
};
```

---

## 🔍 Monitoring

### Check PNET Integration Status
```typescript
const stats = {
  totalJobs: jobs.length,
  pnetJobs: jobs.filter(j => j.pnetJobId).length,
  pnetApps: applications.filter(a => a.source?.includes('PNET')).length,
};

console.log(`${stats.pnetJobs}/${stats.totalJobs} jobs on PNET`);
console.log(`${stats.pnetApps} applications via PNET`);
```

### Recent PNET Activity
```typescript
const recentPosts = jobs
  .filter(j => j.pnetPostedAt)
  .filter(j => {
    const posted = new Date(j.pnetPostedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return posted > weekAgo;
  });

console.log(`${recentPosts.length} jobs posted in last 7 days`);
```

---

## 🎨 UI Examples

### PNET Status Indicator
```tsx
<div className="flex items-center gap-2">
  {job.pnetJobId ? (
    <>
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="text-green-500">Live on PNET</span>
      <a 
        href={job.pnetJobUrl} 
        target="_blank"
        className="text-blue-400 underline"
      >
        View →
      </a>
    </>
  ) : (
    <>
      <Clock className="w-4 h-4 text-yellow-500" />
      <span className="text-yellow-500">Not posted</span>
      <Button 
        size="sm" 
        onClick={() => postToPNet(job.id)}
      >
        Post Now
      </Button>
    </>
  )}
</div>
```

### Application Source Badge
```tsx
<Badge variant={
  app.source?.includes('PNET') ? 'success' : 'default'
}>
  {app.source || 'Unknown'}
</Badge>
```

---

## ⚙️ Configuration

### Required Environment Variables
```bash
PNET_API_KEY=your_pnet_api_key
PNET_API_BASE_URL=https://api.pnet.co.za/v4
APPLICATION_EMAIL_DOMAIN=applications@avatarhc.com
GROQ_API_KEY=your_groq_key_for_ai_features
```

### Optional Settings
```bash
# Rate limiting (applications per minute)
PNET_RATE_LIMIT=30

# Default posting behavior
AUTO_POST_TO_PNET=true
```

---

## 📚 Learn More

- **Full Guide:** `docs/PNET_JOB_POSTING_AGENT.md`
- **Job Creation Flow:** `docs/JOB_POSTING_CREATION_FLOW.md`
- **System Overview:** `docs/PNET_INTEGRATION_COMPLETE.md`
- **Source Code:** `server/pnet-job-posting-agent.ts`

---

## 🆘 Get Help

**Issue:** Something not working?

1. Check environment variables are set
2. Review error logs in console
3. Verify job has required fields
4. Test with minimal example

**Need Support?** Contact the development team! 😊

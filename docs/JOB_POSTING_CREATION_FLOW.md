# Job Posting Creation Flow - PNET Integration

## Overview
The Avatar Human Capital platform provides **TWO AI-POWERED METHODS** to create job postings that can be automatically posted to PNET:

1. **AI Chat Assistant** - Conversational job creation
2. **Paste & Parse** - Bulk paste full job specification

---

## 🎯 Where It Happens

### Frontend Entry Point
**Location:** HR Dashboard (`/client/src/pages/hr-dashboard.tsx`)

**Access:**
```
Navigate to: HR Dashboard → "Jobs & Requisitions" Tab → Click "Create New Job" Button
```

**Component:** `JobCreationChat` (`/client/src/components/job-creation-chat.tsx`)

---

## 📋 Method 1: AI Chat Assistant (Conversational)

### User Experience Flow

```
┌─────────────────────────────────────────────────┐
│  HR Dashboard - Jobs Tab                        │
│  ┌────────────────────┐                         │
│  │ + Create New Job   │ ← Click this button     │
│  └────────────────────┘                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Job Creation Dialog Opens                      │
│  ┌─────────────────────────────────┐            │
│  │ [Chat with AI] [Paste Full Spec]│ ← Tabs     │
│  └─────────────────────────────────┘            │
│                                                  │
│  ┌──────────────────────┬──────────────────┐    │
│  │  Chat Interface      │  Extracted Info  │    │
│  │  ┌────────────────┐  │  ┌────────────┐  │    │
│  │  │ 🤖 AI Assistant│  │  │ Title: ... │  │    │
│  │  ├────────────────┤  │  │ Dept: ...  │  │    │
│  │  │ Hello! What    │  │  │ Salary: ...│  │    │
│  │  │ position are   │  │  └────────────┘  │    │
│  │  │ you looking to │  │                  │    │
│  │  │ fill today?    │  │                  │    │
│  │  └────────────────┘  │                  │    │
│  │                      │                  │    │
│  │  ┌────────────────┐  │                  │    │
│  │  │ Type message...│  │                  │    │
│  │  └────────────────┘  │                  │    │
│  └──────────────────────┴──────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Conversation Example

**User:** "I need a Senior Software Engineer"

**AI:** "Great! For the Senior Software Engineer position:
- Which department is this for?
- What location?
- What's the salary range you have in mind?"

**User:** "Engineering department in Johannesburg, salary 850k to 1.2M"

**AI:** "Perfect! A few more details:
- How many years of experience required?
- Any specific skills or technologies needed?"

**User:** "5 years minimum, React, Node.js, TypeScript"

**AI:** "✓ I've collected all essential details. Ready to create this job posting?"

**User:** "Yes"

**AI:** ✓ Job created successfully!

### Technical Flow (Chat Mode)

```
Frontend (JobCreationChat)              Backend (routes.ts)              AI (job-creation-agent.ts)
         │                                      │                                    │
         │──── POST /api/jobs/conversation/chat ──→                                 │
         │     { sessionId, message: "start" }  │                                   │
         │                                       │─── getOrCreateConversation() ──→ │
         │                                       │                                   │
         │                                       │                  Creates JobCreationAgent
         │                                       │                  with system prompt
         │                                       │                                   │
         │                                       │←─── agent.chat(message) ────────│
         │                                       │                                   │
         │                                       │     Groq LLM generates response  │
         │                                       │     Extracts structured data     │
         │                                       │     Returns jobSpec + isComplete │
         │                                       │                                   │
         │←─── { reply, jobSpec, isComplete } ──│                                   │
         │                                                                           │
         │  (User continues chatting...)                                            │
         │                                                                           │
         │──── POST /api/jobs/conversation/create ──→                               │
         │     { sessionId, isDraft: false }     │                                   │
         │                                        │                                  │
         │                                        │─── storage.createJob() ──→ DB   │
         │                                        │                                  │
         │                                        │─── Generate embedding ────→ AI  │
         │                                        │                                  │
         │                                        │─── Auto-post to PNET (future)   │
         │                                        │                                  │
         │←─── { success: true, job } ───────────│                                  │
         │                                                                           │
         │  Show success toast                                                       │
         │  Refresh jobs list                                                        │
         │  Close dialog                                                             │
```

---

## 📄 Method 2: Paste Full Job Spec

### User Experience Flow

```
┌─────────────────────────────────────────────────┐
│  Job Creation Dialog                            │
│  ┌─────────────────────────────────┐            │
│  │ [Chat with AI] [Paste Full Spec]│ ← Click    │
│  └─────────────────────────────────┘            │
│                                                  │
│  ┌──────────────────────┬──────────────────┐    │
│  │  Paste Area          │  Extracted Info  │    │
│  │  ┌────────────────┐  │  (Empty until    │    │
│  │  │ Paste your full│  │   parsed)        │    │
│  │  │ job spec here: │  │                  │    │
│  │  │                │  │                  │    │
│  │  │ Job Title:     │  │                  │    │
│  │  │ Senior Engineer│  │                  │    │
│  │  │                │  │                  │    │
│  │  │ Department:    │  │                  │    │
│  │  │ Engineering    │  │                  │    │
│  │  │                │  │                  │    │
│  │  │ Requirements:  │  │                  │    │
│  │  │ - 5+ years...  │  │                  │    │
│  │  └────────────────┘  │                  │    │
│  │                      │                  │    │
│  │  ┌────────────────┐  │                  │    │
│  │  │ ✨ Extract     │  │                  │    │
│  │  │    Job Details │  │                  │    │
│  │  └────────────────┘  │                  │    │
│  └──────────────────────┴──────────────────┘    │
└─────────────────────────────────────────────────┘
                    ↓ (After clicking Extract)
┌─────────────────────────────────────────────────┐
│  ┌──────────────────────┬──────────────────┐    │
│  │  Paste Area          │  Extracted Info  │    │
│  │  (Same content)      │  ┌────────────┐  │    │
│  │                      │  │ Title:     │  │    │
│  │                      │  │ Senior...  │  │    │
│  │                      │  ├────────────┤  │    │
│  │                      │  │ Dept:      │  │    │
│  │                      │  │ Engineering│  │    │
│  │                      │  ├────────────┤  │    │
│  │                      │  │ Salary:    │  │    │
│  │                      │  │ R850k-1.2M │  │    │
│  │                      │  ├────────────┤  │    │
│  │                      │  │ Skills:    │  │    │
│  │                      │  │ • React    │  │    │
│  │                      │  │ • Node.js  │  │    │
│  │                      │  └────────────┘  │    │
│  │  ┌────────────────┐  │  ┌──────────┐   │    │
│  │  │ ✅ Create Job  │  │  │ ✏️ Edit  │   │    │
│  │  └────────────────┘  │  └──────────┘   │    │
│  └──────────────────────┴──────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Technical Flow (Paste Mode)

```
Frontend                                Backend                              AI
    │                                      │                                 │
    │──── POST /api/jobs/conversation/parse-spec ──→                        │
    │     { sessionId, fullSpec: "..." }   │                                │
    │                                       │                                │
    │                                       │─── agent.parseFullSpec() ────→│
    │                                       │                                │
    │                                       │        Groq LLM with prompt:  │
    │                                       │        "Extract all job details
    │                                       │         from this text..."    │
    │                                       │                                │
    │                                       │        Parses and extracts:   │
    │                                       │        - Title, Department    │
    │                                       │        - Salary range         │
    │                                       │        - Requirements array   │
    │                                       │        - Responsibilities     │
    │                                       │        - Benefits, etc.       │
    │                                       │                                │
    │←─── { jobSpec: {...}, isComplete } ──│←───────────────────────────────│
    │                                                                        │
    │  Display extracted data in right panel                                │
    │                                                                        │
    │  (User reviews and optionally edits)                                  │
    │                                                                        │
    │──── POST /api/jobs/conversation/create ──→                            │
    │     { sessionId, jobSpec }            │                                │
    │                                        │                               │
    │                                        │─── storage.createJob() ──→ DB│
    │                                                                        │
    │←─── { success: true } ────────────────│                               │
```

---

## ✏️ Editing Before Creation

Both modes allow **inline editing** before creating the job:

```
Extracted Info Panel:
┌──────────────────────┐
│ Extracted Info  [✏️] │ ← Click pencil to edit
├──────────────────────┤
│ Title: ...           │
│ Dept: ...            │
│ Salary: ...          │
└──────────────────────┘
           ↓ (Click edit)
┌──────────────────────┐
│ Edit Details  [💾][✖]│ ← Save / Cancel
├──────────────────────┤
│ Title: [________]    │ ← Editable inputs
│ Dept:  [________]    │
│ Salary Min: [___]    │
│ Salary Max: [___]    │
│ Description:         │
│ [________________]   │
│ Requirements:        │
│ [________________]   │
└──────────────────────┘
```

---

## 🗄️ Database Schema

When job is created, it's stored in the `jobs` table:

```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  location TEXT,
  employment_type TEXT,
  shift_structure TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  pay_rate_unit TEXT,
  min_years_experience INTEGER,
  license_requirements TEXT, -- JSON array
  vehicle_types TEXT,        -- JSON array
  certifications_required TEXT, -- JSON array
  physical_requirements TEXT,
  equipment_experience TEXT,  -- JSON object
  status TEXT DEFAULT 'Active', -- Active, Draft, Closed
  embedding BLOB,  -- Vector embedding for AI matching
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🤖 AI Components

### 1. Job Creation Agent (`server/job-creation-agent.ts`)

**Responsibilities:**
- Conducts conversational interview with HR
- Extracts structured data from natural language
- Parses full job specifications
- Uses Groq Llama 3.3 70B model

**Key Methods:**
```typescript
class JobCreationAgent {
  async chat(message: string): Promise<{
    reply: string;
    isComplete: boolean;
    jobSpec?: JobSpecData;
  }>
  
  async parseFullSpec(fullSpec: string): Promise<{
    jobSpec: JobSpecData;
    isComplete: boolean;
  }>
  
  getJobSpec(): JobSpecData
}
```

### 2. System Prompt (Conversational Mode)

```
You are an expert HR assistant helping to create job requisitions in South Africa.

Your goal is to quickly gather the essential job details in a friendly, efficient conversation. Focus on getting:
1. Job title (what position?)
2. Department/team
3. Location (city/province)
4. Key requirements (experience, licenses, skills)
5. Salary range or pay rate (in ZAR)

For blue-collar roles, understand South African context:
- Truck driver licenses: Code 10, Code 14, Code EC, PrDP
- Forklift/warehouse certifications
- Physical requirements

IMPORTANT INSTRUCTIONS:
- Ask 2-3 related questions at once to speed up the process
- When you have enough info (job title + 3 other fields), summarize and confirm
- Be concise and friendly
```

### 3. Extraction Prompt (Parse Mode)

```
You are an expert HR assistant. Parse this job specification and extract all relevant details into a structured JSON format.

Extract all information into this JSON structure:
{
  "title": "string (job title - REQUIRED)",
  "department": "string (REQUIRED, infer from job title if not stated)",
  "description": "string (full job description)",
  "location": "string (city, province)",
  "salaryMin": number (in ZAR),
  "salaryMax": number (in ZAR),
  "requirements": ["array of requirements"],
  "responsibilities": ["array of responsibilities"],
  "benefits": ["array of benefits"],
  ...
}

IMPORTANT:
- ALWAYS provide "title" and "department" - these are required
- If department not stated, infer from job title
- Extract salary numbers without currency symbols
- Convert to clean arrays
- Return ONLY valid JSON
```

---

## 🔄 Post-Creation Flow

After a job is created:

```
Job Created Successfully
         ↓
┌────────────────────────────────────┐
│ 1. Generate Vector Embedding       │ ← For AI candidate matching
│    (embedding-service.ts)          │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 2. Store in Database                │
│    Status: "Active" or "Draft"     │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 3. Trigger Recruitment Agents       │ ← If Active status
│    (recruitment-orchestrator.ts)   │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 4. AI Sourcing Specialists Start   │
│    - Internal Database Search      │
│    - PNET Job Scraping             │
│    - LinkedIn Search (future)      │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ 5. Auto-Apply to PNET (Future)     │ ← Using pnet-api-service.ts
│    - Inquiry job status            │
│    - Get screening questions       │
│    - Submit applications           │
└────────────────────────────────────┘
```

---

## 🌐 PNET Integration Ready

The job is now ready to be posted to PNET using:

**File:** `server/pnet-api-service.ts`

```typescript
// Future enhancement: Auto-post jobs to PNET
async function postJobToPNET(job: Job) {
  // 1. Format job data to PNET spec
  // 2. Call PNET Job Posting API
  // 3. Store PNET job ID in database
  // 4. Monitor for applications
}
```

---

## 📊 Key Features

### ✅ Dual Input Modes
- **Chat:** Natural conversation, guided questions
- **Paste:** Bulk paste entire job spec, AI extracts everything

### ✅ Real-time Extraction
- Data appears in right panel as conversation progresses
- Live updates as AI extracts information

### ✅ Inline Editing
- Click pencil icon to edit any field
- Changes reflected before creation

### ✅ Draft Support
- Save incomplete jobs as drafts
- Resume editing later
- Only "Active" jobs trigger recruitment

### ✅ South African Context
- ZAR salary handling
- SA-specific licenses (Code 10, 14, EC, PrDP)
- SA locations and provinces
- Forklift, warehouse certifications

### ✅ Smart Defaults
- Department inferred from job title if missing
- Employment type defaults
- Validation only on required fields

---

## 🎨 UI/UX Highlights

### Chat Interface
- ✨ Sparkly AI avatar
- 💬 Clean message bubbles
- ⏱️ Timestamps
- 🔄 Typing indicators
- ✅ Completion status

### Data Panel
- 📋 Organized sections
- 🏷️ Color-coded tags (benefits, licenses)
- 📊 Formatted salary ranges
- ✏️ Quick edit access
- 📌 Sticky positioning

### Buttons & Actions
- 💾 Save Draft
- ✅ Create Job
- ❌ Cancel
- ✏️ Edit
- 🔄 Parse/Extract

---

## 🔧 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/jobs/conversation/chat` | POST | Conversational chat with AI |
| `/api/jobs/conversation/parse-spec` | POST | Parse full job spec text |
| `/api/jobs/conversation/create` | POST | Create job from collected data |
| `/api/jobs/conversation/:sessionId` | DELETE | Clean up conversation session |
| `/api/jobs` | GET | List all jobs |
| `/api/jobs/:id` | GET | Get single job |
| `/api/jobs/:id` | PATCH | Update job |
| `/api/jobs/:id/archive` | POST | Archive job |

---

## 💡 Example Job Spec (Paste Mode)

```
Job Title: Senior Software Engineer
Department: Engineering
Location: Johannesburg, Gauteng

About the Role:
We are looking for a Senior Software Engineer to join our growing engineering team.
You will be responsible for designing, developing, and maintaining scalable web applications.

Requirements:
- 5+ years of experience in software development
- Proficiency in React, Node.js, and TypeScript
- Strong problem-solving skills
- Experience with PostgreSQL or similar databases
- Familiarity with cloud platforms (AWS, Azure)

Responsibilities:
- Design and implement new features for our web platform
- Mentor junior developers and conduct code reviews
- Participate in architecture decisions
- Ensure code quality and performance
- Collaborate with product and design teams

Benefits:
- Medical aid
- Retirement fund
- Flexible working hours
- Remote work options
- Learning and development budget

Salary: R850,000 - R1,200,000 per annum
```

AI will extract all fields and structure them perfectly! 🎯

---

## 🚀 Future Enhancements

### Phase 1 (Current)
- ✅ AI-powered job creation
- ✅ Dual input modes
- ✅ Inline editing
- ✅ Draft support

### Phase 2 (Planned)
- 🔄 Auto-post to PNET
- 🔄 LinkedIn job posting
- 🔄 Indeed integration
- 🔄 Job template library

### Phase 3 (Future)
- 🔮 Multi-language support
- 🔮 Industry-specific templates
- 🔮 Compliance checking (BBBEE, EE)
- 🔮 Salary benchmarking

---

## 📝 Summary

**Where:** HR Dashboard → Jobs Tab → "Create New Job" button

**How:** 
1. Choose Chat or Paste mode
2. Provide job details
3. Review extracted information
4. Edit if needed
5. Click "Create Job"

**Result:** 
- Job stored in database
- Vector embedding generated
- Recruitment agents activated
- Ready for PNET posting (future)

The entire flow is **AI-powered**, **user-friendly**, and **production-ready**! 🎉

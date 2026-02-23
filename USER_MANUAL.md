# Avatar Human Capital (AHC) - User Manual

## Complete System Guide

**Version**: 1.0  
**Platform**: Avatar Human Capital — AI-Powered HR Management  
**Last Updated**: February 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Home Page & Navigation](#2-home-page--navigation)
3. [AI Recruitment Command Center](#3-ai-recruitment-command-center)
4. [Recruitment Dashboard](#4-recruitment-dashboard)
5. [Candidate Management](#5-candidate-management)
6. [Pipeline Board](#6-pipeline-board)
7. [Interview Suite](#7-interview-suite)
8. [Integrity Agent](#8-integrity-agent--background-checks)
9. [Onboarding Agent](#9-onboarding-agent)
10. [HR Management Agent](#10-hr-management-agent)
11. [Social Screening Agent](#11-social-screening-agent)
12. [Executive Dashboard](#12-executive-dashboard)
13. [HR Dashboard & Performance](#13-hr-dashboard--performance)
14. [KPI Management](#14-kpi-management)
15. [Learning Management System (LMS)](#15-learning-management-system)
16. [Certificate Management](#16-certificate-management)
17. [Document Automation](#17-document-automation)
18. [Workforce Intelligence](#18-workforce-intelligence)
19. [WhatsApp Communications](#19-whatsapp-communications)
20. [Offer Management](#20-offer-management)
21. [Tenant & Admin Management](#21-tenant--admin-management)
22. [Platform Settings](#22-platform-settings)
23. [Theme & Appearance](#23-theme--appearance)

---

## 1. Getting Started

### Accessing the Platform

1. Open your browser and navigate to the platform URL
2. You will land on the **Home Page**, which showcases the platform's capabilities
3. Click **Login** in the top navigation bar to access the dashboard
4. After login, you will be taken to the **HR Dashboard** as your default workspace

### Navigation Structure

The platform uses a **collapsible sidebar** on the left side for navigation within the application. The sidebar is organized into logical sections:

| Section | Purpose |
|:---|:---|
| **INTELLIGENCE** | Workforce analytics and AI recommendations |
| **HR COMMAND CENTRE** | Central HR operations, dashboards, and module setup |
| **RECRUITMENT** | All recruitment workflows and AI sourcing |
| **INTERVIEWS** | Voice, video, and face-to-face interview tools |
| **PERFORMANCE** | KPI tracking, reviews, and attendance |
| **DOCUMENTS** | Automated document generation and library |
| **COMMUNICATIONS** | WhatsApp monitoring and HR conversations |
| **SUPPORT** | AI-powered help and support chat |
| **TRAINING** | Learning Management System and attendance |
| **ADMIN** | System administration, tenant management, and settings |

The sidebar can be collapsed by clicking the collapse icon at the top, giving you more screen space when needed.

### Theme Toggle

The platform supports **Light Mode** and **Dark Mode**. Toggle between them using the sun/moon icon in the top header bar. Your preference is saved automatically.

---

## 2. Home Page & Navigation

**URL**: `/`

The home page serves as the platform's landing page and product showcase.

### What You'll See

- **Hero Section**: Large banner introducing Avatar Human Capital with tagline and call-to-action buttons
- **AHC Features Section**: Overview of the platform's AI recruitment capabilities
- **AI Interview Suite**: Cards showcasing the Voice Interview and Video Interview modules with demo links
- **Workflow Showcase**: Visual demonstration of the platform's AI agent workflow process
- **Services Section**: Summary of all HR services offered
- **Dashboard Preview**: Preview of the executive dashboard capabilities
- **Contact Section**: Company contact information including address, phone, and email

### Top Navigation Bar (Public)

The public navbar includes dropdown menus for:
- **Solutions**: Links to Recruitment, Integrity, Onboarding, and HR Management agents
- **Platform**: Links to dashboards (Executive, Recruitment, HR)
- **Features**: Links to AI Support, Workforce Intelligence, and Pipeline Board
- **Interviews**: Links to Voice, Video, and Face-to-Face interview modules
- **Dashboards**: Quick access to all dashboard types
- **Admin**: System administration links

---

## 3. AI Recruitment Command Center

**URL**: `/recruitment-agent`  
**Sidebar**: RECRUITMENT → AI Recruitment

This is the core AI-powered recruitment engine. It uses multiple AI agents to source, screen, and rank candidates automatically.

### Step-by-Step Workflow

#### Step 1: Select or Create a Job

1. When you open the page, you'll see a **job selection area** at the top
2. Choose an existing job from the dropdown, or click **Create New Job** to define a new position
3. Each job includes: title, description, required skills, location, and salary range

#### Step 2: Deploy AI Agents

1. Once a job is selected, click the **"Deploy Agents"** button
2. A **modal window** opens showing the live AI sourcing activity

#### Step 3: Watch Live Agent Activity (Modal)

The modal displays a real-time workflow with 6 stages:

| Stage | What Happens |
|:---|:---|
| **1. Analyzing Job** | AI parses job requirements and extracts key skills |
| **2. Specialist Sourcing** | Multiple specialist agents search simultaneously: LinkedIn Specialist, PNet Specialist, Indeed Specialist, plus category-specific agents (GitHub, StackOverflow, Executive News, etc.) |
| **3. AI Search** | General AI search augments results and deduplicates profiles |
| **4. AI Screening** | LLaMA 3.1 70B via Groq evaluates each candidate's profile for skill alignment |
| **5. Smart Ranking** | Composite match scores are calculated and candidates are prioritized |
| **6. Complete** | Results are ready for review |

During this process, you'll see:
- A **progress bar** showing overall completion
- **Live agent messages** scrolling in real-time (e.g., "LinkedIn Specialist: Generating boolean search strings...")
- **Step indicators** showing which phase is active, complete, or pending

#### Step 4: Review Top Matches

When the modal closes (or you close it after completion), the main page reveals:

- **Top Matches Grid**: Landscape-oriented cards showing the best candidates
- Each card displays:
  - Candidate name, current role, and company
  - Match score (percentage)
  - Source platform (LinkedIn, PNet, Indeed, GitHub, etc.)
  - Key skills as badges
  - Location
  - Email and phone contact information
  - Quick action buttons: View Profile, Shortlist, Contact

#### Step 5: Take Action on Candidates

- **View Full Profile**: Opens detailed candidate view with all sourced information
- **Shortlist**: Adds the candidate to your shortlist for the job
- **Enrich Profile**: Fetches additional contact details and background information
- **Move to Pipeline**: Places the candidate into your recruitment pipeline

### Sourcing Specialists

The system deploys category-specific sourcing agents based on the job type:

| Category | Agents Used |
|:---|:---|
| **Tech Roles** | GitHub, StackOverflow, HackerNews, Kaggle, Dev.to |
| **Executive Roles** | Executive News, Company Leadership, CIPC Directors |
| **Blue Collar** | OLX, Trade Forums, Community Boards |
| **General** | LinkedIn, PNet, Indeed (always active) |

---

## 4. Recruitment Dashboard

**URL**: `/recruitment-dashboard`  
**Sidebar**: RECRUITMENT → Recruitment Dashboard

A high-level analytics view of all recruitment activity.

### Dashboard Components

- **Monthly Placements Chart**: Line/bar chart showing placements and revenue by month
- **Job Health Overview**: Pie chart breaking down jobs by status (On Track, At Risk, Lost, Completed)
- **Talent Pipeline Funnel**: Horizontal bar chart showing candidates at each stage (Screening → Shortlisted → Interview → Offer → Hired)
- **Employer Type Breakdown**: Distribution of jobs by industry/employer type
- **Key Metrics Cards**: At-a-glance numbers for:
  - Total active jobs
  - Total candidates in pipeline
  - Average time to hire
  - Placement rate
  - Revenue this month

### Customizable Layout

The dashboard supports a **drag-and-drop customizable layout**. Click the customize icon to rearrange, resize, or hide dashboard widgets to suit your preferences.

---

## 5. Candidate Management

### Candidates List

**URL**: `/candidates-list`  
**Sidebar**: RECRUITMENT (accessible via dashboard links)

A searchable, sortable table of all candidates in the system.

#### Features

- **Search Bar**: Filter candidates by name, skills, or role
- **Status Filters**: Filter by status (New, Screening, Shortlisted, Interview, Offered, Hired, Rejected)
- **Sortable Columns**: Click column headers to sort by name, match score, date added, etc.
- **Bulk Actions**: Select multiple candidates for bulk status updates
- **Export**: Download candidate data as CSV

#### Candidate Table Columns

| Column | Description |
|:---|:---|
| Name | Candidate's full name with avatar |
| Current Role | Their current or most recent job title |
| Skills | Key skills shown as badges |
| Match Score | AI-calculated match percentage |
| Source | Where the candidate was found (LinkedIn, PNet, etc.) |
| Status | Current pipeline status |
| Date Added | When the candidate entered the system |
| Actions | View, Edit, Contact buttons |

### Candidate Detail Page

**URL**: `/candidates/:id`

Clicking on any candidate opens their full profile page.

#### Profile Sections

- **Header**: Name, photo, current role, company, location
- **Contact Information**: Email, phone number, LinkedIn profile
- **Match Analysis**: AI-generated match score with breakdown by skill, experience, and qualifications
- **Skills & Competencies**: Visual skill tags with proficiency indicators
- **Work Experience**: Chronological employment history
- **Education**: Academic qualifications
- **AI Assessment**: Detailed AI screening notes and recommendations
- **Integrity Status**: Background check results (if completed)
- **Activity Timeline**: Log of all interactions and status changes
- **Documents**: Attached resumes, cover letters, and certificates

### Shortlisted Candidates

**URL**: `/shortlisted-candidates`

A focused view of candidates who have passed initial screening and are being considered for positions. Shows candidates grouped by the job they're shortlisted for.

### External Candidates

**URL**: `/external-candidates`

Manages candidates sourced from external platforms (PNet API, job boards). Shows integration status and allows importing external profiles into the main system.

### AI Recommendations

**URL**: `/recommendations`

AI-powered candidate recommendations based on your active job requirements. The system proactively suggests matches from your existing candidate database.

---

## 6. Pipeline Board

**URL**: `/pipeline-board`  
**Sidebar**: RECRUITMENT → Pipeline Board

A **Kanban-style board** for visually managing the recruitment pipeline.

### How It Works

1. **Columns** represent pipeline stages: Screening → Shortlisted → Interview → Offer → Hired → Rejected
2. **Candidate cards** appear in their current stage column
3. **Drag and drop** cards between columns to update a candidate's status
4. Each card shows: name, role, match score, and key details
5. Click a card to open the full candidate detail view

### Pipeline Features

- **Job Filter**: Filter the board to show candidates for a specific job
- **Search**: Find specific candidates on the board
- **Stage Counts**: Each column header shows the number of candidates in that stage
- **Color Coding**: Cards are color-coded by match score (green = high, yellow = medium, red = low)

---

## 7. Interview Suite

The platform offers three interview modes, plus a management console.

### Interview Console

**URL**: `/interview-console`  
**Sidebar**: RECRUITMENT → Interview Console

Central hub for managing all interview activities.

- View scheduled interviews
- Track interview completion status
- Access recordings and AI assessments
- Send interview invitations to candidates

### AI Voice Interview

**URL**: `/interview/voice`  
**Sidebar**: INTERVIEWS → Voice

An AI-powered voice interview system using empathic voice technology.

#### Workflow

1. Select a candidate and interview type
2. The AI interviewer introduces itself and begins asking questions
3. The candidate responds verbally (via microphone)
4. The AI detects emotional cues and adapts its approach
5. Real-time transcription appears on screen
6. After completion, an AI assessment is generated with:
   - Communication skills rating
   - Technical knowledge assessment
   - Confidence and emotional analysis
   - Overall recommendation

### Video Interview

**URL**: `/interview/video`  
**Sidebar**: INTERVIEWS → Video

Personalized video interviews using AI avatar technology (Tavus integration).

#### Workflow

1. Configure the interview: select job, candidate, and question set
2. The AI avatar appears on screen and conducts the interview
3. Candidate responses are recorded
4. AI generates a comprehensive assessment report
5. Recordings are saved for reviewer playback

### Face-to-Face Interview

**URL**: `/interview/face-to-face`  
**Sidebar**: INTERVIEWS → Face to Face

Tools for managing traditional in-person interviews.

- Schedule interview slots
- Generate interview guides based on the job requirements
- Score cards for structured evaluation
- Notes and feedback entry for interviewers
- Compare multiple interviewer assessments

### Interview Invitations

**URL**: `/interview/invite/:token`

Candidates receive invitation links via email. The invitation page allows them to:
- View the job details
- Choose available time slots
- Confirm their interview
- Access pre-interview preparation materials

---

## 8. Integrity Agent — Background Checks

**URL**: `/integrity-agent`  
**Sidebar**: HR COMMAND CENTRE → Integrity Setup (for configuration)

An AI agent that automates comprehensive background verification.

### Available Check Types

| Check Type | What It Verifies |
|:---|:---|
| **Criminal Record** | National criminal database query |
| **Credit Bureau** | Credit history and score verification |
| **Education** | Academic credential validation |
| **Employment History** | Previous employment records |
| **Biometric Verification** | ID verification and biometric data processing |
| **Reference Checks** | Contacting and verifying professional references |

### Workflow

1. **Select a Candidate**: Choose from the candidate list
2. **Choose Check Types**: Select which background checks to run (individual or all)
3. **Launch Verification**: Click "Run Check" to start the AI agent
4. **Watch Progress**: Each check shows real-time status:
   - Pending (grey) → Processing (blue spinner) → Completed (green check) or Failed (red X)
5. **Review Results**: Each completed check provides:
   - Pass/Fail status
   - Risk score (Low / Medium / High)
   - Detailed findings
   - Source verification links
   - Recommendations

### Risk Scoring

The system generates a composite **Integrity Score** based on all checks:
- **90-100**: Low risk — proceed with confidence
- **70-89**: Medium risk — review flagged items
- **Below 70**: High risk — further investigation recommended

### Configuration

**URL**: `/integrity-setup`

Configure which background check providers and check types are available for your organization.

---

## 9. Onboarding Agent

**URL**: `/onboarding-agent`  
**Sidebar**: HR COMMAND CENTRE → Employee Onboarding Setup (for configuration)

An AI-powered chat agent that automates the entire onboarding process for new hires.

### How It Works

1. **Select a Candidate**: Search for and select a hired candidate from the list
2. **Chat Interface**: The AI agent guides you through onboarding via a conversational interface
3. **Automated Tasks**: The agent handles:
   - Welcome packet generation and sending
   - Document collection (ID, tax forms, banking details)
   - Equipment provisioning (laptop, access cards, etc.)
   - System account creation (email, software licenses)
   - Training schedule setup
   - Manager introductions
   - First-day logistics

### RAG-Powered Intelligence

The agent uses **Retrieval-Augmented Generation (RAG)** to:
- Pull relevant company policies and procedures
- Reference specific onboarding checklists
- Retrieve document templates
- Track completion status of each onboarding item

### Onboarding Dashboard

**URL**: `/onboarding-dashboard`  
**Sidebar**: HR COMMAND CENTRE → Onboarding Dashboard (visible in the sidebar as "Onboarding Dashboard")

Overview of all employees currently going through onboarding:
- Progress percentages per employee
- Outstanding tasks and documents
- Time-to-onboard metrics
- Bottleneck identification

### Employee Onboarding Portal

**URL**: `/employee-onboarding`

The employee-facing view where new hires can:
- View their onboarding checklist
- Upload required documents
- Acknowledge company policies
- Complete onboarding forms
- Track their own progress

---

## 10. HR Management Agent

**URL**: `/hr-management-agent`  
**Sidebar**: Via HR COMMAND CENTRE

An AI assistant for ongoing HR management tasks.

### Capabilities

The agent can help with:
- **Performance Monitoring**: Track and analyze employee performance metrics
- **Sentiment Analysis**: Gauge employee satisfaction from communications
- **Payroll Compliance**: Check payroll data against regulations
- **Policy Questions**: Answer HR policy questions using RAG
- **Report Generation**: Create HR reports on demand

### Chat Interface

1. Type your HR question or request in the chat input
2. The AI processes your request using its RAG pipeline:
   - Retrieves relevant documents and data
   - Analyzes metrics and trends
   - Generates a comprehensive response
3. Results may include:
   - Text responses with recommendations
   - Performance charts and metrics
   - Employee comparison data
   - Policy citations

### Metrics Display

The right panel shows real-time HR metrics:
- **Performance Score**: Overall workforce performance (0-100)
- **Employee Satisfaction**: Sentiment-derived satisfaction rating
- **Training Completion**: Percentage of required training completed
- **Trend Indicators**: Up/down arrows showing metric direction

---

## 11. Social Screening Agent

**URL**: `/social-screening-agent`  
**Sidebar**: Via Solutions menu

An AI agent that conducts automated social media and public record screening for candidates.

### What It Checks

- Public social media profiles
- Professional network presence
- Public records and publications
- News mentions
- Online reputation analysis

### Workflow

1. Select a candidate for screening
2. The agent searches across public platforms
3. Results are categorized by risk level
4. A summary report is generated with findings and recommendations

---

## 12. Executive Dashboard

**URL**: `/executive-dashboard`  
**Sidebar**: HR COMMAND CENTRE → Executive Dashboard

A high-level analytics dashboard designed for executive leadership.

### Dashboard Sections

- **Key Metrics Overview**: Large cards showing critical numbers (headcount, turnover rate, cost per hire, time to fill)
- **Revenue & Placement Charts**: Monthly trends with interactive tooltips
- **Department Analytics**: Breakdown by department with drill-down capability
- **Hiring Pipeline Health**: Visual funnel showing conversion rates
- **Budget Tracking**: Recruitment spend vs budget

### Custom Executive Dashboard

**URL**: `/executive-dashboard-custom`

A fully customizable version where you can:
- Drag and drop widgets to rearrange the layout
- Add or remove specific metric cards
- Resize chart components
- Save custom layouts per user
- Create multiple dashboard views

---

## 13. HR Dashboard & Performance

### HR Dashboard

**URL**: `/hr-dashboard` or `/hr`  
**Sidebar**: HR COMMAND CENTRE → HR Command

The primary workspace for HR professionals.

#### Features

- **Employee Overview**: Quick stats on total employees, new hires, departures
- **Attendance Summary**: Today's attendance snapshot
- **Pending Approvals**: Leave requests, document approvals, etc.
- **Recent Activity**: Timeline of recent HR events
- **Quick Actions**: Shortcuts to common tasks

### KPI HR Dashboard

**URL**: `/kpi-hr-dashboard`  
**Sidebar**: PERFORMANCE → HR Performance

Focused analytics for HR key performance indicators:
- Recruitment efficiency metrics
- Employee retention rates
- Training completion rates
- Time-to-hire trends
- Cost-per-hire analysis
- Diversity metrics

---

## 14. KPI Management

### KPI Configuration

**URL**: `/kpi-management`  
**Sidebar**: PERFORMANCE → KPI Management

Define and manage Key Performance Indicators for your organization.

#### Features

- Create custom KPIs with:
  - Name and description
  - Target values and thresholds
  - Measurement frequency (daily, weekly, monthly, quarterly)
  - Assigned department or individual
  - Weighting for composite scores
- Group KPIs by category (Sales, Operations, HR, Finance)
- Set alert thresholds for underperformance

### Manager Review

**URL**: `/kpi-manager-review`  
**Sidebar**: PERFORMANCE → Manager Review

Interface for managers to:
- Review direct reports' KPI performance
- Provide scores and written feedback
- Compare team member performance
- Track improvement trends
- Submit formal performance reviews

### KPI Self-Review

**URL**: `/kpi-review`  
**Sidebar**: PERFORMANCE → My KPI Review

Employee-facing view where individuals can:
- View their assigned KPIs and targets
- See their current scores
- Submit self-assessments
- Track their own performance trends
- View manager feedback

---

## 15. Learning Management System

### LMS Dashboard

**URL**: `/learning-management`  
**Sidebar**: TRAINING → LMS Dashboard

Administration interface for the Learning Management System.

#### Features

- **Course Management**: Create, edit, and publish training courses
- **Enrollment Tracking**: See who is enrolled in what courses
- **Completion Reports**: Track completion rates and scores
- **Content Library**: Manage training materials (videos, documents, quizzes)
- **Certification Paths**: Define learning paths that lead to certifications

### Course Catalogue

**URL**: `/courses`

The browsable catalogue of available training courses:
- Filter by category, difficulty level, or duration
- View course descriptions and prerequisites
- Enroll in courses
- Track progress on enrolled courses
- Rate and review completed courses

### LMS Management

**URL**: `/lms-management`

Advanced LMS configuration:
- Course creation and editing tools
- Quiz and assessment builder
- Learning path designer
- Instructor management
- Content upload and organization

---

## 16. Certificate Management

### Certificate Templates

**URL**: `/certificate-templates`  
**Sidebar**: Via Training section

Design and manage certificate templates:
- Visual template editor
- Customizable fields (name, course, date, instructor, etc.)
- Company branding elements
- QR code for digital verification
- Multiple template designs

### Certificates

**URL**: `/certificates`

Manage all issued certificates:
- View all certificates issued
- Filter by course, employee, or date
- Revoke or reissue certificates
- Download certificate PDFs

### My Certificates

**URL**: `/my-certificates`

Employee-facing view to:
- View all earned certificates
- Download certificate files
- Share certificates via link
- Track certificate expiry dates

### Certificate Verification

**URL**: `/verify-certificate/:number`

Public-facing page where anyone can verify a certificate's authenticity by entering the certificate number. Shows:
- Certificate validity status
- Holder name
- Course/qualification
- Issue date
- Issuing organization

### Leaderboard

**URL**: `/leaderboard`

Gamification element showing top performers:
- Ranking by certificates earned
- Points and achievements
- Department comparisons
- Monthly/yearly leaderboards

---

## 17. Document Automation

**URL**: `/document-automation`  
**Sidebar**: DOCUMENTS → Document Automation

Automated generation of HR documents.

### Document Types

- Employment contracts
- Offer letters
- NDA agreements
- Policy acknowledgments
- Warning letters
- Termination letters
- Reference letters
- Salary adjustment notices

### How It Works

1. Select a document template
2. Choose the employee/candidate
3. The system auto-populates fields from the database
4. Review and edit the generated document
5. Send for digital signature or download as PDF

### Document Library

**URL**: `/document-library`  
**Sidebar**: DOCUMENTS → Document Library

Centralized storage for all company documents:
- Company policies
- Employee handbooks
- Standard operating procedures
- Template library
- Uploaded employee documents

### Templates

**URL**: `/templates`  
**Sidebar**: DOCUMENTS → Templates

Manage communication and document templates:
- Email templates (offer letters, rejection notices, interview invitations)
- Document templates (contracts, agreements)
- Notification templates (reminders, alerts)

### CV Templates

**URL**: `/cv-templates`

Library of CV/resume templates for candidate profiling:
- Multiple professional layouts
- Customizable sections
- Auto-fill from candidate data
- PDF export

---

## 18. Workforce Intelligence

**URL**: `/workforce-intelligence`  
**Sidebar**: INTELLIGENCE → Workforce Intelligence

Advanced analytics and insights for strategic workforce planning.

### Features

- **Workforce Composition**: Demographics, department sizes, role distribution
- **Turnover Analysis**: Predictive models for employee churn
- **Skills Gap Analysis**: Identify missing competencies across the organization
- **Succession Planning**: AI recommendations for succession candidates
- **Compensation Benchmarking**: Salary comparisons against market data
- **Diversity & Inclusion Metrics**: Representation and equity analytics
- **Predictive Analytics**: AI-powered forecasting for hiring needs

---

## 19. WhatsApp Communications

**URL**: `/whatsapp-monitor`  
**Sidebar**: COMMUNICATIONS → WhatsApp Monitor

Monitor and manage WhatsApp-based candidate communications.

### Features

- View all WhatsApp conversation threads
- Send messages to candidates
- Automated message templates
- Message delivery status tracking
- Integration with recruitment pipeline (messages linked to candidate profiles)

### HR Conversations

**URL**: `/hr-conversations`  
**Sidebar**: COMMUNICATIONS → Conversations

Log and manage internal HR communications:
- Thread-based conversation view
- Tag conversations by topic
- Link conversations to employees or cases
- Search and filter conversation history

---

## 20. Offer Management

**URL**: `/offer-management`  
**Sidebar**: Via HR COMMAND CENTRE

Track and manage employment offers.

### Features

- Create new offers with salary, benefits, and terms
- Track offer status (Draft → Sent → Accepted → Rejected → Expired)
- Digital signature integration
- Offer comparison for the same position
- Automated follow-up reminders
- Conversion rate analytics

### Offer Setup

**URL**: `/offer-setup`  
**Sidebar**: HR COMMAND CENTRE → Offer Setup

Configure offer letter templates and approval workflows:
- Define approval chains (HR → Manager → Director)
- Set salary bands and benefit packages
- Customize offer letter content
- Configure expiry rules

---

## 21. Tenant & Admin Management

### Admin Dashboard

**URL**: `/admin-dashboard`  
**Sidebar**: ADMIN → System Admin

Central hub for system administrators.

#### Features

- System health monitoring
- User activity logs
- Error tracking
- Usage statistics
- API performance metrics
- Tenant selector (for multi-tenant admin access)

### Tenant Management

**URL**: `/tenant-management`  
**Sidebar**: ADMIN → Tenant Management

Manage platform tenants (client organizations):
- View all tenants and their subscription status
- Payment tracking and history
- Subscription plan management (Free, Basic, Professional, Enterprise)
- Module enable/disable per tenant
- Usage statistics per tenant

### Admin Tenant Management

**URL**: `/admin-tenant-management`

Super-admin tools for advanced tenant operations:
- Create new tenants
- Modify tenant configurations
- Manage tenant-specific settings
- Impersonate tenant view (see the platform as a specific tenant sees it)

### Tenant Requests

**URL**: `/tenant-requests`  
**Sidebar**: ADMIN → Tenant Requests

Handle incoming support requests from tenants:
- View and respond to support tickets
- Track request status
- Assign requests to team members
- Priority management

### Customer Onboarding

**URL**: `/onboarding`  
**Sidebar**: ADMIN → Customer Onboarding

Guide new tenant organizations through their initial platform setup:
- Company profile configuration
- Module selection
- User account creation
- Data import assistance
- Configuration walkthrough

### Persona Management

**URL**: `/persona-management`  
**Sidebar**: ADMIN → Persona Management

Define and manage AI personas used across the platform's agents:
- Customize AI agent names, avatars, and communication styles
- Configure persona behavior for interviews
- Set personality parameters for different interaction contexts

---

## 22. Platform Settings

**URL**: `/platform-settings`  
**Sidebar**: ADMIN → Platform Settings (or via top header)

Global configuration for your organization's workspace.

### Settings Categories

- **Company Profile**: Organization name, logo, contact details
- **Branding**: Colors, logos, custom themes
- **Notifications**: Email and in-app notification preferences
- **Integrations**: API key management for third-party services
- **Module Configuration**: Enable/disable platform modules
- **User Management**: Add, edit, remove user accounts and roles
- **Security**: Password policies, session timeouts, 2FA settings

---

## 23. Theme & Appearance

The platform features a professional, business-appropriate design.

### Color Scheme

- **Primary Colors**: Blues (professional trust) — used for primary buttons, links, and accents
- **Secondary Colors**: Teals (growth and stability) — used for success states, highlights, and secondary accents
- **Semantic Colors**: Green (success), Red (error/danger), Yellow (warning), Blue (info)

### Light Mode

- Clean white backgrounds with subtle grey card surfaces
- Dark text for high readability
- Light borders and dividers
- Professional and minimal aesthetic

### Dark Mode

- Rich dark backgrounds (zinc/slate tones)
- Light text with appropriate contrast
- Subtle card elevation through border highlights
- Reduced eye strain for extended use

### How to Switch Themes

1. Look at the **top header bar** on any page
2. Find the **sun/moon icon** (usually near the right side)
3. Click it to toggle between Light and Dark mode
4. Your preference persists across sessions

---

## Additional Resources

### Data Sources

**URL**: `/data-sources`

Manage external data connections and file uploads for analytics and reporting.

### Dashboard Builder

**URL**: `/dashboard-builder`

Create custom dashboard layouts with drag-and-drop widgets, custom metrics, and personalized views.

### Workflow Showcase

**URL**: `/workflow-showcase`

A demonstration page showing the platform's various AI workflow capabilities and process automations.

### Platform Documentation

**URL**: `/platform-docs`

Interactive in-app documentation covering:
- Feature guides
- API reference
- Configuration help
- FAQ section

### System Documentation

**URL**: `/system-docs`

Technical system documentation for administrators and developers.

### AI Support

**URL**: `/ai-support`  
**Sidebar**: SUPPORT → AI Support

An AI-powered help desk where you can ask questions about the platform and get instant answers.

---

## Subscription Plans

The platform offers four subscription tiers:

| Plan | Features |
|:---|:---|
| **Free** | Basic candidate management, limited job postings |
| **Basic** | Full recruitment module, candidate pipeline, basic analytics |
| **Professional** | All modules including AI agents, interviews, LMS, and document automation |
| **Enterprise** | Everything plus multi-tenant support, custom integrations, and priority support |

---

## Keyboard Shortcuts & Tips

- **Sidebar Toggle**: Click the collapse icon to expand/contract the navigation sidebar
- **Search**: Use the search functionality available on most list pages to quickly find records
- **Drag & Drop**: The Pipeline Board and Dashboard Builder support drag-and-drop for intuitive management
- **Bulk Actions**: Hold Shift or Ctrl to select multiple items on list pages for batch operations

---

## Getting Help

- **In-App**: Visit `/ai-support` for AI-powered assistance
- **Documentation**: Visit `/platform-docs` for detailed feature guides
- **Support**: Contact your system administrator or submit a request via the Tenant Requests system

---

*Avatar Human Capital — Transforming HR with AI*

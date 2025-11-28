import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, vector, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'tenant_admin', 'super_admin'
  isSuperAdmin: integer("is_super_admin").notNull().default(0), // 1 = can access multiple tenants
}, (table) => ({
  tenantIdIdx: index("users_tenant_id_idx").on(table.tenantId),
}));

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  title: text("title").notNull(),
  department: text("department").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Active"),
  
  // Compensation
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  payRateUnit: text("pay_rate_unit"), // 'hourly', 'daily', 'monthly', 'annual'
  
  // Location & Schedule
  location: text("location"),
  employmentType: text("employment_type"), // 'full_time', 'part_time', 'contract', 'temporary'
  shiftStructure: text("shift_structure"), // 'day', 'night', 'rotating', 'split'
  
  // Experience & Requirements
  minYearsExperience: integer("min_years_experience"),
  licenseRequirements: text("license_requirements").array(), // ['Code 10', 'Code 14', 'PrDP']
  vehicleTypes: text("vehicle_types").array(), // ['Rigid Truck', 'Articulated Truck', 'Forklift']
  certificationsRequired: text("certifications_required").array(), // ['First Aid', 'Hazmat', 'OHSA']
  
  // Physical & Equipment
  physicalRequirements: text("physical_requirements"), // 'Heavy lifting', 'Standing for long periods'
  equipmentExperience: jsonb("equipment_experience"), // { 'Forklift': 'required', 'Pallet Jack': 'preferred' }
  
  // Other
  unionAffiliation: text("union_affiliation"),
  
  // RAG Embeddings
  requirementsEmbedding: vector("requirements_embedding", { dimensions: 1536 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("jobs_tenant_id_idx").on(table.tenantId),
}));

export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role"),
  source: text("source").notNull().default("Uploaded"),
  status: text("status").notNull().default("New"),
  stage: text("stage").notNull().default("Screening"),
  match: integer("match").notNull().default(0),
  jobId: varchar("job_id").references(() => jobs.id),
  cvUrl: text("cv_url"),
  skills: text("skills").array(),
  education: jsonb("education"),
  experience: jsonb("experience"),
  summary: text("summary"),
  linkedinUrl: text("linkedin_url"),
  location: text("location"),
  yearsOfExperience: integer("years_of_experience"),
  languages: text("languages").array(),
  certifications: text("certifications").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("candidates_tenant_id_idx").on(table.tenantId),
  jobIdIdx: index("candidates_job_id_idx").on(table.jobId),
}));

export const integrityChecks = pgTable("integrity_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  candidateId: varchar("candidate_id").notNull().references(() => candidates.id),
  checkType: text("check_type").notNull(),
  status: text("status").notNull().default("Pending"),
  result: text("result"),
  riskScore: integer("risk_score"),
  findings: jsonb("findings"),
  reminderIntervalHours: integer("reminder_interval_hours").default(24),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  nextReminderAt: timestamp("next_reminder_at"),
  reminderEnabled: integer("reminder_enabled").default(1),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("integrity_checks_tenant_id_idx").on(table.tenantId),
  candidateIdIdx: index("integrity_checks_candidate_id_idx").on(table.candidateId),
}));

export const recruitmentSessions = pgTable("recruitment_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull().default("Running"),
  searchQuery: text("search_query"),
  candidatesFound: integer("candidates_found").notNull().default(0),
  candidatesAdded: integer("candidates_added").notNull().default(0),
  searchCriteria: jsonb("search_criteria"),
  results: jsonb("results"),
  embedding: vector("embedding", { dimensions: 1536 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("recruitment_sessions_tenant_id_idx").on(table.tenantId),
  jobIdIdx: index("recruitment_sessions_job_id_idx").on(table.jobId),
}));

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  category: text("category").notNull().default("general"),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const recruitmentMetrics = pgTable("recruitment_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  month: timestamp("month").notNull(),
  placements: integer("placements").notNull().default(0),
  revenue: integer("revenue").notNull().default(0),
  avgRevenue: integer("avg_revenue").notNull().default(0),
  jobsOnTrack: integer("jobs_on_track").notNull().default(0),
  jobsAtRisk: integer("jobs_at_risk").notNull().default(0),
  jobsLost: integer("jobs_lost").notNull().default(0),
  jobsCompleted: integer("jobs_completed").notNull().default(0),
  pipelineMatching: integer("pipeline_matching").notNull().default(0),
  pipelineScreening: integer("pipeline_screening").notNull().default(0),
  pipelineShortlisted: integer("pipeline_shortlisted").notNull().default(0),
  pipelineInterview: integer("pipeline_interview").notNull().default(0),
  pipelineOffer: integer("pipeline_offer").notNull().default(0),
  pipelineHired: integer("pipeline_hired").notNull().default(0),
  pipelineLost: integer("pipeline_lost").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("recruitment_metrics_tenant_id_idx").on(table.tenantId),
}));

export const onboardingWorkflows = pgTable("onboarding_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  candidateId: varchar("candidate_id").notNull().references(() => candidates.id),
  status: text("status").notNull().default("In Progress"),
  currentStep: text("current_step"),
  tasks: jsonb("tasks"),
  documents: jsonb("documents"),
  provisioningData: jsonb("provisioning_data"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("onboarding_workflows_tenant_id_idx").on(table.tenantId),
  candidateIdIdx: index("onboarding_workflows_candidate_id_idx").on(table.candidateId),
}));

export const tenantConfig = pgTable("tenant_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  primaryColor: text("primary_color").default("#0ea5e9"),
  logoUrl: text("logo_url"),
  tagline: text("tagline"), // Custom welcome message for landing page
  industry: text("industry"),
  modulesEnabled: jsonb("modules_enabled").notNull().default(sql`'{}'::jsonb`),
  apiKeysConfigured: jsonb("api_keys_configured").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenantRequests = pgTable("tenant_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  requestedSubdomain: text("requested_subdomain").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  industry: text("industry"),
  companySize: text("company_size"), // 'small', 'medium', 'large', 'enterprise'
  message: text("message"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'cancelled'
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by"), // User ID of admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  candidateId: varchar("candidate_id").references(() => candidates.id),
  jobId: varchar("job_id").references(() => jobs.id),
  type: text("type").notNull(), // 'voice' | 'video'
  provider: text("provider").notNull(), // 'tavus' | 'hume'
  status: text("status").notNull().default("scheduled"), // 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
  sessionId: text("session_id"),
  conversationUrl: text("conversation_url"),
  transcriptUrl: text("transcript_url"),
  recordingUrl: text("recording_url"),
  durationMinutes: integer("duration_minutes"),
  metadata: jsonb("metadata"), // Provider-specific data
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("interviews_tenant_id_idx").on(table.tenantId),
  candidateIdIdx: index("interviews_candidate_id_idx").on(table.candidateId),
  jobIdIdx: index("interviews_job_id_idx").on(table.jobId),
}));

export const interviewAssessments = pgTable("interview_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").notNull().references(() => interviews.id),
  summary: text("summary"),
  rubricScores: jsonb("rubric_scores"), // { communication: 4, problemSolving: 5, ... }
  strengths: text("strengths").array(),
  improvements: text("improvements").array(),
  recommendation: text("recommendation"), // 'hire' | 'reject' | 'maybe' | 'advance'
  reviewerType: text("reviewer_type").notNull(), // 'ai' | 'human'
  reviewerId: varchar("reviewer_id"), // User ID if human reviewer
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
  requirementsEmbedding: true, // Generated automatically by the system
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrityCheckSchema = createInsertSchema(integrityChecks, {
  completedAt: z.coerce.date().optional().nullable(),
}).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
});

export const insertRecruitmentSessionSchema = createInsertSchema(recruitmentSessions, {
  completedAt: z.coerce.date().optional().nullable(),
}).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
  embedding: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertIntegrityCheck = z.infer<typeof insertIntegrityCheckSchema>;
export type IntegrityCheck = typeof integrityChecks.$inferSelect;

export type InsertRecruitmentSession = z.infer<typeof insertRecruitmentSessionSchema>;
export type RecruitmentSession = typeof recruitmentSessions.$inferSelect;

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

export const insertOnboardingWorkflowSchema = createInsertSchema(onboardingWorkflows, {
  completedAt: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
}).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
});

export type InsertOnboardingWorkflow = z.infer<typeof insertOnboardingWorkflowSchema>;
export type OnboardingWorkflow = typeof onboardingWorkflows.$inferSelect;

export const insertTenantConfigSchema = createInsertSchema(tenantConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTenantConfig = z.infer<typeof insertTenantConfigSchema>;
export type TenantConfig = typeof tenantConfig.$inferSelect;

export const insertTenantRequestSchema = createInsertSchema(tenantRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedBy: true,
  reviewedAt: true,
});

// Schema for admin updating/reviewing tenant requests (with validation)
export const updateTenantRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  adminNotes: z.string().optional(),
  reviewedAt: z.string().optional(), // ISO timestamp
});

export type InsertTenantRequest = z.infer<typeof insertTenantRequestSchema>;
export type UpdateTenantRequest = z.infer<typeof updateTenantRequestSchema>;
export type TenantRequest = typeof tenantRequests.$inferSelect;

export const insertInterviewSchema = createInsertSchema(interviews, {
  candidateId: z.string().nullable().optional(),
  jobId: z.string().nullable().optional(),
  scheduledAt: z.coerce.date().optional().nullable(),
  startedAt: z.coerce.date().optional().nullable(),
  endedAt: z.coerce.date().optional().nullable(),
}).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
});

export const updateInterviewSchema = z.object({
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "failed"]).optional(),
  sessionId: z.string().nullable().optional(),
  conversationUrl: z.string().nullable().optional(),
  transcriptUrl: z.string().nullable().optional(),
  recordingUrl: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive().nullable().optional(),
  metadata: z.any().optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  startedAt: z.coerce.date().nullable().optional(),
  endedAt: z.coerce.date().nullable().optional(),
});

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type UpdateInterview = z.infer<typeof updateInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

export const insertInterviewAssessmentSchema = createInsertSchema(interviewAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInterviewAssessment = z.infer<typeof insertInterviewAssessmentSchema>;
export type InterviewAssessment = typeof interviewAssessments.$inferSelect;

export const insertRecruitmentMetricSchema = createInsertSchema(recruitmentMetrics, {
  month: z.coerce.date(),
}).omit({
  id: true,
  tenantId: true, // Injected server-side from req.tenant.id to prevent spoofing
  createdAt: true,
  updatedAt: true,
});

export type InsertRecruitmentMetric = z.infer<typeof insertRecruitmentMetricSchema>;
export type RecruitmentMetric = typeof recruitmentMetrics.$inferSelect;

// ==================== WORKFORCE INTELLIGENCE ====================

// Skills Taxonomy - Master list of skills
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Technical', 'Soft Skills', 'Leadership', 'Domain'
  description: text("description"),
  parentSkillId: varchar("parent_skill_id"), // For hierarchical skills
  isEssential: integer("is_essential").default(0), // 1 = marked as essential
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("skills_tenant_id_idx").on(table.tenantId),
  categoryIdx: index("skills_category_idx").on(table.category),
}));

// Employees (People Profiles) - Internal workforce
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  department: text("department"),
  team: text("team"),
  jobTitle: text("job_title"),
  manager: text("manager"),
  location: text("location"),
  employmentType: text("employment_type"), // 'full_time', 'part_time', 'contract'
  startDate: timestamp("start_date"),
  avatarUrl: text("avatar_url"),
  linkedinUrl: text("linkedin_url"),
  cvUrl: text("cv_url"),
  bio: text("bio"),
  tags: text("tags").array(), // For grouping/filtering
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("employees_tenant_id_idx").on(table.tenantId),
  departmentIdx: index("employees_department_idx").on(table.department),
  teamIdx: index("employees_team_idx").on(table.team),
}));

// Employee Skill Assessments - Links employees to skills with proficiency levels
export const employeeSkills = pgTable("employee_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  skillId: varchar("skill_id").notNull().references(() => skills.id),
  proficiencyLevel: integer("proficiency_level").notNull().default(1), // 1-8 scale
  status: text("status").notNull().default("assessed"), // 'critical_gap', 'training_needed', 'good_match', 'beyond_expectations'
  source: text("source").notNull().default("self"), // 'self', 'manager', 'cv_parsed', 'assessment'
  notes: text("notes"),
  assessedAt: timestamp("assessed_at").notNull().defaultNow(),
  assessedBy: varchar("assessed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("employee_skills_tenant_id_idx").on(table.tenantId),
  employeeIdIdx: index("employee_skills_employee_id_idx").on(table.employeeId),
  skillIdIdx: index("employee_skills_skill_id_idx").on(table.skillId),
}));

// Job Skill Requirements - Skills required for each job
export const jobSkills = pgTable("job_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  skillId: varchar("skill_id").notNull().references(() => skills.id),
  requiredLevel: integer("required_level").notNull().default(3), // Minimum proficiency required (1-8)
  importance: text("importance").notNull().default("required"), // 'essential', 'required', 'preferred', 'nice_to_have'
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("job_skills_tenant_id_idx").on(table.tenantId),
  jobIdIdx: index("job_skills_job_id_idx").on(table.jobId),
}));

// Skill Activity Log - Track skill updates for learning path feed
export const skillActivities = pgTable("skill_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  employeeId: varchar("employee_id").references(() => employees.id),
  skillId: varchar("skill_id").references(() => skills.id),
  activityType: text("activity_type").notNull(), // 'skill_added', 'skill_improved', 'gap_closed', 'assessment_completed'
  description: text("description"),
  previousLevel: integer("previous_level"),
  newLevel: integer("new_level"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("skill_activities_tenant_id_idx").on(table.tenantId),
  employeeIdIdx: index("skill_activities_employee_id_idx").on(table.employeeId),
}));

// Departments - For skill analysis grouping
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  name: text("name").notNull(),
  headCount: integer("head_count").default(0),
  skillGapScore: integer("skill_gap_score").default(0), // Higher = more gaps
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdIdx: index("departments_tenant_id_idx").on(table.tenantId),
}));

// Insert schemas for new tables
export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees, {
  startDate: z.coerce.date().optional().nullable(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSkillSchema = createInsertSchema(employeeSkills, {
  assessedAt: z.coerce.date().optional(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSkillSchema = createInsertSchema(jobSkills).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const insertSkillActivitySchema = createInsertSchema(skillActivities).omit({
  id: true,
  tenantId: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertEmployeeSkill = z.infer<typeof insertEmployeeSkillSchema>;
export type EmployeeSkill = typeof employeeSkills.$inferSelect;

export type InsertJobSkill = z.infer<typeof insertJobSkillSchema>;
export type JobSkill = typeof jobSkills.$inferSelect;

export type InsertSkillActivity = z.infer<typeof insertSkillActivitySchema>;
export type SkillActivity = typeof skillActivities.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

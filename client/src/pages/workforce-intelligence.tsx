import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search, Filter, Users, Briefcase, TrendingUp, Target, AlertCircle, CheckCircle,
  ChevronRight, Plus, X, Building2, MapPin, Clock, Star, Zap, Brain,
  BarChart3, UserCheck, ArrowUpRight, Sparkles, GraduationCap, Award
} from "lucide-react";
import { api } from "@/lib/api";
import type { Employee, Skill, Job, EmployeeSkill, SkillActivity, Department } from "@shared/schema";

interface SkillWithStatus extends Skill {
  employeeCount?: number;
  avgProficiency?: number;
}

interface DepartmentWithSkills extends Department {
  employees?: Employee[];
  skillGaps?: string[];
}

interface EmployeeWithSkills extends Employee {
  skills?: (EmployeeSkill & { skill?: Skill })[];
  matchScore?: number;
}

const SKILL_STATUS_COLORS = {
  critical_gap: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-500" },
  training_needed: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-500" },
  good_match: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", dot: "bg-green-500" },
  beyond_expectations: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-500" },
};

const SKILL_LEVEL_LABELS = [
  "No experience",
  "Beginner",
  "Elementary",
  "Intermediate",
  "Advanced",
  "Proficient",
  "Expert",
  "Master"
];

export default function WorkforceIntelligence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithSkills | null>(null);
  const [showSkillGaps, setShowSkillGaps] = useState(true);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("all");
  
  const queryClient = useQueryClient();
  const employeesKey = useTenantQueryKey(["employees"]);
  const skillsKey = useTenantQueryKey(["skills"]);
  const departmentsKey = useTenantQueryKey(["departments"]);
  const jobsKey = useTenantQueryKey(["jobs"]);
  const activitiesKey = useTenantQueryKey(["skill-activities"]);

  const { data: employees = [], isLoading: employeesLoading } = useQuery<EmployeeWithSkills[]>({
    queryKey: employeesKey,
    queryFn: async () => {
      const response = await api.get("/employees");
      return response.data;
    },
  });

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: skillsKey,
    queryFn: async () => {
      const response = await api.get("/skills");
      return response.data;
    },
  });

  const { data: departments = [] } = useQuery<DepartmentWithSkills[]>({
    queryKey: departmentsKey,
    queryFn: async () => {
      const response = await api.get("/departments");
      return response.data;
    },
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: jobsKey,
    queryFn: async () => {
      const response = await api.get("/jobs");
      return response.data;
    },
  });

  const { data: activities = [] } = useQuery<SkillActivity[]>({
    queryKey: activitiesKey,
    queryFn: async () => {
      const response = await api.get("/skill-activities");
      return response.data;
    },
  });

  const skillCategories = Array.from(new Set(skills.map(s => s.category)));

  const filteredSkills = skills.filter(skill => 
    selectedSkillCategory === "all" || skill.category === selectedSkillCategory
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critical_gap": return "Critical gap";
      case "training_needed": return "Training needed";
      case "good_match": return "Good skill match";
      case "beyond_expectations": return "Beyond expectations";
      default: return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "skill_added": return <Plus className="h-3 w-3" />;
      case "skill_improved": return <TrendingUp className="h-3 w-3" />;
      case "gap_closed": return <CheckCircle className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Mock data for demo
  const mockDepartments: DepartmentWithSkills[] = [
    { id: "1", tenantId: "1", name: "Operations", headCount: 12, skillGapScore: 12, skillGaps: ["Data Analysis", "Inventory Management", "Teamwork", "Attention to Detail"], metadata: null, createdAt: new Date(), updatedAt: new Date() },
    { id: "2", tenantId: "1", name: "Legal", headCount: 8, skillGapScore: 11, skillGaps: ["Intellectual Property (IP) Law", "Analytical Thinking"], metadata: null, createdAt: new Date(), updatedAt: new Date() },
    { id: "3", tenantId: "1", name: "Finance", headCount: 10, skillGapScore: 10, skillGaps: ["Risk Management", "Ethical Judgment"], metadata: null, createdAt: new Date(), updatedAt: new Date() },
    { id: "4", tenantId: "1", name: "Marketing", headCount: 15, skillGapScore: 9, skillGaps: ["Data Analysis", "SEO", "Leadership", "Communication"], metadata: null, createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockJobs = [
    { id: "1", title: "Senior Product Designer", department: "Design", salaryMin: 6000, salaryMax: 8000, location: "Remote", applicants: 32, internalMatches: 6, skills: ["Data Analysis", "Analytical Thinking"] },
    { id: "2", title: "Financial Analyst", department: "Finance", salaryMin: 5000, salaryMax: 7000, location: "Johannesburg", applicants: 28, internalMatches: 4, skills: ["Data Analysis", "Analytical Thinking"] },
  ];

  const mockActivities = [
    { id: "1", employeeName: "Mark", skillName: "Public Presentation", type: "skill_added", time: "23 minutes ago", teamName: null },
    { id: "2", employeeName: "Julia", skillName: "Communication", type: "gap_closed", time: "2 hours ago", teamName: null },
    { id: "3", employeeName: null, skillName: "Hubspot", type: "skill_added", time: "2 hours ago", teamName: "Marketing team" },
    { id: "4", employeeName: null, skillName: null, type: "no_update", time: "Yesterday", teamName: "Sales team", message: "hasn't made any skill status updates or improvements in the last week" },
  ];

  const mockSkillAssessments = [
    { name: "Communication", description: "Exchanging information effectively through verbal, non-verbal, and written means to convey ideas...", skills: ["Active listening", "Written communication"], status: "good_match", mentors: ["avatar1", "avatar2"] },
    { name: "Planning and organising", description: "Setting objectives, prioritising tasks, and managing resources effectively to achieve goals...", skills: ["Time management"], status: "training_needed", mentors: ["avatar3"] },
    { name: "Supporting others", description: "Providing help, guidance, and encouragement to individuals or teams to enhance performance...", skills: ["Coaching", "Mentoring"], status: "good_match", mentors: ["avatar4", "avatar5"] },
    { name: "Recruiting and hiring", description: "Identifying, attracting, and selecting suitable candidates by assessing skills, experience...", skills: ["Interviewing", "Assessing"], status: "critical_gap", mentors: ["avatar6"] },
    { name: "Supervising people", description: "Overseeing and guiding individuals or teams by setting expectations, providing support...", skills: ["Delegating", "Leadership"], status: "good_match", mentors: ["avatar7"] },
    { name: "Making decisions", description: "Evaluating information, weighing options, and choosing the best course of action...", skills: ["Critical thinking", "Risk assessing"], status: "training_needed", mentors: ["avatar8"] },
    { name: "Assessing data", description: "Collecting, analyzing, and interpreting information to identify patterns and support decision-making...", skills: ["Trend identification", "Report interpretation"], status: "good_match", mentors: ["avatar9"] },
    { name: "Marketing", description: "Promoting products, services, or brands by understanding customer needs, crafting messages...", skills: ["Market research", "Branding", "Digital marketing"], status: "beyond_expectations", mentors: ["avatar10"] },
  ];

  const mockMatchingData = {
    skills: ["Javascript", "Project Management", "HTML5", "Solution Architecture", "Lean methodologies"],
    people: [
      { name: "Dylan George", avatar: "", scores: { "Javascript": 90, "Project Management": 80, "HTML5": 85, "Solution Architecture": 75, "Lean methodologies": 70 }, overallMatch: 90 },
      { name: "Helly Riggs", avatar: "", scores: { "Javascript": 85, "Project Management": 75, "HTML5": 80, "Solution Architecture": 65, "Lean methodologies": 60 }, overallMatch: 80 },
      { name: "Kier Eagan", avatar: "", scores: { "Javascript": 70, "Project Management": 80, "HTML5": 65, "Solution Architecture": null, "Lean methodologies": 55 }, overallMatch: 70 },
      { name: "Burt Goodman", avatar: "", scores: { "Javascript": null, "Project Management": 60, "HTML5": null, "Solution Architecture": 50, "Lean methodologies": null }, overallMatch: null },
      { name: "Mark Scout", avatar: "", scores: { "Javascript": 60, "Project Management": 55, "HTML5": 50, "Solution Architecture": 45, "Lean methodologies": 40 }, overallMatch: 50 },
    ],
  };

  const displayDepartments = departments.length > 0 ? departments : mockDepartments;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">
                  Workforce Intelligence
                </h1>
                <p className="text-zinc-500">
                  Skills analysis, internal mobility & learning paths
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-white border-zinc-200"
                  data-testid="input-search"
                />
              </div>
              <Button variant="outline" size="icon" className="bg-white">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-white border border-zinc-200 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Skill Assessment
              </TabsTrigger>
              <TabsTrigger value="matching" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Matching
              </TabsTrigger>
              <TabsTrigger value="people" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                People
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skill Analysis Section */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white border-zinc-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Skill analysis</CardTitle>
                          <CardDescription>Area's to focus on</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayDepartments.map((dept, idx) => (
                          <Card 
                            key={dept.id} 
                            className="bg-zinc-50 border-zinc-200 hover:border-amber-300 transition-colors cursor-pointer"
                            data-testid={`card-department-${dept.name.toLowerCase()}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="outline" className="text-xs text-zinc-500">
                                  #{12 - idx}
                                </Badge>
                                <span className="font-semibold">{dept.name}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-3">
                                {[...Array(Math.min(dept.headCount || 4, 5))].map((_, i) => (
                                  <Avatar key={i} className="h-6 w-6 -ml-1 first:ml-0 border-2 border-white">
                                    <AvatarFallback className="text-[10px] bg-zinc-200">
                                      {String.fromCharCode(65 + i)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {(dept.headCount || 0) > 5 && (
                                  <span className="text-xs text-zinc-500 ml-1">+{(dept.headCount || 0) - 5}</span>
                                )}
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs text-zinc-500">Skill to address:</p>
                                <div className="flex flex-wrap gap-1">
                                  {(dept.skillGaps || []).slice(0, 3).map((skill, i) => (
                                    <Badge 
                                      key={i}
                                      variant="secondary" 
                                      className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-200"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Internal Mobility */}
                  <Card className="bg-white border-zinc-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Internal Mobility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockJobs.map((job) => (
                        <Card 
                          key={job.id} 
                          className="bg-zinc-50 border-zinc-200 hover:border-amber-300 transition-colors"
                          data-testid={`card-job-${job.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <div className="flex flex-wrap gap-1">
                                  {job.skills.map((skill, i) => (
                                    <Badge 
                                      key={i}
                                      className="text-xs bg-blue-100 text-blue-700"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-zinc-500 line-clamp-2">
                                  As a {job.title}, you will play a key role in the product development lifecycle, from conceptualization to delivery. You will work closely with...
                                </p>
                                <div className="flex items-center gap-4 text-sm text-zinc-500">
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium text-zinc-900">R{job.salaryMin?.toLocaleString()} - R{job.salaryMax?.toLocaleString()}</span>/month
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {job.applicants} applicants
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                  </span>
                                </div>
                                <p className="text-sm text-amber-600 font-medium">
                                  Internal matches: {job.internalMatches}
                                </p>
                              </div>
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(job.internalMatches, 4))].map((_, i) => (
                                  <Avatar key={i} className="h-8 w-8 border-2 border-white">
                                    <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                                      {String.fromCharCode(65 + i)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Learning Path Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-white border-zinc-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Learning Path</CardTitle>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-zinc-200" />
                        <div className="space-y-4">
                          {mockActivities.map((activity, idx) => (
                            <div key={activity.id} className="relative pl-8">
                              <div className={`absolute left-1.5 w-3 h-3 rounded-full border-2 border-white ${
                                activity.type === "skill_added" ? "bg-green-500" :
                                activity.type === "gap_closed" ? "bg-blue-500" :
                                activity.type === "no_update" ? "bg-red-500" :
                                "bg-amber-500"
                              }`} />
                              <div className="space-y-1">
                                <p className="text-xs text-zinc-400">{activity.time}</p>
                                <p className="text-sm">
                                  {activity.employeeName ? (
                                    <>
                                      <span className="font-medium">{activity.employeeName}</span>
                                      {activity.type === "skill_added" ? " has added a new skill:" : " has closed her skill gap in:"}
                                    </>
                                  ) : activity.teamName ? (
                                    <>
                                      <span className="font-medium">{activity.teamName}</span>
                                      {activity.message ? ` ${activity.message}` : " has added a new skill:"}
                                    </>
                                  ) : null}
                                </p>
                                {activity.skillName && (
                                  <Badge className={`text-xs ${
                                    activity.type === "skill_added" ? "bg-green-100 text-green-700" :
                                    activity.type === "gap_closed" ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>
                                    {activity.skillName}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Skill Assessment Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-white border-zinc-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg">Skill assessment</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch checked={true} />
                        <Label className="text-sm text-zinc-500">Group similar skills</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">All types</Button>
                      <Button variant="outline" size="sm">Manage skills</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="bg-zinc-100">All 21</Badge>
                    <Badge className="bg-red-100 text-red-700">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                      Critical gap 1
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                      Training needed 5
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                      Good skill match 13
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700">
                      <span className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
                      Beyond expectations 2
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockSkillAssessments.map((skill, idx) => {
                      const colors = SKILL_STATUS_COLORS[skill.status as keyof typeof SKILL_STATUS_COLORS] || SKILL_STATUS_COLORS.good_match;
                      return (
                        <Card 
                          key={idx}
                          className={`border ${colors.border} ${colors.bg} hover:shadow-md transition-shadow cursor-pointer`}
                          data-testid={`card-skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-zinc-900">{skill.name}</h3>
                              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-3">{skill.description}</p>
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {skill.skills.map((s, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">Recommended mentors</p>
                              <div className="flex -space-x-1">
                                {[...Array(2)].map((_, i) => (
                                  <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                    <AvatarFallback className="text-[10px] bg-zinc-200">
                                      {String.fromCharCode(65 + i + idx)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Matching Tab */}
            <TabsContent value="matching" className="space-y-6">
              <Card className="bg-white border-zinc-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg">Matching</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch checked={showSkillGaps} onCheckedChange={setShowSkillGaps} />
                        <Label className="text-sm text-zinc-500">Show skill gap</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Quick select</Button>
                      <Button variant="outline" size="sm">Select Tag or</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-3 border-b border-zinc-200 w-48"></th>
                          {mockMatchingData.people.map((person, idx) => (
                            <th key={idx} className="p-3 border-b border-zinc-200 text-center min-w-[120px]">
                              <div className="flex flex-col items-center gap-2">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-amber-100 text-amber-700">
                                    {getInitials(person.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{person.name}</span>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-zinc-400">
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </th>
                          ))}
                          <th className="p-3 border-b border-zinc-200 w-12">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockMatchingData.skills.map((skill, skillIdx) => (
                          <tr key={skillIdx} className="hover:bg-zinc-50">
                            <td className="p-3 border-b border-zinc-100">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{skill}</span>
                                <div className="flex items-center gap-1 text-zinc-400">
                                  <span className="text-xs">↕</span>
                                  <X className="h-3 w-3 cursor-pointer hover:text-zinc-600" />
                                </div>
                              </div>
                            </td>
                            {mockMatchingData.people.map((person, personIdx) => {
                              const score = person.scores[skill as keyof typeof person.scores];
                              const getScoreColor = (s: number | null) => {
                                if (s === null) return "bg-zinc-100";
                                if (s >= 80) return "bg-green-100";
                                if (s >= 60) return "bg-yellow-100";
                                if (s >= 40) return "bg-orange-100";
                                return "bg-red-100";
                              };
                              const getScoreIcon = (s: number | null) => {
                                if (s === null) return null;
                                if (s >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
                                if (s >= 60) return <div className="h-3 w-3 rounded-full bg-yellow-500" />;
                                return <div className="h-3 w-3 rounded-full bg-red-500" />;
                              };
                              return (
                                <td 
                                  key={personIdx} 
                                  className={`p-3 border-b border-zinc-100 text-center ${getScoreColor(score)}`}
                                >
                                  <div className="flex justify-center">
                                    {score !== null ? getScoreIcon(score) : (
                                      <span className="text-xs text-zinc-400">No data</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-3 border-b border-zinc-100"></td>
                          </tr>
                        ))}
                        <tr>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" className="text-zinc-500">
                              <Plus className="h-4 w-4 mr-2" />
                              Add skill
                            </Button>
                          </td>
                          <td colSpan={mockMatchingData.people.length + 1}></td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-zinc-200">
                          <td className="p-3 font-medium">Match Score</td>
                          {mockMatchingData.people.map((person, idx) => (
                            <td key={idx} className="p-3 text-center font-semibold">
                              {person.overallMatch !== null ? `${person.overallMatch}% match` : (
                                <span className="text-zinc-400 text-sm">Insufficient data</span>
                              )}
                            </td>
                          ))}
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button variant="ghost" size="sm" className="text-zinc-500">
                      Clear all
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-6">
              <Card className="bg-white border-zinc-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">People Profiles</CardTitle>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Person
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {employees.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-zinc-600 mb-2">No people profiles yet</h3>
                      <p className="text-zinc-500 mb-4">
                        Upload CVs or add employees to build your workforce intelligence
                      </p>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Person
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employees.map((employee) => (
                        <Card 
                          key={employee.id}
                          className="border-zinc-200 hover:border-amber-300 transition-colors cursor-pointer"
                          onClick={() => setSelectedEmployee(employee)}
                          data-testid={`card-employee-${employee.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatarUrl || undefined} />
                                <AvatarFallback className="bg-amber-100 text-amber-700">
                                  {getInitials(employee.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{employee.fullName}</h3>
                                <p className="text-sm text-zinc-500 truncate">{employee.jobTitle}</p>
                                <p className="text-xs text-zinc-400">{employee.department}</p>
                              </div>
                            </div>
                            {employee.tags && employee.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {employee.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-100 text-amber-700">
                  {selectedEmployee ? getInitials(selectedEmployee.fullName) : ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedEmployee?.fullName}</span>
                <p className="text-sm font-normal text-zinc-500">{selectedEmployee?.jobTitle}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-zinc-500">Department</Label>
                <p className="font-medium">{selectedEmployee?.department || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-500">Team</Label>
                <p className="font-medium">{selectedEmployee?.team || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-500">Location</Label>
                <p className="font-medium">{selectedEmployee?.location || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-500">Email</Label>
                <p className="font-medium">{selectedEmployee?.email || "Not set"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-zinc-500 mb-2 block">Skills</Label>
              <div className="flex flex-wrap gap-2">
                {selectedEmployee?.skills?.map((es, i) => (
                  <Badge 
                    key={i} 
                    className="bg-amber-100 text-amber-700"
                  >
                    {es.skill?.name || "Unknown Skill"} - Level {es.proficiencyLevel}
                  </Badge>
                )) || (
                  <p className="text-zinc-500 text-sm">No skills assessed yet</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

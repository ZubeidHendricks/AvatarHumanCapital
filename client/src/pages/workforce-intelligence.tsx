import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Filter, Users, TrendingUp, CheckCircle,
  ChevronRight, Plus, X, MapPin, Brain, Send, Loader2,
  Sparkles, AlertTriangle, ArrowRight, Bell, Flame, Database
} from "lucide-react";
import { api } from "@/lib/api";
import type { Employee, Skill, Job, EmployeeSkill, SkillActivity, Department } from "@shared/schema";

interface DepartmentGap {
  department: string;
  headCount: number;
  skillGaps: string[];
  gapScore: number;
}

interface EmployeeWithSkills extends Employee {
  skills: (EmployeeSkill & { skill: Skill })[];
}

interface SkillAssessmentCategory {
  name: string;
  skills: { id: string; name: string; avgProficiency: number; assessedCount: number; gapCount: number }[];
  avgProficiency: number;
  totalAssessed: number;
}

interface AIResponse {
  success: boolean;
  answer: string;
  confidence: number;
  matchedEmployee: { name: string; matchScore: number; reason: string } | null;
  insights: string[];
  recommendations: string[];
  alerts: { type: string; message: string }[];
  thinkingTime: number;
}

interface WorkforceAlert {
  id: string;
  type: "urgent" | "promotion" | "info";
  category: string;
  title: string;
  description: string;
  team?: string;
  time: string;
}

const SKILL_STATUS_COLORS = {
  critical_gap: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-500" },
  training_needed: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-500" },
  good_match: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", dot: "bg-green-500" },
  beyond_expectations: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-500" },
};

export default function WorkforceIntelligence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithSkills | null>(null);
  const [showSkillGaps, setShowSkillGaps] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const queryClient = useQueryClient();
  
  const employeesKey = useTenantQueryKey(["workforce-employees"]);
  const skillsKey = useTenantQueryKey(["skills"]);
  const departmentGapsKey = useTenantQueryKey(["department-gaps"]);
  const jobsKey = useTenantQueryKey(["jobs"]);
  const alertsKey = useTenantQueryKey(["workforce-alerts"]);
  const skillAssessmentsKey = useTenantQueryKey(["skill-assessments"]);
  const skillActivitiesKey = useTenantQueryKey(["skill-activities"]);
  const allEmployeeSkillsKey = useTenantQueryKey(["all-employee-skills"]);

  // Fetch employees with their skills (for People Profiles and Matching)
  const { data: employeesWithSkills = [], isLoading: employeesLoading } = useQuery<EmployeeWithSkills[]>({
    queryKey: employeesKey,
    queryFn: async () => {
      const response = await api.get("/workforce/employees");
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

  // Fetch department skill gaps (for Skill Analysis section)
  const { data: departmentGaps = [], isLoading: departmentGapsLoading } = useQuery<DepartmentGap[]>({
    queryKey: departmentGapsKey,
    queryFn: async () => {
      const response = await api.get("/workforce/department-gaps");
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

  const { data: alertsData } = useQuery<{ alerts: WorkforceAlert[] }>({
    queryKey: alertsKey,
    queryFn: async () => {
      const response = await api.get("/workforce-ai/alerts");
      return response.data;
    },
  });

  // Fetch skill assessments grouped by category
  const { data: skillAssessments = [], isLoading: skillAssessmentsLoading } = useQuery<SkillAssessmentCategory[]>({
    queryKey: skillAssessmentsKey,
    queryFn: async () => {
      const response = await api.get("/workforce/skill-assessments");
      return response.data;
    },
  });

  // Fetch skill activities for Learning Path
  const { data: skillActivities = [] } = useQuery<SkillActivity[]>({
    queryKey: skillActivitiesKey,
    queryFn: async () => {
      const response = await api.get("/skill-activities");
      return response.data;
    },
  });

  // Fetch all employee skills for matching matrix
  const { data: allEmployeeSkills = [] } = useQuery<(EmployeeSkill & { skill: Skill; employee: Employee })[]>({
    queryKey: allEmployeeSkillsKey,
    queryFn: async () => {
      const response = await api.get("/workforce/all-employee-skills");
      return response.data;
    },
  });

  // Seed demo data mutation
  const seedDemoMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/workforce/seed-demo-data");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKey });
      queryClient.invalidateQueries({ queryKey: skillsKey });
      queryClient.invalidateQueries({ queryKey: departmentGapsKey });
      queryClient.invalidateQueries({ queryKey: skillAssessmentsKey });
      queryClient.invalidateQueries({ queryKey: allEmployeeSkillsKey });
    },
  });

  const askAIMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await api.post("/workforce-ai/ask", { question });
      return response.data as AIResponse;
    },
    onSuccess: (data) => {
      setAiResponse(data);
      setIsAiThinking(false);
    },
    onError: () => {
      setIsAiThinking(false);
    },
  });

  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;
    setIsAiThinking(true);
    setAiResponse(null);
    askAIMutation.mutate(aiQuestion);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Build matching data from real employee skills
  const uniqueSkillNames = Array.from(new Set(allEmployeeSkills.map(es => es.skill.name))).slice(0, 5);
  const matchingData = {
    skills: uniqueSkillNames,
    people: employeesWithSkills.slice(0, 5).map(emp => {
      const scores: Record<string, number | null> = {};
      uniqueSkillNames.forEach(skillName => {
        const empSkill = emp.skills?.find(es => es.skill?.name === skillName);
        scores[skillName] = empSkill ? Math.round((empSkill.proficiencyLevel / 8) * 100) : null;
      });
      const validScores = Object.values(scores).filter((s): s is number => s !== null);
      return {
        name: emp.fullName,
        avatar: emp.avatarUrl || "",
        scores,
        overallMatch: validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null,
      };
    }),
  };

  const alerts = alertsData?.alerts || [];

  // Helper to format time ago
  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  // Get skill status counts from real data
  const skillStatusCounts = {
    critical_gap: allEmployeeSkills.filter(es => es.status === 'critical_gap').length,
    training_needed: allEmployeeSkills.filter(es => es.status === 'training_needed').length,
    good_match: allEmployeeSkills.filter(es => es.status === 'good_match').length,
    beyond_expectations: allEmployeeSkills.filter(es => es.status === 'beyond_expectations').length,
  };

  const totalSkillAssessments = Object.values(skillStatusCounts).reduce((a, b) => a + b, 0);

  const sampleQuestions = [
    "Who's the best candidate to lead the product expansion in Cape Town?",
    "Which team has the most skill gaps?",
    "Who is ready for promotion?",
    "What skills are we missing in Marketing?",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Workforce Intelligence
                </h1>
                <p className="text-zinc-400">
                  AI-powered skills analysis, internal mobility & workforce insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search by keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                  data-testid="input-search"
                />
              </div>
              <Button variant="outline" size="icon" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* AI Assistant & Alerts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ask AHC - AI Assistant */}
            <Card className="bg-gradient-to-br from-cyan-900/30 via-purple-900/30 to-pink-900/30 border-zinc-700 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-400 border-0">Ask AHC</Badge>
                </div>
                <CardTitle className="text-xl text-white">Get instant answers</CardTitle>
                <CardDescription className="text-zinc-400">
                  Instead of wasting weeks pulling data or waiting for reports, get clear, reliable answers in seconds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question Input */}
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <p className="text-zinc-800 font-medium mb-3">{aiQuestion || "Who's the best candidate to lead the product expansion in Spain?"}</p>
                  <div className="flex gap-2">
                    <Input
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="Ask anything about your workforce..."
                      className="flex-1 bg-zinc-100 border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
                      onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                      data-testid="input-ai-question"
                    />
                    <Button 
                      onClick={handleAskAI}
                      disabled={isAiThinking || !aiQuestion.trim()}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      data-testid="button-ask-ai"
                    >
                      {isAiThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* AI Response */}
                {isAiThinking && (
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">AHC thinking for ~{Math.floor(Math.random() * 5) + 3}s...</span>
                    </div>
                  </div>
                )}

                {aiResponse && (
                  <div className="bg-white rounded-xl p-4 shadow-lg space-y-3">
                    {aiResponse.matchedEmployee && (
                      <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-amber-100 text-amber-700">
                            {getInitials(aiResponse.matchedEmployee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-zinc-900">{aiResponse.matchedEmployee.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                              {aiResponse.matchedEmployee.matchScore}% Great skill match
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-zinc-700 text-sm">{aiResponse.answer}</p>
                    {aiResponse.insights.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {aiResponse.insights.map((insight, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-zinc-600">{insight}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sample Questions */}
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.slice(0, 2).map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs border-zinc-600 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300"
                      onClick={() => setAiQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Ask anything
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Execution Co-Pilot - Alerts */}
            <Card className="bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-blue-900/30 border-zinc-700 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-500/20 text-pink-400 border-0">Execution Co-Pilot</Badge>
                </div>
                <CardTitle className="text-xl text-white">Execute & stay on track</CardTitle>
                <CardDescription className="text-zinc-400">
                  Turn answers into workforce plans, map the right people, keep reports live, and flag risks early.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Alerts */}
                {(alerts.length > 0 ? alerts : [
                  { id: "1", type: "urgent" as const, category: "Skill analysis", title: "3 team members need to grow in Sales Techniques", description: "A crucial skill for the Sales Team.", time: "now" },
                  { id: "2", type: "promotion" as const, category: "Promotion alert", title: "2 members of this team are ready for promotion", description: "Consider internal mobility opportunities.", time: "2h ago" },
                ]).map((alert) => (
                  <div key={alert.id} className="bg-white rounded-xl p-4 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-zinc-800 font-medium text-sm">{alert.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            alert.type === "urgent" 
                              ? "bg-red-100 text-red-700" 
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {alert.type === "urgent" ? <Flame className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                            {alert.type === "urgent" ? "Urgent" : "Promotion alert"}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-zinc-500">
                            {alert.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-500">{alert.time}</span>
                        <Button variant="ghost" size="sm" className="text-blue-600 text-xs p-0 h-auto mt-1 block">
                          More <ArrowRight className="h-3 w-3 inline ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Connect your systems
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                Skill Assessment
              </TabsTrigger>
              <TabsTrigger value="matching" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                Matching
              </TabsTrigger>
              <TabsTrigger value="people" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                People
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">Skill analysis</CardTitle>
                          <CardDescription className="text-zinc-400">Area's to focus on</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {departmentGaps.length === 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                              onClick={() => seedDemoMutation.mutate()}
                              disabled={seedDemoMutation.isPending}
                            >
                              <Database className="h-4 w-4 mr-2" />
                              {seedDemoMutation.isPending ? "Loading..." : "Load Demo Data"}
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {departmentGapsLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                          <p className="text-zinc-500 mt-2">Loading skill analysis...</p>
                        </div>
                      ) : departmentGaps.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                          <p className="text-zinc-400">No department skill data yet</p>
                          <p className="text-zinc-500 text-sm">Add employees and assess their skills to see analysis</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {departmentGaps.map((dept, idx) => (
                            <Card 
                              key={dept.department} 
                              className="bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 transition-colors cursor-pointer"
                              data-testid={`card-department-${dept.department.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-600">
                                    Gap: {dept.gapScore}
                                  </Badge>
                                  <span className="font-semibold text-white">{dept.department}</span>
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                  {[...Array(Math.min(dept.headCount || 1, 5))].map((_, i) => (
                                    <Avatar key={i} className="h-6 w-6 -ml-1 first:ml-0 border-2 border-zinc-800">
                                      <AvatarFallback className="text-[10px] bg-zinc-700 text-zinc-300">
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
                                    {dept.skillGaps.length > 0 ? (
                                      dept.skillGaps.slice(0, 3).map((skill, i) => (
                                        <Badge 
                                          key={i}
                                          variant="secondary" 
                                          className="text-[10px] bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0"
                                        >
                                          {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-green-400">No gaps identified</span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-white">Internal Mobility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {jobs.filter(j => j.status === "open").length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                          <p className="text-zinc-400">No open positions yet</p>
                          <p className="text-zinc-500 text-sm">Create job postings to find internal mobility opportunities</p>
                        </div>
                      ) : (
                        jobs.filter(j => j.status === "open").slice(0, 3).map((job) => {
                          const internalMatches = employeesWithSkills.filter(e => 
                            e.department === job.department
                          ).length;
                          return (
                            <Card 
                              key={job.id} 
                              className="bg-zinc-800/50 border-zinc-700 hover:border-amber-500/50 transition-colors"
                              data-testid={`card-job-${job.id}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-white">{job.title}</h3>
                                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-0">
                                      {job.department}
                                    </Badge>
                                    <p className="text-sm text-zinc-400 line-clamp-2">
                                      {job.description || `As a ${job.title}, you will play a key role in the team...`}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                      {job.salaryMin && job.salaryMax && (
                                        <span className="flex items-center gap-1">
                                          <span className="font-medium text-white">R{job.salaryMin?.toLocaleString()} - R{job.salaryMax?.toLocaleString()}</span>/month
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location || "Remote"}
                                      </span>
                                    </div>
                                    <p className="text-sm text-amber-400 font-medium">
                                      Internal matches: {internalMatches}
                                    </p>
                                  </div>
                                  <div className="flex -space-x-2">
                                    {[...Array(Math.min(internalMatches, 4))].map((_, i) => (
                                      <Avatar key={i} className="h-8 w-8 border-2 border-zinc-800">
                                        <AvatarFallback className="text-xs bg-amber-500/20 text-amber-400">
                                          {String.fromCharCode(65 + i)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">Learning Path</CardTitle>
                        <ChevronRight className="h-4 w-4 text-zinc-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-zinc-700" />
                        <div className="space-y-4">
                          {skillActivities.length === 0 ? (
                            <div className="text-center py-4 pl-8">
                              <p className="text-zinc-500 text-sm">No recent skill activities</p>
                            </div>
                          ) : (
                            skillActivities.slice(0, 5).map((activity) => (
                              <div key={activity.id} className="relative pl-8">
                                <div className={`absolute left-1.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                                  activity.activityType === "skill_added" ? "bg-green-500" :
                                  activity.activityType === "gap_closed" ? "bg-blue-500" :
                                  activity.activityType === "skill_improved" ? "bg-amber-500" :
                                  "bg-purple-500"
                                }`} />
                                <div className="space-y-1">
                                  <p className="text-xs text-zinc-500">{formatTimeAgo(activity.createdAt)}</p>
                                  <p className="text-sm text-zinc-300">
                                    {activity.description || `${activity.activityType.replace(/_/g, " ")}`}
                                  </p>
                                  {activity.newLevel && activity.previousLevel && (
                                    <Badge className="text-xs bg-green-500/20 text-green-400 border-0">
                                      Level {activity.previousLevel} → {activity.newLevel}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg text-white">Skill assessment</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch checked={true} />
                        <Label className="text-sm text-zinc-400">Group by category</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800">All types</Button>
                      <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800">Manage skills</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">All {totalSkillAssessments}</Badge>
                    <Badge className="bg-red-500/20 text-red-400 border-0">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                      Critical gap {skillStatusCounts.critical_gap}
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                      Training needed {skillStatusCounts.training_needed}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-0">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                      Good skill match {skillStatusCounts.good_match}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-0">
                      <span className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
                      Beyond expectations {skillStatusCounts.beyond_expectations}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {skillAssessmentsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                      <p className="text-zinc-500 mt-2">Loading skill assessments...</p>
                    </div>
                  ) : skillAssessments.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400">No skill assessments yet</p>
                      <p className="text-zinc-500 text-sm mb-4">Add skills and assess employee proficiency to see data</p>
                      {employeesWithSkills.length === 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                          onClick={() => seedDemoMutation.mutate()}
                          disabled={seedDemoMutation.isPending}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {seedDemoMutation.isPending ? "Loading..." : "Load Demo Data"}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {skillAssessments.map((category) => (
                        <div key={category.name}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">{category.name}</h3>
                            <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                              Avg: {category.avgProficiency}/8 | {category.totalAssessed} assessed
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {category.skills.map((skill) => {
                              const hasGap = skill.gapCount > 0;
                              const colors = hasGap 
                                ? (skill.avgProficiency < 3 ? SKILL_STATUS_COLORS.critical_gap : SKILL_STATUS_COLORS.training_needed)
                                : (skill.avgProficiency >= 6 ? SKILL_STATUS_COLORS.beyond_expectations : SKILL_STATUS_COLORS.good_match);
                              return (
                                <Card 
                                  key={skill.id}
                                  className={`border ${colors.border} ${colors.bg} hover:shadow-md transition-shadow cursor-pointer`}
                                  data-testid={`card-skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                      <h3 className="font-semibold text-white">{skill.name}</h3>
                                      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                          style={{ width: `${(skill.avgProficiency / 8) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-zinc-400">{skill.avgProficiency}/8</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                      <span>{skill.assessedCount} assessed</span>
                                      {skill.gapCount > 0 && (
                                        <Badge className="text-[10px] bg-red-500/20 text-red-400 border-0">
                                          {skill.gapCount} gap{skill.gapCount > 1 ? 's' : ''}
                                        </Badge>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matching" className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg text-white">Matching</CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch checked={showSkillGaps} onCheckedChange={setShowSkillGaps} />
                        <Label className="text-sm text-zinc-400">Show skill gap</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800">Quick select</Button>
                      <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800">Select Tag</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {matchingData.people.length === 0 || matchingData.skills.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400">No matching data available</p>
                      <p className="text-zinc-500 text-sm mb-4">Add employees with skill assessments to see matching matrix</p>
                      {employeesWithSkills.length === 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                          onClick={() => seedDemoMutation.mutate()}
                          disabled={seedDemoMutation.isPending}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {seedDemoMutation.isPending ? "Loading..." : "Load Demo Data"}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="text-left p-3 border-b border-zinc-700 w-48"></th>
                              {matchingData.people.map((person, idx) => (
                                <th key={idx} className="p-3 border-b border-zinc-700 text-center min-w-[120px]">
                                  <div className="flex flex-col items-center gap-2">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="bg-amber-500/20 text-amber-400">
                                        {getInitials(person.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-white">{person.name}</span>
                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-zinc-500 hover:text-zinc-300">
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </th>
                              ))}
                              <th className="p-3 border-b border-zinc-700 w-12">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-zinc-700 bg-zinc-800">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {matchingData.skills.map((skill, skillIdx) => (
                              <tr key={skillIdx} className="hover:bg-zinc-800/50">
                                <td className="p-3 border-b border-zinc-800">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{skill}</span>
                                    <div className="flex items-center gap-1 text-zinc-500">
                                      <span className="text-xs">↕</span>
                                      <X className="h-3 w-3 cursor-pointer hover:text-zinc-300" />
                                    </div>
                                  </div>
                                </td>
                                {matchingData.people.map((person, personIdx) => {
                                  const score = person.scores[skill as keyof typeof person.scores];
                                  const getScoreColor = (s: number | null) => {
                                    if (s === null) return "bg-zinc-800";
                                    if (s >= 80) return "bg-green-500/20";
                                    if (s >= 60) return "bg-yellow-500/20";
                                    if (s >= 40) return "bg-orange-500/20";
                                    return "bg-red-500/20";
                                  };
                                  const getScoreIcon = (s: number | null) => {
                                    if (s === null) return null;
                                    if (s >= 80) return <CheckCircle className="h-4 w-4 text-green-400" />;
                                    if (s >= 60) return <div className="h-3 w-3 rounded-full bg-yellow-500" />;
                                    return <div className="h-3 w-3 rounded-full bg-red-500" />;
                                  };
                                  return (
                                    <td 
                                      key={personIdx} 
                                      className={`p-3 border-b border-zinc-800 text-center ${getScoreColor(score)}`}
                                    >
                                      <div className="flex justify-center">
                                        {score !== null ? getScoreIcon(score) : (
                                          <span className="text-xs text-zinc-500">No data</span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="p-3 border-b border-zinc-800"></td>
                              </tr>
                            ))}
                            <tr>
                              <td className="p-3">
                                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add skill
                                </Button>
                              </td>
                              <td colSpan={matchingData.people.length + 1}></td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-zinc-700">
                              <td className="p-3 font-medium text-white">Match Score</td>
                              {matchingData.people.map((person, idx) => (
                                <td key={idx} className="p-3 text-center font-semibold text-white">
                                  {person.overallMatch !== null ? `${person.overallMatch}% match` : (
                                    <span className="text-zinc-500 text-sm">Insufficient data</span>
                                  )}
                                </td>
                              ))}
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300">
                          Clear all
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="people" className="space-y-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">People Profiles</CardTitle>
                    <div className="flex items-center gap-2">
                      {employeesWithSkills.length === 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                          onClick={() => seedDemoMutation.mutate()}
                          disabled={seedDemoMutation.isPending}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          {seedDemoMutation.isPending ? "Loading..." : "Load Demo Data"}
                        </Button>
                      )}
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Person
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {employeesLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                      <p className="text-zinc-500 mt-2">Loading people profiles...</p>
                    </div>
                  ) : employeesWithSkills.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-zinc-300 mb-2">No people profiles yet</h3>
                      <p className="text-zinc-500 mb-4">
                        Upload CVs or add employees to build your workforce intelligence
                      </p>
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Person
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employeesWithSkills.map((employee) => (
                        <Card 
                          key={employee.id}
                          className="border-zinc-700 bg-zinc-800/50 hover:border-amber-500/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEmployee(employee)}
                          data-testid={`card-employee-${employee.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={employee.avatarUrl || undefined} />
                                <AvatarFallback className="bg-amber-500/20 text-amber-400">
                                  {getInitials(employee.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate text-white">{employee.fullName}</h3>
                                <p className="text-sm text-zinc-400 truncate">{employee.jobTitle || "No title"}</p>
                                <p className="text-xs text-zinc-500">{employee.department || "No department"}</p>
                              </div>
                            </div>
                            {employee.skills && employee.skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {employee.skills.slice(0, 3).map((es, i) => {
                                  const colors = SKILL_STATUS_COLORS[es.status as keyof typeof SKILL_STATUS_COLORS] || SKILL_STATUS_COLORS.good_match;
                                  return (
                                    <Badge key={i} className={`text-[10px] ${colors.bg} ${colors.text} border-0`}>
                                      {es.skill?.name || "Unknown"} ({es.proficiencyLevel}/8)
                                    </Badge>
                                  );
                                })}
                                {employee.skills.length > 3 && (
                                  <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">
                                    +{employee.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-500 mt-3">No skills assessed</p>
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

      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-500/20 text-amber-400">
                  {selectedEmployee ? getInitials(selectedEmployee.fullName) : ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <span>{selectedEmployee?.fullName}</span>
                <p className="text-sm font-normal text-zinc-400">{selectedEmployee?.jobTitle}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-zinc-500">Department</Label>
                <p className="font-medium text-white">{selectedEmployee?.department || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-500">Team</Label>
                <p className="font-medium text-white">{selectedEmployee?.team || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-500">Location</Label>
                <p className="font-medium text-white">{selectedEmployee?.location || "Not set"}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-500">Email</Label>
                <p className="font-medium text-white">{selectedEmployee?.email || "Not set"}</p>
              </div>
            </div>
            <Separator className="bg-zinc-700" />
            <div>
              <Label className="text-xs text-zinc-500 mb-2 block">Skills</Label>
              <div className="flex flex-wrap gap-2">
                {selectedEmployee?.skills?.map((es, i) => (
                  <Badge 
                    key={i} 
                    className="bg-amber-500/20 text-amber-400 border-0"
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

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsService, candidateService, api } from "@/lib/api";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Briefcase,
  Users,
  Search,
  FileCheck,
  Video,
  Send,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Play,
  Star,
  Clock,
  Target,
  Sparkles,
  UserPlus,
  Zap,
  CircleDot,
  AlertCircle,
  FileText,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import type { Candidate, Job } from "@shared/schema";

const WORKFLOW_STEPS = [
  { id: 1, key: "create_job", name: "Create Job", shortName: "Job", icon: Briefcase, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", textColor: "text-blue-400" },
  { id: 2, key: "sourcing", name: "Sourcing", shortName: "Source", icon: Search, color: "from-slate-500 to-slate-600", bgColor: "bg-slate-500/10", borderColor: "border-slate-500/30", textColor: "text-slate-400" },
  { id: 3, key: "screening", name: "Screening", shortName: "Screen", icon: FileCheck, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30", textColor: "text-purple-400" },
  { id: 4, key: "shortlisted", name: "Shortlisted", shortName: "Short", icon: Star, color: "from-yellow-500 to-amber-500", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30", textColor: "text-yellow-400" },
  { id: 5, key: "interviewing", name: "Interviewing", shortName: "Interview", icon: Video, color: "from-indigo-500 to-indigo-600", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/30", textColor: "text-indigo-400" },
  { id: 6, key: "offer", name: "Offer Stage", shortName: "Offer", icon: Send, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30", textColor: "text-orange-400" },
  { id: 7, key: "integrity", name: "Integrity", shortName: "Checks", icon: ShieldCheck, color: "from-cyan-500 to-cyan-600", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30", textColor: "text-cyan-400" },
  { id: 8, key: "onboarding", name: "Onboarding", shortName: "Onboard", icon: GraduationCap, color: "from-teal-500 to-teal-600", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/30", textColor: "text-teal-400" },
  { id: 9, key: "hired", name: "Hired", shortName: "Hired", icon: Award, color: "from-green-500 to-green-600", bgColor: "bg-green-500/10", borderColor: "border-green-500/30", textColor: "text-green-400" },
];

const STAGE_ACTIONS: Record<string, { title: string; description: string; automations: string[] }> = {
  "create_job": { title: "Define the Position", description: "Create a new job requisition with requirements and description.", automations: ["Auto-generate JD", "Parse job specs", "Set interview questions"] },
  "sourcing": { title: "Find Candidates", description: "AI finds and imports qualified candidates from various sources.", automations: ["LinkedIn import", "CV parsing", "Auto-matching", "Bulk import"] },
  "screening": { title: "AI CV Analysis", description: "Automatically analyze and rank candidates based on requirements.", automations: ["Skills extraction", "Experience matching", "Red flag detection"] },
  "shortlisted": { title: "Top Candidates", description: "Review AI recommendations and select for interviews.", automations: ["Match ranking", "Comparison view", "Notes sharing"] },
  "interviewing": { title: "Conduct Interviews", description: "AI-powered voice and video interviews with analysis.", automations: ["Schedule interviews", "AI voice screening", "Video interviews", "Transcription"] },
  "offer": { title: "Extend Offers", description: "Generate and send offer letters, track negotiations.", automations: ["Generate offer letter", "E-signature", "Auto-trigger integrity"] },
  "integrity": { title: "Background Checks", description: "Comprehensive verification and social screening.", automations: ["Criminal check", "Credit check", "References", "Social screening"] },
  "onboarding": { title: "Welcome New Hire", description: "Complete onboarding tasks and prepare for day one.", automations: ["Welcome email", "Document collection", "IT provisioning", "Training"] },
  "hired": { title: "Successfully Hired!", description: "Employee is fully onboarded and ready.", automations: ["Add to workforce", "Assign manager", "Set KPIs"] }
};

interface DemoCandidate {
  id: string;
  fullName: string;
  role: string;
  match: number;
  stage: string;
  email: string;
  integrityStatus?: string;
  interviewScore?: number;
  onboardingProgress?: number;
}

const DEMO_CANDIDATES: DemoCandidate[] = [
  { id: "demo-1", fullName: "Sarah Chen", role: "Senior Developer", match: 94, stage: "sourcing", email: "sarah@demo.com" },
  { id: "demo-2", fullName: "Marcus Johnson", role: "Senior Developer", match: 88, stage: "sourcing", email: "marcus@demo.com" },
  { id: "demo-3", fullName: "Emily Watson", role: "Senior Developer", match: 82, stage: "sourcing", email: "emily@demo.com" },
];

const DEMO_TIMELINE: { step: number; stageName: string; actions: string[] }[] = [
  { step: 1, stageName: "create_job", actions: ["Job requisition created", "AI generated job description", "Posted to 5 job boards"] },
  { step: 2, stageName: "sourcing", actions: ["3 candidates found via LinkedIn", "CVs parsed and extracted", "Match scores calculated"] },
  { step: 3, stageName: "screening", actions: ["AI analyzed all CVs", "Skills matched to requirements", "Red flags: None detected"] },
  { step: 4, stageName: "shortlisted", actions: ["Top 2 candidates shortlisted", "Sarah (94%) and Marcus (88%)", "Interview invites sent"] },
  { step: 5, stageName: "interviewing", actions: ["Voice interviews completed", "Sarah scored 92/100", "Video interview scheduled"] },
  { step: 6, stageName: "offer", actions: ["Offer letter generated for Sarah", "E-signature sent", "Offer accepted!"] },
  { step: 7, stageName: "integrity", actions: ["Background check initiated", "Credit check: Clear", "References verified: 3/3"] },
  { step: 8, stageName: "onboarding", actions: ["Welcome email sent", "IT equipment ordered", "Training courses assigned"] },
  { step: 9, stageName: "hired", actions: ["Employee added to workforce", "Manager assigned", "First day: Monday"] },
];

export default function WorkflowShowcase() {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [advancingCandidate, setAdvancingCandidate] = useState<string | null>(null);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState(true);
  const [demoCandidates, setDemoCandidates] = useState<DemoCandidate[]>([]);
  const [demoTimeline, setDemoTimeline] = useState<typeof DEMO_TIMELINE[0][]>([]);
  const [demoJobCreated, setDemoJobCreated] = useState(false);
  
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const jobsKey = useTenantQueryKey(['jobs']);
  const candidatesKey = useTenantQueryKey(['candidates']);
  const integrityKey = useTenantQueryKey(['integrity-checks']);

  const { data: jobs = [] } = useQuery({ queryKey: jobsKey, queryFn: jobsService.getAll });
  const { data: candidates = [] } = useQuery({ queryKey: candidatesKey, queryFn: candidateService.getAll });
  const { data: integrityChecks = [] } = useQuery({
    queryKey: integrityKey,
    queryFn: async () => { try { const r = await fetch('/api/integrity-checks'); return r.ok ? r.json() : []; } catch { return []; } }
  });

  const createJobMutation = useMutation({
    mutationFn: jobsService.create,
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: jobsKey });
      setSelectedJobId(newJob.id);
      setJobTitle(""); setDepartment(""); setJobDescription("");
      toast.success("Job created!");
      setActiveStep(2);
    },
    onError: () => toast.error("Failed to create job")
  });

  const activeJobs = jobs.filter((j: Job) => j.status === 'Active');
  const selectedJob = activeJobs.find((j: Job) => j.id === selectedJobId);
  const jobCandidates = selectedJobId ? candidates.filter((c: Candidate) => c.jobId === selectedJobId) : [];

  const getStageForStep = (stepKey: string): string[] => {
    const map: Record<string, string[]> = {
      "sourcing": ["sourcing"], "screening": ["screening"], "shortlisted": ["shortlisted"],
      "interviewing": ["interviewing"], "offer": ["offer_pending", "offer_accepted"],
      "integrity": ["integrity_checks", "integrity_passed"], "onboarding": ["onboarding"], "hired": ["hired"]
    };
    return map[stepKey] || [];
  };

  const getCandidatesForStep = (stepKey: string): (Candidate | DemoCandidate)[] => {
    if (useDemoMode && demoCandidates.length > 0) {
      const stages = getStageForStep(stepKey);
      return demoCandidates.filter(c => stages.some(s => c.stage === s || c.stage.includes(s.replace('_', ''))));
    }
    const stages = getStageForStep(stepKey);
    return jobCandidates.filter((c: Candidate) => {
      const stage = (c.stage || 'sourcing').toLowerCase().replace(/\s+/g, '_');
      return stages.some(s => stage === s);
    });
  };

  const getStepStats = (stepKey: string) => {
    const count = getCandidatesForStep(stepKey).length;
    const total = useDemoMode ? demoCandidates.length : jobCandidates.length;
    return { count, percentage: total ? Math.round((count / total) * 100) : 0 };
  };

  const handleAdvanceCandidate = async (candidate: Candidate | DemoCandidate, toStage: string) => {
    if (useDemoMode) {
      setDemoCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, stage: toStage } : c));
      toast.success(`${candidate.fullName} advanced to ${toStage}`);
      return;
    }
    
    setAdvancingCandidate(candidate.id);
    try {
      const response = await api.post(`/api/pipeline/candidates/${candidate.id}/transition`, { toStage });
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: candidatesKey });
        toast.success(`${candidate.fullName} advanced!`);
      } else {
        toast.error("Cannot advance", { description: response.data.blockers?.[0] });
      }
    } catch (error: any) {
      toast.error("Cannot advance");
    } finally {
      setAdvancingCandidate(null);
    }
  };

  const handleCreateJob = () => {
    if (!jobTitle) { toast.error("Enter a job title"); return; }
    if (useDemoMode) {
      setDemoJobCreated(true);
      setDemoCandidates(DEMO_CANDIDATES.map(c => ({ ...c })));
      setDemoTimeline([DEMO_TIMELINE[0]]);
      toast.success("Demo job created!");
      setActiveStep(2);
      return;
    }
    createJobMutation.mutate({
      title: jobTitle, department: department || "General",
      description: jobDescription || `Position for ${jobTitle}`,
      status: "Active", salaryMin: 800000, salaryMax: 1200000, location: "Johannesburg"
    });
  };

  const runDemoWorkflow = async () => {
    if (!useDemoMode) { toast.error("Enable Demo Mode first"); return; }
    setIsRunningDemo(true);
    
    setDemoJobCreated(true);
    setDemoCandidates(DEMO_CANDIDATES.map(c => ({ ...c })));
    setDemoTimeline([DEMO_TIMELINE[0]]);
    setActiveStep(1);
    await new Promise(r => setTimeout(r, 600));

    const stageProgression = ["sourcing", "screening", "shortlisted", "interviewing", "offer_accepted", "integrity_passed", "onboarding", "hired"];
    
    for (let i = 0; i < stageProgression.length; i++) {
      const stage = stageProgression[i];
      const stepIndex = i + 2;
      
      setActiveStep(stepIndex);
      setDemoTimeline(prev => [...prev, DEMO_TIMELINE[stepIndex - 1]]);
      
      await new Promise(r => setTimeout(r, 400));
      
      if (stage === "shortlisted") {
        setDemoCandidates(prev => prev.slice(0, 2).map(c => ({ ...c, stage })));
      } else if (stage === "interviewing") {
        setDemoCandidates(prev => prev.map(c => ({ ...c, stage, interviewScore: c.id === "demo-1" ? 92 : 85 })));
      } else if (stage === "offer_accepted" || stage === "integrity_passed" || stage === "onboarding" || stage === "hired") {
        setDemoCandidates(prev => prev.filter(c => c.id === "demo-1").map(c => ({ 
          ...c, 
          stage, 
          integrityStatus: stage === "integrity_passed" || stage === "onboarding" || stage === "hired" ? "passed" : undefined,
          onboardingProgress: stage === "onboarding" ? 60 : stage === "hired" ? 100 : undefined
        })));
      } else {
        setDemoCandidates(prev => prev.map(c => ({ ...c, stage })));
      }
      
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsRunningDemo(false);
    toast.success("Demo complete! Sarah Chen has been hired.");
  };

  const resetDemo = () => {
    setDemoCandidates([]);
    setDemoTimeline([]);
    setDemoJobCreated(false);
    setActiveStep(1);
    setJobTitle("Senior Developer");
    setDepartment("Engineering");
    toast.info("Demo reset - ready to run again");
  };

  const currentStep = WORKFLOW_STEPS[activeStep - 1];
  const stepAction = STAGE_ACTIONS[currentStep.key];
  const progressPercent = ((activeStep - 1) / (WORKFLOW_STEPS.length - 1)) * 100;
  const IconComponent = currentStep.icon;

  useEffect(() => {
    if (useDemoMode) {
      setJobTitle("Senior Developer");
      setDepartment("Engineering");
    }
  }, [useDemoMode]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">HR Workflow Showcase</h1>
            <p className="text-muted-foreground">Complete hiring process demonstration</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={useDemoMode} onCheckedChange={setUseDemoMode} data-testid="toggle-demo-mode" />
              <Label className="text-sm">Demo Mode</Label>
            </div>
            {useDemoMode && demoTimeline.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetDemo} data-testid="button-reset-demo">
                Reset
              </Button>
            )}
            <Button 
              onClick={runDemoWorkflow}
              disabled={isRunningDemo || !useDemoMode}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="button-run-demo"
            >
              {isRunningDemo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunningDemo ? "Running..." : "Run Full Demo"}
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-card/80 to-card/60 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => activeStep > 1 && setActiveStep(activeStep - 1)} disabled={activeStep === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${currentStep.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Step {activeStep}/{WORKFLOW_STEPS.length}</span>
                      <Badge variant="outline" className={currentStep.bgColor}>{currentStep.name}</Badge>
                    </div>
                    <h2 className="text-xl font-bold">{stepAction.title}</h2>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => activeStep < WORKFLOW_STEPS.length && setActiveStep(activeStep + 1)} disabled={activeStep === WORKFLOW_STEPS.length}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Progress value={progressPercent} className="h-2 mb-4" />

            <div className="flex justify-between gap-1">
              {WORKFLOW_STEPS.map((step) => {
                const isActive = step.id === activeStep;
                const isCompleted = step.id < activeStep;
                const StepIcon = step.icon;
                const stats = step.key !== "create_job" ? getStepStats(step.key) : null;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex-1 flex flex-col items-center p-2 rounded-lg transition-all ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    data-testid={`wizard-step-${step.key}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${
                      isActive ? `bg-gradient-to-r ${step.color} shadow-lg` : isCompleted ? 'bg-green-500/20 border border-green-500' : 'bg-muted/50'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <StepIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />}
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.shortName}</span>
                    {stats && stats.count > 0 && <span className={`text-[10px] ${step.textColor}`}>{stats.count}</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader className="pb-3">
                <CardDescription>{stepAction.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep.key === "create_job" ? (
                  <div className="space-y-4">
                    {!useDemoMode && activeJobs.length > 0 && (
                      <div>
                        <Label className="text-sm mb-2 block">Select existing job:</Label>
                        <Select value={selectedJobId || ""} onValueChange={(v) => { setSelectedJobId(v); setActiveStep(2); }}>
                          <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                          <SelectContent>
                            {activeJobs.map((job: Job) => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className={!useDemoMode && activeJobs.length > 0 ? "border-t border-white/10 pt-4" : ""}>
                      <h4 className="font-medium mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> {useDemoMode ? "Demo Job" : "New Job"}</h4>
                      <div className="grid gap-3">
                        <div><Label>Job Title</Label><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Senior Developer" data-testid="input-job-title" /></div>
                        <div><Label>Department</Label><Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g., Engineering" data-testid="input-department" /></div>
                        <Button onClick={handleCreateJob} disabled={createJobMutation.isPending || !jobTitle} className="bg-gradient-to-r from-blue-500 to-blue-600" data-testid="button-create-job">
                          {createJobMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Briefcase className="h-4 w-4 mr-2" />}
                          {useDemoMode ? "Start Demo" : "Create Job"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const stepCandidates = getCandidatesForStep(currentStep.key);
                      const nextStep = WORKFLOW_STEPS[activeStep];
                      const nextStages = nextStep ? getStageForStep(nextStep.key) : [];
                      const nextStage = nextStages[0];

                      if (stepCandidates.length === 0 && !useDemoMode) {
                        return (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">No Candidates</h3>
                            <p className="text-sm text-muted-foreground">
                              {currentStep.key === "sourcing" ? "Upload CVs or use AI sourcing" : "Advance candidates from previous stage"}
                            </p>
                          </div>
                        );
                      }

                      if (stepCandidates.length === 0 && useDemoMode) {
                        return (
                          <div className="text-center py-8">
                            <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">Ready to Demo</h3>
                            <p className="text-sm text-muted-foreground mb-4">Click "Run Full Demo" or create a demo job to start</p>
                          </div>
                        );
                      }

                      return (
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-3">
                            {stepCandidates.map((candidate) => {
                              const demo = candidate as DemoCandidate;
                              return (
                                <Card key={candidate.id} className="bg-background/50 border-white/10" data-testid={`workflow-card-${candidate.id}`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                            {candidate.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{candidate.fullName}</p>
                                          <p className="text-sm text-muted-foreground">{candidate.role}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {candidate.match && (
                                          <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                                            <Star className="h-3 w-3 mr-1 text-yellow-400" />{candidate.match}%
                                          </Badge>
                                        )}
                                        {demo.interviewScore && (
                                          <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30">
                                            <Video className="h-3 w-3 mr-1" />{demo.interviewScore}/100
                                          </Badge>
                                        )}
                                        {demo.integrityStatus && (
                                          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                                            <ShieldCheck className="h-3 w-3 mr-1" />Passed
                                          </Badge>
                                        )}
                                        {demo.onboardingProgress !== undefined && (
                                          <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30">
                                            <GraduationCap className="h-3 w-3 mr-1" />{demo.onboardingProgress}%
                                          </Badge>
                                        )}
                                        {nextStage && currentStep.key !== "hired" && (
                                          <Button size="sm" className={`bg-gradient-to-r ${nextStep?.color}`}
                                            onClick={() => handleAdvanceCandidate(candidate as any, nextStage)}
                                            disabled={advancingCandidate === candidate.id}
                                            data-testid={`button-advance-${candidate.id}`}
                                          >
                                            {advancingCandidate === candidate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ChevronRight className="h-4 w-4 mr-1" />{nextStep?.shortName}</>}
                                          </Button>
                                        )}
                                        {currentStep.key === "hired" && (
                                          <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Hired</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />Automations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {stepAction.automations.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
                      <CircleDot className="h-3 w-3 text-primary" />{a}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {useDemoMode && demoTimeline.length > 0 && (
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {demoTimeline.map((entry, idx) => {
                        const step = WORKFLOW_STEPS.find(s => s.key === entry.stageName);
                        const StepIcon = step?.icon || Briefcase;
                        return (
                          <div key={idx} className="relative pl-6">
                            <div className={`absolute left-0 top-0 w-4 h-4 rounded-full bg-gradient-to-r ${step?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                              <StepIcon className="h-2 w-2 text-white" />
                            </div>
                            {idx < demoTimeline.length - 1 && (
                              <div className="absolute left-[7px] top-4 w-0.5 h-full bg-muted" />
                            )}
                            <div className="pb-4">
                              <p className="text-sm font-medium">{step?.name}</p>
                              <ul className="mt-1 space-y-0.5">
                                {entry.actions.map((action, aIdx) => (
                                  <li key={aIdx} className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-2 w-2 text-green-400" />{action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-sm">Pipeline Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(useDemoMode && demoCandidates.length > 0) || (!useDemoMode && selectedJob) ? (
                  <>
                    <div className="flex justify-between p-2 rounded bg-muted/30 text-sm">
                      <span className="text-muted-foreground">Job</span>
                      <span className="font-medium">{useDemoMode ? "Senior Developer" : selectedJob?.title}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-muted/30 text-sm">
                      <span className="text-muted-foreground">Candidates</span>
                      <span className="font-medium">{useDemoMode ? demoCandidates.length : jobCandidates.length}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2">
                      {WORKFLOW_STEPS.filter(s => s.key !== "create_job").map(step => {
                        const stats = getStepStats(step.key);
                        return (
                          <div key={step.key} className="flex items-center gap-2 py-1">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`} />
                            <span className="text-xs text-muted-foreground flex-1">{step.shortName}</span>
                            <span className="text-xs font-medium">{stats.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Run demo to see summary</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
              <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm h-9" onClick={() => setActiveStep(1)}>
                  <Briefcase className="h-3 w-3 mr-2" />New Job
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
                  <a href="/pipeline-board"><Target className="h-3 w-3 mr-2" />Pipeline Board</a>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
                  <a href="/hr-dashboard"><Sparkles className="h-3 w-3 mr-2" />HR Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

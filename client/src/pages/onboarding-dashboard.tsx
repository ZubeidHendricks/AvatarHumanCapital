import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Send,
  RefreshCw,
  User,
  Calendar,
  AlertTriangle,
  XCircle,
  Bot,
  ChevronRight,
  Sparkles,
  Shield,
  FileCheck,
  Bell,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";

interface OnboardingWorkflow {
  id: string;
  candidateId: string;
  status: string;
  currentStep: string | null;
  tasks: { completedSteps?: string[] } | null;
  startDate: string;
  completedAt: string | null;
}

interface AgentLog {
  id: string;
  workflowId: string;
  candidateId: string | null;
  agentType: string;
  action: string;
  stepName: string | null;
  status: string;
  details: Record<string, any> | null;
  communicationChannel: string | null;
  messageContent: string | null;
  requiresHumanReview: number;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
}

interface DocumentRequest {
  id: string;
  workflowId: string;
  candidateId: string;
  documentType: string;
  documentName: string;
  description: string | null;
  isRequired: number;
  status: string;
  priority: string | null;
  dueDate: string | null;
  reminderCount: number;
  maxReminders: number;
  receivedAt: string | null;
  verifiedAt: string | null;
}

interface Candidate {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  stage: string;
}

const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
  requested: { bg: "bg-blue-50", text: "text-blue-700", icon: Send },
  received: { bg: "bg-amber-50", text: "text-amber-700", icon: FileCheck },
  verified: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  rejected: { bg: "bg-red-50", text: "text-red-700", icon: XCircle },
  overdue: { bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
};

const priorityConfig: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
  normal: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  high: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  urgent: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

const channelConfig: Record<string, { icon: any; color: string }> = {
  whatsapp: { icon: MessageSquare, color: "text-green-500" },
  email: { icon: Mail, color: "text-blue-500" },
  system: { icon: Bot, color: "text-purple-500" },
  manual: { icon: User, color: "text-slate-500" },
};

const agentColors: Record<string, string> = {
  onboarding_coordinator: "from-blue-500 to-blue-600",
  welcome_agent: "from-green-500 to-green-600",
  contract_agent: "from-purple-500 to-purple-600",
  document_collector: "from-amber-500 to-amber-600",
  reminder: "from-orange-500 to-orange-600",
  escalation: "from-red-500 to-red-600",
};

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interventionDialog, setInterventionDialog] = useState<AgentLog | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: workflows = [], isLoading: loadingWorkflows } = useQuery<OnboardingWorkflow[]>({
    queryKey: ["/api/onboarding/workflows"],
  });

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: interventionQueue = [] } = useQuery<AgentLog[]>({
    queryKey: ["/api/onboarding/human-intervention-queue"],
  });

  const { data: agentLogs = [] } = useQuery<AgentLog[]>({
    queryKey: ["/api/onboarding/agent-logs", selectedWorkflow],
    enabled: !!selectedWorkflow,
  });

  const { data: documentRequests = [] } = useQuery<DocumentRequest[]>({
    queryKey: ["/api/onboarding/document-requests", selectedWorkflow],
    enabled: !!selectedWorkflow,
  });

  const processRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/onboarding/process-reminders", { method: "POST" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/human-intervention-queue"] });
      if (selectedWorkflow) {
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/document-requests", selectedWorkflow] });
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/agent-logs", selectedWorkflow] });
      }
    },
  });

  const resolveInterventionMutation = useMutation({
    mutationFn: async ({ logId, notes }: { logId: string; notes: string }) => {
      const response = await fetch(`/api/onboarding/resolve-intervention/${logId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/human-intervention-queue"] });
      setInterventionDialog(null);
      setResolutionNotes("");
    },
  });

  const markReceivedMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/onboarding/document-requests/${requestId}/received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      return response.json();
    },
    onSuccess: () => {
      if (selectedWorkflow) {
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/document-requests", selectedWorkflow] });
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/agent-logs", selectedWorkflow] });
      }
    },
  });

  const markVerifiedMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/onboarding/document-requests/${requestId}/verified`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      return response.json();
    },
    onSuccess: () => {
      if (selectedWorkflow) {
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/document-requests", selectedWorkflow] });
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/agent-logs", selectedWorkflow] });
      }
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/onboarding/document-requests/${requestId}/remind`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      if (selectedWorkflow) {
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/document-requests", selectedWorkflow] });
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/agent-logs", selectedWorkflow] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/human-intervention-queue"] });
    },
  });

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.fullName || "Unknown";
  };

  const getDocumentProgress = (requests: DocumentRequest[]) => {
    const required = requests.filter(r => r.isRequired === 1);
    const verified = required.filter(r => r.status === "verified").length;
    return required.length > 0 ? Math.round((verified / required.length) * 100) : 0;
  };

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      const candidate = candidates.find(c => c.id === workflow.candidateId);
      setSelectedCandidate(candidate || null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loadingWorkflows) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-testid="loading-spinner">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse" />
            <RefreshCw className="w-8 h-8 text-blue-500 absolute top-4 left-4 animate-spin" />
          </div>
          <p className="text-slate-500 font-medium">Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900" data-testid="link-back">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent" data-testid="page-title">
                    Onboarding Command Center
                  </h1>
                </div>
                <p className="text-slate-500 text-sm mt-1">AI-powered employee onboarding automation</p>
              </div>
            </div>
            <Button
              onClick={() => processRemindersMutation.mutate()}
              disabled={processRemindersMutation.isPending}
              className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
              data-testid="button-process-reminders"
            >
              <Zap className={`w-4 h-4 ${processRemindersMutation.isPending ? "animate-pulse" : ""}`} />
              {processRemindersMutation.isPending ? "Processing..." : "Run Automation"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg shadow-blue-500/20" data-testid="stat-total-workflows">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Workflows</p>
                  <p className="text-4xl font-bold text-white mt-1">{workflows.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Employees onboarding</span>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-0 shadow-lg ${interventionQueue.length > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20" : "bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20"}`} data-testid="stat-interventions">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${interventionQueue.length > 0 ? "text-red-100" : "text-emerald-100"}`}>
                    {interventionQueue.length > 0 ? "Needs Attention" : "All Clear"}
                  </p>
                  <p className="text-4xl font-bold text-white mt-1">{interventionQueue.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  {interventionQueue.length > 0 ? (
                    <AlertCircle className="w-7 h-7 text-white" />
                  ) : (
                    <Shield className="w-7 h-7 text-white" />
                  )}
                </div>
              </div>
              <div className={`mt-4 flex items-center gap-2 text-sm ${interventionQueue.length > 0 ? "text-red-100" : "text-emerald-100"}`}>
                <Activity className="w-4 h-4" />
                <span>{interventionQueue.length > 0 ? "Requires HR review" : "No issues detected"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg shadow-amber-500/20" data-testid="stat-pending-docs">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Awaiting Documents</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {workflows.filter(w => w.status === "awaiting_documents" || w.status === "documentation").length}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-amber-100 text-sm">
                <Bell className="w-4 h-4" />
                <span>Pending submission</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/20" data-testid="stat-completed">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed</p>
                  <p className="text-4xl font-bold text-white mt-1">
                    {workflows.filter(w => w.status === "completed").length}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-emerald-100 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Successfully onboarded</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {interventionQueue.length > 0 && (
          <Card className="mb-8 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg" data-testid="intervention-queue">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-800">Human Intervention Required</CardTitle>
                  <CardDescription className="text-red-600">
                    {interventionQueue.length} case{interventionQueue.length > 1 ? "s" : ""} need your attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {interventionQueue.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all"
                    data-testid={`intervention-item-${log.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/30">
                        {getInitials(getCandidateName(log.candidateId || ""))}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getCandidateName(log.candidateId || "")}
                        </p>
                        <p className="text-sm text-slate-500 capitalize">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {(log.details as any)?.reason || "Requires manual review"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setInterventionDialog(log)}
                      className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25"
                      data-testid={`button-resolve-${log.id}`}
                    >
                      Resolve Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <Card className="shadow-lg border-slate-200" data-testid="workflows-list">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Team Members</CardTitle>
                    <CardDescription>Select to view onboarding details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[520px]">
                  <div className="p-4 space-y-3">
                    {workflows.map(workflow => {
                      const candidate = candidates.find(c => c.id === workflow.candidateId);
                      const isSelected = selectedWorkflow === workflow.id;
                      const progress = getDocumentProgress(
                        documentRequests.filter(d => d.workflowId === workflow.id)
                      );
                      
                      return (
                        <div
                          key={workflow.id}
                          onClick={() => handleWorkflowSelect(workflow.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 scale-[1.02]"
                              : "bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md"
                          }`}
                          data-testid={`workflow-item-${workflow.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                              isSelected 
                                ? "bg-white/20 text-white" 
                                : "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
                            }`}>
                              {getInitials(candidate?.fullName || "?")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                                {candidate?.fullName || "Unknown"}
                              </p>
                              <p className={`text-sm truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                                {workflow.currentStep?.replace(/_/g, " ") || "Getting started"}
                              </p>
                            </div>
                            <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Badge className={`text-xs ${
                              isSelected 
                                ? "bg-white/20 text-white border-white/30" 
                                : workflow.status === "completed" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : workflow.status.includes("document")
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {workflow.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-8">
            {selectedWorkflow ? (
              <div className="space-y-6">
                <Card className="shadow-lg border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                          {getInitials(selectedCandidate?.fullName || "?")}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{selectedCandidate?.fullName}</h2>
                          <p className="text-blue-100">{selectedCandidate?.email}</p>
                          <p className="text-blue-200 text-sm">{selectedCandidate?.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-100 text-sm mb-2">Document Completion</p>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-3 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ width: `${getDocumentProgress(documentRequests)}%` }}
                            />
                          </div>
                          <span className="text-2xl font-bold text-white">{getDocumentProgress(documentRequests)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="documents" className="w-full">
                    <div className="border-b border-slate-200 bg-slate-50/50 px-6">
                      <TabsList className="bg-transparent border-0 p-0 h-14">
                        <TabsTrigger 
                          value="documents" 
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg border-b-2 border-transparent data-[state=active]:border-blue-500 px-6"
                          data-testid="tab-documents"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Documents
                        </TabsTrigger>
                        <TabsTrigger 
                          value="activity" 
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-t-lg border-b-2 border-transparent data-[state=active]:border-blue-500 px-6"
                          data-testid="tab-activity"
                        >
                          <Activity className="w-4 h-4 mr-2" />
                          Activity Timeline
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="documents" className="m-0">
                      <div className="p-6" data-testid="documents-panel">
                        <div className="grid gap-4">
                          {documentRequests.map(doc => {
                            const config = statusConfig[doc.status] || statusConfig.pending;
                            const priorityConf = priorityConfig[doc.priority || "normal"];
                            const StatusIcon = config.icon;
                            
                            return (
                              <div
                                key={doc.id}
                                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                                  doc.status === "verified" ? "border-emerald-200 bg-emerald-50/50" :
                                  doc.status === "received" ? "border-amber-200 bg-amber-50/50" :
                                  doc.status === "overdue" ? "border-red-200 bg-red-50/50" :
                                  "border-slate-200 bg-white"
                                }`}
                                data-testid={`doc-request-${doc.id}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${config.bg}`}>
                                      <StatusIcon className={`w-6 h-6 ${config.text}`} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-slate-900">{doc.documentName}</p>
                                        {doc.isRequired === 1 && (
                                          <Badge className="bg-blue-100 text-blue-700 text-xs">Required</Badge>
                                        )}
                                        <Badge className={`text-xs ${priorityConf.bg} ${priorityConf.text} border ${priorityConf.border}`}>
                                          {doc.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                                      {doc.dueDate && (
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Due: {new Date(doc.dueDate).toLocaleDateString()}
                                          </span>
                                          {doc.reminderCount > 0 && (
                                            <span className="flex items-center gap-1 text-orange-500">
                                              <Bell className="w-3 h-3" />
                                              {doc.reminderCount} reminder{doc.reminderCount > 1 ? "s" : ""} sent
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${config.bg} ${config.text} capitalize`}>
                                      {doc.status}
                                    </Badge>
                                    {doc.status === "requested" && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => sendReminderMutation.mutate(doc.id)}
                                          disabled={sendReminderMutation.isPending}
                                          className="gap-1"
                                          data-testid={`button-remind-${doc.id}`}
                                        >
                                          <Bell className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => markReceivedMutation.mutate(doc.id)}
                                          disabled={markReceivedMutation.isPending}
                                          className="bg-amber-500 hover:bg-amber-600"
                                          data-testid={`button-received-${doc.id}`}
                                        >
                                          Mark Received
                                        </Button>
                                      </>
                                    )}
                                    {doc.status === "received" && (
                                      <Button
                                        size="sm"
                                        onClick={() => markVerifiedMutation.mutate(doc.id)}
                                        disabled={markVerifiedMutation.isPending}
                                        className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                                        data-testid={`button-verify-${doc.id}`}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Verify
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="activity" className="m-0">
                      <div className="p-6" data-testid="activity-panel">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-slate-200" />
                            <div className="space-y-6">
                              {agentLogs
                                .slice()
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((log) => {
                                  const channelConf = channelConfig[log.communicationChannel || "system"];
                                  const ChannelIcon = channelConf?.icon || Bot;
                                  const agentGradient = agentColors[log.agentType] || "from-slate-500 to-slate-600";
                                  
                                  return (
                                    <div
                                      key={log.id}
                                      className="relative pl-14"
                                      data-testid={`activity-log-${log.id}`}
                                    >
                                      <div className={`absolute left-3 w-7 h-7 rounded-full bg-gradient-to-br ${agentGradient} flex items-center justify-center shadow-lg ring-4 ring-white`}>
                                        <ChannelIcon className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                                        log.status === "requires_intervention" ? "border-red-200" : "border-slate-200"
                                      }`}>
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className={`bg-gradient-to-r ${agentGradient} text-white border-0 text-xs`}>
                                              {log.agentType.replace(/_/g, " ")}
                                            </Badge>
                                            <span className="font-medium text-slate-900 capitalize">
                                              {log.action.replace(/_/g, " ")}
                                            </span>
                                          </div>
                                          <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTimeAgo(log.createdAt)}
                                          </span>
                                        </div>
                                        {log.messageContent && (
                                          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-sm text-slate-600 italic">"{log.messageContent}"</p>
                                          </div>
                                        )}
                                        {log.details && Object.keys(log.details).length > 0 && (
                                          <div className="mt-3 flex flex-wrap gap-2">
                                            {Object.entries(log.details).slice(0, 3).map(([key, value]) => (
                                              <span key={key} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                {key}: {String(value).slice(0, 30)}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        {log.requiresHumanReview === 1 && !log.reviewedAt && (
                                          <Badge className="mt-3 bg-red-100 text-red-700 border-red-200">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Requires Review
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center shadow-lg border-slate-200" data-testid="no-selection">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Team Member</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Choose an employee from the list to view their onboarding progress, documents, and AI agent activity.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!interventionDialog} onOpenChange={() => setInterventionDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Resolve Escalation</DialogTitle>
                <DialogDescription>
                  Review and take action on this case
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {interventionDialog && (
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white font-bold">
                    {getInitials(getCandidateName(interventionDialog.candidateId || ""))}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {getCandidateName(interventionDialog.candidateId || "")}
                    </p>
                    <p className="text-sm text-slate-500 capitalize">
                      {interventionDialog.action.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">
                    Issue: {(interventionDialog.details as any)?.reason || "Manual review required"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Step: {interventionDialog.stepName} • {formatTimeAgo(interventionDialog.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how you resolved this issue..."
                  rows={4}
                  className="resize-none"
                  data-testid="input-resolution-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterventionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => interventionDialog && resolveInterventionMutation.mutate({
                logId: interventionDialog.id,
                notes: resolutionNotes,
              })}
              disabled={resolveInterventionMutation.isPending || !resolutionNotes}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              data-testid="button-confirm-resolve"
            >
              {resolveInterventionMutation.isPending ? "Resolving..." : "Mark Resolved"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

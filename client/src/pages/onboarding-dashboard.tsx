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

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  requested: "bg-blue-100 text-blue-800",
  received: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  overdue: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const channelIcons: Record<string, any> = {
  whatsapp: MessageSquare,
  email: Mail,
  system: Bot,
  manual: User,
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

  if (loadingWorkflows) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                Onboarding Dashboard
              </h1>
              <p className="text-gray-500">Monitor and manage employee onboarding workflows</p>
            </div>
          </div>
          <Button
            onClick={() => processRemindersMutation.mutate()}
            disabled={processRemindersMutation.isPending}
            data-testid="button-process-reminders"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${processRemindersMutation.isPending ? "animate-spin" : ""}`} />
            Process Reminders
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card data-testid="stat-total-workflows">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                  <p className="text-sm text-gray-500">Active Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-interventions">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{interventionQueue.length}</p>
                  <p className="text-sm text-gray-500">Needs Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-docs">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {workflows.filter(w => w.status === "awaiting_documents" || w.status === "documentation").length}
                  </p>
                  <p className="text-sm text-gray-500">Awaiting Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {workflows.filter(w => w.status === "completed").length}
                  </p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {interventionQueue.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50" data-testid="intervention-queue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Human Intervention Required ({interventionQueue.length})
              </CardTitle>
              <CardDescription className="text-red-600">
                These cases require manual review and action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interventionQueue.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200"
                    data-testid={`intervention-item-${log.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getCandidateName(log.candidateId || "")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.action.replace(/_/g, " ")} - {log.stepName}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {(log.details as any)?.reason || "Requires manual review"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setInterventionDialog(log)}
                      data-testid={`button-resolve-${log.id}`}
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card data-testid="workflows-list">
              <CardHeader>
                <CardTitle>Onboarding Workflows</CardTitle>
                <CardDescription>Click to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {workflows.map(workflow => {
                      const candidate = candidates.find(c => c.id === workflow.candidateId);
                      const isSelected = selectedWorkflow === workflow.id;
                      return (
                        <div
                          key={workflow.id}
                          onClick={() => handleWorkflowSelect(workflow.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          data-testid={`workflow-item-${workflow.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                                {candidate?.fullName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {candidate?.fullName || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {workflow.currentStep?.replace(/_/g, " ") || "Not started"}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 ${isSelected ? "text-blue-500" : ""}`} />
                          </div>
                          <div className="mt-3">
                            <Badge className={statusColors[workflow.status] || "bg-gray-100 text-gray-800"}>
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

          <div className="col-span-2">
            {selectedWorkflow ? (
              <Tabs defaultValue="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedCandidate?.fullName || "Candidate"}</CardTitle>
                        <CardDescription>
                          {selectedCandidate?.email} | {selectedCandidate?.phone}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Document Progress</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={getDocumentProgress(documentRequests)} className="w-32" />
                          <span className="text-sm font-medium">{getDocumentProgress(documentRequests)}%</span>
                        </div>
                      </div>
                    </div>
                    <TabsList className="mt-4">
                      <TabsTrigger value="documents" data-testid="tab-documents">
                        <FileText className="w-4 h-4 mr-2" />
                        Documents
                      </TabsTrigger>
                      <TabsTrigger value="activity" data-testid="tab-activity">
                        <Clock className="w-4 h-4 mr-2" />
                        Activity
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                </Card>

                <TabsContent value="documents">
                  <Card data-testid="documents-panel">
                    <CardHeader>
                      <CardTitle>Required Documents</CardTitle>
                      <CardDescription>Track and verify onboarding documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {documentRequests.map(doc => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                            data-testid={`doc-request-${doc.id}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                doc.status === "verified" ? "bg-green-100" :
                                doc.status === "received" ? "bg-yellow-100" :
                                doc.status === "overdue" ? "bg-red-100" : "bg-gray-100"
                              }`}>
                                {doc.status === "verified" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : doc.status === "received" ? (
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                ) : doc.status === "overdue" ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <FileText className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{doc.documentName}</p>
                                  {doc.isRequired === 1 && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                  <Badge className={priorityColors[doc.priority || "normal"]}>
                                    {doc.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{doc.description}</p>
                                {doc.dueDate && (
                                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {new Date(doc.dueDate).toLocaleDateString()}
                                    {doc.reminderCount > 0 && (
                                      <span className="ml-2 text-orange-500">
                                        ({doc.reminderCount} reminder{doc.reminderCount > 1 ? "s" : ""} sent)
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[doc.status]}>
                                {doc.status}
                              </Badge>
                              {doc.status === "requested" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendReminderMutation.mutate(doc.id)}
                                    disabled={sendReminderMutation.isPending}
                                    data-testid={`button-remind-${doc.id}`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => markReceivedMutation.mutate(doc.id)}
                                    disabled={markReceivedMutation.isPending}
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
                                  data-testid={`button-verify-${doc.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card data-testid="activity-panel">
                    <CardHeader>
                      <CardTitle>Agent Activity Timeline</CardTitle>
                      <CardDescription>All automated actions taken during onboarding</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                          <div className="space-y-6">
                            {agentLogs
                              .slice()
                              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                              .map((log, index) => {
                                const ChannelIcon = channelIcons[log.communicationChannel || "system"] || Bot;
                                return (
                                  <div
                                    key={log.id}
                                    className="relative pl-10"
                                    data-testid={`activity-log-${log.id}`}
                                  >
                                    <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                                      log.status === "success" ? "bg-green-500" :
                                      log.status === "requires_intervention" ? "bg-red-500" :
                                      log.status === "failed" ? "bg-red-500" : "bg-blue-500"
                                    }`}>
                                      <ChannelIcon className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="bg-white border rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">{log.agentType.replace(/_/g, " ")}</Badge>
                                          <span className="text-sm font-medium text-gray-900">
                                            {log.action.replace(/_/g, " ")}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                      {log.messageContent && (
                                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
                                          "{log.messageContent}"
                                        </p>
                                      )}
                                      {log.details && Object.keys(log.details).length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          {Object.entries(log.details).map(([key, value]) => (
                                            <span key={key} className="mr-3">
                                              <strong>{key}:</strong> {String(value)}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {log.requiresHumanReview === 1 && !log.reviewedAt && (
                                        <Badge className="mt-2 bg-red-100 text-red-700">
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
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-full flex items-center justify-center" data-testid="no-selection">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a workflow to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!interventionDialog} onOpenChange={() => setInterventionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Intervention</DialogTitle>
            <DialogDescription>
              Review and resolve this escalated case
            </DialogDescription>
          </DialogHeader>
          {interventionDialog && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{interventionDialog.action.replace(/_/g, " ")}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Step: {interventionDialog.stepName}
                </p>
                {interventionDialog.details && (
                  <p className="text-sm text-red-600 mt-2">
                    Reason: {(interventionDialog.details as any).reason}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how you resolved this issue..."
                  rows={4}
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

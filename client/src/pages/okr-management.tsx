import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search, Plus, Crosshair, FileText, Users, Calendar, Edit2, Trash2,
  CheckCircle, Clock, AlertCircle, BarChart3, Star, User, Loader2, Link, Key
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import type { OkrObjective, OkrKeyResult, OkrReviewCycle, OkrAssignment, OkrReviewSubmission, Employee } from "@shared/schema";

const CATEGORIES = [
  "Strategic", "Operational", "Growth", "Innovation",
  "Customer", "Financial", "Team", "Process"
];

export default function OkrManagement() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("objectives");
  const [showObjectiveDialog, setShowObjectiveDialog] = useState(false);
  const [showKeyResultDialog, setShowKeyResultDialog] = useState(false);
  const [showCycleDialog, setShowCycleDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editingObjective, setEditingObjective] = useState<OkrObjective | null>(null);
  const [editingKeyResult, setEditingKeyResult] = useState<OkrKeyResult | null>(null);
  const [editingCycle, setEditingCycle] = useState<OkrReviewCycle | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<string>("all");
  const [linkSourceType, setLinkSourceType] = useState<"objective" | "key_result">("objective");
  const [linkSourceId, setLinkSourceId] = useState<string>("");

  const queryClient = useQueryClient();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
      navigate('/okr-management', { replace: true });
    }
  }, []);

  const objectivesKey = useTenantQueryKey(["okr-objectives"]);
  const keyResultsKey = useTenantQueryKey(["okr-key-results"]);
  const cyclesKey = useTenantQueryKey(["okr-review-cycles"]);
  const assignmentsKey = useTenantQueryKey(["okr-assignments"]);
  const submissionsKey = useTenantQueryKey(["okr-review-submissions"]);
  const linksKey = useTenantQueryKey(["okr-links"]);
  const employeesKey = useTenantQueryKey(["workforce-employees"]);

  const { data: objectives = [], isLoading: objectivesLoading } = useQuery<OkrObjective[]>({
    queryKey: objectivesKey,
    queryFn: async () => (await api.get("/okr-objectives")).data,
  });

  const { data: keyResults = [], isLoading: keyResultsLoading } = useQuery<OkrKeyResult[]>({
    queryKey: keyResultsKey,
    queryFn: async () => (await api.get("/okr-key-results")).data,
  });

  const { data: cycles = [], isLoading: cyclesLoading } = useQuery<OkrReviewCycle[]>({
    queryKey: cyclesKey,
    queryFn: async () => (await api.get("/okr-review-cycles")).data,
  });

  const { data: assignments = [] } = useQuery<OkrAssignment[]>({
    queryKey: [...assignmentsKey, selectedCycle],
    queryFn: async () => {
      const params = selectedCycle && selectedCycle !== "all" ? `?reviewCycleId=${selectedCycle}` : '';
      return (await api.get(`/okr-assignments${params}`)).data;
    },
    enabled: activeTab === "assignments"
  });

  const { data: submissions = [] } = useQuery<OkrReviewSubmission[]>({
    queryKey: [...submissionsKey, selectedCycle],
    queryFn: async () => {
      const params = selectedCycle && selectedCycle !== "all" ? `?reviewCycleId=${selectedCycle}` : '';
      return (await api.get(`/okr-review-submissions${params}`)).data;
    },
    enabled: activeTab === "reviews"
  });

  const { data: links = [] } = useQuery({
    queryKey: linksKey,
    queryFn: async () => (await api.get("/okr-links")).data,
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: employeesKey,
    queryFn: async () => (await api.get("/workforce/employees")).data,
  });

  const createObjectiveMutation = useMutation({
    mutationFn: async (data: Partial<OkrObjective>) => {
      if (editingObjective) {
        return api.patch(`/okr-objectives/${editingObjective.id}`, data);
      }
      return api.post("/okr-objectives", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectivesKey });
      setShowObjectiveDialog(false);
      setEditingObjective(null);
    }
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/okr-objectives/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: objectivesKey })
  });

  const createKeyResultMutation = useMutation({
    mutationFn: async (data: Partial<OkrKeyResult>) => {
      if (editingKeyResult) {
        return api.patch(`/okr-key-results/${editingKeyResult.id}`, data);
      }
      return api.post("/okr-key-results", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keyResultsKey });
      setShowKeyResultDialog(false);
      setEditingKeyResult(null);
    }
  });

  const deleteKeyResultMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/okr-key-results/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keyResultsKey })
  });

  const createCycleMutation = useMutation({
    mutationFn: async (data: Partial<OkrReviewCycle>) => {
      if (editingCycle) {
        return api.patch(`/okr-review-cycles/${editingCycle.id}`, data);
      }
      return api.post("/okr-review-cycles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cyclesKey });
      setShowCycleDialog(false);
      setEditingCycle(null);
    }
  });

  const deleteCycleMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/okr-review-cycles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cyclesKey })
  });

  const createLinkMutation = useMutation({
    mutationFn: async ({ objectiveId, keyResultId }: { objectiveId: string; keyResultId: string }) => {
      return api.post("/okr-links", { objectiveId, keyResultId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linksKey });
      setShowLinkDialog(false);
    }
  });

  const filteredObjectives = objectives.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredKeyResults = keyResults.filter(kr =>
    kr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kr.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      draft: { variant: "secondary", icon: Clock },
      active: { variant: "default", icon: CheckCircle },
      self_assessment: { variant: "default", icon: User },
      manager_review: { variant: "default", icon: Users },
      completed: { variant: "outline", icon: CheckCircle },
      archived: { variant: "destructive", icon: AlertCircle },
    };
    const { variant, icon: Icon } = config[status] || { variant: "secondary", icon: Clock };
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
      </Badge>
    );
  };

  const getLinkedKeyResults = (objectiveId: string) => {
    const linkedIds = links.filter((l: any) => l.objectiveId === objectiveId).map((l: any) => l.keyResultId);
    return keyResults.filter(kr => linkedIds.includes(kr.id) || kr.objectiveId === objectiveId);
  };

  const getLinkedObjectives = (keyResultId: string) => {
    const linkedIds = links.filter((l: any) => l.keyResultId === keyResultId).map((l: any) => l.objectiveId);
    const directObj = keyResults.find(kr => kr.id === keyResultId)?.objectiveId;
    if (directObj) linkedIds.push(directObj);
    return objectives.filter(o => linkedIds.includes(o.id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Crosshair className="h-7 w-7 text-purple-500" />
              OKR Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Define Objectives & Key Results, manage review cycles, and track progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search OKRs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-muted border-border"
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="objectives" className="data-[state=active]:bg-purple-600">
              <Crosshair className="h-4 w-4 mr-2" />
              Objectives Templates
            </TabsTrigger>
            <TabsTrigger value="keyresults" className="data-[state=active]:bg-purple-600">
              <Key className="h-4 w-4 mr-2" />
              Key Results Templates
            </TabsTrigger>
            <TabsTrigger value="cycles" className="data-[state=active]:bg-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              Review Cycles
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* OBJECTIVES TEMPLATES TAB */}
          <TabsContent value="objectives" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Objective Templates</h2>
              <Button onClick={() => { setEditingObjective(null); setShowObjectiveDialog(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Objective
              </Button>
            </div>

            {objectivesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : filteredObjectives.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Crosshair className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Objectives</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create objective templates to define goals for your team.
                  </p>
                  <Button onClick={() => setShowObjectiveDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Objective
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredObjectives.map((obj) => {
                  const linkedKRs = getLinkedKeyResults(obj.id);
                  return (
                    <Card key={obj.id} className="bg-card border-border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{obj.name}</CardTitle>
                            <CardDescription className="mt-1">{obj.description}</CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingObjective(obj); setShowObjectiveDialog(true); }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteObjectiveMutation.mutate(obj.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {obj.category && <Badge variant="secondary">{obj.category}</Badge>}
                          {obj.frequency && <Badge variant="outline">{obj.frequency}</Badge>}
                          {obj.projectName && (
                            <Badge variant="outline" className="gap-1">
                              <Link className="h-3 w-3" />{obj.projectName}
                            </Badge>
                          )}
                        </div>
                        {obj.targetValue && (
                          <div className="text-sm text-muted-foreground">
                            Target: {obj.targetValue} | Weight: {obj.weight}
                          </div>
                        )}
                        {linkedKRs.length > 0 && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Linked Key Results ({linkedKRs.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {linkedKRs.slice(0, 3).map(kr => (
                                <Badge key={kr.id} variant="outline" className="text-xs">{kr.name}</Badge>
                              ))}
                              {linkedKRs.length > 3 && <Badge variant="outline" className="text-xs">+{linkedKRs.length - 3} more</Badge>}
                            </div>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="w-full mt-2 text-purple-600" onClick={() => { setLinkSourceType("objective"); setLinkSourceId(obj.id); setShowLinkDialog(true); }}>
                          <Link className="h-3 w-3 mr-1" /> Link Key Results
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* KEY RESULTS TEMPLATES TAB */}
          <TabsContent value="keyresults" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Key Result Templates</h2>
              <Button onClick={() => { setEditingKeyResult(null); setShowKeyResultDialog(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Key Result
              </Button>
            </div>

            {keyResultsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : filteredKeyResults.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Key className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Key Results</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create key result templates to define measurable outcomes.
                  </p>
                  <Button onClick={() => setShowKeyResultDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Key Result
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredKeyResults.map((kr) => {
                  const linkedObjs = getLinkedObjectives(kr.id);
                  return (
                    <Card key={kr.id} className="bg-card border-border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{kr.name}</CardTitle>
                            <CardDescription className="mt-1">{kr.description}</CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingKeyResult(kr); setShowKeyResultDialog(true); }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteKeyResultMutation.mutate(kr.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {kr.category && <Badge variant="secondary">{kr.category}</Badge>}
                          {kr.frequency && <Badge variant="outline">{kr.frequency}</Badge>}
                          {kr.projectName && (
                            <Badge variant="outline" className="gap-1">
                              <Link className="h-3 w-3" />{kr.projectName}
                            </Badge>
                          )}
                        </div>
                        {kr.targetValue && (
                          <div className="text-sm text-muted-foreground">
                            Target: {kr.targetValue} | Weight: {kr.weight}
                          </div>
                        )}
                        {linkedObjs.length > 0 && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Linked Objectives ({linkedObjs.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {linkedObjs.map(o => (
                                <Badge key={o.id} variant="outline" className="text-xs">{o.name}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="w-full mt-2 text-purple-600" onClick={() => { setLinkSourceType("key_result"); setLinkSourceId(kr.id); setShowLinkDialog(true); }}>
                          <Link className="h-3 w-3 mr-1" /> Link Objectives
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* REVIEW CYCLES TAB */}
          <TabsContent value="cycles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">OKR Review Cycles</h2>
              <Button onClick={() => { setEditingCycle(null); setShowCycleDialog(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Cycle
              </Button>
            </div>

            {cyclesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : cycles.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Review Cycles</h3>
                  <p className="text-muted-foreground text-center mb-4">Create a review cycle to start tracking OKR progress.</p>
                  <Button onClick={() => setShowCycleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Cycle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {cycles.map((cycle) => (
                  <Card key={cycle.id} className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{cycle.name}</CardTitle>
                          <CardDescription>{cycle.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(cycle.status)}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCycle(cycle); setShowCycleDialog(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCycleMutation.mutate(cycle.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 font-medium">{cycle.cycleType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Period:</span>
                          <span className="ml-2 font-medium">
                            {format(new Date(cycle.startDate), "MMM d")} - {format(new Date(cycle.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ASSIGNMENTS TAB */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">OKR Assignments</h2>
              <div className="flex gap-3">
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cycles</SelectItem>
                    {cycles.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {assignments.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Assignments</h3>
                  <p className="text-muted-foreground text-center">Assign OKRs to employees through the objective/key result templates.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => {
                  const obj = objectives.find(o => o.id === assignment.objectiveId);
                  const kr = keyResults.find(k => k.id === assignment.keyResultId);
                  const emp = employees.find(e => e.id === assignment.employeeId);
                  return (
                    <Card key={assignment.id} className="bg-card border-border">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{emp?.fullName || "Unknown Employee"}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.assignmentType === "objective" ? `Objective: ${obj?.name || "N/A"}` : `Key Result: ${kr?.name || "N/A"}`}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(assignment.status)}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">OKR Reviews</h2>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  {cycles.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {submissions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground text-center">Reviews will appear here once employees submit their OKR self-assessments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {submissions.map((sub) => {
                  const emp = employees.find(e => e.id === sub.employeeId);
                  return (
                    <Card key={sub.id} className="bg-card border-border">
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-medium">{emp?.fullName || "Unknown"}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>Self: {sub.overallSelfScore || "-"}/5</span>
                            <span>Manager: {sub.overallManagerScore || "-"}/5</span>
                            <span>Final: {sub.finalScore || "-"}/5</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(sub.selfAssessmentStatus)}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* OBJECTIVE DIALOG */}
        <Dialog open={showObjectiveDialog} onOpenChange={setShowObjectiveDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingObjective ? "Edit Objective" : "Create Objective"}</DialogTitle>
              <DialogDescription>Define an objective template for your OKR framework.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createObjectiveMutation.mutate({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                measurementType: formData.get("measurementType") as string,
                targetValue: parseInt(formData.get("targetValue") as string) || undefined,
                weight: parseInt(formData.get("weight") as string) || 1,
                frequency: formData.get("frequency") as string,
                projectName: formData.get("projectName") as string || undefined,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editingObjective?.name || ""} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingObjective?.description || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={editingObjective?.category || ""}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select name="frequency" defaultValue={editingObjective?.frequency || "weekly"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="measurementType">Measurement</Label>
                    <Select name="measurementType" defaultValue={editingObjective?.measurementType || "scale"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scale">Scale (1-5)</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetValue">Target</Label>
                    <Input id="targetValue" name="targetValue" type="number" defaultValue={editingObjective?.targetValue || ""} />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" name="weight" type="number" defaultValue={editingObjective?.weight || 1} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="projectName">Project Link</Label>
                  <Input id="projectName" name="projectName" placeholder="Link to project name..." defaultValue={editingObjective?.projectName || ""} />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowObjectiveDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createObjectiveMutation.isPending}>
                  {createObjectiveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingObjective ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* KEY RESULT DIALOG */}
        <Dialog open={showKeyResultDialog} onOpenChange={setShowKeyResultDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingKeyResult ? "Edit Key Result" : "Create Key Result"}</DialogTitle>
              <DialogDescription>Define a key result template for measuring objective progress.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createKeyResultMutation.mutate({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                objectiveId: formData.get("objectiveId") as string || undefined,
                measurementType: formData.get("measurementType") as string,
                targetValue: parseInt(formData.get("targetValue") as string) || undefined,
                weight: parseInt(formData.get("weight") as string) || 1,
                frequency: formData.get("frequency") as string,
                projectName: formData.get("projectName") as string || undefined,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="kr-name">Name</Label>
                  <Input id="kr-name" name="name" defaultValue={editingKeyResult?.name || ""} required />
                </div>
                <div>
                  <Label htmlFor="kr-description">Description</Label>
                  <Textarea id="kr-description" name="description" defaultValue={editingKeyResult?.description || ""} />
                </div>
                <div>
                  <Label htmlFor="objectiveId">Parent Objective</Label>
                  <Select name="objectiveId" defaultValue={editingKeyResult?.objectiveId || ""}>
                    <SelectTrigger><SelectValue placeholder="Select objective (optional)" /></SelectTrigger>
                    <SelectContent>
                      {objectives.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kr-category">Category</Label>
                    <Select name="category" defaultValue={editingKeyResult?.category || ""}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="kr-frequency">Frequency</Label>
                    <Select name="frequency" defaultValue={editingKeyResult?.frequency || "weekly"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="kr-measurement">Measurement</Label>
                    <Select name="measurementType" defaultValue={editingKeyResult?.measurementType || "percentage"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scale">Scale (1-5)</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="kr-target">Target</Label>
                    <Input id="kr-target" name="targetValue" type="number" defaultValue={editingKeyResult?.targetValue || ""} />
                  </div>
                  <div>
                    <Label htmlFor="kr-weight">Weight</Label>
                    <Input id="kr-weight" name="weight" type="number" defaultValue={editingKeyResult?.weight || 1} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="kr-project">Project Link</Label>
                  <Input id="kr-project" name="projectName" placeholder="Link to project name..." defaultValue={editingKeyResult?.projectName || ""} />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowKeyResultDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createKeyResultMutation.isPending}>
                  {createKeyResultMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingKeyResult ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* REVIEW CYCLE DIALOG */}
        <Dialog open={showCycleDialog} onOpenChange={setShowCycleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCycle ? "Edit Review Cycle" : "Create Review Cycle"}</DialogTitle>
              <DialogDescription>Set up an OKR review cycle for tracking progress.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createCycleMutation.mutate({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                cycleType: formData.get("cycleType") as string,
                startDate: formData.get("startDate") as any,
                endDate: formData.get("endDate") as any,
                status: formData.get("status") as string || "draft",
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cycle-name">Name</Label>
                  <Input id="cycle-name" name="name" defaultValue={editingCycle?.name || ""} required />
                </div>
                <div>
                  <Label htmlFor="cycle-description">Description</Label>
                  <Textarea id="cycle-description" name="description" defaultValue={editingCycle?.description || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cycleType">Type</Label>
                    <Select name="cycleType" defaultValue={editingCycle?.cycleType || "weekly"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingCycle?.status || "draft"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" defaultValue={editingCycle?.startDate ? format(new Date(editingCycle.startDate), "yyyy-MM-dd") : ""} required />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" defaultValue={editingCycle?.endDate ? format(new Date(editingCycle.endDate), "yyyy-MM-dd") : ""} required />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCycleDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createCycleMutation.isPending}>
                  {createCycleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCycle ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* LINK DIALOG */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {linkSourceType === "objective" ? "Link Key Results to Objective" : "Link Objectives to Key Result"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {linkSourceType === "objective" ? (
                <div>
                  <Label>Select Key Result to Link</Label>
                  {keyResults.map(kr => (
                    <Button key={kr.id} variant="outline" className="w-full justify-start mt-2" onClick={() => {
                      createLinkMutation.mutate({ objectiveId: linkSourceId, keyResultId: kr.id });
                    }}>
                      <Key className="h-4 w-4 mr-2" /> {kr.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div>
                  <Label>Select Objective to Link</Label>
                  {objectives.map(obj => (
                    <Button key={obj.id} variant="outline" className="w-full justify-start mt-2" onClick={() => {
                      createLinkMutation.mutate({ objectiveId: obj.id, keyResultId: linkSourceId });
                    }}>
                      <Crosshair className="h-4 w-4 mr-2" /> {obj.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

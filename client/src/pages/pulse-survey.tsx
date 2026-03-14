import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Heart, MessageSquare, Users, BarChart3, AlertTriangle, Sparkles,
  ThumbsUp, ThumbsDown, Minus, Plus, Loader2, Send, Search, TrendingUp
} from "lucide-react";
import { api } from "@/lib/api";
import type { PulseSurvey as PulseSurveyType, PulseSurveyResponse } from "@shared/schema";

export default function PulseSurvey() {
  const [activeTab, setActiveTab] = useState("nps");
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const queryClient = useQueryClient();

  const surveysKey = useTenantQueryKey(["pulse-surveys"]);
  const responsesKey = useTenantQueryKey(["pulse-survey-responses"]);
  const analysisKey = useTenantQueryKey(["pulse-survey-analysis"]);

  const { data: surveys = [], isLoading } = useQuery<PulseSurveyType[]>({
    queryKey: surveysKey,
    queryFn: async () => (await api.get("/pulse-surveys")).data,
  });

  const { data: responses = [] } = useQuery<PulseSurveyResponse[]>({
    queryKey: responsesKey,
    queryFn: async () => (await api.get("/pulse-survey-responses")).data,
  });

  const { data: analysis = [] } = useQuery({
    queryKey: analysisKey,
    queryFn: async () => (await api.get("/pulse-survey-analysis")).data,
  });

  const createSurveyMutation = useMutation({
    mutationFn: async (data: Partial<PulseSurveyType>) => api.post("/pulse-surveys", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveysKey });
      setShowSurveyDialog(false);
    }
  });

  // Calculate eNPS from responses
  const npsResponses = responses.filter(r => r.npsScore !== null && r.npsScore !== undefined);
  const promoters = npsResponses.filter(r => (r.npsScore ?? 0) >= 9).length;
  const passives = npsResponses.filter(r => (r.npsScore ?? 0) >= 7 && (r.npsScore ?? 0) <= 8).length;
  const detractors = npsResponses.filter(r => (r.npsScore ?? 0) <= 6).length;
  const totalNps = npsResponses.length;
  const enps = totalNps > 0 ? Math.round(((promoters / totalNps) * 100) - ((detractors / totalNps) * 100)) : 0;
  const promoterPct = totalNps > 0 ? Math.round((promoters / totalNps) * 100) : 0;
  const passivePct = totalNps > 0 ? Math.round((passives / totalNps) * 100) : 0;
  const detractorPct = totalNps > 0 ? Math.round((detractors / totalNps) * 100) : 0;

  const getEnpsColor = (score: number) => {
    if (score >= 50) return "text-green-600";
    if (score >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-7 w-7 text-pink-500" />
              Pulse Survey
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor employee well-being, engagement, and satisfaction
            </p>
          </div>
          <Button onClick={() => setShowSurveyDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Survey
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted border border-border flex-wrap">
            <TabsTrigger value="nps" className="data-[state=active]:bg-pink-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Net Promoter Score
            </TabsTrigger>
            <TabsTrigger value="wellbeing" className="data-[state=active]:bg-pink-600">
              <Heart className="h-4 w-4 mr-2" />
              Well-being Check
            </TabsTrigger>
            <TabsTrigger value="relationship" className="data-[state=active]:bg-pink-600">
              <Users className="h-4 w-4 mr-2" />
              Relationship Check
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-pink-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open-ended Feedback
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-pink-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-pink-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* NET PROMOTER SCORE TAB */}
          <TabsContent value="nps" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Employee Net Promoter Score (eNPS)</CardTitle>
                <CardDescription>
                  "On a scale of 0-10, how likely are you to recommend this company as a place to work?"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getEnpsColor(enps)}`}>{enps}</div>
                  <p className="text-sm text-muted-foreground mt-1">eNPS Score</p>
                  <p className="text-xs text-muted-foreground mt-1">eNPS = % Promoters - % Detractors</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="pt-4 text-center">
                      <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{promoterPct}%</div>
                      <p className="text-sm font-medium">Promoters (9-10)</p>
                      <p className="text-xs text-muted-foreground mt-1">{promoters} employees</p>
                      <p className="text-xs text-muted-foreground">Highly satisfied, loyal brand ambassadors</p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-4 text-center">
                      <Minus className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">{passivePct}%</div>
                      <p className="text-sm font-medium">Passives (7-8)</p>
                      <p className="text-xs text-muted-foreground mt-1">{passives} employees</p>
                      <p className="text-xs text-muted-foreground">Satisfied but considered "flight risk"</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-4 text-center">
                      <ThumbsDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">{detractorPct}%</div>
                      <p className="text-sm font-medium">Detractors (0-6)</p>
                      <p className="text-xs text-muted-foreground mt-1">{detractors} employees</p>
                      <p className="text-xs text-muted-foreground">Dissatisfied, may spread negative word-of-mouth</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Score Distribution</h3>
                  <div className="flex h-6 rounded-full overflow-hidden">
                    {detractorPct > 0 && <div className="bg-red-500" style={{ width: `${detractorPct}%` }} />}
                    {passivePct > 0 && <div className="bg-yellow-500" style={{ width: `${passivePct}%` }} />}
                    {promoterPct > 0 && <div className="bg-green-500" style={{ width: `${promoterPct}%` }} />}
                    {totalNps === 0 && <div className="bg-muted w-full" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Total responses: {totalNps}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WELL-BEING CHECK TAB */}
          <TabsContent value="wellbeing" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Well-being Check</CardTitle>
                <CardDescription>Monitor employee workload and mental health support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Sample Questions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>"How manageable has your workload been this week?"</li>
                        <li>"Do you feel supported when you share mental health concerns?"</li>
                        <li>"Rate your overall well-being this week (1-5)"</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Aggregate Scores</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Workload Manageability</span>
                            <span className="font-medium">--</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Mental Health Support</span>
                            <span className="font-medium">--</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Well-being</span>
                            <span className="font-medium">--</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {surveys.filter(s => s.surveyType === "wellbeing").length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No well-being surveys created yet. Create one to start collecting feedback.</p>
                    <Button className="mt-4" onClick={() => setShowSurveyDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Well-being Survey
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RELATIONSHIP CHECK TAB */}
          <TabsContent value="relationship" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Relationship Check</CardTitle>
                <CardDescription>Assess team dynamics and psychological safety</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Sample Questions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>"Do you feel comfortable sharing your ideas and opinions with your team?"</li>
                        <li>"How would you rate your relationship with your manager?"</li>
                        <li>"Do you feel respected and valued by your colleagues?"</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Team Dynamics Score</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Psychological Safety</span>
                            <span className="font-medium">--</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Manager Relationship</span>
                            <span className="font-medium">--</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Colleague Respect</span>
                            <span className="font-medium">--</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OPEN-ENDED FEEDBACK TAB */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Open-ended Feedback</CardTitle>
                <CardDescription>Qualitative feedback for deeper insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Sample Questions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>"What is one thing we could do to better support your well-being?"</li>
                      <li>"What would make this a better place to work?"</li>
                      <li>"Describe a recent positive experience at work."</li>
                    </ul>
                  </CardContent>
                </Card>

                {responses.filter(r => r.comments).length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-medium">Recent Feedback</h3>
                    {responses.filter(r => r.comments).slice(0, 10).map((r) => (
                      <Card key={r.id} className="bg-card">
                        <CardContent className="py-3">
                          <p className="text-sm">{r.comments}</p>
                          {r.sentiment && (
                            <Badge variant={r.sentiment === "positive" ? "default" : r.sentiment === "negative" ? "destructive" : "secondary"} className="mt-2">
                              {r.sentiment}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No feedback collected yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ASSESSMENTS TAB */}
          <TabsContent value="assessments" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI-Powered Assessments
                </CardTitle>
                <CardDescription>AI agent evaluation of survey responses with red flag identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-4 text-center">
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">0</div>
                      <p className="text-sm text-muted-foreground">Red Flags Identified</p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-4 text-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">0</div>
                      <p className="text-sm text-muted-foreground">Risk Indicators</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="pt-4 text-center">
                      <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <p className="text-sm text-muted-foreground">Positive Indicators</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">AI Analysis Areas</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Individual employee risk assessment</li>
                      <li>Department-level wellness trends</li>
                      <li>Collective organization health indicators</li>
                      <li>Burnout and disengagement early warning</li>
                      <li>Employee relations concern detection</li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">AI assessments will be generated automatically as survey responses are collected.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>AI-generated intervention recommendations for wellness and employee relations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Collective Recommendations
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Company-wide and department-level interventions based on aggregate survey data.
                      </p>
                      <div className="mt-3 space-y-2">
                        <Badge variant="outline" className="mr-2">Wellness Programs</Badge>
                        <Badge variant="outline" className="mr-2">Work-Life Balance</Badge>
                        <Badge variant="outline" className="mr-2">Team Building</Badge>
                        <Badge variant="outline">Mental Health Support</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Individual Recommendations
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Personalized interventions for employees showing risk indicators.
                      </p>
                      <div className="mt-3 space-y-2">
                        <Badge variant="outline" className="mr-2">1:1 Check-ins</Badge>
                        <Badge variant="outline" className="mr-2">Workload Review</Badge>
                        <Badge variant="outline" className="mr-2">EAP Referral</Badge>
                        <Badge variant="outline">Career Discussion</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Recommendations will appear here once sufficient survey data is collected and analyzed by the AI agent.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CREATE SURVEY DIALOG */}
        <Dialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Pulse Survey</DialogTitle>
              <DialogDescription>Create a new survey to gather employee feedback.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createSurveyMutation.mutate({
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                surveyType: formData.get("surveyType") as string,
                frequency: formData.get("frequency") as string,
                isAnonymous: 1,
                isActive: 1,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="surveyType">Type</Label>
                    <Select name="surveyType" defaultValue="nps">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nps">Net Promoter Score</SelectItem>
                        <SelectItem value="wellbeing">Well-being Check</SelectItem>
                        <SelectItem value="relationship">Relationship Check</SelectItem>
                        <SelectItem value="open_feedback">Open Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select name="frequency" defaultValue="weekly">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowSurveyDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createSurveyMutation.isPending}>
                  {createSurveyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Survey
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

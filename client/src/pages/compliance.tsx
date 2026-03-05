import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Scale, FileText, Shield, Users, CheckCircle, Clock, AlertCircle,
  MessageSquare, Search, Send, BookOpen, ExternalLink, Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import type { Employee } from "@shared/schema";

const LEGISLATION_ACTS = [
  {
    name: "Basic Conditions of Employment Act",
    shortName: "BCEA",
    description: "Regulates working hours, leave, remuneration, termination of employment and related matters.",
    icon: FileText,
  },
  {
    name: "Labour Relations Act",
    shortName: "LRA",
    description: "Promotes fair labour practices, collective bargaining, workplace forums, and dispute resolution.",
    icon: Users,
  },
  {
    name: "Employment Equity Act",
    shortName: "EEA",
    description: "Promotes equal opportunity and fair treatment through elimination of unfair discrimination.",
    icon: Scale,
  },
  {
    name: "Occupational Health and Safety Act",
    shortName: "OHSA",
    description: "Provides for the health and safety of persons at work and related matters.",
    icon: Shield,
  },
];

export default function Compliance() {
  const [activeTab, setActiveTab] = useState("legislation");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatType, setChatType] = useState<"legislation" | "contracts">("legislation");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const consentKey = useTenantQueryKey(["employee-consent"]);
  const contractsKey = useTenantQueryKey(["compliance-documents"]);
  const chatKey = useTenantQueryKey(["compliance-chat"]);
  const employeesKey = useTenantQueryKey(["workforce-employees"]);

  const { data: consents = [] } = useQuery({
    queryKey: consentKey,
    queryFn: async () => (await api.get("/employee-consent")).data,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: contractsKey,
    queryFn: async () => (await api.get("/compliance-documents?documentType=employment_contract")).data,
  });

  const { data: chatHistory = [] } = useQuery({
    queryKey: [...chatKey, chatType],
    queryFn: async () => (await api.get(`/compliance-chat?chatType=${chatType}`)).data,
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: employeesKey,
    queryFn: async () => (await api.get("/workforce/employees")).data,
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { question: string; chatType: string }) => {
      return api.post("/compliance-chat", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKey });
      setChatQuestion("");
    }
  });

  const sendConsentMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return api.post("/employee-consent", {
        employeeId,
        consentType: "data_processing",
        status: "pending",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: consentKey }),
  });

  const receivedCount = consents.filter((c: any) => c.status === "received").length;
  const pendingCount = consents.filter((c: any) => c.status === "pending").length;
  const deniedCount = consents.filter((c: any) => c.status === "denied").length;

  const getConsentBadge = (status: string) => {
    switch (status) {
      case "received": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "denied": return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-7 w-7 text-indigo-500" />
            Compliance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Legislation, employment contracts, and POPIA consent management
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="legislation" className="data-[state=active]:bg-indigo-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Legislation
            </TabsTrigger>
            <TabsTrigger value="administration" className="data-[state=active]:bg-indigo-600">
              <FileText className="h-4 w-4 mr-2" />
              Administration
            </TabsTrigger>
          </TabsList>

          {/* LEGISLATION TAB */}
          <TabsContent value="legislation" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {LEGISLATION_ACTS.map((act) => {
                const Icon = act.icon;
                return (
                  <Card key={act.shortName} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{act.name}</CardTitle>
                          <CardDescription className="mt-1">{act.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{act.shortName}</Badge>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          View Act
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-muted/50 border-border">
              <CardContent className="pt-4">
                <Badge variant="outline" className="mb-2">
                  <Shield className="h-3 w-3 mr-1" />
                  AI-powered by Government Gazette updates
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Our AI agents continuously monitor the Government Gazette for any updates to these Acts and incorporate changes automatically.
                </p>
              </CardContent>
            </Card>

            {/* Legislation RAG Chat */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  Ask About Legislation
                </CardTitle>
                <CardDescription>
                  Ask any question about South African labour legislation as it pertains to your business.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {chatHistory.filter((c: any) => c.chatType === "legislation").map((entry: any) => (
                    <div key={entry.id} className="space-y-2">
                      <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3">
                        <p className="text-sm font-medium">You:</p>
                        <p className="text-sm">{entry.question}</p>
                      </div>
                      {entry.answer && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-sm font-medium">AI:</p>
                          <p className="text-sm">{entry.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about South African labour legislation..."
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && chatQuestion.trim()) {
                        chatMutation.mutate({ question: chatQuestion, chatType: "legislation" });
                      }
                    }}
                  />
                  <Button
                    onClick={() => chatQuestion.trim() && chatMutation.mutate({ question: chatQuestion, chatType: "legislation" })}
                    disabled={chatMutation.isPending || !chatQuestion.trim()}
                  >
                    {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADMINISTRATION TAB */}
          <TabsContent value="administration" className="space-y-6">
            {/* Employment Contracts */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Employment Contracts</CardTitle>
                <CardDescription>View and manage all employment contracts on record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {contracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No employment contracts on record.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Employee</th>
                          <th className="px-4 py-2 text-left font-medium">Contract Type</th>
                          <th className="px-4 py-2 text-left font-medium">Start Date</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                          <th className="px-4 py-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map((contract: any) => (
                          <tr key={contract.id} className="border-t">
                            <td className="px-4 py-2">{contract.title}</td>
                            <td className="px-4 py-2">{contract.contractType || "Permanent"}</td>
                            <td className="px-4 py-2">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "-"}</td>
                            <td className="px-4 py-2">
                              <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                                {contract.status || "Active"}
                              </Badge>
                            </td>
                            <td className="px-4 py-2">
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Contracts RAG Chat */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Ask About Contracts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question about employment contracts on record..."
                        value={chatType === "contracts" ? chatQuestion : ""}
                        onChange={(e) => { setChatType("contracts"); setChatQuestion(e.target.value); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && chatQuestion.trim()) {
                            chatMutation.mutate({ question: chatQuestion, chatType: "contracts" });
                          }
                        }}
                      />
                      <Button
                        onClick={() => chatQuestion.trim() && chatMutation.mutate({ question: chatQuestion, chatType: "contracts" })}
                        disabled={chatMutation.isPending}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* POPIA Consent Management */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  POPIA Consent Management
                </CardTitle>
                <CardDescription>
                  Manage employee consent for data processing, secure storage, and destruction in terms of the POPIA Act.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold">{employees.length}</div>
                      <p className="text-xs text-muted-foreground">Total Employees</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{receivedCount}</div>
                      <p className="text-xs text-muted-foreground">Received</p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{deniedCount}</div>
                      <p className="text-xs text-muted-foreground">Denied</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Employee Consent Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Employee</th>
                        <th className="px-4 py-2 text-left font-medium">Department</th>
                        <th className="px-4 py-2 text-left font-medium">Consent Status</th>
                        <th className="px-4 py-2 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.slice(0, 20).map((emp) => {
                        const consent = consents.find((c: any) => c.employeeId === emp.id);
                        const status = consent?.status || "not_requested";
                        return (
                          <tr key={emp.id} className="border-t">
                            <td className="px-4 py-2 font-medium">{emp.fullName}</td>
                            <td className="px-4 py-2">{emp.department || "-"}</td>
                            <td className="px-4 py-2">
                              {consent ? getConsentBadge(consent.status) : (
                                <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Not Requested</Badge>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {(!consent || consent.status === "denied") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendConsentMutation.mutate(emp.id)}
                                  disabled={sendConsentMutation.isPending}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Send Request
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">
                      In compliance with the Protection of Personal Information Act (POPIA), employee consent must be obtained to process, store, and manage personal data.
                      Data must be securely stored and destroyed once no longer required for its original purpose.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

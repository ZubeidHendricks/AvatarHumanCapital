import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Receipt, FileText, CheckCircle, Clock, DollarSign,
  Plus, Search, User, XCircle, Upload
} from "lucide-react";
import { api } from "@/lib/api";
import type { Employee } from "@shared/schema";

const CLAIM_TYPES = [
  "Travel", "Accommodation", "Meals", "Communication",
  "Training", "Equipment", "Medical", "Other"
];

interface ClaimSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  claimType: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  status: string;
  submittedAt: string;
  approvedBy?: string;
}

export default function ClaimsManagement() {
  const [activeTab, setActiveTab] = useState("submission");
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const employeesKey = useTenantQueryKey(["workforce-employees"]);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: employeesKey,
    queryFn: async () => (await api.get("/workforce/employees")).data,
  });

  const [claims] = useState<ClaimSubmission[]>([]);

  const pendingClaims = claims.filter(c => c.status === "pending");
  const approvedClaims = claims.filter(c => c.status === "approved");
  const rejectedClaims = claims.filter(c => c.status === "rejected");
  const totalAmount = approvedClaims.reduce((sum, c) => sum + c.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-7 w-7 text-orange-500" />
              Claims Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submit claims, manage approvals, and sync with payroll
            </p>
          </div>
          <Button onClick={() => setShowClaimDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Submit Claim
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="submission" className="data-[state=active]:bg-orange-600">
              <FileText className="h-4 w-4 mr-2" />
              Submission
            </TabsTrigger>
            <TabsTrigger value="approval" className="data-[state=active]:bg-orange-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approval
            </TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-orange-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Payroll Sync
            </TabsTrigger>
          </TabsList>

          {/* SUBMISSION TAB */}
          <TabsContent value="submission" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Claims Submissions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">{claims.length}</div>
                  <p className="text-xs text-muted-foreground">Total Claims</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedClaims.length}</div>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingClaims.length}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">R {totalAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Approved</p>
                </CardContent>
              </Card>
            </div>

            {claims.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Claims Submitted</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Submit an expense claim to get started.
                  </p>
                  <Button onClick={() => setShowClaimDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit First Claim
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Employee</th>
                      <th className="px-4 py-2 text-left font-medium">Type</th>
                      <th className="px-4 py-2 text-left font-medium">Amount</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id} className="border-t">
                        <td className="px-4 py-2">{claim.employeeName}</td>
                        <td className="px-4 py-2">{claim.claimType}</td>
                        <td className="px-4 py-2">R {claim.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 max-w-xs truncate">{claim.description}</td>
                        <td className="px-4 py-2">{getStatusBadge(claim.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* APPROVAL TAB */}
          <TabsContent value="approval" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Approvals</h2>
            {pendingClaims.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Pending Claims</h3>
                  <p className="text-muted-foreground text-center">
                    All claims have been processed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingClaims.map((claim) => (
                  <Card key={claim.id} className="bg-card border-border">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                          <User className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{claim.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {claim.claimType} | R {claim.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{claim.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button size="sm" variant="destructive">Reject</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PAYROLL SYNC TAB */}
          <TabsContent value="payroll" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Payroll Sync</h2>
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Claims Payroll Integration</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Approved claims will automatically sync with payroll for reimbursement processing.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">0</div>
                    <p className="text-xs text-muted-foreground">Synced</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-600">0</div>
                    <p className="text-xs text-muted-foreground">Pending Sync</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">0</div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SUBMIT CLAIM DIALOG */}
        <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit Claim</DialogTitle>
              <DialogDescription>Submit a new expense claim for approval.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowClaimDialog(false);
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select name="employee">
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claimType">Claim Type</Label>
                    <Select name="claimType">
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {CLAIM_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (R)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe the expense..." />
                </div>
                <div>
                  <Label htmlFor="receipt">Upload Receipt</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowClaimDialog(false)}>Cancel</Button>
                <Button type="submit">Submit Claim</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

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
import {
  CalendarDays, FileText, CheckCircle, Clock, AlertCircle,
  Plus, Loader2, Search, User, Users, DollarSign, XCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import type { Employee } from "@shared/schema";

const LEAVE_TYPES = [
  "Annual Leave", "Sick Leave", "Family Responsibility Leave",
  "Maternity Leave", "Paternity Leave", "Study Leave",
  "Unpaid Leave", "Compassionate Leave"
];

interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  approvedBy?: string;
  createdAt: string;
}

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState("application");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const employeesKey = useTenantQueryKey(["workforce-employees"]);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: employeesKey,
    queryFn: async () => (await api.get("/workforce/employees")).data,
  });

  // Mock leave data - will be replaced with API calls when leave tables are added
  const [leaveApplications] = useState<LeaveApplication[]>([]);

  const pendingApplications = leaveApplications.filter(l => l.status === "pending");
  const approvedApplications = leaveApplications.filter(l => l.status === "approved");
  const rejectedApplications = leaveApplications.filter(l => l.status === "rejected");

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
              <CalendarDays className="h-7 w-7 text-teal-500" />
              Leave Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Apply for leave, manage approvals, and sync with payroll
            </p>
          </div>
          <Button onClick={() => setShowApplyDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Apply for Leave
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="application" className="data-[state=active]:bg-teal-600">
              <FileText className="h-4 w-4 mr-2" />
              Application
            </TabsTrigger>
            <TabsTrigger value="approval" className="data-[state=active]:bg-teal-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approval
            </TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-teal-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Payroll Sync
            </TabsTrigger>
          </TabsList>

          {/* APPLICATION TAB */}
          <TabsContent value="application" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Leave Applications</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            {/* Leave Balance Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-teal-600">0</div>
                  <p className="text-xs text-muted-foreground">Total Applications</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedApplications.length}</div>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{rejectedApplications.length}</div>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </CardContent>
              </Card>
            </div>

            {leaveApplications.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Leave Applications</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Submit a leave application to get started.
                  </p>
                  <Button onClick={() => setShowApplyDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Apply for Leave
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
                      <th className="px-4 py-2 text-left font-medium">Dates</th>
                      <th className="px-4 py-2 text-left font-medium">Days</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveApplications.map((app) => (
                      <tr key={app.id} className="border-t">
                        <td className="px-4 py-2">{app.employeeName}</td>
                        <td className="px-4 py-2">{app.leaveType}</td>
                        <td className="px-4 py-2">{app.startDate} - {app.endDate}</td>
                        <td className="px-4 py-2">{app.days}</td>
                        <td className="px-4 py-2">{getStatusBadge(app.status)}</td>
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
            {pendingApplications.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Pending Approvals</h3>
                  <p className="text-muted-foreground text-center">
                    All leave applications have been processed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingApplications.map((app) => (
                  <Card key={app.id} className="bg-card border-border">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                          <User className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium">{app.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.leaveType} | {app.startDate} - {app.endDate} ({app.days} days)
                          </p>
                          {app.reason && <p className="text-xs text-muted-foreground mt-1">{app.reason}</p>}
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
                <h3 className="text-lg font-medium text-foreground mb-2">Payroll Integration</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Approved leave records will automatically sync with payroll to ensure accurate salary calculations and deductions.
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

        {/* APPLY FOR LEAVE DIALOG */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>Submit a new leave application for approval.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowApplyDialog(false);
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
                <div>
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select name="leaveType">
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea id="reason" name="reason" placeholder="Reason for leave..." />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowApplyDialog(false)}>Cancel</Button>
                <Button type="submit">Submit Application</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

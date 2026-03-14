import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, Plus, Edit2, Trash2, Settings } from "lucide-react";

const DEFAULT_LEAVE_TYPES = [
  { name: "Annual Leave", days: 21, carryOver: true, paid: true },
  { name: "Sick Leave", days: 30, carryOver: false, paid: true },
  { name: "Family Responsibility Leave", days: 3, carryOver: false, paid: true },
  { name: "Maternity Leave", days: 120, carryOver: false, paid: true },
  { name: "Paternity Leave", days: 10, carryOver: false, paid: true },
  { name: "Study Leave", days: 5, carryOver: false, paid: true },
  { name: "Unpaid Leave", days: 0, carryOver: false, paid: false },
  { name: "Compassionate Leave", days: 5, carryOver: false, paid: true },
];

export default function LeaveSetup() {
  const [leaveTypes] = useState(DEFAULT_LEAVE_TYPES);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-7 w-7 text-teal-500" />
              Leave Setup
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure leave types, entitlements, and policies
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Leave Type
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaveTypes.map((type, idx) => (
            <Card key={idx} className="bg-card border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{type.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days per year:</span>
                  <span className="font-medium">{type.days || "Unlimited"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Carry over:</span>
                  <Badge variant={type.carryOver ? "default" : "secondary"}>{type.carryOver ? "Yes" : "No"}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid:</span>
                  <Badge variant={type.paid ? "default" : "destructive"}>{type.paid ? "Paid" : "Unpaid"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Leave Policy Settings</CardTitle>
            <CardDescription>Configure general leave policies for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require manager approval</Label>
                <p className="text-xs text-muted-foreground">All leave applications must be approved by a manager</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve after deadline</Label>
                <p className="text-xs text-muted-foreground">Automatically approve if manager doesn't respond within deadline</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow negative leave balance</Label>
                <p className="text-xs text-muted-foreground">Allow employees to take leave even if balance is insufficient</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sync with payroll</Label>
                <p className="text-xs text-muted-foreground">Automatically sync approved leave with payroll system</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

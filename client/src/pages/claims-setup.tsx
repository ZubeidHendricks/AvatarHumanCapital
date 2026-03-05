import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Receipt, Plus, Edit2, Trash2, Settings } from "lucide-react";

const DEFAULT_CLAIM_TYPES = [
  { name: "Travel", maxAmount: 5000, requiresReceipt: true, autoApproveUnder: 500 },
  { name: "Accommodation", maxAmount: 3000, requiresReceipt: true, autoApproveUnder: 0 },
  { name: "Meals", maxAmount: 500, requiresReceipt: true, autoApproveUnder: 200 },
  { name: "Communication", maxAmount: 1000, requiresReceipt: true, autoApproveUnder: 100 },
  { name: "Training", maxAmount: 10000, requiresReceipt: true, autoApproveUnder: 0 },
  { name: "Equipment", maxAmount: 5000, requiresReceipt: true, autoApproveUnder: 0 },
  { name: "Medical", maxAmount: 2000, requiresReceipt: true, autoApproveUnder: 0 },
  { name: "Other", maxAmount: 1000, requiresReceipt: true, autoApproveUnder: 0 },
];

export default function ClaimsSetup() {
  const [claimTypes] = useState(DEFAULT_CLAIM_TYPES);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-7 w-7 text-orange-500" />
              Claims Setup
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure claim types, limits, and approval policies
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Claim Type
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {claimTypes.map((type, idx) => (
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
                  <span className="text-muted-foreground">Max amount:</span>
                  <span className="font-medium">R {type.maxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receipt required:</span>
                  <Badge variant={type.requiresReceipt ? "default" : "secondary"}>{type.requiresReceipt ? "Yes" : "No"}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Auto-approve under:</span>
                  <span className="font-medium">{type.autoApproveUnder > 0 ? `R ${type.autoApproveUnder}` : "Manual"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Claims Policy Settings</CardTitle>
            <CardDescription>Configure general claims policies for your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require manager approval</Label>
                <p className="text-xs text-muted-foreground">All claims must be approved by a manager</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Require receipt upload</Label>
                <p className="text-xs text-muted-foreground">Employees must upload receipts for all claims</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Monthly claim limit</Label>
                <p className="text-xs text-muted-foreground">Set maximum total claims per employee per month</p>
              </div>
              <Input type="number" className="w-32" placeholder="R 10,000" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sync with payroll</Label>
                <p className="text-xs text-muted-foreground">Automatically sync approved claims with payroll</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

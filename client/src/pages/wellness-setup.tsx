import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Heart, Brain, Dumbbell, Wallet, Plus, CheckCircle, XCircle,
  Edit2, Trash2, Link, Loader2, Settings
} from "lucide-react";
import { api } from "@/lib/api";
import type { WellnessProvider } from "@shared/schema";

const CATEGORIES = [
  {
    key: "mental_emotional",
    label: "Mental & Emotional Health",
    description: "Integrations with mental health and emotional wellness providers",
    icon: Brain,
    color: "purple",
  },
  {
    key: "physical",
    label: "Physical Wellness",
    description: "Integrations with physical health and fitness providers",
    icon: Dumbbell,
    color: "green",
  },
  {
    key: "financial",
    label: "Financial Wellbeing",
    description: "Integrations with financial wellness and advisory providers",
    icon: Wallet,
    color: "blue",
  },
];

export default function WellnessSetup() {
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<WellnessProvider | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const queryClient = useQueryClient();

  const providersKey = useTenantQueryKey(["wellness-providers"]);

  const { data: providers = [], isLoading } = useQuery<WellnessProvider[]>({
    queryKey: providersKey,
    queryFn: async () => (await api.get("/wellness-providers")).data,
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: Partial<WellnessProvider>) => {
      if (editingProvider) {
        return api.patch(`/wellness-providers/${editingProvider.id}`, data);
      }
      return api.post("/wellness-providers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providersKey });
      setShowProviderDialog(false);
      setEditingProvider(null);
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/wellness-providers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providersKey }),
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/wellness-providers/${id}`, { connectionStatus: "connected" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providersKey }),
  });

  const openAddDialog = (category: string) => {
    setEditingProvider(null);
    setSelectedCategory(category);
    setIsActive(true);
    setShowProviderDialog(true);
  };

  const openEditDialog = (provider: WellnessProvider) => {
    setEditingProvider(provider);
    setSelectedCategory(provider.category);
    setIsActive(provider.isActive === 1);
    setShowProviderDialog(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "mental_emotional": return "purple";
      case "physical": return "green";
      case "financial": return "blue";
      default: return "gray";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-7 w-7 text-pink-500" />
            Wellness Partner Setup
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure integrations with third-party wellness providers
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const categoryProviders = providers.filter(p => p.category === cat.key);
              const bgColor = cat.color === "purple" ? "bg-purple-100 dark:bg-purple-900" :
                              cat.color === "green" ? "bg-green-100 dark:bg-green-900" :
                              "bg-blue-100 dark:bg-blue-900";
              const iconColor = cat.color === "purple" ? "text-purple-600" :
                                cat.color === "green" ? "text-green-600" :
                                "text-blue-600";

              return (
                <Card key={cat.key} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{cat.label}</CardTitle>
                          <CardDescription>{cat.description}</CardDescription>
                        </div>
                      </div>
                      <Button onClick={() => openAddDialog(cat.key)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Provider
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {categoryProviders.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-border rounded-lg">
                        <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No providers configured for this category.</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => openAddDialog(cat.key)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add First Provider
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categoryProviders.map((provider) => (
                          <div key={provider.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`h-3 w-3 rounded-full ${
                                provider.connectionStatus === "connected" ? "bg-green-500" :
                                provider.connectionStatus === "error" ? "bg-red-500" : "bg-gray-400"
                              }`} />
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                {provider.description && (
                                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                                )}
                                <div className="flex gap-2 mt-1">
                                  {provider.apiEndpoint && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Link className="h-3 w-3" />
                                      {provider.apiEndpoint}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {provider.connectionStatus === "connected" ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />Connected
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />Disconnected
                                </Badge>
                              )}
                              <Badge variant={provider.isActive === 1 ? "default" : "secondary"}>
                                {provider.isActive === 1 ? "Active" : "Inactive"}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => testConnectionMutation.mutate(provider.id)}>
                                <Settings className="h-4 w-4 mr-1" />
                                Test
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(provider)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProviderMutation.mutate(provider.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ADD/EDIT PROVIDER DIALOG */}
        <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProvider ? "Edit Provider" : "Add Wellness Provider"}</DialogTitle>
              <DialogDescription>Configure a third-party wellness provider integration.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createProviderMutation.mutate({
                name: formData.get("name") as string,
                category: selectedCategory,
                description: formData.get("description") as string || undefined,
                apiEndpoint: formData.get("apiEndpoint") as string || undefined,
                apiKey: formData.get("apiKey") as string || undefined,
                isActive: isActive ? 1 : 0,
                connectionStatus: "disconnected",
              });
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Provider Name</Label>
                  <Input id="name" name="name" defaultValue={editingProvider?.name || ""} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={CATEGORIES.find(c => c.key === selectedCategory)?.label || selectedCategory}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="apiEndpoint">API Endpoint URL</Label>
                  <Input id="apiEndpoint" name="apiEndpoint" type="url" placeholder="https://api.provider.com/v1" defaultValue={editingProvider?.apiEndpoint || ""} />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" name="apiKey" type="password" placeholder="Enter API key..." defaultValue={editingProvider?.apiKey || ""} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Brief description of the provider..." defaultValue={editingProvider?.description || ""} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowProviderDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createProviderMutation.isPending}>
                  {createProviderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingProvider ? "Update" : "Add Provider"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

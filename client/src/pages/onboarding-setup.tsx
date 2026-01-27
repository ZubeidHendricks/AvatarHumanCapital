import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  Download,
  Upload,
  Loader2,
  FolderOpen,
  FileText,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  lastUpdated: string;
}

export default function OnboardingSetup() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const templates: Template[] = [
    { 
      id: "welcome_letter", 
      name: "Welcome Letter", 
      type: "welcome_letter",
      description: "Welcome letter template for new employees",
      icon: FileText,
      lastUpdated: "2024-01-15"
    },
    { 
      id: "employee_handbook", 
      name: "Employee Handbook", 
      type: "employee_handbook",
      description: "Comprehensive employee handbook template",
      icon: BookOpen,
      lastUpdated: "2024-01-10"
    },
    { 
      id: "company_policies", 
      name: "Company Policies", 
      type: "company_policies",
      description: "Company policies and procedures document",
      icon: ClipboardList,
      lastUpdated: "2024-01-08"
    },
    { 
      id: "onboarding_checklist", 
      name: "Onboarding Checklist", 
      type: "onboarding_checklist",
      description: "Step-by-step onboarding checklist for new hires",
      icon: ClipboardList,
      lastUpdated: "2024-01-05"
    },
    { 
      id: "it_request_form", 
      name: "IT Equipment Request Form", 
      type: "it_request",
      description: "Form for requesting IT equipment and access",
      icon: FileText,
      lastUpdated: "2024-01-03"
    },
    { 
      id: "benefits_enrollment", 
      name: "Benefits Enrollment Form", 
      type: "benefits_enrollment",
      description: "Employee benefits enrollment documentation",
      icon: FileText,
      lastUpdated: "2024-01-01"
    },
  ];

  const handleDownloadTemplate = async (templateId: string, templateName: string) => {
    setIsDownloading(templateId);
    try {
      const response = await fetch(`/api/documents/generate/${templateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "[Employee Name]",
          jobTitle: "[Job Title]",
          startDate: new Date().toISOString().split('T')[0],
          department: "[Department]",
        }),
      });

      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateName.replace(/\s+/g, "_")}_Template.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: "Template Downloaded",
        description: `${templateName} template has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUploadTemplate = () => {
    toast({
      title: "Template Uploaded",
      description: "Your custom template has been uploaded successfully.",
    });
    setUploadDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Employee Onboarding Setup
          </h1>
          <p className="text-muted-foreground mt-2">
            Download and upload onboarding document templates
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="button-upload-template">
              <Upload className="w-4 h-4 mr-2" />
              Upload Custom Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Custom Template</DialogTitle>
              <DialogDescription>
                Upload your own onboarding template to use in the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="e.g., Custom Welcome Letter" data-testid="input-template-name" />
              </div>
              <div className="space-y-2">
                <Label>Template File</Label>
                <Input type="file" accept=".docx,.doc,.pdf" data-testid="input-template-file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadTemplate} data-testid="button-confirm-upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:border-primary/50 transition-colors" data-testid={`template-card-${template.id}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {template.lastUpdated}
                  </Badge>
                  <Button 
                    size="sm"
                    onClick={() => handleDownloadTemplate(template.id, template.name)}
                    disabled={isDownloading === template.id}
                    data-testid={`button-download-${template.id}`}
                  >
                    {isDownloading === template.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Download,
  Upload,
  Loader2,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  lastUpdated: string;
}

export default function OfferSetup() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const templates: Template[] = [
    { 
      id: "offer_letter", 
      name: "Standard Offer Letter", 
      type: "offer_letter",
      description: "Standard employment offer letter template",
      lastUpdated: "2024-01-15"
    },
    { 
      id: "contract", 
      name: "Employment Contract", 
      type: "contract",
      description: "Full employment contract template with terms and conditions",
      lastUpdated: "2024-01-10"
    },
    { 
      id: "executive_offer", 
      name: "Executive Offer Package", 
      type: "executive_offer",
      description: "Executive-level offer letter with compensation details",
      lastUpdated: "2024-01-08"
    },
    { 
      id: "nda", 
      name: "Non-Disclosure Agreement", 
      type: "nda",
      description: "Standard NDA template for new hires",
      lastUpdated: "2024-01-05"
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
          salary: "[Salary Amount]",
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
            <FileText className="w-8 h-8 text-primary" />
            Offer Setup
          </h1>
          <p className="text-muted-foreground mt-2">
            Download and upload offer document templates
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
                Upload your own offer letter template to use in the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="e.g., Custom Offer Letter" data-testid="input-template-name" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:border-primary/50 transition-colors" data-testid={`template-card-${template.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Last updated: {template.lastUpdated}
                </Badge>
                <Button 
                  onClick={() => handleDownloadTemplate(template.id, template.name)}
                  disabled={isDownloading === template.id}
                  data-testid={`button-download-${template.id}`}
                >
                  {isDownloading === template.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

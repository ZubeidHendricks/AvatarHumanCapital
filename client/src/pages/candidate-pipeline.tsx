import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateService } from "@/lib/api";
import { useTenantQueryKey } from "@/hooks/useTenant";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  FileText,
  IdCard,
  Shield,
  FileCheck,
  UserCheck,
  ArrowRight,
  Download
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Candidate } from "@shared/schema";

type DocumentStatus = "complete" | "pending" | "missing";

type DocumentRecord = {
  status: DocumentStatus;
  uploadedAt?: string;
  url?: string;
};

type CandidateMetadata = {
  documents?: {
    cv?: DocumentRecord;
    idDocument?: DocumentRecord;
    references?: DocumentRecord;
    backgroundCheck?: DocumentRecord;
    contract?: DocumentRecord;
  };
  [key: string]: any;
};

const DOCUMENT_DEFINITIONS = [
  { key: "cv", name: "CV/Resume", icon: FileText },
  { key: "idDocument", name: "ID Document", icon: IdCard },
  { key: "references", name: "References", icon: UserCheck },
  { key: "backgroundCheck", name: "Background Check", icon: Shield },
  { key: "contract", name: "Signed Contract", icon: FileCheck },
] as const;

const PIPELINE_STAGES = [
  { name: "Screening", color: "bg-blue-400" },
  { name: "Shortlisted", color: "bg-yellow-500" },
  { name: "Interview", color: "bg-purple-500" },
  { name: "Offer", color: "bg-green-500" },
  { name: "Hired", color: "bg-emerald-600" },
];

export default function CandidatePipeline() {
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const candidatesKey = useTenantQueryKey(['candidates']);

  const { data: candidates, isLoading } = useQuery({
    queryKey: candidatesKey,
    queryFn: candidateService.getAll,
    retry: 1,
  });

  const shortlistedCandidates = candidates?.filter(c => 
    c.stage === "Shortlisted" || c.stage === "Interview" || c.stage === "Offer"
  ) || [];

  const getDocumentStatus = (candidate: Candidate, docKey: string): DocumentStatus => {
    const metadata = candidate.metadata as CandidateMetadata | null;
    const documents = metadata?.documents || {};
    const doc = documents[docKey as keyof typeof documents];
    
    if (docKey === "cv" && candidate.cvUrl) {
      return "complete";
    }
    
    return doc?.status || "missing";
  };

  const getCandidateDocumentStats = (candidate: Candidate) => {
    let complete = 0;
    let pending = 0;
    let missing = 0;

    DOCUMENT_DEFINITIONS.forEach(doc => {
      const status = getDocumentStatus(candidate, doc.key);
      if (status === "complete") complete++;
      else if (status === "pending") pending++;
      else missing++;
    });

    return { complete, pending, missing, total: DOCUMENT_DEFINITIONS.length };
  };

  const getStageIndex = (stage: string): number => {
    const index = PIPELINE_STAGES.findIndex(s => s.name === stage);
    return index === -1 ? 0 : index;
  };

  const allCandidateStats = shortlistedCandidates.map(c => getCandidateDocumentStats(c));
  const totalDocsComplete = allCandidateStats.filter(s => s.missing === 0).length;
  const totalDocsPending = allCandidateStats.filter(s => s.pending > 0 && s.missing === 0).length;
  const totalDocsMissing = allCandidateStats.filter(s => s.missing > 0).length;

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "missing":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const styles = {
      complete: "bg-green-500/10 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      missing: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    return styles[status];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Candidate Pipeline</h1>
          <p className="text-muted-foreground">Track shortlisted candidates and their document status</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Pipeline</p>
                  <p className="text-2xl font-bold">{shortlistedCandidates.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Docs Complete</p>
                  <p className="text-2xl font-bold text-green-400">
                    {totalDocsComplete}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Docs Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {totalDocsPending}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Docs Missing</p>
                  <p className="text-2xl font-bold text-red-400">
                    {totalDocsMissing}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Candidate Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              Loading candidates...
            </div>
          ) : shortlistedCandidates.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">No shortlisted candidates yet</p>
              <p className="text-sm text-muted-foreground mt-2">Shortlist candidates from the candidates page</p>
            </div>
          ) : (
            shortlistedCandidates.map((candidate, idx) => {
              const stats = getCandidateDocumentStats(candidate);
              const progressPercent = (stats.complete / stats.total) * 100;
              const stageIndex = getStageIndex(candidate.stage);

              return (
                <Card key={candidate.id} className="bg-card/50 border-white/10 hover:border-white/20 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-white/10">
                          <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                            {candidate.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{candidate.fullName}</CardTitle>
                          <CardDescription className="text-sm">{candidate.role || 'No role specified'}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusBadge(
                        progressPercent === 100 ? "complete" : 
                        stats.missing > 0 ? "missing" : "pending"
                      )}`}>
                        {Math.round(progressPercent)}% Complete
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Pipeline Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground">PIPELINE STAGE</p>
                        <p className="text-xs text-primary">{candidate.stage}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {PIPELINE_STAGES.map((stage, i) => (
                          <div key={i} className="flex items-center flex-1">
                            <div className={`h-2 rounded-full flex-1 transition-all ${
                              i <= stageIndex ? stage.color : 'bg-white/5'
                            }`} />
                            {i < PIPELINE_STAGES.length - 1 && (
                              <ArrowRight className={`h-3 w-3 mx-0.5 ${
                                i < stageIndex ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        {PIPELINE_STAGES.map((stage, i) => (
                          <span key={i} className={i <= stageIndex ? 'text-primary' : ''}>{stage.name}</span>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Documents Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-muted-foreground">REQUIRED DOCUMENTS</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-400">{stats.complete} ✓</span>
                          <span className="text-yellow-400">{stats.pending} ⏱</span>
                          <span className="text-red-400">{stats.missing} ✗</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {DOCUMENT_DEFINITIONS.map((doc, docIdx) => {
                          const status = getDocumentStatus(candidate, doc.key);
                          const Icon = doc.icon;
                          
                          return (
                            <div 
                              key={docIdx} 
                              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status)}
                                {status === "complete" && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 px-2 text-xs"
                                    data-testid={`button-download-${doc.name.toLowerCase().replace(/\//g, '-')}-${candidate.id}`}
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toast.info(`Sending reminder to ${candidate.fullName}`)}
                        data-testid={`button-remind-${candidate.id}`}
                      >
                        Send Reminder
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary"
                        onClick={() => toast.success(`Viewing ${candidate.fullName}'s full profile`)}
                        data-testid={`button-view-profile-${candidate.id}`}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

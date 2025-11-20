import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { interviewService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, PhoneOff, Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";

export default function InterviewVideo() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const candidateName = params.get("candidate") || "Candidate";
  const candidateId = params.get("id");

  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const createSessionMutation = useMutation({
    mutationFn: () => interviewService.createVideoSession(candidateId || undefined, candidateName),
    onSuccess: (data) => {
      setSessionUrl(data.sessionUrl);
      setIsSessionActive(true);
      toast.success("Video session created successfully");
    },
    onError: (error: any) => {
      console.error("Failed to create session:", error);
      toast.error("Failed to create video session. Please try again.");
    }
  });

  const handleStartSession = () => {
    createSessionMutation.mutate();
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setSessionUrl(null);
    toast.success("Interview ended");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-sm">Final Round Interview - {candidateName}</span>
        </div>
        <div className="flex items-center gap-4">
          {isSessionActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Connected to Tavus</span>
            </div>
          )}
          <Link href="/hr-dashboard">
            <Button variant="ghost" size="sm">Return to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 flex gap-6 h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 relative">
            {!isSessionActive ? (
              <div className="w-full h-full rounded-2xl border border-white/10 bg-card/30 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                  <Video className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Ready for your final interview?</h2>
                  <p className="text-muted-foreground max-w-md">
                    This session uses Tavus video cloning technology for a hyper-personalized experience with an AI interviewer.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleStartSession}
                  disabled={createSessionMutation.isPending}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                  data-testid="button-start-video"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Session...
                    </>
                  ) : (
                    "Start Video Interview"
                  )}
                </Button>
                {createSessionMutation.isError && (
                  <p className="text-red-400 text-sm">
                    Failed to create session. Please check your Tavus API configuration.
                  </p>
                )}
              </div>
            ) : sessionUrl ? (
              <iframe
                src={sessionUrl}
                className="w-full h-full rounded-2xl border border-white/10 shadow-2xl"
                allow="camera; microphone; fullscreen"
                data-testid="tavus-video-frame"
              />
            ) : (
              <div className="w-full h-full rounded-2xl border border-white/10 bg-card/30 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
              </div>
            )}
          </div>

          {isSessionActive && (
            <div className="h-20 rounded-2xl bg-card/50 border border-white/10 flex items-center justify-center gap-6 backdrop-blur-md">
              <Button 
                variant="destructive" 
                size="lg"
                onClick={handleEndSession}
                className="rounded-full"
                data-testid="button-end-video"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                End Interview
              </Button>
            </div>
          )}
        </div>

        <div className="w-80 space-y-4">
          <div className="bg-card/30 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" />
              Interview Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidate:</span>
                <span className="font-medium">{candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <span className="font-medium">Senior Backend Developer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Round:</span>
                <span className="font-medium">Final Interview</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technology:</span>
                <span className="font-medium">Tavus AI Clone</span>
              </div>
            </div>
          </div>

          <div className="bg-card/30 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Interview Topics</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <span>Technical expertise & project experience</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <span>Problem-solving approach</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <span>Team collaboration & communication</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <span>Cultural fit & career goals</span>
              </li>
            </ul>
          </div>

          {isSessionActive && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-green-400">
                The AI interviewer is actively listening and will adapt questions based on your responses.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

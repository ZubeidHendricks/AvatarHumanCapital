import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mic, Video, PhoneOff, Settings, MoreVertical, Volume2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

// Mock Tavus Video Player Component
function TavusPlayer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative w-full h-full bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Placeholder for Tavus Video */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-950">
        {/* Simulated Person */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[90%]">
          <motion.div 
            animate={isPlaying ? { scale: [1, 1.01, 1] } : {}}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-full h-full bg-zinc-700 rounded-t-full opacity-50 blur-3xl"
          />
           {/* Simple SVG representation of a person for the mockup */}
           <svg className="w-full h-full text-zinc-400" viewBox="0 0 100 100" fill="currentColor">
             <path d="M50 60 C 30 60, 20 80, 20 100 L 80 100 C 80 80, 70 60, 50 60 Z" />
             <circle cx="50" cy="35" r="15" />
           </svg>
        </div>
      </div>

      {/* Overlays */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-medium text-white">Tavus AI Engine</span>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
           <p className="text-white/90 text-lg font-medium">
             "Hello Sarah! I reviewed your first interview, and I'm impressed by your agile experience. Can you walk me through a specific sprint where you had to pivot quickly?"
           </p>
        </div>
      </div>
    </div>
  );
}

export default function InterviewVideo() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  // Mock mic level animation
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      setMicLevel(Math.random() * 100);
    }, 100);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Video className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-sm">Final Round Interview</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
             <div className="w-2 h-2 rounded-full bg-green-500" />
             <span className="text-xs text-muted-foreground">Connection Stable</span>
           </div>
           <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 flex gap-6 h-[calc(100vh-64px)]">
        
        {/* Main Video Area */}
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
                     This session uses Tavus video cloning technology for a hyper-personalized experience.
                   </p>
                 </div>
                 <Button size="lg" onClick={() => setIsSessionActive(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                   Start Video Session
                 </Button>
              </div>
            ) : (
              <TavusPlayer isPlaying={true} />
            )}
            
            {/* Self View (Picture in Picture) */}
            {isSessionActive && (
              <div className="absolute bottom-6 right-6 w-48 h-32 bg-black rounded-lg border border-white/20 shadow-xl overflow-hidden">
                 <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                   <UserCameraMock />
                 </div>
                 <div className="absolute bottom-2 left-2 flex gap-1">
                    <div className="w-1 h-3 bg-green-500 rounded-full" style={{ height: `${Math.max(20, micLevel/2)}%` }} />
                    <div className="w-1 h-3 bg-green-500 rounded-full" style={{ height: `${Math.max(30, micLevel)}%` }} />
                    <div className="w-1 h-3 bg-green-500 rounded-full" style={{ height: `${Math.max(20, micLevel/1.5)}%` }} />
                 </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          {isSessionActive && (
            <div className="h-20 rounded-2xl bg-card/50 border border-white/10 flex items-center justify-center gap-6 backdrop-blur-md">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-white/5">
                <Mic className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-white/5">
                <Video className="w-5 h-5" />
              </Button>
              <Link href="/">
                <Button size="icon" className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20">
                  <PhoneOff className="w-6 h-6 text-white" />
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-white/5">
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - Interview Context */}
        <div className="w-80 hidden lg:flex flex-col gap-4">
           <Card className="bg-card/30 border-white/10 flex-1">
             <CardHeader>
               <CardTitle className="text-sm">Interview Context</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="space-y-2">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Role</p>
                 <p className="font-medium">Senior Project Manager</p>
               </div>
               <div className="space-y-2">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Interviewer</p>
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">AI</div>
                   <div>
                     <p className="text-sm font-medium">Alex (Digital Twin)</p>
                     <p className="text-xs text-muted-foreground">Tavus Gen-2 Model</p>
                   </div>
                 </div>
               </div>
               <div className="space-y-2">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Focus Areas</p>
                 <div className="flex flex-wrap gap-2">
                   <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">Leadership</Badge>
                   <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">Conflict Resolution</Badge>
                   <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">Strategic Planning</Badge>
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>

      </main>
    </div>
  );
}

function UserCameraMock() {
  return (
    <div className="w-full h-full bg-zinc-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-zinc-600 rounded-t-full opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500">
        <span className="text-xs">You</span>
      </div>
    </div>
  )
}
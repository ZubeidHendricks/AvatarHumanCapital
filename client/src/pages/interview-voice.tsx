import { useState, useEffect } from "react";
import { HumeVisualizer } from "@/components/voice-agent/hume-visualizer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, PhoneOff, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

type Transcript = {
  role: "user" | "ai";
  text: string;
  emotion?: string;
};

export default function InterviewVoice() {
  const [state, setState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>("Neutral");
  const [isStarted, setIsStarted] = useState(false);

  // Simulation loop
  useEffect(() => {
    if (!isStarted) return;

    let timeout: NodeJS.Timeout;

    const startSimulation = async () => {
      // 1. AI Speaks Intro
      setState("speaking");
      setCurrentEmotion("Warmth");
      await new Promise(r => setTimeout(r, 1000));
      setTranscripts(prev => [...prev, { role: "ai", text: "Hi there! Thank you for joining this voice interview. I'm AHC's AI interviewer. I'd love to hear about your background. Shall we start?", emotion: "Warmth" }]);
      
      // 2. User "Speaks" (Simulated)
      await new Promise(r => setTimeout(r, 3000));
      setState("listening");
      await new Promise(r => setTimeout(r, 4000)); // Simulating user talking
      
      setState("processing");
      await new Promise(r => setTimeout(r, 1500));
      setTranscripts(prev => [...prev, { role: "user", text: "Yes, absolutely. I've been working in project management for about 5 years now, focusing mostly on agile transformations." }]);

      // 3. AI Responds
      setState("speaking");
      setCurrentEmotion("Curiosity");
      setTranscripts(prev => [...prev, { role: "ai", text: "That's fascinating. Agile transformations can be challenging. What was the biggest hurdle you faced during one of those transitions?", emotion: "Curiosity" }]);
      
      await new Promise(r => setTimeout(r, 4000));
      setState("listening");
    };

    if (isStarted && transcripts.length === 0) {
      timeout = setTimeout(startSimulation, 500);
    }

    return () => clearTimeout(timeout);
  }, [isStarted]);

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div>
            <h1 className="font-medium text-sm text-white/90">Voice Interview Session</h1>
            <p className="text-xs text-white/50">Powered by Chit-Chet</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70 px-3 py-1">
          {currentEmotion}
        </Badge>
      </header>

      {/* Main Visualizer */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        {!isStarted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
              <Mic className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Ready for your interview?</h2>
              <p className="text-white/50 max-w-md mx-auto">
                This is an AI-led voice interview. Speak naturally as if you were talking to a person.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => setIsStarted(true)}
              className="h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 font-medium text-lg transition-transform hover:scale-105"
            >
              Start Conversation
            </Button>
          </motion.div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex-1 flex items-center justify-center w-full">
              <HumeVisualizer state={state} />
            </div>
            
            {/* Captions */}
            <div className="h-32 w-full max-w-2xl px-6 text-center flex items-center justify-center mb-12">
              <AnimatePresence mode="wait">
                {transcripts.length > 0 && (
                  <motion.div
                    key={transcripts[transcripts.length - 1].text}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.5 }}
                    className={`text-xl md:text-2xl font-medium leading-relaxed ${
                      transcripts[transcripts.length - 1].role === "ai" 
                        ? "text-white" 
                        : "text-white/60 italic"
                    }`}
                  >
                    "{transcripts[transcripts.length - 1].text}"
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mb-12 flex items-center gap-6">
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">
                <MicOff className="w-6 h-6" />
              </Button>
              <Link href="/">
                <Button size="icon" className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 text-white">
                  <PhoneOff className="w-8 h-8" />
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white">
                <MessageSquare className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
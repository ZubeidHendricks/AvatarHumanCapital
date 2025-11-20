import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Search, 
  Database, 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  FileSearch,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types for our mock RAG system
type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
};

type RagStep = {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed";
  details?: string[];
  icon: any;
};

type RetrievedDoc = {
  id: string;
  title: string;
  type: "template" | "candidate" | "policy";
  relevance: number; // 0-100
  snippet: string;
};

export default function RecruitmentAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "Hello. I am your AI Recruitment Agent. I can help you define hiring needs, compile job descriptions from our library, and source candidates. What role are you looking to fill today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // RAG State
  const [ragSteps, setRagSteps] = useState<RagStep[]>([]);
  const [retrievedDocs, setRetrievedDocs] = useState<RetrievedDoc[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate RAG Workflow based on the document provided
    // 1. Determine Needs -> 2. Compile JD -> 3. Find Candidates -> 4. Assess
    
    // Step 1: Analyze Request
    setRagSteps([
      { id: "1", label: "Analyzing Hiring Needs", status: "processing", icon: BrainCircuit, details: ["Extracting role requirements...", "Identifying seniority level..."] }
    ]);
    
    await new Promise(r => setTimeout(r, 1500));
    
    // Step 2: Retrieve Context (JD Libraries)
    setRagSteps(prev => [
      { ...prev[0], status: "completed" },
      { id: "2", label: "Retrieving JD Templates", status: "processing", icon: Database, details: ["Searching 'Senior Project Manager' templates...", "Accessing Industry Standards Library..."] }
    ]);
    setRetrievedDocs([
      { id: "doc1", title: "Project_Manager_L3_Template.pdf", type: "template", relevance: 98, snippet: "Requires 5+ years experience in Agile methodologies..." },
      { id: "doc2", title: "IT_Dept_Hiring_Policy_v2.docx", type: "policy", relevance: 85, snippet: "All senior roles require technical assessment..." }
    ]);

    await new Promise(r => setTimeout(r, 2000));

    // Step 3: Source Candidates (External Portals)
    setRagSteps(prev => [
      ...prev.slice(0, 1),
      { ...prev[1], status: "completed" },
      { id: "3", label: "Sourcing Candidates", status: "processing", icon: Search, details: ["Connecting to LinkedIn API...", "Scanning internal talent pool...", "Filtering for 'PMP Certification'..."] }
    ]);

    await new Promise(r => setTimeout(r, 2500));

    // Step 4: Assess & Match
    setRagSteps(prev => [
      ...prev.slice(0, 2),
      { ...prev[2], status: "completed" },
      { id: "4", label: " AI Assessment & Matching", status: "processing", icon: Sparkles, details: ["Ranking top 50 candidates...", "Evaluating cultural fit...", "Generating match scores..."] }
    ]);
    
    // Add some "Candidate" docs
    setRetrievedDocs(prev => [
      ...prev,
      { id: "cand1", title: "Sarah_Jenkins_Resume.pdf", type: "candidate", relevance: 94, snippet: "PMP Certified, 7 years at TechCorp..." },
      { id: "cand2", title: "Michael_Wong_CV.pdf", type: "candidate", relevance: 89, snippet: "Senior PM with fintech experience..." }
    ]);

    await new Promise(r => setTimeout(r, 1500));

    setRagSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
    setIsProcessing(false);

    const agentResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "agent",
      content: "I've analyzed your request for a Senior Project Manager. Using our Job Description Library, I've compiled a standardized JD and cross-referenced it with our hiring policies.\n\nI also scanned external portals and our internal database. I found 2 highly relevant candidates who match the criteria (PMP certified, 5+ years experience).\n\nWould you like to review the drafted JD or see the candidate profiles?",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, agentResponse]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-20 container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* LEFT: RAG Context & Process Visualization */}
          <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            {/* Process Steps */}
            <Card className="bg-card/30 border-white/10 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-primary" /> 
                  Agent Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-6 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/5 z-0" />
                  
                  {ragSteps.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-8 italic">
                      Waiting for task...
                    </div>
                  )}

                  <AnimatePresence>
                    {ragSteps.map((step, index) => (
                      <motion.div 
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative z-10"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 bg-background ${
                            step.status === "completed" ? "border-green-500 text-green-500" : 
                            step.status === "processing" ? "border-primary text-primary animate-pulse" : 
                            "border-muted text-muted-foreground"
                          }`}>
                            {step.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className={`text-sm font-bold ${step.status === "processing" ? "text-primary" : "text-foreground"}`}>
                              {step.label}
                            </h4>
                            {step.details && (
                              <motion.ul 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2 space-y-1"
                              >
                                {step.details.map((detail, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    {detail}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MIDDLE: Chat Interface */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <Card className="flex-1 flex flex-col bg-card/50 border-white/10 backdrop-blur-md overflow-hidden">
              <CardHeader className="border-b border-white/5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <CardTitle className="text-base">Recruitment Assistant</CardTitle>
                      <CardDescription className="text-xs">Powered by AHC Agentic Engine</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px]">RAG ENABLED</Badge>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 pb-4">
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className={`w-8 h-8 ${msg.role === "agent" ? "border border-primary/50" : "border border-white/10"}`}>
                        <AvatarImage src={msg.role === "agent" ? "" : "/user.png"} />
                        <AvatarFallback className={msg.role === "agent" ? "bg-primary/10 text-primary" : "bg-white/10"}>
                          {msg.role === "agent" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-white/5 border border-white/10 rounded-tl-none"
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3"
                    >
                       <Avatar className="w-8 h-8 border border-primary/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Processing request...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex gap-2">
                  <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Describe the role you want to hire for..." 
                    className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isProcessing || !inputValue.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: Retrieved Documents & Results */}
          <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <Card className="bg-card/30 border-white/10 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-primary" /> 
                  Retrieved Context
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2">
                {retrievedDocs.length === 0 ? (
                   <div className="text-sm text-muted-foreground text-center py-8 italic">
                      No documents retrieved yet.
                    </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {retrievedDocs.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group cursor-pointer">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {doc.type === "candidate" ? <Users className="w-3 h-3 text-blue-400" /> : <FileText className="w-3 h-3 text-yellow-400" />}
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/10">{doc.type}</Badge>
                              </div>
                              <span className="text-[10px] text-green-400 font-mono">{doc.relevance}% Match</span>
                            </div>
                            <h5 className="text-sm font-medium truncate mb-1 group-hover:text-primary transition-colors">{doc.title}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">"{doc.snippet}"</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
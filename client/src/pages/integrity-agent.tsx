import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  FileSignature, 
  Fingerprint, 
  Search, 
  AlertTriangle,
  CheckCircle2, 
  Loader2, 
  Lock,
  Scale,
  FileText
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
  type: "consent" | "record" | "report";
  status: "verified" | "flagged" | "pending";
  snippet: string;
};

export default function IntegrityAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "I am the Integrity Evaluation Agent. I can automate background checks, biometric processing, and risk assessments. Please provide a candidate name to begin the integrity workflow.",
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

    // Simulate Integrity Workflow
    // 1. Obtain Consent & Bio -> 2. Run Checks -> 3. Verify & Assess -> 4. Report
    
    // Step 1: Consent & Biometrics
    setRagSteps([
      { id: "1", label: "Procuring Consent & Biometrics", status: "processing", icon: FileSignature, details: ["Requesting digital consent...", "Processing fingerprint hash...", "Validating ID documents..."] }
    ]);
    
    await new Promise(r => setTimeout(r, 1500));
    
    setRagSteps(prev => [
      { ...prev[0], status: "completed" },
      { id: "2", label: "Executing Multi-Source Checks", status: "processing", icon: Search, details: ["Querying Criminal Database...", "Verifying Credit Bureau Data...", "Checking Academic Registry...", "Validating Employment History..."] }
    ]);
    
    setRetrievedDocs([
      { id: "doc1", title: "Signed_Consent_Form.pdf", type: "consent", status: "verified", snippet: "Digital signature verified. Timestamp: 2024-05-20 09:00 AM" },
      { id: "doc2", title: "Biometric_Scan_Hash.dat", type: "record", status: "verified", snippet: "Fingerprint match score: 99.9%. ID verified against Home Affairs." }
    ]);

    await new Promise(r => setTimeout(r, 2000));

    // Step 3: Evaluation
    setRagSteps(prev => [
      ...prev.slice(0, 1),
      { ...prev[1], status: "completed" },
      { id: "3", label: "Risk Assessment & Evaluation", status: "processing", icon: Scale, details: ["Cross-referencing references...", "Analyzing credit risk score...", "Compiling integrity matrix..."] }
    ]);

    setRetrievedDocs(prev => [
      ...prev,
      { id: "rep1", title: "Criminal_Record_Clearance.pdf", type: "report", status: "verified", snippet: "No criminal record found in national database." },
      { id: "rep2", title: "Credit_Bureau_Report_v2.pdf", type: "report", status: "flagged", snippet: "Minor credit default flagged in 2022. Risk level: Low." },
      { id: "rep3", title: "University_Transcript.pdf", type: "record", status: "verified", snippet: "BSc Computer Science confirmed. Graduated 2018." }
    ]);

    await new Promise(r => setTimeout(r, 2000));

    setRagSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
    setIsProcessing(false);

    const agentResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "agent",
      content: "Integrity Evaluation Complete.\n\nI have successfully processed the candidate's biometrics and consent. Background checks returned a **CLEAR** criminal record and verified academic qualifications.\n\nNote: A minor flag was identified in the credit report (Low Risk). \n\nI have compiled the final 'Candidate Assessment Report' with a recommendation to **APPOINT**. Would you like to generate the formal offer?",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, agentResponse]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-20 container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* LEFT: Workflow Visualization */}
          <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <Card className="bg-card/30 border-white/10 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> 
                  Integrity Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-6 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/5 z-0" />
                  
                  {ragSteps.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-8 italic">
                      Waiting for candidate...
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
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <div>
                      <CardTitle className="text-base">Integrity Agent</CardTitle>
                      <CardDescription className="text-xs">Automated Background & Risk Engine</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px]">SECURE CHANNEL</Badge>
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
                        <span className="text-xs text-muted-foreground">Running verification protocols...</span>
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
                    placeholder="Enter candidate name for integrity check..." 
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

          {/* RIGHT: Evidence Locker */}
          <div className="hidden lg:block lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <Card className="bg-card/30 border-white/10 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" /> 
                  Evidence Locker
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2">
                {retrievedDocs.length === 0 ? (
                   <div className="text-sm text-muted-foreground text-center py-8 italic">
                      Secure verification pending...
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
                          <div className={`p-3 rounded-lg bg-white/5 border transition-colors group cursor-pointer ${
                            doc.status === "flagged" ? "border-yellow-500/30 hover:border-yellow-500/60" : 
                            "border-white/5 hover:border-green-500/30"
                          }`}>
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {doc.type === "consent" ? <FileSignature className="w-3 h-3 text-blue-400" /> : 
                                 doc.type === "record" ? <Fingerprint className="w-3 h-3 text-purple-400" /> : 
                                 <FileText className="w-3 h-3 text-orange-400" />}
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/10">{doc.type}</Badge>
                              </div>
                              {doc.status === "flagged" ? (
                                <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> FLAGGED
                                </span>
                              ) : (
                                <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-medium truncate mb-1 group-hover:text-foreground transition-colors">{doc.title}</h5>
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
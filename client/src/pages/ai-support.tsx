import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Bot, 
  User,
  Sparkles,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  relatedTopics?: string[];
  suggestedActions?: string[];
}

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/support/chat", {
        question: userMessage.content,
        sessionId
      });

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: response.data.answer || "I'm not sure how to help with that. Please try rephrasing your question.",
        relatedTopics: response.data.relatedTopics,
        suggestedActions: response.data.suggestedActions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.post("/support/clear-history", { sessionId });
      setMessages([]);
      toast({
        title: "Conversation Cleared",
        description: "Your conversation history has been cleared."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history.",
        variant: "destructive"
      });
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          AI Support Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Ask me anything about how to use the Avatar Human Capital platform. I'm here to help!
        </p>
      </div>

      <Card className="h-[600px] flex flex-col" data-testid="support-chat-panel">
        <CardHeader className="pb-2 flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Platform Help</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearHistory}
            data-testid="button-clear-history"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Sparkles className="w-16 h-16 mx-auto text-primary/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                  <p className="text-muted-foreground">
                    Ask me about any feature in the platform and I'll guide you through it.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Quick questions to get started:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "How do I create a new job?",
                      "How do I add a chart to the dashboard?",
                      "How do I schedule an interview?",
                      "How do I download templates?",
                      "How do I run a background check?",
                      "How do I manage candidates?"
                    ].map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => handleQuickQuestion(q)}
                        data-testid={`button-quick-question-${i}`}
                      >
                        <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                        <span>{q}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.role === "assistant" && message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-medium mb-2 opacity-70">Suggested actions:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.suggestedActions.map((action, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <ArrowRight className="w-3 h-3 mr-1" />
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.role === "assistant" && message.relatedTopics && message.relatedTopics.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {message.relatedTopics.map((topic, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-accent"
                                onClick={() => handleQuickQuestion(topic)}
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about the platform..."
                disabled={isLoading}
                className="flex-1"
                data-testid="input-support-question"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                data-testid="button-send-question"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

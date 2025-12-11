"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, History, Youtube, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "./markdown-renderer";
import { VideoCarousel } from "../video/video-carousel";
import { QuizInterface } from "../quiz/quiz-interface";
import { cn } from "@/lib/utils";

const syllabi: Record<
  string,
  {
    title: string;
    sections: { title: string; items: string[] }[];
  }
> = {
  javascript: {
    title: "JavaScript Roadmap",
    sections: [
      {
        title: "Fundamentals",
        items: [
          "Values, Variables (let/const), Scope",
          "Primitives vs Objects",
          "Operators, Control Flow",
          "Functions & Parameters",
        ],
      },
      {
        title: "Data & Structures",
        items: ["Arrays & Methods", "Objects & Prototypes", "Destructuring/Rest/Spread", "JSON"],
      },
      {
        title: "Browser & APIs",
        items: ["DOM & Events", "Fetch/HTTP", "Timers & Async Tasks", "LocalStorage/SessionStorage"],
      },
      {
        title: "Async & Modules",
        items: ["Promises", "Async/Await", "Error Handling", "ES Modules vs CommonJS"],
      },
      {
        title: "Tooling & Quality",
        items: ["NPM/Yarn", "Bundlers (Vite/Webpack)", "ESLint/Prettier", "Basic Testing (Jest)"],
      },
      {
        title: "Next Steps",
        items: ["TypeScript Intro", "React Basics", "Performance & DevTools"],
      },
    ],
  },
  typescript: {
    title: "TypeScript Roadmap",
    sections: [
      {
        title: "Core Types",
        items: ["Primitives & Literals", "Interfaces vs Types", "Unions & Intersections", "Enums"],
      },
      {
        title: "Functions & Safety",
        items: ["Function Types", "Generics Basics", "Type Narrowing (typeof/in/instanceof)", "Unknown vs Any"],
      },
      {
        title: "Advanced Types",
        items: ["Utility Types (Partial/Pick/Record)", "Mapped & Conditional Types", "Template Literal Types"],
      },
      {
        title: "Tooling",
        items: ["tsconfig essentials", "Path aliases", "Strict mode & noImplicitAny", "ESLint + TS"],
      },
      {
        title: "Integration",
        items: ["Type React components/hooks", "Typing APIs/Fetch", "Module augmentation & declaration files"],
      },
    ],
  },
  python: {
    title: "Python Roadmap",
    sections: [
      {
        title: "Foundations",
        items: ["Syntax & Indentation", "Variables & Types", "Control Flow", "Functions & Arguments"],
      },
      {
        title: "Data Structures",
        items: ["Lists/Tuples/Sets", "Dictionaries", "Comprehensions", "Iterators/Generators"],
      },
      {
        title: "Modules & Env",
        items: ["Imports & Packages", "Virtual Environments", "pip/requirements", "Logging & Config"],
      },
      {
        title: "OOP & Errors",
        items: ["Classes & Inheritance", "Dunder methods", "Exceptions & Handling", "Context Managers"],
      },
      {
        title: "Typing & Quality",
        items: ["Typing (typing/mypy)", "Testing (pytest)", "Lint/Format (ruff/black)", "Packaging basics"],
      },
      {
        title: "Async & Ecosystem",
        items: ["Asyncio basics", "HTTP/Requests", "CLI tools", "Next: FastAPI/Django or Data stack"],
      },
    ],
  },
  default: {
    title: "Learning Roadmap",
    sections: [
      {
        title: "Basics",
        items: ["Syntax & Types", "Variables & Scope", "Control Flow", "Functions"],
      },
      {
        title: "Data Structures",
        items: ["Arrays/Lists", "Maps/Objects", "Strings/Regex", "Collections & Iteration"],
      },
      {
        title: "Advanced",
        items: ["Modules & Imports", "Error Handling", "Async/Concurrency", "Testing & Tooling"],
      },
    ],
  },
};

interface ChatInterfaceProps {
  language: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function ChatInterface({ language }: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizTopic, setQuizTopic] = useState("");
  const [sidebarMode, setSidebarMode] = useState<"videos" | "quiz" | null>(null);
  const videoSearchRef = useRef<HTMLInputElement>(null);
  const quizSearchRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [showSyllabus, setShowSyllabus] = useState(true);
  const [inputError, setInputError] = useState<string | null>(null);
  const [contextWarning, setContextWarning] = useState<string | null>(null);

  const MAX_MESSAGE_CHARS = 4000;
  const WARNING_CONTEXT_CHARS = 12000; // approximate combined chars before warning

  // Simple syllabus/roadmap per language
  const normalizedLang = language.toLowerCase();
  const syllabus = syllabi[normalizedLang] || syllabi.default;

  const { messages, append, isLoading, error, setMessages } =
    useChat({
      api: "/api/chat",
      body: {
        language,
      },
      onError: (error) => {
        console.error("Chat error:", error);
        alert(`Error: ${error.message}`);
      },
    });

  // Ref for save function to access latest messages
  const savingRef = useRef(false);

  // Save chat - only called after streaming ends
  const saveChat = async () => {
    if (savingRef.current || messages.length === 0) return;
    
    savingRef.current = true;
    try {
      const response = await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          language,
          sessionId: currentSessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      savingRef.current = false;
    }
  };

  // Save only when loading stops (streaming ended)
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const timer = setTimeout(saveChat, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const loadRecentChats = async () => {
    try {
      const response = await fetch(`/api/chat/history?language=${language}&limit=5`);
      if (!response.ok) return;
      const data = await response.json();
      setRecentChats(data.chats || []);
    } catch (error) {
      console.error("Failed to load recent chats:", error);
    }
  };

  // Load recent chats once on mount
  useEffect(() => {
    loadRecentChats();
  }, []);

  // Simple auto-scroll - only when a new message is added
  const prevMessageCount = useRef(0);
  
  useEffect(() => {
    // Only scroll if message count increased
    if (messages.length > prevMessageCount.current) {
      prevMessageCount.current = messages.length;
      
      requestAnimationFrame(() => {
        const scrollElement = scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      });
    }
  }, [messages.length]);

  const loadChat = async (sessionId: string) => {
    try {
      const response = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.chat) {
        setMessages(data.chat.messages);
        setCurrentSessionId(data.chat.id);
        setShowHistory(false);
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
    setVideos([]);
    setQuizTopic("");
    setShowQuiz(false);
    setSidebarMode(null);
    if (videoSearchRef.current) videoSearchRef.current.value = "";
    if (quizSearchRef.current) quizSearchRef.current.value = "";
    if (chatInputRef.current) chatInputRef.current.value = "";
  };

  const searchVideos = async (topic: string) => {
    setLoadingVideos(true);
    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${topic} ${language}`, maxResults: 5 }),
      });

      const data = await response.json();
      if (data.videos) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error("Failed to search videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const openVideosSidebar = () => {
    setSidebarMode("videos");
    setShowQuiz(false);
  };

  const openQuizSidebar = () => {
    setSidebarMode("quiz");
    setShowQuiz(false);
  };

  // Context warning based on total chars (rough heuristic)
  useEffect(() => {
    const totalChars =
      messages.reduce((acc, m) => acc + (m.content?.length || 0), 0) +
      (chatInputRef.current?.value.length || 0);
    if (totalChars > WARNING_CONTEXT_CHARS) {
      setContextWarning("Conversation is getting long; older context may be truncated.");
    } else {
      setContextWarning(null);
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    const input = chatInputRef.current?.value.trim();
    if (!input) return;

    // Guard: message length
    if (input.length > MAX_MESSAGE_CHARS) {
      setInputError(`Message too long (${input.length} chars). Limit ${MAX_MESSAGE_CHARS}.`);
      return;
    }
    
    setInputError(null);

    // Add user message
    await append({
      role: "user",
      content: input,
    });
    
    // Clear input
    if (chatInputRef.current) {
      chatInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar for Videos/Quiz */}
      {sidebarMode && (
        <div className="w-96 border-r border-border/40 bg-background/50 flex flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              {sidebarMode === "videos" ? (
                <>
                  <Youtube className="w-5 h-5 text-red-500" />
                  Video Tutorials
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 text-purple-500" />
                  Take Quiz
                </>
              )}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarMode(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 flex flex-col">
            {sidebarMode === "videos" && (
              <>
                {/* Video Search Input */}
                <div className="p-4 border-b border-border/40">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const topic = videoSearchRef.current?.value.trim();
                      if (topic) {
                        searchVideos(topic);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={videoSearchRef}
                      type="text"
                      placeholder={`e.g., ${language} basics, loops, functions...`}
                      className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={loadingVideos}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={loadingVideos}
                    >
                      {loadingVideos ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </form>
                </div>

                {/* Video Results */}
                <div className="flex-1 overflow-hidden">
                  {loadingVideos ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="px-4">
                      <VideoCarousel 
                        videos={videos} 
                        topic={videoSearchRef.current?.value || language} 
                        language={language}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12 px-4">
                      <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Search for {language} video tutorials</p>
                      <p className="text-xs mt-1">Enter a topic above to get started</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {sidebarMode === "quiz" && (
              <>
                {/* Quiz Topic Input */}
                {!showQuiz && (
                  <div className="p-4 border-b border-border/40">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const topic = quizSearchRef.current?.value.trim();
                        if (topic) {
                          setQuizTopic(topic);
                          setShowQuiz(true);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          What topic do you want to test yourself on?
                        </label>
                        <input
                          ref={quizSearchRef}
                          type="text"
                          placeholder={`e.g., ${language} variables, loops, OOP...`}
                          className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Quiz
                      </Button>
                    </form>
                  </div>
                )}

                {/* Quiz Interface */}
                {showQuiz && (
                  <ScrollArea className="flex-1">
                    <QuizInterface
                      topic={quizTopic}
                      language={language}
                      onClose={() => {
                        setShowQuiz(false);
                        if (quizSearchRef.current) quizSearchRef.current.value = "";
                      }}
                    />
                  </ScrollArea>
                )}

                {/* Placeholder when no quiz */}
                {!showQuiz && (
                  <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-6">
                    <div>
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Enter a topic to generate a quiz</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Chat Header */}
        <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between bg-background/95">
          <div className="flex items-center gap-2">
            <Button
              onClick={openVideosSidebar}
              variant={sidebarMode === "videos" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <Youtube className="w-4 h-4" />
              Videos
            </Button>
            <Button
              onClick={openQuizSidebar}
              variant={sidebarMode === "quiz" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <Brain className="w-4 h-4" />
              Quiz
            </Button>
            <Button
              variant={showSyllabus ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSyllabus((v) => !v)}
              className="gap-2"
            >
              Syllabus
            </Button>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              Recent Chats
            </Button>
            
            {showHistory && recentChats.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {recentChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-border/40 last:border-0 transition-colors"
                  >
                    <div className="font-medium text-sm truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
          {/* Input/context warnings */}
          {inputError && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {inputError}
              </div>
            </div>
          )}
          {contextWarning && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {contextWarning}
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Start Learning {language.charAt(0).toUpperCase() + language.slice(1)}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Ask me anything about {language} programming! I can help with concepts,
                  code examples, debugging, and best practices.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-6">
              <button
                onClick={() => {
                  if (chatInputRef.current) {
                    chatInputRef.current.value = `Explain the basics of ${language}`;
                    chatInputRef.current.focus();
                  }
                }}
                className="p-4 rounded-lg border border-border/40 hover:border-border hover:bg-accent/50 transition-colors text-left"
              >
                <p className="text-sm font-medium">Getting Started</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Explain the basics of {language}
                </p>
              </button>
              <button
                onClick={() => {
                  if (chatInputRef.current) {
                    chatInputRef.current.value = `Show me a simple ${language} example`;
                    chatInputRef.current.focus();
                  }
                }}
                className="p-4 rounded-lg border border-border/40 hover:border-border hover:bg-accent/50 transition-colors text-left"
              >
                <p className="text-sm font-medium">Code Example</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Show me a simple {language} example
                </p>
              </button>
              <button
                onClick={() => {
                  if (chatInputRef.current) {
                    chatInputRef.current.value = `What are the best practices in ${language}?`;
                    chatInputRef.current.focus();
                  }
                }}
                className="p-4 rounded-lg border border-border/40 hover:border-border hover:bg-accent/50 transition-colors text-left"
              >
                <p className="text-sm font-medium">Best Practices</p>
                <p className="text-xs text-muted-foreground mt-1">
                  What are the best practices in {language}?
                </p>
              </button>
              <button
                onClick={() => {
                  if (chatInputRef.current) {
                    chatInputRef.current.value = `Common mistakes to avoid in ${language}`;
                    chatInputRef.current.focus();
                  }
                }}
                className="p-4 rounded-lg border border-border/40 hover:border-border hover:bg-accent/50 transition-colors text-left"
              >
                <p className="text-sm font-medium">Common Pitfalls</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Common mistakes to avoid in {language}
                </p>
              </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isStreamingMessage = isLoading && isLastMessage && message.role === "assistant";
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 max-w-[85%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MarkdownRenderer 
                          content={message.content} 
                          isStreaming={isStreamingMessage}
                        />
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {error && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm font-medium text-red-200">Error</p>
                <p className="text-xs text-red-300/80 mt-1">{error.message}</p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input Form */}
        <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex gap-3">
            <textarea
              ref={chatInputRef}
              placeholder={`Ask anything about ${language}...`}
              disabled={isLoading}
              className="flex-1 min-h-[60px] max-h-[200px] px-4 py-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && chatInputRef.current?.value.trim()) {
                    onSubmit(e as any);
                  }
                }
              }}
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Right Sidebar - Syllabus/Roadmap */}
      {showSyllabus && (
        <div className="hidden lg:flex w-80 border-l border-border/40 bg-background/50 flex-col">
          <div className="border-b border-border/40 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Roadmap</p>
              <p className="font-semibold">{syllabus.title}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSyllabus(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {syllabus.sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-lg border border-border/40 p-3 bg-muted/40 space-y-2"
                >
                  <p className="text-sm font-semibold">{section.title}</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

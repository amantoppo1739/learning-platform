"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Code2,
  Coffee,
  Database,
  Globe,
  Brackets,
  FileCode,
  Sparkles,
  ArrowLeft,
  Home,
} from "lucide-react";
import Link from "next/link";

const languages = [
  {
    id: "python",
    name: "Python",
    icon: FileCode,
    description: "Beginner-friendly, versatile for web, data science & AI",
    color: "from-blue-500 to-yellow-500",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: Globe,
    description: "Essential for web development, runs in browsers",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: Code2,
    description: "JavaScript with types, better for large projects",
    color: "from-blue-600 to-blue-400",
  },
  {
    id: "java",
    name: "Java",
    icon: Coffee,
    description: "Enterprise apps, Android development, robust",
    color: "from-red-600 to-orange-500",
  },
  {
    id: "cpp",
    name: "C++",
    icon: Brackets,
    description: "High-performance systems, game development",
    color: "from-blue-700 to-blue-500",
  },
  {
    id: "csharp",
    name: "C#",
    icon: Code2,
    description: "Microsoft stack, Unity game development, .NET",
    color: "from-purple-600 to-purple-400",
  },
  {
    id: "go",
    name: "Go",
    icon: Database,
    description: "Fast, concurrent, great for backend services",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "rust",
    name: "Rust",
    icon: Sparkles,
    description: "Memory-safe systems programming, blazing fast",
    color: "from-orange-600 to-red-600",
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: FileCode,
    description: "Elegant syntax, Rails framework for web apps",
    color: "from-red-600 to-red-400",
  },
  {
    id: "php",
    name: "PHP",
    icon: Globe,
    description: "Server-side scripting, powers WordPress & Laravel",
    color: "from-indigo-600 to-purple-500",
  },
  {
    id: "swift",
    name: "Swift",
    icon: Code2,
    description: "iOS/macOS app development, modern & safe",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    icon: Code2,
    description: "Modern Android development, concise Java alternative",
    color: "from-purple-500 to-pink-500",
  },
];

export default function LearnPage() {
  const { data: session } = useSession();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  if (selectedLanguage) {
    const language = languages.find((lang) => lang.id === selectedLanguage);
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLanguage(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Language
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-border/40" />
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${language?.color} flex items-center justify-center`}
                >
                  {language?.icon && <language.icon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{language?.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {language?.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Learning as <span className="font-medium">{session?.user?.name}</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface language={selectedLanguage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Choose Your Language
          </h1>
          <p className="text-muted-foreground mt-2">
            Start your programming journey with AI-powered guidance
          </p>
        </div>
      </div>

      {/* Language Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {languages.map((language) => (
            <Card
              key={language.id}
              className="border-border/40 hover:border-border cursor-pointer transition-all hover:scale-[1.02] group"
              onClick={() => setSelectedLanguage(language.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${language.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <language.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{language.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {language.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="border-border/40 bg-gradient-to-br from-blue-500/10 to-purple-600/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Powered by Google Gemini AI
              </CardTitle>
              <CardDescription>
                Get instant help with code examples, explanations, debugging, and best
                practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-1">💡 Ask Questions</div>
                  <div className="text-muted-foreground">
                    Get clear explanations for any concept
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">🚀 Code Examples</div>
                  <div className="text-muted-foreground">
                    See practical code with syntax highlighting
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">🐛 Debug Help</div>
                  <div className="text-muted-foreground">
                    Fix errors and improve your code
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


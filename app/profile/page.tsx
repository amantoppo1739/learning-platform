import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserNav } from "@/components/auth/user-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Mail, User, ArrowLeft, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile | AI Learning Platform",
  description: "Your account profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            <span className="font-semibold text-lg">AI Learning Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-border/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/40 transition-colors"
            >
              Home
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your account information
          </p>
        </div>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              Details from your sign-in provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{user.name ?? "No name set"}</p>
                {user.email && (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                )}
                {session.user.id && (
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {session.user.id}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              To change your name or email, update your account in the provider you used to sign in (e.g. Google or GitHub).
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <Brain className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/learn">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Learn
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

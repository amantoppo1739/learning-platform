import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatSessions, quizResults, activityLog } from "@/lib/schema";
import { UserNav } from "@/components/auth/user-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Trophy, Sparkles, History, Film, Flame } from "lucide-react";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Dashboard | AI Learning Platform",
  description: "Your personalized learning dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id;

  // Load summary stats
  const [userChatSessions, userQuizResults] = await Promise.all([
    db
      .select({
        id: chatSessions.id,
        language: chatSessions.language,
        title: chatSessions.title,
        updatedAt: chatSessions.updatedAt,
      })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(10),
    db
      .select({
        id: quizResults.id,
        language: quizResults.language,
        topic: quizResults.topic,
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        completedAt: quizResults.completedAt,
      })
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt))
      .limit(10),
  ]);

  // Activity log (graceful fallback if table not migrated)
  let userActivity: typeof activityLog.$inferSelect[] = [];
  let activityError = false;
  try {
    userActivity = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(50);
  } catch (err) {
    console.error("Activity log fetch error (run migration to create activity_log table):", err);
    activityError = true;
  }

  const totalChats = userChatSessions.length;
  const totalQuizzes = userQuizResults.length;
  const videosWatched = userActivity.filter((a) => a.type === "video").length;

  const languagesLearning = new Set<string>();
  userChatSessions.forEach((c: { language: string }) => languagesLearning.add(c.language));
  userQuizResults.forEach((q: { language: string }) => languagesLearning.add(q.language));
  userActivity.forEach((a: { language: string | null }) => {
    if (a.language) languagesLearning.add(a.language);
  });

  // Simple per-language summaries
  const languageMap = new Map<
    string,
    { chats: number; quizzes: number; lastActivity: Date | null }
  >();
  userChatSessions.forEach((c: { language: string; updatedAt: Date }) => {
    const entry =
      languageMap.get(c.language) || { chats: 0, quizzes: 0, lastActivity: null };
    entry.chats += 1;
    entry.lastActivity = entry.lastActivity
      ? new Date(Math.max(entry.lastActivity.getTime(), c.updatedAt.getTime()))
      : c.updatedAt;
    languageMap.set(c.language, entry);
  });
  userQuizResults.forEach((q: { language: string; completedAt: Date }) => {
    const entry =
      languageMap.get(q.language) || { chats: 0, quizzes: 0, lastActivity: null };
    entry.quizzes += 1;
    entry.lastActivity = entry.lastActivity
      ? new Date(Math.max(entry.lastActivity.getTime(), q.completedAt.getTime()))
      : q.completedAt;
    languageMap.set(q.language, entry);
  });

  const languageSummary = Array.from(languageMap.entries()).slice(0, 6);

  // Streak calculation (consecutive active days)
  const daySet = new Set(
    userActivity.map((a) => new Date(a.createdAt).toISOString().slice(0, 10))
  );
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }

  // Recommendations (simple heuristics)
  const recommendations: string[] = [];
  if (userQuizResults.length === 0) {
    recommendations.push("Take your first quiz to benchmark your skills.");
  } else {
    const lastQuiz = userQuizResults[0];
    const accuracy = lastQuiz.score / lastQuiz.totalQuestions;
    if (accuracy < 0.7) {
      recommendations.push(`Review ${lastQuiz.topic} (${lastQuiz.language}) and retake the quiz.`);
    }
  }
  if (videosWatched === 0) {
    recommendations.push("Watch a video tutorial on your current language to reinforce learning.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Keep the streak going—continue where you left off!");
  }

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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Languages Learning
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{languagesLearning.size}</div>
              <p className="text-xs text-muted-foreground">
                {languagesLearning.size === 0
                  ? "Start your first language!"
                  : "Languages you are learning"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chat Sessions
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChats}</div>
              <p className="text-xs text-muted-foreground">
                {totalChats === 0 ? "No conversations yet" : "Recent chats saved"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quizzes Completed
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                {totalQuizzes === 0 ? "Take your first quiz!" : "Completed quizzes"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videosWatched}</div>
              <p className="text-xs text-muted-foreground">
                {videosWatched === 0 ? "Try a tutorial video" : "Keep exploring videos"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak} days</div>
              <p className="text-xs text-muted-foreground">
                {streak === 0 ? "Start today to begin a streak" : "Active days in a row"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Per-language snapshot */}
        {languageSummary.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Languages Overview</CardTitle>
                <CardDescription>Chats and quizzes per language</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {languageSummary.map(([lang, stats]) => (
                <div
                  key={lang}
                  className="rounded-lg border border-border/40 p-3 bg-muted/40 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{lang}</p>
                    {stats.lastActivity && (
                      <span className="text-xs text-muted-foreground">
                        {stats.lastActivity.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.chats} chats · {stats.quizzes} quizzes
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Learning Paths */}
        <Card className="border-border/40 bg-gradient-to-br from-blue-500/5 to-purple-600/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <CardTitle>Start Learning with AI</CardTitle>
            </div>
            <CardDescription>
              Choose a programming language and chat with your AI tutor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/learn">
              <Button
                size="lg"
                className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Brain className="mr-2 h-5 w-5" />
                Start Learning Now
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              12 languages available: Python, JavaScript, TypeScript, Java, C++, C#, Ruby, Go, Rust, PHP, Swift, Kotlin
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity + Recommendations */}
        <div className="grid gap-4 lg:grid-cols-2 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest chats, quizzes, and videos</CardDescription>
              </div>
              <History className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {activityError ? (
                <p className="text-sm text-muted-foreground">
                  Activity log not available. Run DB migration to create activity_log table.
                </p>
              ) : userActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet. Start learning!</p>
              ) : (
                <div className="space-y-2">
                  {userActivity.slice(0, 8).map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between rounded-lg border border-border/40 p-3 bg-muted/40"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium capitalize">
                          {act.type}: {act.topic || "Untitled"}{" "}
                          {act.language ? `(${act.language})` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-border/40 uppercase">
                        {act.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggested next steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  • {rec}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


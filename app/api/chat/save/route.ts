import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatSessions, activityLog } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", message: "Please sign in to save chats" },
        { status: 401 }
      );
    }

    const { messages, language, sessionId } = await req.json();

    if (!messages || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate title from first user message
    const firstUserMessage = messages.find((m: any) => m.role === "user");
    const title = firstUserMessage?.content?.slice(0, 50) || "New Chat";

    if (sessionId) {
      // Update existing session
      const [updated] = await db
        .update(chatSessions)
        .set({
          messages: messages,
          title,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(chatSessions.id, sessionId),
            eq(chatSessions.userId, session.user.id)
          )
        )
        .returning();

      // Log activity
      await db.insert(activityLog).values({
        userId: session.user.id,
        type: "chat",
        topic: title,
        refId: updated.id,
        language,
      });

      return Response.json({ success: true, sessionId: updated.id });
    } else {
      // Create new session
      const [created] = await db
        .insert(chatSessions)
        .values({
          userId: session.user.id,
          language,
          title,
          messages: messages,
        })
        .returning();

      // Log activity
      await db.insert(activityLog).values({
        userId: session.user.id,
        type: "chat",
        topic: title,
        refId: created.id,
        language,
      });

      return Response.json({ success: true, sessionId: created.id });
    }
  } catch (error: any) {
    console.error("Save chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save chat", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


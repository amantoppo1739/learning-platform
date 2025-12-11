import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatSessions } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", message: "Please sign in to view chat history" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "10");

    let chats;
    
    if (language) {
      chats = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.userId, session.user.id),
            eq(chatSessions.language, language)
          )
        )
        .orderBy(desc(chatSessions.updatedAt))
        .limit(limit);
    } else {
      chats = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, session.user.id))
        .orderBy(desc(chatSessions.updatedAt))
        .limit(limit);
    }

    return Response.json({ chats });
  } catch (error: any) {
    console.error("Load chat history error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load chat history", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Get specific chat session
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", message: "Please sign in to view chat history" },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    const [chat] = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, session.user.id)
        )
      )
      .limit(1);

    if (!chat) {
      return new Response(
        JSON.stringify({ error: "Chat not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return Response.json({ chat });
  } catch (error: any) {
    console.error("Load specific chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load chat", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


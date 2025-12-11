import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activityLog } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, topic, refId, language, meta } = await req.json();
    if (!type) {
      return Response.json({ error: "Type is required" }, { status: 400 });
    }

    await db.insert(activityLog).values({
      userId: session.user.id,
      type,
      topic,
      refId,
      language,
      meta,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Activity log error:", error);
    return Response.json({ error: "Failed to log activity" }, { status: 500 });
  }
}


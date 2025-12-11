import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizResults, activityLog } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", message: "Please sign in to save quiz results" },
        { status: 401 }
      );
    }

    const { language, topic, score, totalQuestions, quizData } = await req.json();

    if (!language || !topic || score === undefined || !totalQuestions || !quizData) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save quiz result to database
    const [result] = await db
      .insert(quizResults)
      .values({
        userId: session.user.id,
        language,
        topic,
        score,
        totalQuestions,
        quizData,
      })
      .returning();

    // Log activity
    await db.insert(activityLog).values({
      userId: session.user.id,
      type: "quiz",
      topic,
      refId: result.id,
      language,
      meta: { score, totalQuestions },
    });

    return Response.json({
      success: true,
      resultId: result.id,
      message: "Quiz result saved successfully!",
    });
  } catch (error: any) {
    console.error("Save quiz result error:", error);
    return Response.json(
      {
        error: "Failed to save quiz result",
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}


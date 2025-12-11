import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Schema for quiz questions
const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", message: "Please sign in to generate quizzes" },
        { status: 401 }
      );
    }

    const { topic, language, numQuestions = 5 } = await req.json();

    if (!topic || !language) {
      return Response.json(
        { error: "Missing required fields: topic and language" },
        { status: 400 }
      );
    }

    // Check if Groq API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: "Groq API key not configured",
        message: "Please add GROQ_API_KEY to your .env.local file.",
      }, { status: 500 });
    }

    const groq = createGroq({ apiKey });

    // Generate quiz using AI
    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: QuizSchema,
      prompt: `Generate a ${numQuestions}-question multiple choice quiz about "${topic}" in ${language} programming.

Requirements:
- Questions should be beginner to intermediate level
- Each question should have exactly 4 options
- Options should be clearly distinct
- Include detailed explanations for correct answers
- Focus on practical understanding, not just theory
- Make questions engaging and educational

Format the quiz as a JSON object with an array of questions. Each question should have:
- question: the question text
- options: array of 4 possible answers
- correctAnswer: index (0-3) of the correct option
- explanation: detailed explanation of why the answer is correct

Example topic: "Python variables"
Example questions might cover: variable declaration, data types, variable naming rules, scope, etc.`,
    });

    return Response.json({
      quiz: object,
      topic,
      language,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return Response.json(
      {
        error: "Failed to generate quiz",
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}


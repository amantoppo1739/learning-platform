import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
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

type QuizOutput = z.infer<typeof QuizSchema>;

/** Extract JSON from model text (handles markdown code blocks or raw JSON). */
function extractJson(text: string): string {
  const trimmed = text.trim();
  // Try ```json ... ``` or ``` ... ```
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  return trimmed;
}

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
    const num = Math.min(Math.max(Number(numQuestions) || 5, 1), 10);

    // Use generateText + JSON parse so quiz works with Groq (generateObject/tool-calling can fail)
    const prompt = `You are a programming quiz generator. Reply with ONLY a valid JSON object, no other text or markdown.

Generate a ${num}-question multiple choice quiz about "${topic}" in ${language} programming.

Requirements:
- Questions should be beginner to intermediate level
- Each question must have exactly 4 options (options: array of 4 strings)
- correctAnswer must be the index 0-3 of the correct option
- Include a short explanation for each correct answer
- Focus on practical understanding

Output format (valid JSON only):
{"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}, ...]}`;

    const { text } = await generateText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Groq provider types vs ai; runtime compatible
      model: groq("llama-3.1-8b-instant") as any,
      prompt,
      maxOutputTokens: 4096,
      temperature: 0.6,
    });

    const rawJson = extractJson(text);
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (parseError) {
      console.error("Quiz JSON parse error:", parseError);
      console.error("Raw response (first 500 chars):", text.slice(0, 500));
      return Response.json(
        {
          error: "Failed to generate quiz",
          message: "The AI response was not valid JSON. Please try again.",
        },
        { status: 500 }
      );
    }

    const result = QuizSchema.safeParse(parsed);
    if (!result.success) {
      console.error("Quiz schema validation failed:", result.error.flatten());
      return Response.json(
        {
          error: "Failed to generate quiz",
          message: "Quiz format was invalid. Please try again.",
        },
        { status: 500 }
      );
    }

    const quiz: QuizOutput = result.data;
    // Normalize: ensure exactly 4 options and correctAnswer in range
    const normalizedQuestions = quiz.questions.map((q) => {
      const options = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
      while (options.length < 4) options.push(`Option ${options.length + 1}`);
      const correctAnswer = Math.min(Math.max(Number(q.correctAnswer) || 0, 0), 3);
      return {
        question: String(q.question),
        options,
        correctAnswer,
        explanation: String(q.explanation ?? ""),
      };
    });

    return Response.json({
      quiz: { questions: normalizedQuestions },
      topic,
      language,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return Response.json(
      {
        error: "Failed to generate quiz",
        message,
      },
      { status: 500 }
    );
  }
}

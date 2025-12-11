import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const runtime = 'nodejs';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ 
      error: "No Groq API Key found",
      message: "Please add GROQ_API_KEY to your .env.local file. Get one at https://console.groq.com/keys"
    }, { status: 500 });
  }

  try {
    const groq = createGroq({ apiKey });
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: "Say 'Hello! I am working correctly.' in one sentence.",
    });

    return Response.json({ 
      success: true, 
      model: "llama-3.3-70b-versatile",
      provider: "Groq",
      response: text,
      message: "✅ Groq is working! Your chat should work now."
    });
  } catch (error: any) {
    console.error("Groq test error:", error);
    return Response.json({ 
      success: false, 
      error: error.message,
      details: error.toString(),
      helpUrl: "https://console.groq.com/keys"
    }, { status: 500 });
  }
}
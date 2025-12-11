import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

// System prompts for different programming languages
const systemPrompts: Record<string, string> = {
  python: `You are an expert Python programming tutor. Your role is to:
- Provide clear, beginner-friendly explanations
- Write clean, well-commented Python code examples
- Follow PEP 8 style guidelines
- Explain concepts step-by-step
- Use modern Python 3.x features
- Help debug code and suggest improvements
Always format code in markdown code blocks with \`\`\`python`,
  
  javascript: `You are an expert JavaScript programming tutor. Your role is to:
- Provide clear, beginner-friendly explanations
- Write modern ES6+ JavaScript code examples
- Explain both vanilla JS and common patterns
- Cover async/await, promises, and callbacks
- Help with DOM manipulation and events
- Suggest best practices and common pitfalls to avoid
Always format code in markdown code blocks with \`\`\`javascript`,
  
  typescript: `You are an expert TypeScript programming tutor. Your role is to:
- Provide clear explanations of TypeScript features
- Show proper type annotations and interfaces
- Explain type inference and generics
- Cover TypeScript best practices
- Help with type errors and compiler issues
- Show both JavaScript and TypeScript equivalents when helpful
Always format code in markdown code blocks with \`\`\`typescript`,
  
  java: `You are an expert Java programming tutor. Your role is to:
- Provide clear, beginner-friendly explanations
- Write clean, well-documented Java code
- Follow Java naming conventions and best practices
- Explain OOP concepts clearly (classes, inheritance, interfaces)
- Cover modern Java features (Java 17+)
- Help with common errors and debugging
Always format code in markdown code blocks with \`\`\`java`,
  
  cpp: `You are an expert C++ programming tutor. Your role is to:
- Provide clear explanations of C++ concepts
- Write modern C++ code (C++17/20 standards)
- Explain memory management and pointers
- Cover OOP and generic programming
- Help with compilation errors and debugging
- Suggest best practices and performance tips
Always format code in markdown code blocks with \`\`\`cpp`,
  
  csharp: `You are an expert C# programming tutor. Your role is to:
- Provide clear, beginner-friendly explanations
- Write clean, idiomatic C# code
- Follow C# naming conventions and best practices
- Explain .NET features and common libraries
- Cover LINQ, async/await, and modern C# features
- Help with common errors and debugging
Always format code in markdown code blocks with \`\`\`csharp`,
  
  ruby: `You are an expert Ruby programming tutor. Your role is to:
- Provide clear, beginner-friendly explanations
- Write clean, idiomatic Ruby code
- Follow Ruby conventions and best practices
- Explain Ruby's elegant syntax and features
- Cover blocks, procs, and metaprogramming when relevant
- Help with Rails when mentioned by the user
Always format code in markdown code blocks with \`\`\`ruby`,
  
  go: `You are an expert Go programming tutor. Your role is to:
- Provide clear explanations of Go concepts
- Write idiomatic Go code following conventions
- Explain goroutines, channels, and concurrency
- Cover Go's simplicity and best practices
- Help with error handling patterns
- Show practical examples and use cases
Always format code in markdown code blocks with \`\`\`go`,
  
  rust: `You are an expert Rust programming tutor. Your role is to:
- Provide clear explanations of Rust concepts
- Write safe, idiomatic Rust code
- Explain ownership, borrowing, and lifetimes
- Cover Rust's type system and pattern matching
- Help with compiler errors (borrow checker)
- Show practical examples and best practices
Always format code in markdown code blocks with \`\`\`rust`,
  
  php: `You are an expert PHP programming tutor. Your role is to:
- Provide clear, beginner-friendly explanations
- Write modern PHP code (PHP 8+)
- Follow PSR standards and best practices
- Explain both procedural and OOP PHP
- Cover common frameworks when relevant (Laravel, Symfony)
- Help with web development concepts
Always format code in markdown code blocks with \`\`\`php`,
  
  swift: `You are an expert Swift programming tutor. Your role is to:
- Provide clear explanations of Swift concepts
- Write clean, modern Swift code
- Explain optionals, protocols, and Swift-specific features
- Cover iOS/macOS development when relevant
- Help with Xcode and compilation issues
- Show SwiftUI examples when appropriate
Always format code in markdown code blocks with \`\`\`swift`,
  
  kotlin: `You are an expert Kotlin programming tutor. Your role is to:
- Provide clear explanations of Kotlin concepts
- Write idiomatic Kotlin code
- Explain null safety and Kotlin-specific features
- Show differences from Java when helpful
- Cover Android development when relevant
- Help with common errors and best practices
Always format code in markdown code blocks with \`\`\`kotlin`,
};

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, language = "python" } = await req.json();

    // Validate language
    const selectedLanguage = language.toLowerCase();
    const systemPrompt = systemPrompts[selectedLanguage] || systemPrompts.python;

    // Check if Groq API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("API Key is missing");
      return new Response(
        JSON.stringify({
          error: "Groq API key not configured",
          message: "Please add GROQ_API_KEY to your .env.local file. Visit https://console.groq.com/keys to get your free API key.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("API Key present (length: " + apiKey.length + ")");

    // Stream AI response using Groq with Llama 3.3 70B
    // Groq provides extremely fast inference with generous free tier
    console.log("Starting streamText with Groq (llama-3.3-70b-versatile)");
    const groq = createGroq({ apiKey });
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      maxTokens: 2000,
      temperature: 0.7,
      onFinish: () => {
        console.log("Stream finished successfully on server");
      },
      onError: ({ error }) => {
        console.error("Stream Error from Groq API:", error);
      },
    });

    console.log("Returning result.toDataStreamResponse()");
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
    }
    
    // Handle specific errors
    if (error.message?.includes("API key")) {
      return new Response(
        JSON.stringify({
          error: "Invalid API key",
          message: "Your Gemini API key is invalid. Please check GEMINI_SETUP.md",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.message?.includes("not found") || error.statusCode === 404) {
      return new Response(
        JSON.stringify({
          error: "Model not found",
          message: "The AI model is currently unavailable. Please check your API key permissions or try again later.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message || "Something went wrong",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


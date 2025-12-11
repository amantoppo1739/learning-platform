// Test endpoint to verify YouTube API key
export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey || apiKey.includes("your_") || apiKey.length < 20) {
    return Response.json({
      success: false,
      message: "YouTube API key not configured",
      instructions: "Add YOUTUBE_API_KEY to your .env.local file. See PHASE_4_SETUP.md for details.",
    });
  }

  try {
    // Test with a simple video search
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=python+tutorial&type=video&maxResults=1&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      return Response.json({
        success: false,
        message: "YouTube API key is invalid or quota exceeded",
        error: error,
        statusCode: response.status,
      });
    }

    const data = await response.json();
    
    return Response.json({
      success: true,
      message: "✅ YouTube API key is working!",
      testVideo: data.items?.[0]?.snippet?.title || "Test successful",
      quota: "You have YouTube API access",
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      message: "Failed to test YouTube API",
      error: error.message,
    });
  }
}


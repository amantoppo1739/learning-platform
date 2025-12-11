import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", message: "Please sign in to search videos" },
        { status: 401 }
      );
    }

    const { query, maxResults = 5 } = await req.json();

    if (!query) {
      return Response.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    // Check if YouTube API key is configured
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey.includes("your_") || apiKey.length < 20) {
      return Response.json({
        error: "YouTube API key not configured",
        message: "Please add YOUTUBE_API_KEY to your .env.local file. See PHASE_4_SETUP.md for instructions.",
        videos: [],
      });
    }

    // Build YouTube API URL
    const searchQuery = `${query} tutorial programming`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      searchQuery
    )}&type=video&maxResults=${maxResults}&key=${apiKey}&relevanceLanguage=en&safeSearch=strict&videoEmbeddable=true`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API Error:", errorData);
      
      if (response.status === 403) {
        return Response.json({
          error: "YouTube API quota exceeded or key invalid",
          message: "Please check your API key or try again tomorrow.",
          videos: [],
        });
      }
      
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    // Format video data
    const videos = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })) || [];

    return Response.json({ videos });
  } catch (error: any) {
    console.error("YouTube search error:", error);
    return Response.json(
      {
        error: "Failed to search videos",
        message: error.message || "Something went wrong",
        videos: [],
      },
      { status: 500 }
    );
  }
}


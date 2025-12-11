"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Youtube } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  url: string;
}

interface VideoCarouselProps {
  videos: Video[];
  topic: string;
  language?: string;
}

export function VideoCarousel({ videos, topic, language }: VideoCarouselProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (videos.length === 0) {
    return null;
  }

  const handlePlay = (videoId: string) => {
    setSelectedVideo(videoId);

    // Fire-and-forget activity log
    fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "video",
        refId: videoId,
        topic,
        language,
        meta: { topic, language },
      }),
    }).catch(() => {});
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      {/* Video Cards - Vertical Scroll (like Quiz) */}
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="space-y-3 pr-4">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="rounded-lg overflow-hidden border border-border/40 hover:border-border transition-colors cursor-pointer"
              onClick={() => handlePlay(video.id)}
            >
              <div className="relative aspect-video overflow-hidden group">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white ml-1" fill="white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-zinc-900/50">
                <h4 className="text-sm font-medium line-clamp-2 mb-1">
                  {video.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {video.channelTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute -top-12 right-0 text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

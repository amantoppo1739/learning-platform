"use client";

import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  onPlay: (id: string) => void;
}

export function VideoCard({ id, title, thumbnail, channelTitle, onPlay }: VideoCardProps) {
  return (
    <div className="flex-shrink-0 w-64 group cursor-pointer" onClick={() => onPlay(id)}>
      <div className="relative rounded-lg overflow-hidden bg-zinc-900 border border-border/40 hover:border-border transition-all">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h4 className="text-sm font-medium line-clamp-2 leading-tight mb-1">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {channelTitle}
          </p>
        </div>
      </div>
    </div>
  );
}


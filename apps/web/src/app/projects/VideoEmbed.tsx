"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectVideoDto } from "@/lib/api";

// ── URL helpers ───────────────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

// ── Single video embed ────────────────────────────────────────────────────────

interface SingleProps {
  video: ProjectVideoDto;
}

function SingleVideoEmbed({ video }: SingleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const label = video.title ?? "Project video";

  return (
    <div ref={ref} className="relative w-full aspect-video rounded-xl overflow-hidden glass">
      {visible ? (
        video.source === "youtube" ? (
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}?rel=0`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : video.source === "vimeo" ? (
          <iframe
            src={`https://player.vimeo.com/video/${getVimeoId(video.url)}?title=0&byline=0`}
            title={label}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          // self_hosted MP4
          <video
            src={video.url}
            controls
            preload="metadata"
            title={label}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : (
        // Placeholder skeleton while waiting to enter viewport
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-2xl opacity-40">▶</span>
        </div>
      )}
      {video.title && (
        <p className="absolute bottom-0 left-0 right-0 px-4 py-2 text-xs text-white/80 bg-black/40 truncate">
          {video.title}
        </p>
      )}
    </div>
  );
}

// ── Video section ─────────────────────────────────────────────────────────────

interface Props {
  videos: ProjectVideoDto[];
}

export function VideoSection({ videos }: Props) {
  if (!videos.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Videos</h2>
      <div className="space-y-6">
        {videos.map((v) => (
          <SingleVideoEmbed key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PhotoDto, PhotoPageDto } from "@/lib/api";
import { Lightbox } from "../Lightbox";

interface Props {
  albumSlug: string;
  initialPhotos: PhotoDto[];
  initialNextCursor: string | null;
  total: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchMore(albumSlug: string, cursor: string): Promise<PhotoPageDto> {
  const url = `${API_BASE}/v1/gallery/albums/${encodeURIComponent(albumSlug)}?cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch more photos");
  const data = await res.json() as { photos: PhotoDto[]; nextCursor: string | null; total: number };
  return { photos: data.photos, nextCursor: data.nextCursor, total: data.total };
}

export function AlbumClient({ albumSlug, initialPhotos, initialNextCursor, total }: Props) {
  const [photos, setPhotos] = useState<PhotoDto[]>(initialPhotos);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !nextCursor) return;
    setLoading(true);
    try {
      const page = await fetchMore(albumSlug, nextCursor);
      setPhotos(prev => [...prev, ...page.photos]);
      setNextCursor(page.nextCursor);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [loading, nextCursor, albumSlug]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (photos.length === 0) {
    return <p className="text-center text-muted-foreground py-20">No photos in this album yet.</p>;
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="break-inside-avoid mb-3 overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => setLightboxIndex(idx)}
          >
            <Image
              src={photo.thumbUrl}
              alt={photo.altText ?? photo.title ?? "Photo"}
              width={photo.width ?? 400}
              height={photo.height ?? 300}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
              placeholder={photo.lqipUrl ? "blur" : "empty"}
              blurDataURL={photo.lqipUrl ?? undefined}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
        {loading && <span className="text-muted-foreground text-sm animate-pulse">Loading more…</span>}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

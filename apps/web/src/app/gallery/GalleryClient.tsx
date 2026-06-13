"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AlbumSummaryDto, PhotoDto, PhotoPageDto } from "@/lib/api";
import { ApiEndpoint } from "@/lib/config";
import { Lightbox } from "./Lightbox";
import { OatSpinner } from "@portfolio-cms/oat-ui";

interface Props {
  albums: AlbumSummaryDto[];
  initialPhotos: PhotoPageDto;
}

type Layout = "masonry" | "grid";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchMorePhotos(cursor: string): Promise<PhotoPageDto> {
  const url = `${API_BASE}${ApiEndpoint.GALLERY_PHOTOS}?cursor=${encodeURIComponent(cursor)}`;
  if (process.env.NODE_ENV !== "production") console.log(`[API →] ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch more photos");
  return res.json() as Promise<PhotoPageDto>;
}

export function GalleryClient({ albums, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<PhotoDto[]>(initialPhotos.photos);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPhotos.nextCursor);
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState<Layout>("masonry");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(async () => {
    if (loading || !nextCursor) return;
    setLoading(true);
    try {
      const page = await fetchMorePhotos(nextCursor);
      setPhotos(prev => [...prev, ...page.photos]);
      setNextCursor(page.nextCursor);
    } catch {
      // silently fail — user can scroll back to retry
    } finally {
      setLoading(false);
    }
  }, [loading, nextCursor]);

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

  return (
    <>
      {/* ── Albums grid ─────────────────────────────────────────────────── */}
      {albums.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-6">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map(album => (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className="group relative aspect-square overflow-hidden rounded-xl glass glass-hover"
              >
                {album.coverUrl ? (
                  <Image
                    src={album.coverUrl}
                    alt={album.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    placeholder={album.lqipUrl ? "blur" : "empty"}
                    blurDataURL={album.lqipUrl ?? undefined}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <span className="text-4xl">📷</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-medium text-sm leading-snug truncate">{album.name}</p>
                  <p className="text-white/70 text-xs">{album.photoCount} photos</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── All Photos ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">All Photos</h2>
          {/* Layout toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["masonry", "grid"] as Layout[]).map(l => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  layout === l ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "masonry" ? "⊞ Masonry" : "⊟ Grid"}
              </button>
            ))}
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No photos yet.</p>
        ) : layout === "masonry" ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="break-inside-avoid mb-3 overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => setLightboxIndex(idx)}
              >
                <div className="relative">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => setLightboxIndex(idx)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={photo.thumbUrl}
                    alt={photo.altText ?? photo.title ?? "Photo"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    placeholder={photo.lqipUrl ? "blur" : "empty"}
                    blurDataURL={photo.lqipUrl ?? undefined}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-10 mt-6 flex items-center justify-center">
          {loading && <OatSpinner size="sm" aria-label="Loading more photos" />}
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
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

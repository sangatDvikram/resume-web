"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PhotoDto, ExifDto } from "@/lib/api";

interface Props {
  photos: PhotoDto[];
  initialIndex: number;
  onClose: () => void;
}

function ExifPanel({ exif }: { exif: ExifDto }) {
  const rows: [string, string | number | undefined][] = [
    ["Camera", exif.make && exif.model ? `${exif.make} ${exif.model}` : exif.model ?? exif.make],
    ["Focal length", exif.focalLength],
    ["Aperture", exif.aperture ? `f/${exif.aperture}` : undefined],
    ["Shutter", exif.shutterSpeed],
    ["ISO", exif.iso],
  ];
  const visible = rows.filter(([, v]) => v !== undefined && v !== null);
  if (!visible.length) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white/70">
      {visible.map(([label, val]) => (
        <div key={label} className="flex flex-col">
          <span className="text-white/40 uppercase tracking-wider text-[10px]">{label}</span>
          <span className="text-white">{String(val)}</span>
        </div>
      ))}
    </div>
  );
}

export function Lightbox({ photos, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [showExif, setShowExif] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const photo = photos[index];
  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(photos.length - 1, i + 1)), [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen().catch(() => null);
          setIsFullscreen(true);
        } else {
          document.exitFullscreen().catch(() => null);
          setIsFullscreen(false);
        }
      }
      if (e.key === "i" || e.key === "I") setShowExif(s => !s);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) next();
    if (dx >  50) prev();
    touchStartX.current = null;
  }

  // Keep active thumbnail in view
  useEffect(() => {
    const strip = thumbRef.current;
    const active = strip?.querySelector<HTMLButtonElement>(`[data-active="true"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/60 text-sm tabular-nums">{index + 1} / {photos.length}</span>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExif(s => !s)}
            className="text-white/70 hover:text-white text-sm px-2 py-1 rounded"
            title="Toggle EXIF (i)"
          >
            ℹ
          </button>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none px-2"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Main image ──────────────────────────────────────────────────── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
        {/* Prev */}
        {index > 0 && (
          <button
            onClick={prev}
            className="absolute left-3 z-10 text-white/70 hover:text-white text-3xl px-3 py-8 rounded-full hover:bg-white/10"
          >
            ‹
          </button>
        )}

        <div className="relative max-h-full max-w-full">
          <Image
            key={photo.id}
            src={photo.originalUrl}
            alt={photo.altText ?? photo.title ?? "Photo"}
            width={photo.width ?? 1200}
            height={photo.height ?? 800}
            className="object-contain max-h-[calc(100vh-200px)] w-auto"
            placeholder={photo.lqipUrl ? "blur" : "empty"}
            blurDataURL={photo.lqipUrl ?? undefined}
            priority
          />
          {/* Prefetch adjacent images */}
          {photos[index + 1] && (
            <link rel="prefetch" href={photos[index + 1].originalUrl} as="image" />
          )}
        </div>

        {/* Next */}
        {index < photos.length - 1 && (
          <button
            onClick={next}
            className="absolute right-3 z-10 text-white/70 hover:text-white text-3xl px-3 py-8 rounded-full hover:bg-white/10"
          >
            ›
          </button>
        )}
      </div>

      {/* ── Caption + EXIF ──────────────────────────────────────────────── */}
      {(photo.title || photo.location || (showExif && photo.exif)) && (
        <div className="shrink-0 px-6 py-4 max-w-2xl mx-auto w-full">
          {photo.title && <p className="text-white font-medium">{photo.title}</p>}
          {photo.location && <p className="text-white/50 text-sm">{photo.location}</p>}
          {showExif && photo.exif && <ExifPanel exif={photo.exif} />}
        </div>
      )}

      {/* ── Thumbnail strip ─────────────────────────────────────────────── */}
      <div
        ref={thumbRef}
        className="shrink-0 flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none"
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            data-active={i === index}
            onClick={() => setIndex(i)}
            className={`relative shrink-0 w-14 h-14 rounded overflow-hidden transition-all ${
              i === index ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-70"
            }`}
          >
            <Image
              src={p.thumbUrl}
              alt={p.altText ?? `Photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="56px"
            />
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-white/20 text-xs pb-3">
        ← → Navigate &nbsp;·&nbsp; I Info &nbsp;·&nbsp; F Fullscreen &nbsp;·&nbsp; Esc Close
      </p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import type { ProjectMediaDto } from "@/lib/api";

interface Props {
  media: ProjectMediaDto[];
  autoplay?: boolean;
}

export function ProjectCarousel({ media, autoplay = true }: Props) {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    autoplay ? [autoplayPlugin.current] : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo   = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scrollPrev, scrollNext]);

  if (!media.length) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl glow-sm"
      onMouseEnter={() => autoplayPlugin.current.stop()}
      onMouseLeave={() => autoplayPlugin.current.play()}
    >
      {/* Slides */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {media.map((item, i) => (
            <div
              key={item.id}
              className="relative flex-[0_0_100%] aspect-video"
            >
              <Image
                src={item.url}
                alt={item.altText ?? `Project image ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next buttons */}
      {media.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full glass hover:bg-card/80 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full glass hover:bg-card/80 transition-colors"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {scrollSnaps.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-5 bg-primary"
                  : "w-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

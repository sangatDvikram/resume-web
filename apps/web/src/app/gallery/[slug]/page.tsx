import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbums, getAlbum } from "@/lib/api";
import type { AlbumDetailDto } from "@/lib/api";
import { AlbumClient } from "./AlbumClient";

// ISR: revalidate every hour; on-demand via /api/revalidate with tag "gallery"
export const revalidate = 3600;

// ── SSG: pre-render all published album slugs at build time ───────────────────
export async function generateStaticParams() {
  try {
    const albums = await getAlbums();
    return albums.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

// ── OG metadata ───────────────────────────────────────────────────────────────

// Next.js 16: params is now a Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const album = await getAlbum(slug);
    return {
      title: album.name,
      description: album.description ?? `Photography album: ${album.name}`,
      openGraph: {
        title: album.name,
        description: album.description ?? undefined,
        type: "website",
        ...(album.coverUrl && {
          images: [{ url: album.coverUrl, alt: album.name }],
        }),
      },
    };
  } catch {
    return { title: "Album" };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let album: AlbumDetailDto;

  try {
    album = await getAlbum(slug);
  } catch {
    notFound();
  }

  return (
    <main className="pb-16">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {album.coverUrl ? (
          <Image
            src={album.coverUrl}
            alt={album.name}
            fill
            priority
            className="object-cover"
            placeholder={album.lqipUrl ? "blur" : "empty"}
            blurDataURL={album.lqipUrl ?? undefined}
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center text-6xl">📷</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 section-container">
          <Link href="/gallery" className="text-white/60 text-sm hover:text-white mb-2 inline-block">
            ← Gallery
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{album.name}</h1>
          {album.location && (
            <p className="text-white/70 text-sm mt-1">📍 {album.location}</p>
          )}
          <p className="text-white/50 text-sm mt-1">{album.photoCount} photos</p>
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
      {album.description && (
        <div className="section-container py-6">
          <p className="text-muted-foreground max-w-2xl">{album.description}</p>
        </div>
      )}

      {/* ── Photo grid ────────────────────────────────────────────────── */}
      <div className="section-container pt-4">
        <AlbumClient
          albumSlug={slug}
          initialPhotos={album.photos}
          initialNextCursor={album.nextCursor}
          total={album.total}
        />
      </div>
    </main>
  );
}

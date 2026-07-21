import type { Metadata } from "next";
import { getAlbums, getPhotos } from "@/lib/api";
import type { AlbumSummaryDto, PhotoPageDto } from "@/lib/api";
import { GalleryClient } from "./GalleryClient";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { total } = await getPhotos();
    const description =
      total > 0
        ? `${total} photo${total === 1 ? "" : "s"} — landscapes, portraits, and street scenes.`
        : "A collection of photographs — landscapes, portraits, and street scenes.";
    return { title: "Gallery", description };
  } catch {
    return {
      title: "Gallery",
      description: "A collection of photographs — landscapes, portraits, and street scenes.",
    };
  }
}

// ISR: revalidate every hour; on-demand via /api/revalidate with tag "gallery"
export const revalidate = 3600;

export default async function GalleryPage() {
  let albums: AlbumSummaryDto[] = [];
  let initialPhotos: PhotoPageDto = { photos: [], nextCursor: null, total: 0 };

  try {
    [albums, initialPhotos] = await Promise.all([
      getAlbums(),
      getPhotos(),
    ]);
  } catch {
    // render with empty state on error
  }

  return (
    <main className="section-container py-16">
      {/* Header */}
      <div className="mb-12 text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Gallery</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A visual journal — landscapes, street scenes, and moments in between.
        </p>
      </div>

      <GalleryClient
        albums={albums}
        initialPhotos={initialPhotos}
      />
    </main>
  );
}

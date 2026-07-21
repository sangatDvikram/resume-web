import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/api";
import type { BlogPostSummaryDto } from "@/lib/api";
import { OatBadge } from "@portfolio-cms/oat-ui";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const posts = await getBlogPosts();
    const description =
      posts.length > 0
        ? `${posts.length} article${posts.length === 1 ? "" : "s"} — thoughts and technical deep-dives.`
        : "Articles, thoughts, and technical deep-dives.";
    return { title: "Blog", description };
  } catch {
    return { title: "Blog", description: "Articles, thoughts, and technical deep-dives." };
  }
}

// ISR: revalidate every hour; on-demand via /api/revalidate with tag "blog"
export const revalidate = 3600;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PostCard({ post }: { post: BlogPostSummaryDto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl glass glass-hover transition-all">
      {post.coverImageUrl && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <OatBadge
                key={tag.id}
                style={{ fontSize: "0.75rem", padding: "2px 8px" }}
              >
                {tag.name}
              </OatBadge>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`} className="no-underline">
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Meta: date + reading time */}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.readingTime && (
            <span>{post.readingTime} min read</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function BlogPage() {
  let posts: BlogPostSummaryDto[] = [];

  try {
    posts = await getBlogPosts();
  } catch {
    // Graceful fallback when API is unavailable
    posts = [];
  }

  return (
    <main className="section-container py-16">
      {/* Header */}
      <div className="mb-12 text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Blog</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Articles, thoughts, and technical deep-dives.
        </p>
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <p className="text-lg">No posts published yet.</p>
          <p className="text-sm">Check back soon!</p>
        </div>
      )}
    </main>
  );
}

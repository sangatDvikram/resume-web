import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPosts, getBlogPost } from "@/lib/api";
import type { BlogPostDetailDto } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";

// ISR: revalidate every hour; on-demand via /api/revalidate with tag "blog"
export const revalidate = 3600;

// ── SSG: pre-render all published slugs at build time ─────────────────────────
export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    return posts.map((p) => ({ slug: p.slug }));
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
    const post = await getBlogPost(slug);
    return {
      title: post.title,
      description: post.excerpt ?? undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt ?? undefined,
        type: "article",
        publishedTime: post.publishedAt ?? undefined,
        ...(post.coverImageUrl && {
          images: [{ url: post.coverImageUrl, alt: post.title }],
        }),
      },
      twitter: {
        card: post.coverImageUrl ? "summary_large_image" : "summary",
        title: post.title,
        description: post.excerpt ?? undefined,
        ...(post.coverImageUrl && { images: [post.coverImageUrl] }),
      },
    };
  } catch {
    return { title: "Post not found" };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Page component ────────────────────────────────────────────────────────────

// Next.js 16: params is a Promise
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: BlogPostDetailDto;
  try {
    post = await getBlogPost(slug);
  } catch {
    notFound();
  }

  return (
    <main className="section-container py-16">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
      >
        ← All posts
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag.id} className="skill-chip text-xs">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.readingTime && <span>{post.readingTime} min read</span>}
        </div>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden mb-10 glow-sm">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="wiki-prose prose max-w-none
                     prose-headings:tracking-tight
                     prose-code:before:content-none prose-code:after:content-none
                     prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.htmlContent) }}
        />
      </article>
    </main>
  );
}

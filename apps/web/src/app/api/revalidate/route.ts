/**
 * On-demand ISR revalidation endpoint.
 *
 * Called by the NestJS API after any content mutation.
 *
 * POST /api/revalidate
 * Body: { "tags": ["resume", "projects"], "secret": "<REVALIDATE_SECRET>" }
 *
 * The REVALIDATE_SECRET must match the value in both:
 *   - apps/web/.env   → REVALIDATE_SECRET
 *   - apps/api/.env   → REVALIDATE_SECRET
 *
 * Returns:
 *   200 { revalidated: true, tags: [...], now: <epoch> }
 *   401 if secret is missing / incorrect
 *   400 if body is missing / malformed
 */

import type { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

interface RevalidateBody {
  /** Cache tags to invalidate — e.g. ["resume"], ["blog"], ["projects"] */
  tags?: string[];
  /** Must equal process.env.REVALIDATE_SECRET */
  secret?: string;
}

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const expectedSecret = process.env.REVALIDATE_SECRET;

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return Response.json(
      { revalidated: false, message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  if (!expectedSecret || body.secret !== expectedSecret) {
    return Response.json(
      { revalidated: false, message: 'Invalid revalidation secret.' },
      { status: 401 },
    );
  }

  // ── Revalidate ────────────────────────────────────────────────────────────
  const tags = Array.isArray(body.tags) && body.tags.length > 0
    ? body.tags
    : ['resume']; // default to resume tag

  for (const tag of tags) {
    // Use { expire: 0 } for immediate expiration — required when called by
    // external services that need data to expire right away (Next.js 16 docs).
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({
    revalidated: true,
    tags,
    now: Date.now(),
  });
}

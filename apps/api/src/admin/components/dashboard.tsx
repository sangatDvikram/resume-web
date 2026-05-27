/**
 * E8-S2: Custom AdminJS dashboard — live stat cards.
 *
 * Bundled by AdminJS's internal esbuild pipeline; runs in the BROWSER.
 * Registered via ComponentLoader in admin.module.ts as the dashboard override.
 *
 * Stat sources:
 *  - Published blog posts  → GET /v1/blog (public, returns published only)
 *  - Total blog posts      → AdminJS ApiClient list BlogPost (admin, returns all)
 *  - Projects              → GET /v1/projects
 *  - Gallery photos        → GET /v1/gallery/photos (total field)
 *  - Albums                → GET /v1/gallery/albums
 */
import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';

interface Stats {
  publishedPosts: number | '–';
  draftPosts:     number | '–';
  projects:       number | '–';
  photos:         number | '–';
  albums:         number | '–';
}

const INITIAL: Stats = {
  publishedPosts: '–',
  draftPosts:     '–',
  projects:       '–',
  photos:         '–',
  albums:         '–',
};

const CARDS: Array<{
  key: keyof Stats;
  label: string;
  icon: string;
  accent: string;
}> = [
  { key: 'publishedPosts', label: 'Published Posts', icon: '📝', accent: '#6366f1' },
  { key: 'draftPosts',     label: 'Draft Posts',     icon: '✏️',  accent: '#f59e0b' },
  { key: 'projects',       label: 'Projects',        icon: '🚀', accent: '#22c55e' },
  { key: 'photos',         label: 'Photos',          icon: '📷', accent: '#3b82f6' },
  { key: 'albums',         label: 'Albums',          icon: '🗂️',  accent: '#a855f7' },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = new ApiClient();

    async function load() {
      try {
        const [pubPostsRes, allPostsRes, projectsRes, photosRes, albumsRes] =
          await Promise.allSettled([
            fetch('/v1/blog',          { credentials: 'include' }).then(r => r.json()),
            api.resourceAction({ resourceId: 'BlogPost', actionName: 'list', params: { perPage: 1 } } as any),
            fetch('/v1/projects',      { credentials: 'include' }).then(r => r.json()),
            fetch('/v1/gallery/photos',{ credentials: 'include' }).then(r => r.json()),
            fetch('/v1/gallery/albums',{ credentials: 'include' }).then(r => r.json()),
          ]);

        const publishedPosts =
          pubPostsRes.status === 'fulfilled' ? (pubPostsRes.value as any[]).length : '–';
        const totalPosts =
          allPostsRes.status === 'fulfilled'
            ? ((allPostsRes.value as any)?.data?.meta?.total ?? '–')
            : '–';
        const draftPosts =
          typeof totalPosts === 'number' && typeof publishedPosts === 'number'
            ? totalPosts - publishedPosts
            : '–';
        const projects =
          projectsRes.status === 'fulfilled' ? (projectsRes.value as any[]).length : '–';
        const photos =
          photosRes.status === 'fulfilled'
            ? ((photosRes.value as any)?.total ?? '–')
            : '–';
        const albums =
          albumsRes.status === 'fulfilled' ? (albumsRes.value as any[]).length : '–';

        setStats({ publishedPosts, draftPosts, projects, photos, albums });
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#e2e8f0' }}>
          {greeting} 👋
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '15px' }}>
          Here's a live snapshot of your portfolio content.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#fca5a5', marginBottom: '24px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {CARDS.map(({ key, label, icon, accent }) => (
          <div
            key={key}
            style={{
              background: 'rgba(30,41,59,0.8)',
              border: `1px solid ${accent}40`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: `0 0 0 1px ${accent}20, 0 4px 24px rgba(0,0,0,0.3)`,
              transition: 'transform 150ms',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px', lineHeight: 1 }}>{icon}</div>
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: loading ? '#4b5563' : accent,
              lineHeight: 1,
              marginBottom: '6px',
              transition: 'color 300ms',
            }}>
              {loading ? '—' : String(stats[key])}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, letterSpacing: '0.025em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#cbd5e1', marginBottom: '16px' }}>
          Quick actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '+ New Blog Post', href: '/admin/resources/BlogPost/actions/new',     color: '#6366f1' },
            { label: '+ New Project',   href: '/admin/resources/Project/actions/new',      color: '#22c55e' },
            { label: '+ New Album',     href: '/admin/resources/Album/actions/new',        color: '#a855f7' },
            { label: '+ Upload Photos', href: '/admin/resources/Photo/actions/new',        color: '#3b82f6' },
          ].map(({ label, href, color }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'inline-block',
                padding: '9px 18px',
                background: `${color}20`,
                border: `1px solid ${color}60`,
                borderRadius: '8px',
                color,
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 150ms',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Last updated */}
      <p style={{ color: '#475569', fontSize: '12px', marginTop: '32px' }}>
        Stats loaded at {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default Dashboard;

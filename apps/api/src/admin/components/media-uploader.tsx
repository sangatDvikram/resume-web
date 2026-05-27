/**
 * E6-S7: Multi-file image upload with drag-and-drop reorder, alt text editing,
 * and delete — wired to POST /v1/upload and the project media sub-endpoints.
 *
 * This component is used as a custom AdminJS component on the ProjectMedia
 * relation within the Project resource.
 */
import React, { useState, useCallback, useRef } from 'react';

interface MediaItem {
  id?: string;     // set after persisted
  url: string;
  altText: string;
  uploading?: boolean;
  error?: string;
}

interface Props {
  property: { path: string };
  record: { id?: string; params: Record<string, string> };
  onChange: (path: string, value: MediaItem[]) => void;
}

export default function MediaUploader({ property, record, onChange }: Props) {
  const apiBase = (window as any).__API_BASE__
    ?? `${window.location.protocol}//${window.location.hostname}:3001`;

  // Initialise from existing record params (media.0.url, media.0.altText, …)
  const initial: MediaItem[] = [];
  if (record?.params) {
    let i = 0;
    while (record.params[`${property.path}.${i}.url`]) {
      initial.push({
        id:      record.params[`${property.path}.${i}.id`] ?? undefined,
        url:     record.params[`${property.path}.${i}.url`],
        altText: record.params[`${property.path}.${i}.altText`] ?? '',
      });
      i++;
    }
  }

  const [items, setItems] = useState<MediaItem[]>(initial);
  const [dragging, setDragging] = useState(false);
  const dragIdx = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const emit = useCallback((next: MediaItem[]) => {
    setItems(next);
    onChange(property.path, next.filter((m) => !m.uploading && !m.error));
  }, [onChange, property.path]);

  // ── File upload ───────────────────────────────────────────────────────────

  const uploadFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const placeholders: MediaItem[] = Array.from(files).map((f) => ({
      url: URL.createObjectURL(f), altText: '', uploading: true,
    }));
    setItems((prev) => [...prev, ...placeholders]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch(`${apiBase}/v1/upload`, {
          method: 'POST', body: fd, credentials: 'include',
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const { url } = await res.json() as { url: string; publicId: string };
        setItems((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.uploading && m.url === placeholders[i].url);
          if (idx !== -1) next[idx] = { url, altText: '', uploading: false };
          onChange(property.path, next.filter((m) => !m.uploading));
          return next;
        });
      } catch (err: any) {
        setItems((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.uploading && m.url === placeholders[i].url);
          if (idx !== -1) next[idx] = { ...next[idx], uploading: false, error: err.message };
          return next;
        });
      }
    }
  };

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────

  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(i, 0, moved);
      dragIdx.current = i;
      onChange(property.path, next.filter((m) => !m.uploading));
      return next;
    });
  };

  const onDropZone = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDropZone}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#818cf8' : 'rgba(128,128,128,0.3)'}`,
          borderRadius: 8, padding: '24px 16px', textAlign: 'center',
          cursor: 'pointer', background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
          transition: 'all 150ms',
        }}
      >
        <span style={{ fontSize: 13, opacity: 0.7 }}>
          Drop images here or <strong>click to browse</strong>
        </span>
        <input
          ref={fileRef} type="file" multiple accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {items.map((item, i) => (
            <div
              key={i}
              draggable={!item.uploading}
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              style={{
                position: 'relative', borderRadius: 8, overflow: 'hidden',
                border: '1px solid rgba(128,128,128,0.2)', cursor: item.uploading ? 'default' : 'grab',
                opacity: item.uploading ? 0.6 : 1,
              }}
            >
              <img src={item.url} alt={item.altText} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
              {item.uploading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', fontSize: 10, color: '#fff' }}>
                  Uploading…
                </div>
              )}
              {item.error && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(220,38,38,0.7)', fontSize: 9, color: '#fff', padding: 4, overflow: 'hidden' }}>
                  {item.error}
                </div>
              )}
              {!item.uploading && (
                <>
                  <input
                    type="text" placeholder="Alt text" value={item.altText}
                    onChange={(e) => emit(items.map((it, j) => j === i ? { ...it, altText: e.target.value } : it))}
                    style={{ width: '100%', fontSize: 10, padding: '3px 6px', border: 'none', borderTop: '1px solid rgba(128,128,128,0.2)', background: 'transparent', boxSizing: 'border-box' }}
                  />
                  <button
                    onClick={() => emit(items.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220,38,38,0.8)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 10, cursor: 'pointer', padding: '1px 5px' }}
                    title="Remove"
                  >✕</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

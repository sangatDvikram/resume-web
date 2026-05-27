/**
 * E6-S8: Video manager component for the Project admin resource.
 *
 * Allows adding YouTube, Vimeo, or self-hosted MP4 URLs with a title field,
 * drag-and-drop reorder, and delete.
 */
import React, { useState, useRef, useCallback } from 'react';

type VideoSource = 'youtube' | 'vimeo' | 'self_hosted';

interface VideoItem {
  id?: string;
  source: VideoSource;
  url: string;
  title: string;
}

interface Props {
  property: { path: string };
  record: { params: Record<string, string> };
  onChange: (path: string, value: VideoItem[]) => void;
}

function detectSource(url: string): VideoSource {
  if (/youtu(\.be|be\.com)/i.test(url))  return 'youtube';
  if (/vimeo\.com/i.test(url))           return 'vimeo';
  return 'self_hosted';
}

export default function VideoManager({ property, record, onChange }: Props) {
  // Initialise from record params
  const initial: VideoItem[] = [];
  if (record?.params) {
    let i = 0;
    while (record.params[`${property.path}.${i}.url`]) {
      initial.push({
        id:     record.params[`${property.path}.${i}.id`] ?? undefined,
        source: (record.params[`${property.path}.${i}.source`] ?? 'self_hosted') as VideoSource,
        url:    record.params[`${property.path}.${i}.url`],
        title:  record.params[`${property.path}.${i}.title`] ?? '',
      });
      i++;
    }
  }

  const [items, setItems] = useState<VideoItem[]>(initial);
  const [newUrl, setNewUrl]     = useState('');
  const [newTitle, setNewTitle] = useState('');
  const dragIdx = useRef<number | null>(null);

  const emit = useCallback((next: VideoItem[]) => {
    setItems(next);
    onChange(property.path, next);
  }, [onChange, property.path]);

  const addItem = () => {
    const url = newUrl.trim();
    if (!url) return;
    const item: VideoItem = { source: detectSource(url), url, title: newTitle.trim() };
    emit([...items, item]);
    setNewUrl(''); setNewTitle('');
  };

  // Drag-and-drop reorder
  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    emit(next);
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5, marginBottom: 4,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(128,128,128,0.3)',
    background: 'transparent', fontSize: 13, color: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
        {property.path.charAt(0).toUpperCase() + property.path.slice(1)}
      </label>

      {/* Add new video */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, borderRadius: 8, border: '1px solid rgba(128,128,128,0.2)' }}>
        <div style={labelStyle}>Add video</div>
        <input
          type="url" placeholder="YouTube, Vimeo, or MP4 URL"
          value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          style={inputStyle}
        />
        <input
          type="text" placeholder="Title (optional)"
          value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          style={inputStyle}
        />
        <button
          onClick={addItem}
          style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 600 }}
        >
          + Add
        </button>
      </div>

      {/* Video list */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8,
                border: '1px solid rgba(128,128,128,0.2)',
                cursor: 'grab',
              }}
            >
              {/* Source badge */}
              <span style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                background: item.source === 'youtube' ? 'rgba(220,38,38,0.15)'
                  : item.source === 'vimeo' ? 'rgba(14,165,233,0.15)' : 'rgba(99,102,241,0.15)',
                color: item.source === 'youtube' ? '#dc2626'
                  : item.source === 'vimeo' ? '#0ea5e9' : '#6366f1',
                textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0,
              }}>
                {item.source.replace('_', ' ')}
              </span>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title || item.url}
                </div>
                {item.title && (
                  <div style={{ fontSize: 10, opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.url}
                  </div>
                )}
              </div>

              {/* Title edit */}
              <input
                type="text" placeholder="Title"
                value={item.title}
                onChange={(e) => emit(items.map((it, j) => j === i ? { ...it, title: e.target.value } : it))}
                style={{ ...inputStyle, width: 120, flexShrink: 0 }}
              />

              <button
                onClick={() => emit(items.filter((_, j) => j !== i))}
                style={{ flexShrink: 0, background: 'rgba(220,38,38,0.15)', border: 'none', borderRadius: 4, color: '#dc2626', fontSize: 11, cursor: 'pointer', padding: '3px 7px' }}
              >✕</button>

              <span style={{ flexShrink: 0, opacity: 0.3, fontSize: 14, cursor: 'grab' }}>⠿</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

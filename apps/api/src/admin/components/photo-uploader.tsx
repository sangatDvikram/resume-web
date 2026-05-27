/**
 * E7-S7: Bulk photo uploader for the Gallery admin panel.
 * Accepts up to 50 images per batch, shows per-file progress bars,
 * and posts them to POST /v1/gallery/photos/upload (one at a time so we
 * can track individual progress).
 *
 * Used as a custom AdminJS Show/Edit component on the Photo.originalUrl
 * property so the admin can upload directly from the photo edit form.
 */
import React, { useState, useCallback, useRef } from 'react';

interface UploadItem {
  file: File;
  localUrl: string;
  state: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;      // 0-100 (XHR approximation)
  resultUrl?: string;
  error?: string;
}

interface Props {
  property: { path: string };
  record: { id?: string; params: Record<string, string> };
  onChange: (path: string, value: string) => void;
}

export default function PhotoUploader({ property, record, onChange }: Props) {
  const apiBase = (window as any).__API_BASE__
    ?? `${window.location.protocol}//${window.location.hostname}:3001`;

  const existingUrl = record?.params?.[property.path] ?? '';
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = useCallback((idx: number, patch: Partial<UploadItem>) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it)),
  []);

  const uploadOne = useCallback(async (item: UploadItem, idx: number) => {
    update(idx, { state: 'uploading', progress: 0 });
    const fd = new FormData();
    fd.append('file', item.file);

    try {
      // XHR lets us track upload progress
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) {
            update(idx, { progress: Math.round((e.loaded / e.total) * 90) });
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText) as { originalUrl: string };
              update(idx, { state: 'done', progress: 100, resultUrl: data.originalUrl });
              // Pass the uploaded URL back to AdminJS form state
              onChange(property.path, data.originalUrl);
              resolve();
            } catch { reject(new Error('Invalid JSON response')); }
          } else {
            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.open('POST', `${apiBase}/v1/gallery/photos/upload`);
        xhr.withCredentials = true;
        xhr.send(fd);
      });
    } catch (err: any) {
      update(idx, { state: 'error', error: err.message });
    }
  }, [apiBase, onChange, property.path, update]);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const allowed = Math.min(fileList.length, 50 - items.length);
    const newItems: UploadItem[] = Array.from(fileList).slice(0, allowed).map(f => ({
      file: f,
      localUrl: URL.createObjectURL(f),
      state: 'pending',
      progress: 0,
    }));
    setItems(prev => {
      const next = [...prev, ...newItems];
      newItems.forEach((it, i) => void uploadOne(it, prev.length + i));
      return next;
    });
  }, [items.length, uploadOne]);

  const stateColor: Record<UploadItem['state'], string> = {
    pending:   '#6b7280',
    uploading: '#6366f1',
    done:      '#22c55e',
    error:     '#ef4444',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Current image preview */}
      {existingUrl && (
        <img
          src={existingUrl}
          alt="Current"
          style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(128,128,128,0.2)' }}
        />
      )}

      {/* Drop zone */}
      {items.length < 50 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#818cf8' : 'rgba(128,128,128,0.3)'}`,
            borderRadius: 8, padding: '20px 16px', textAlign: 'center',
            cursor: 'pointer', background: dragging ? 'rgba(99,102,241,0.05)' : 'transparent',
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.7 }}>
            Drop photos here or <strong>click to browse</strong> (max 50)
          </span>
          <input
            ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Per-file progress list */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Thumbnail */}
              <img
                src={item.resultUrl ?? item.localUrl}
                alt={item.file.name}
                style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
              />
              {/* Name + progress bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.file.name}
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(128,128,128,0.2)', marginTop: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${item.progress}%`,
                    background: stateColor[item.state],
                    transition: 'width 0.15s ease',
                  }} />
                </div>
                {item.error && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{item.error}</div>}
              </div>
              {/* State badge */}
              <span style={{ fontSize: 10, color: stateColor[item.state], flexShrink: 0 }}>
                {item.state === 'uploading' ? `${item.progress}%` : item.state}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * AdminJS custom component — Markdown editor with Cloudinary image upload.
 *
 * Bundled by AdminJS's internal esbuild pipeline; runs in the BROWSER.
 * Registered via ComponentLoader in admin.module.ts and mounted on the
 * rawMarkdown field of the BlogPost resource.
 *
 * Upload flow: file picker → POST /v1/upload → insert ![name](url) at cursor.
 */
import React, { useRef, useState, useEffect } from 'react';

const MarkdownEditor = ({ property, record, onChange }: any) => {
  const path: string = property.path;
  const initialValue: string = record?.params?.[path] ?? '';

  const [value, setValue] = useState<string>(initialValue);
  const [uploading, setUploading] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when the record changes (e.g. on page load or re-fetch).
  useEffect(() => {
    const fromRecord: string = record?.params?.[path] ?? '';
    setValue(fromRecord);
  }, [record?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onChange(path, e.target.value);
  };

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end   = ta.selectionEnd   ?? value.length;
    const next  = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    onChange(path, next);
    // Restore caret after React re-render.
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    }, 0);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/v1/upload', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
      const { url } = await res.json();
      const alt = file.name.replace(/\.[^.]+$/, '');
      insertAtCursor(`![${alt}](${url})`);
    } catch (err: any) {
      alert(`Image upload failed: ${err?.message ?? 'unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const ta: React.CSSProperties = {
    width: '100%',
    fontFamily: '"Fira Code", "Cascadia Code", monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    padding: '12px',
    border: '1px solid #4a4a6a',
    borderRadius: '6px',
    resize: 'vertical',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    minHeight: '400px',
    boxSizing: 'border-box',
  };

  const btn: React.CSSProperties = {
    padding: '7px 16px',
    backgroundColor: uploading ? '#555' : '#3d5af1',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: uploading ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <textarea ref={textareaRef} value={value} onChange={handleChange} style={ta} />

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button type="button" style={btn} disabled={uploading}
          onClick={() => fileInputRef.current?.click()}>
          {uploading ? '⏳ Uploading…' : '📷 Insert Image'}
        </button>

        {uploading && (
          <span style={{ fontSize: '12px', color: '#aaa' }}>
            Uploading to Cloudinary…
          </span>
        )}

        <input ref={fileInputRef} type="file" accept="image/*"
          onChange={handleUpload} style={{ display: 'none' }} />
      </div>

      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
        Supports GitHub Flavored Markdown (GFM) · tables · task lists · fenced code blocks
      </p>
    </div>
  );
};

export default MarkdownEditor;

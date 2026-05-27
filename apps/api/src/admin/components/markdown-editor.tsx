/**
 * E8-S3: AdminJS custom component — split-pane Markdown editor.
 *
 * Bundled by AdminJS's internal esbuild pipeline; runs in the BROWSER.
 * Registered via ComponentLoader in admin.module.ts and mounted on the
 * rawMarkdown field of the BlogPost resource and description on Project.
 *
 * Layout: [editor textarea | live HTML preview]
 * Preview is debounced 300 ms via a simple GFM-subset renderer.
 * Upload flow: file picker → POST /v1/upload → insert ![name](url) at cursor.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';

// ── Lightweight GFM-subset renderer (no external deps) ────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMarkdown(raw: string): string {
  // 1. Protect fenced code blocks
  const saved: string[] = [];
  let s = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    saved.push(`<pre style="background:#0d1117;padding:12px;border-radius:6px;overflow:auto"><code>${esc(code.trim())}</code></pre>`);
    return `\x00CB${saved.length - 1}\x00`;
  });

  // 2. Protect inline code
  s = s.replace(/`([^`\n]+)`/g, (_, c) => `<code style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.9em">${esc(c)}</code>`);

  // 3. Process line by line (headers, blockquotes, lists, HR)
  const lines = s.split('\n');
  const out: string[] = [];
  let listBuf: string[] = [];
  let listType = 'ul';

  const flushList = () => {
    if (!listBuf.length) return;
    out.push(`<${listType} style="padding-left:1.5em;margin:0.5em 0">${listBuf.join('')}</${listType}>`);
    listBuf = [];
  };

  for (const line of lines) {
    const h = line.match(/^(#{1,6})\s+(.+)/);
    if (h) { flushList(); out.push(`<h${h[1].length} style="margin:0.75em 0 0.25em">${h[2]}</h${h[1].length}>`); continue; }

    const bq = line.match(/^>\s*(.*)/);
    if (bq) { flushList(); out.push(`<blockquote style="border-left:3px solid #6366f1;margin:0.5em 0;padding:4px 12px;color:#94a3b8">${bq[1]}</blockquote>`); continue; }

    if (/^[-*_]{3,}$/.test(line.trim())) { flushList(); out.push('<hr style="border:none;border-top:1px solid #334155;margin:1em 0">'); continue; }

    const ulm = line.match(/^(\s*)[-*+]\s+(.*)/);
    const olm = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (ulm || olm) {
      const type = ulm ? 'ul' : 'ol';
      if (listBuf.length && type !== listType) flushList();
      listType = type;
      listBuf.push(`<li>${(ulm ?? olm)![2]}</li>`);
      continue;
    }

    flushList();
    out.push(line);
  }
  flushList();
  s = out.join('\n');

  // 4. Inline formatting
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // 5. Images (before links)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:0.5em 0">');

  // 6. Links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:#6366f1">$1</a>');

  // 7. Paragraph wrap: non-HTML, non-blank sections
  const sections = s.split(/\n\n+/);
  s = sections.map(sec => {
    const t = sec.trim();
    if (!t) return '';
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|img)/.test(t) || t.startsWith('\x00CB')) return t;
    return `<p style="margin:0.5em 0;line-height:1.7">${t.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // 8. Restore code blocks
  saved.forEach((blk, i) => { s = s.replace(`\x00CB${i}\x00`, blk); });

  return s;
}

const MarkdownEditor = ({ property, record, onChange }: any) => {
  const fieldPath: string = property.path;
  const initialValue: string = record?.params?.[fieldPath] ?? '';

  const [value, setValue]       = useState<string>(initialValue);
  const [preview, setPreview]   = useState<string>(() => renderMarkdown(initialValue));
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when record changes (page load / re-fetch)
  useEffect(() => {
    const v = record?.params?.[fieldPath] ?? '';
    setValue(v);
    setPreview(renderMarkdown(v));
  }, [record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    onChange(fieldPath, v);
    // Debounce preview render 300 ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreview(renderMarkdown(v)), 300);
  }, [fieldPath, onChange]);

  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end   = ta.selectionEnd   ?? value.length;
    const next  = value.slice(0, start) + text + value.slice(end);
    setValue(next);
    onChange(fieldPath, next);
    setPreview(renderMarkdown(next));
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    }, 0);
  }, [value, fieldPath, onChange]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/v1/upload', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      insertAtCursor(`![${file.name.replace(/\.[^.]+$/, '')}](${url})`);
    } catch (err: any) {
      alert(`Image upload failed: ${err?.message ?? 'unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const editorStyle: React.CSSProperties = {
    flex: 1, fontFamily: '"Fira Code","Cascadia Code","JetBrains Mono",monospace',
    fontSize: '13px', lineHeight: '1.65', padding: '12px',
    border: '1px solid #334155', borderRadius: '6px', resize: 'none',
    background: '#0f172a', color: '#e2e8f0', minHeight: '460px',
    boxSizing: 'border-box', overflowY: 'auto',
  };
  const previewStyle: React.CSSProperties = {
    flex: 1, padding: '12px 16px', border: '1px solid #334155', borderRadius: '6px',
    background: '#0f172a', color: '#e2e8f0', minHeight: '460px',
    overflowY: 'auto', fontSize: '14px', lineHeight: '1.7',
    boxSizing: 'border-box',
  };
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    border: '1px solid #334155', borderRadius: '5px', background: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
  });

  const showEditor  = activeTab !== 'preview';
  const showPreview = activeTab !== 'editor';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* View mode tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['split', 'editor', 'preview'] as const).map(t => (
            <button key={t} type="button" style={tabBtn(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t === 'split' ? '⊟ Split' : t === 'editor' ? '✏ Editor' : '👁 Preview'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {/* Markdown shortcuts */}
        {[
          { label: 'B', title: 'Bold',   insert: '**bold**' },
          { label: 'I', title: 'Italic', insert: '*italic*' },
          { label: 'H', title: 'Heading', insert: '## Heading\n' },
          { label: '`', title: 'Inline code', insert: '`code`' },
          { label: '≡', title: 'Code block', insert: '```\ncode\n```\n' },
          { label: '→', title: 'Link', insert: '[text](url)' },
        ].map(({ label, title, insert }) => (
          <button key={label} type="button" title={title}
            onClick={() => insertAtCursor(insert)}
            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, border: '1px solid #334155', borderRadius: '4px', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
        {/* Image upload */}
        <button type="button" disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #6366f1', borderRadius: '4px', background: uploading ? '#1e293b' : '#6366f120', color: '#818cf8', cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? '⏳ Uploading…' : '📷 Image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      {/* Split pane */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {showEditor && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            spellCheck={false}
            style={editorStyle}
            placeholder="Write Markdown here…"
          />
        )}
        {showPreview && (
          <div
            style={previewStyle}
            dangerouslySetInnerHTML={{ __html: preview || '<span style="color:#475569">Preview will appear here…</span>' }}
          />
        )}
      </div>

      <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>
        GFM supported · preview debounced 300 ms · Ctrl+Z to undo
      </p>
    </div>
  );
};

export default MarkdownEditor;

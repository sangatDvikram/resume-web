/**
 * AdminJS custom component — Tag picker with typeahead and inline creation.
 *
 * Bundled by AdminJS's internal esbuild pipeline; runs in the BROWSER.
 * Registered via ComponentLoader in admin.module.ts and mounted on the
 * tags (M2M) field of the BlogPost resource.
 *
 * Flow:
 *  1. Fetches all existing tags from GET /v1/blog/tags on mount.
 *  2. Displays selected tags as removable chips (populated from record).
 *  3. Typeahead input filters existing tags; pressing Enter or clicking
 *     "+ Add" creates a new tag via AdminJS's ApiClient and selects it.
 */
import React, { useState, useEffect, useRef } from 'react';
import { ApiClient } from 'adminjs';

interface Tag { id: string; name: string; }

const api = new ApiClient();

const TagPicker = ({ property, record, onChange }: any) => {
  const [allTags, setAllTags]         = useState<Tag[]>([]);
  const [selected, setSelected]       = useState<Tag[]>([]);
  const [query, setQuery]             = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Bootstrap: load available tags and pre-select current ones ────────────
  useEffect(() => {
    // Fetch all tags from the public API.
    fetch('/v1/blog/tags', { credentials: 'include' })
      .then(r => r.json())
      .then((tags: Tag[]) => setAllTags(tags))
      .catch(() => {/* non-fatal */});

    // Our BlogPostResource.findOne loads tags with relations, so they appear
    // as flat params: "tags.0.id", "tags.0.name", "tags.1.id", etc.
    const params = record?.params ?? {};
    const fromParams: Tag[] = [];
    let i = 0;
    while (params[`${property.path}.${i}.id`]) {
      const id   = params[`${property.path}.${i}.id`] as string;
      const name = params[`${property.path}.${i}.name`] as string;
      if (id && name) fromParams.push({ id, name });
      i++;
    }

    // Fallback: AdminJS populated relation (populated in memory via adapter)
    const populated: any[] = record?.populated?.[property.path] ?? [];
    const fromPopulated: Tag[] = populated
      .map((r: any) => ({ id: r.params?.id, name: r.params?.name }))
      .filter((t: Tag) => t.id && t.name);

    // Merge, deduplicate by id
    const seen = new Set<string>();
    const merged = [...fromParams, ...fromPopulated].filter(
      (t) => !seen.has(t.id) && seen.add(t.id),
    );
    setSelected(merged);
  }, [record?.id]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const emit = (tags: Tag[]) => {
    // '__empty__' sentinel tells the server the field was explicitly cleared.
    onChange(property.path, tags.length > 0 ? tags.map(t => t.id) : ['__empty__']);
  };

  const addTag = (tag: Tag) => {
    if (selected.some(s => s.id === tag.id)) return;
    const next = [...selected, tag];
    setSelected(next);
    emit(next);
    setQuery('');
    setShowDropdown(false);
  };

  const removeTag = (id: string) => {
    const next = selected.filter(t => t.id !== id);
    setSelected(next);
    emit(next);
  };

  const createTag = async () => {
    const name = query.trim().toLowerCase();
    if (!name) return;

    // Reuse existing tag if one matches.
    const existing = allTags.find(t => t.name === name);
    if (existing) { addTag(existing); return; }

    try {
      // Create via AdminJS internal resource API — no extra endpoint needed.
      const res = await api.resourceAction({
        resourceId: 'Tag',
        actionName: 'new',
        data: { name },
      } as any);

      const created: Tag = {
        id:   res.data?.record?.params?.id,
        name: res.data?.record?.params?.name ?? name,
      };
      setAllTags(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      addTag(created);
    } catch {
      alert(`Could not create tag "${name}". Please try again.`);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const filtered = allTags.filter(
    t => t.name.toLowerCase().includes(query.toLowerCase()) &&
         !selected.some(s => s.id === t.id),
  );

  // ── Styles ────────────────────────────────────────────────────────────────

  const chip: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 10px', backgroundColor: '#3d5af1', color: '#fff',
    borderRadius: '20px', fontSize: '12px', fontWeight: 500,
  };

  const removeBtn: React.CSSProperties = {
    background: 'none', border: 'none', color: '#fff',
    cursor: 'pointer', lineHeight: 1, padding: '0 0 0 2px', fontSize: '14px',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Selected chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', minHeight: '28px' }}>
        {selected.map(tag => (
          <span key={tag.id} style={chip}>
            {tag.name}
            <button type="button" style={removeBtn} onClick={() => removeTag(tag.id)}>×</button>
          </span>
        ))}
      </div>

      {/* Typeahead input row */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createTag(); } }}
          placeholder="Search or create a tag…"
          style={{
            flex: 1, padding: '7px 11px', border: '1px solid #4a4a6a',
            borderRadius: '5px', fontSize: '13px', backgroundColor: '#1a1a2e', color: '#e0e0e0',
          }}
        />
        {query.trim() && (
          <button type="button" onClick={createTag}
            style={{ padding: '7px 14px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
            + Add
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px',
          listStyle: 'none', margin: '2px 0', padding: 0, maxHeight: '200px', overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {filtered.map(tag => (
            <li key={tag.id} onMouseDown={() => addTag(tag)}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
              {tag.name}
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: '11px', color: '#888', margin: '6px 0 0' }}>
        Type to search existing tags · press Enter or click "+ Add" to create new
      </p>
    </div>
  );
};

export default TagPicker;

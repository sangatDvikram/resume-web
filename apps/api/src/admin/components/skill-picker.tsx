/**
 * E6-S9: Skill multi-select typeahead for the Project resource.
 *
 * Fetches all Skill records from GET /v1/resume (skills array) and displays
 * them as filterable checkboxes. Selected skills are emitted as an array of
 * UUIDs via AdminJS's onChange mechanism.
 */
import React, { useState, useEffect, useCallback } from 'react';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Props {
  property: { path: string; label: string };
  record: { params: Record<string, string>; populated?: Record<string, any[]> };
  onChange: (propertyPath: string, value: string[]) => void;
}


export default function SkillPicker({ property, record, onChange }: Props) {
  const [skills, setSkills]   = useState<Skill[]>([]);
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);

  // ── Load current selection from record params ──────────────────────────────
  useEffect(() => {
    const ids: string[] = [];
    // AdminJS stores M2M as  "skills.0.id", "skills.1.id", ...
    Object.entries(record.params ?? {}).forEach(([key, val]) => {
      if (key.startsWith(`${property.path}.`) && key.endsWith('.id')) {
        ids.push(val as string);
      }
    });
    // Also check populated relation
    const populated = (record.populated ?? {})[property.path];
    if (populated) {
      ids.push(...populated.map((s: any) => s.params?.id ?? s.id).filter(Boolean));
    }
    setSelected([...new Set(ids)]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch skills ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const base = (window as any).__API_BASE__
      ?? `${window.location.protocol}//${window.location.hostname}:3001`;
    fetch(`${base}/v1/resume`)
      .then((r) => r.json())
      .then((data: any) => setSkills(data?.skills ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        // '__empty__' sentinel tells the server the field was explicitly cleared
        onChange(property.path, next.length > 0 ? next : ['__empty__']);
        return next;
      });
    },
    [onChange, property.path],
  );

  const filtered = query
    ? skills.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : skills;

  // Group by category
  const categories = [...new Set(filtered.map((s) => s.category))].sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
        {property.label}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {selected.map((id) => {
            const sk = skills.find((s) => s.id === id);
            return sk ? (
              <span
                key={id}
                style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}
                onClick={() => toggle(id)}
              >
                {sk.name} ✕
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Filter skills..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%', padding: '6px 10px', borderRadius: 6,
          border: '1px solid rgba(128,128,128,0.3)', background: 'transparent',
          fontSize: 13, color: 'inherit', boxSizing: 'border-box',
        }}
      />

      {loading && <span style={{ fontSize: 12, opacity: 0.6 }}>Loading skills…</span>}

      {/* Grouped list */}
      <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 6, padding: 8 }}>
        {categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5, marginBottom: 4 }}>
              {cat}
            </div>
            {filtered.filter((s) => s.category === cat).map((skill) => (
              <label
                key={skill.id}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '2px 0' }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(skill.id)}
                  onChange={() => toggle(skill.id)}
                  style={{ width: 14, height: 14 }}
                />
                {skill.name}
              </label>
            ))}
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <span style={{ fontSize: 12, opacity: 0.5 }}>No skills found.</span>
        )}
      </div>
    </div>
  );
}

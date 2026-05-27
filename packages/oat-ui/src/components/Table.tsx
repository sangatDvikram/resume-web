"use client";

import React, { useState } from "react";

export interface OatTableColumn<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface OatTablePagination {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

export interface OatTableProps<T extends Record<string, unknown>> {
  columns: OatTableColumn<T>[];
  data: T[];
  rowKey?: (row: T, idx: number) => string | number;
  onSort?: (key: string, dir: "asc" | "desc") => void;
  pagination?: OatTablePagination;
  /** Called with the array of row indices of selected rows */
  onSelect?: (indices: number[]) => void;
  className?: string;
  style?: React.CSSProperties;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc";

const th: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: "1px solid var(--border)",
  background: "var(--surface)",
  userSelect: "none",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: "0.875rem",
  color: "var(--foreground)",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "middle",
};

export function OatTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onSort,
  pagination,
  onSelect,
  className,
  style,
  emptyMessage = "No data.",
}: OatTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleSort = (key: string) => {
    const newDir: SortDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const toggleRow = (idx: number) => {
    const next = new Set(selected);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setSelected(next);
    onSelect?.([...next]);
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      onSelect?.([]);
    } else {
      const all = new Set(data.map((_, i) => i));
      setSelected(all);
      onSelect?.([...all]);
    }
  };

  const hasSelect = Boolean(onSelect);

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {hasSelect && (
                <th style={{ ...th, width: 40 }}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selected.size === data.length && data.length > 0}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...th,
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.label}
                  {col.sortable && sortKey === col.key
                    ? sortDir === "asc"
                      ? " ↑"
                      : " ↓"
                    : col.sortable
                    ? " ↕"
                    : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasSelect ? 1 : 0)}
                  style={{ ...td, textAlign: "center", color: "var(--muted-foreground)", padding: "32px" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row, idx) : idx}
                  style={{
                    background: selected.has(idx)
                      ? "color-mix(in oklch, var(--primary) 8%, transparent)"
                      : idx % 2 === 0
                      ? "var(--surface)"
                      : "transparent",
                    transition: "background 150ms",
                  }}
                >
                  {hasSelect && (
                    <td style={td}>
                      <input
                        type="checkbox"
                        aria-label={`Select row ${idx + 1}`}
                        checked={selected.has(idx)}
                        onChange={() => toggleRow(idx)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} style={td}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
          }}
        >
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPage(pagination.page - 1)}
              aria-label="Previous page"
              style={{ padding: "5px 10px", border: "1px solid var(--border)", borderRadius: "6px", background: "transparent", color: "var(--foreground)", cursor: pagination.page <= 1 ? "not-allowed" : "pointer", opacity: pagination.page <= 1 ? 0.4 : 1 }}
            >
              ‹
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPage(pagination.page + 1)}
              aria-label="Next page"
              style={{ padding: "5px 10px", border: "1px solid var(--border)", borderRadius: "6px", background: "transparent", color: "var(--foreground)", cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer", opacity: pagination.page >= pagination.totalPages ? 0.4 : 1 }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

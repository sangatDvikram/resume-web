"use client";

import React, { createContext, useCallback, useContext, useId, useRef, useState } from "react";

/* ── Context ──────────────────────────────────────────────────────────────── */

interface TabsCtx {
  active: string;
  setActive: (v: string) => void;
  uid: string;
  tabValues: React.MutableRefObject<string[]>;
}

const TabsContext = createContext<TabsCtx | null>(null);

function useTabsCtx() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("OatTab/OatTabPanel must be inside OatTabs");
  return ctx;
}

/* ── OatTabs ─────────────────────────────────────────────────────────────── */

export interface OatTabsProps {
  /** Default active tab (uncontrolled) */
  defaultValue?: string;
  /** Active tab (controlled) */
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function OatTabs({ defaultValue, value, onChange, children, className, style }: OatTabsProps) {
  const uid = useId();
  const tabValues = useRef<string[]>([]);
  const [internalActive, setInternalActive] = useState<string>(defaultValue ?? "");

  const active = value ?? internalActive;
  const setActive = useCallback(
    (v: string) => {
      setInternalActive(v);
      onChange?.(v);
    },
    [onChange]
  );

  return (
    <TabsContext.Provider value={{ active, setActive, uid, tabValues }}>
      <div className={className} style={style}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ── OatTabList ──────────────────────────────────────────────────────────── */

export interface OatTabListProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export function OatTabList({ children, className, style, "aria-label": ariaLabel }: OatTabListProps) {
  const { uid, setActive, tabValues, active } = useTabsCtx();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabValues.current.indexOf(active);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = tabValues.current[(idx + 1) % tabValues.current.length];
      setActive(next);
      document.getElementById(`oat-tab-${uid}-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = tabValues.current[(idx - 1 + tabValues.current.length) % tabValues.current.length];
      setActive(prev);
      document.getElementById(`oat-tab-${uid}-${prev}`)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={className}
      style={{
        display: "flex",
        gap: "4px",
        borderBottom: "1px solid var(--border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── OatTab ──────────────────────────────────────────────────────────────── */

export interface OatTabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function OatTab({ value, children, disabled = false, className, style }: OatTabProps) {
  const { active, setActive, uid, tabValues } = useTabsCtx();
  const isActive = active === value;

  // Register tab value on first render
  if (!tabValues.current.includes(value)) tabValues.current.push(value);

  return (
    <button
      id={`oat-tab-${uid}-${value}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`oat-tabpanel-${uid}-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActive(value)}
      className={className}
      style={{
        padding: "8px 16px",
        fontSize: "0.875rem",
        fontWeight: isActive ? 600 : 400,
        color: isActive ? "var(--primary)" : "var(--muted-foreground)",
        background: "transparent",
        border: "none",
        borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "color 150ms, border-color 150ms",
        outline: "none",
        ...style,
      }}
      onFocus={(e) => { e.currentTarget.style.outline = "2px solid color-mix(in oklch, var(--ring) 50%, transparent)"; e.currentTarget.style.outlineOffset = "2px"; }}
      onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
    >
      {children}
    </button>
  );
}

/* ── OatTabPanel ─────────────────────────────────────────────────────────── */

export interface OatTabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function OatTabPanel({ value, children, className, style }: OatTabPanelProps) {
  const { active, uid } = useTabsCtx();
  if (active !== value) return null;

  return (
    <div
      id={`oat-tabpanel-${uid}-${value}`}
      role="tabpanel"
      aria-labelledby={`oat-tab-${uid}-${value}`}
      tabIndex={0}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

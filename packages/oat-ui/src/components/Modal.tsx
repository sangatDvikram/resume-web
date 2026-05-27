"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export interface OatModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Screen-reader description (aria-describedby) */
  description?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Max-width of the dialog panel (default: 560px) */
  maxWidth?: number | string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function OatModal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  style,
  maxWidth = 560,
}: OatModalProps) {
  const uid = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  /* ── Scroll lock ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* ── Focus trap & Escape ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement;

    // Move focus inside after mount
    const raf = requestAnimationFrame(() => {
      const el = dialogRef.current;
      if (!el) return;
      const first = el.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
      first ? first.focus() : el.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }

      if (e.key === "Tab") {
        const el = dialogRef.current;
        if (!el) return;
        const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!focusable.length) { e.preventDefault(); return; }

        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        animation: "oat-fade-in 150ms ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-hidden="false"
    >
      <style>{`
        @keyframes oat-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes oat-slide-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${uid}-title` : undefined}
        aria-describedby={description ? `${uid}-desc` : undefined}
        tabIndex={-1}
        className={className}
        style={{
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "oat-slide-up 200ms ease",
          outline: "none",
          ...style,
        }}
      >
        {/* Header */}
        {(title || true) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
            {title && (
              <h2 id={`${uid}-title`} style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)" }}>
                {title}
              </h2>
            )}
            <button
              aria-label="Close modal"
              onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "var(--muted-foreground)", fontSize: "1.25rem", lineHeight: 1, marginLeft: "auto" }}
            >
              ×
            </button>
          </div>
        )}

        {description && (
          <p id={`${uid}-desc`} style={{ padding: "8px 24px 0", margin: 0, fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
            {description}
          </p>
        )}

        {/* Body */}
        <div style={{ padding: "20px 24px 24px" }}>
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

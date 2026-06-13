"use client";

import React from "react";

export interface OatBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const baseStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.375rem 0.75rem",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "var(--secondary)",
  color: "var(--foreground)",
  border: "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
  transition: "all 200ms",
  lineHeight: 1.4,
};

export const OatBadge = React.forwardRef<HTMLSpanElement, OatBadgeProps>(
  function OatBadge({ style, className, children, ...rest }, ref) {
    return (
      <span
        ref={ref}
        style={{ ...baseStyle, ...style }}
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor =
            "color-mix(in oklch, var(--primary) 50%, transparent)";
          e.currentTarget.style.background =
            "color-mix(in oklch, var(--secondary) 80%, transparent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor =
            "color-mix(in oklch, var(--border) 50%, transparent)";
          e.currentTarget.style.background = "var(--secondary)";
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }
);

OatBadge.displayName = "OatBadge";

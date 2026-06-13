"use client";

import React from "react";

export type OatButtonVariant = "primary" | "ghost" | "destructive";
export type OatButtonSize = "sm" | "md" | "lg";

export interface OatButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: OatButtonVariant;
  size?: OatButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<OatButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "1px solid transparent",
  },
  ghost: {
    background: "transparent",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
  },
  destructive: {
    background: "var(--destructive)",
    color: "var(--destructive-foreground)",
    border: "1px solid transparent",
  },
};

const sizeStyles: Record<OatButtonSize, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "0.8125rem", borderRadius: "6px" },
  md: { padding: "9px 18px", fontSize: "0.875rem", borderRadius: "8px" },
  lg: { padding: "12px 24px", fontSize: "1rem", borderRadius: "10px" },
};

export const OatButton = React.forwardRef<
  HTMLButtonElement,
  OatButtonProps
>(function OatButton(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    children,
    style,
    className,
    ...rest
  },
  ref
) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: 600,
    lineHeight: 1,
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    opacity: disabled || isLoading ? 0.5 : 1,
    transition: "opacity 150ms, filter 150ms",
    outline: "none",
    whiteSpace: "nowrap",
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      className={className}
      style={baseStyle}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow =
          "0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden
          style={{
            width: "0.85em",
            height: "0.85em",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "oat-spin 0.7s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
});

OatButton.displayName = "OatButton";

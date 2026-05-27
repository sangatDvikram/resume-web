import React from "react";

export type OatCardVariant = "default" | "glass";

export interface OatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: OatCardVariant;
  /** Add hover transition on the glass variant */
  hoverable?: boolean;
}

export const OatCard = React.forwardRef<HTMLDivElement, OatCardProps>(
  function OatCard(
    { variant = "default", hoverable = false, style, className, children, ...rest },
    ref
  ) {
    const baseStyle: React.CSSProperties =
      variant === "glass"
        ? {
            background:
              "color-mix(in oklch, var(--card) 60%, transparent)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border:
              "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
            borderRadius: "var(--radius)",
            transition: hoverable ? "all 300ms" : undefined,
          }
        : {
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          };

    return (
      <div
        ref={ref}
        style={{ ...baseStyle, ...style }}
        className={className}
        onMouseEnter={
          hoverable && variant === "glass"
            ? (e) => {
                e.currentTarget.style.background =
                  "color-mix(in oklch, var(--card) 80%, transparent)";
                e.currentTarget.style.borderColor =
                  "color-mix(in oklch, var(--primary) 30%, transparent)";
              }
            : undefined
        }
        onMouseLeave={
          hoverable && variant === "glass"
            ? (e) => {
                e.currentTarget.style.background =
                  "color-mix(in oklch, var(--card) 60%, transparent)";
                e.currentTarget.style.borderColor =
                  "color-mix(in oklch, var(--border) 50%, transparent)";
              }
            : undefined
        }
        {...rest}
      >
        {children}
      </div>
    );
  }
);

OatCard.displayName = "OatCard";

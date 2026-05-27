import React from "react";

export type OatSpinnerSize = "sm" | "md" | "lg";

export interface OatSpinnerProps {
  size?: OatSpinnerSize;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

const sizeMap: Record<OatSpinnerSize, number> = { sm: 16, md: 24, lg: 40 };
const borderMap: Record<OatSpinnerSize, number> = { sm: 2, md: 3, lg: 4 };

export function OatSpinner({
  size = "md",
  className,
  style,
  "aria-label": ariaLabel = "Loading",
}: OatSpinnerProps) {
  const px = sizeMap[size];
  const bw = borderMap[size];

  return (
    <>
      <style>{`
        @keyframes oat-spin {
          to { transform: rotate(360deg); }
        }
        .oat-spinner {
          animation: oat-spin 0.7s linear infinite;
        }
      `}</style>
      <span
        role="status"
        aria-label={ariaLabel}
        className={`oat-spinner${className ? ` ${className}` : ""}`}
        style={{
          display: "inline-block",
          width: px,
          height: px,
          border: `${bw}px solid color-mix(in oklch, var(--primary) 30%, transparent)`,
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          ...style,
        }}
      />
    </>
  );
}

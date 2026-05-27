import React from "react";

export interface OatInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

const inputStyle = (hasError: boolean, disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "9px 12px",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  background: "var(--input)",
  color: "var(--foreground)",
  border: `1px solid ${hasError ? "var(--destructive)" : "var(--border)"}`,
  borderRadius: "calc(var(--radius) - 2px)",
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? "not-allowed" : "text",
  boxSizing: "border-box",
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--foreground)",
  marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--destructive)",
  marginTop: "4px",
};

export const OatInput = React.forwardRef<HTMLInputElement, OatInputProps>(
  function OatInput(
    {
      label,
      error,
      id,
      wrapperClassName,
      wrapperStyle,
      disabled = false,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const hasError = Boolean(error);
    const inputId = id ?? (label ? `oat-input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div
        className={wrapperClassName}
        style={{ display: "flex", flexDirection: "column", ...wrapperStyle }}
      >
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          style={{ ...inputStyle(hasError, disabled), ...style }}
          className={className}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 0 3px color-mix(in oklch, var(--ring) 40%, transparent)";
            e.currentTarget.style.borderColor = hasError
              ? "var(--destructive)"
              : "var(--ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = hasError
              ? "var(--destructive)"
              : "var(--border)";
          }}
          {...rest}
        />
        {hasError && (
          <span id={`${inputId}-error`} role="alert" style={errorStyle}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

OatInput.displayName = "OatInput";

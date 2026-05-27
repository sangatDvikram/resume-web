import React from "react";

export interface OatSelectOption {
  value: string;
  label: string;
}

export interface OatSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: OatSelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

const selectStyle = (
  hasError: boolean,
  disabled: boolean
): React.CSSProperties => ({
  width: "100%",
  padding: "9px 36px 9px 12px",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  background: "var(--input)",
  color: "var(--foreground)",
  border: `1px solid ${hasError ? "var(--destructive)" : "var(--border)"}`,
  borderRadius: "calc(var(--radius) - 2px)",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  transition: "border-color 150ms, box-shadow 150ms",
  boxSizing: "border-box",
  fontFamily: "inherit",
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

export const OatSelect = React.forwardRef<HTMLSelectElement, OatSelectProps>(
  function OatSelect(
    {
      label,
      error,
      options,
      placeholder,
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
    const inputId =
      id ??
      (label
        ? `oat-select-${label.toLowerCase().replace(/\s+/g, "-")}`
        : undefined);

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
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          style={{ ...selectStyle(hasError, disabled), ...style }}
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && (
          <span id={`${inputId}-error`} role="alert" style={errorStyle}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

OatSelect.displayName = "OatSelect";

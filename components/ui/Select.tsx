"use client";

import { forwardRef, useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Convenience prop — renders `<option>`s. Falls back to `children`. */
  options?: SelectOption[];
  containerClassName?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    options,
    id,
    className,
    containerClassName,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedBy = error
    ? `${selectId}-error`
    : hint
      ? `${selectId}-hint`
      : undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full min-w-0 cursor-pointer appearance-none rounded-control border bg-input pl-3.5 pr-10 text-sm text-foreground outline-none transition-colors",
            "border-border-strong [color-scheme:dark] focus:border-primary focus:ring-2 focus:ring-primary/30",
            error && "border-loss focus:border-loss focus:ring-loss/30",
            className,
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-loss">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

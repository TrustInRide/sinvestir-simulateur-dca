"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  /** Inline leading adornment, e.g. a currency symbol. */
  prefix?: ReactNode;
  /** Inline trailing adornment, e.g. a unit. */
  suffix?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    prefix,
    suffix,
    id,
    className,
    containerClassName,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center rounded-control border bg-input transition-colors",
          "border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
          error &&
            "border-loss focus-within:border-loss focus-within:ring-loss/30",
        )}
      >
        {prefix != null && (
          <span className="pl-3.5 text-sm text-muted">{prefix}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full min-w-0 bg-transparent px-3.5 text-sm text-foreground outline-none placeholder:text-muted",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            prefix != null && "pl-2",
            suffix != null && "pr-2",
            className,
          )}
          {...props}
        />
        {suffix != null && (
          <span className="pr-3.5 text-sm text-muted">{suffix}</span>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-loss">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

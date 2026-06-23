"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/ui/FieldLabel";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  /** Small help text shown via an (i) affordance next to the label. */
  info?: string;
  hint?: string;
  error?: string;
  /** Inline leading adornment, e.g. a search icon. */
  prefix?: ReactNode;
  /** Inline trailing adornment / unit, e.g. `EUR`, `%`. */
  suffix?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    info,
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
      {label && <FieldLabel htmlFor={inputId} info={info}>{label}</FieldLabel>}

      {/* Underline field — matches simulateurs.sinvestir.fr inputs */}
      <div
        className={cn(
          "flex items-center gap-2 border-b bg-transparent transition-colors",
          "border-border-strong focus-within:border-primary",
          error && "border-loss focus-within:border-loss",
        )}
      >
        {prefix != null && (
          <span className="flex shrink-0 items-center text-muted">{prefix}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-10 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted/70",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-90",
            className,
          )}
          {...props}
        />
        {suffix != null && (
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">
            {suffix}
          </span>
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

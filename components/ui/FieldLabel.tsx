import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  htmlFor?: string;
  /** Tooltip text surfaced through the (i) affordance. */
  info?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Form label matching simulateurs.sinvestir.fr — small, muted blue-grey, with
 * an optional (i) help affordance (native `title` tooltip, keyboard-focusable).
 */
export function FieldLabel({ htmlFor, info, className, children }: FieldLabelProps) {
  const textClass = "text-[0.8rem] font-medium text-label";
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={textClass}>
          {children}
        </label>
      ) : (
        <span className={textClass}>{children}</span>
      )}
      {info && <InfoDot label={info} />}
    </span>
  );
}

function InfoDot({ label }: { label: string }) {
  return (
    <span
      role="img"
      tabIndex={0}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-3.5 cursor-help items-center justify-center rounded-full",
        "border border-border-strong text-[9px] font-semibold leading-none text-muted",
        "transition-colors hover:border-primary hover:text-primary",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      i
    </span>
  );
}

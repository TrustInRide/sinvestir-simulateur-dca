import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "gain" | "loss" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Show a directional arrow (▲ gain / ▼ loss). Ignored for `neutral`. */
  withArrow?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  gain: "bg-gain/15 text-gain",
  loss: "bg-loss/15 text-loss",
  neutral: "bg-white/5 text-muted",
};

export function Badge({
  variant = "neutral",
  withArrow = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const showArrow = withArrow && variant !== "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-badge px-2 py-0.5 text-xs font-semibold tabular-nums",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {showArrow && (
        <svg
          className="size-2.5"
          viewBox="0 0 8 8"
          fill="currentColor"
          aria-hidden="true"
        >
          {variant === "gain" ? (
            <path d="M4 0 8 6H0z" />
          ) : (
            <path d="M4 8 0 2h8z" />
          )}
        </svg>
      )}
      {children}
    </span>
  );
}

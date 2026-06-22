import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Elevated surface — #1e1e1e on the #141414 page, 20px radius, 24px padding.
 * A hairline inset highlight + soft drop shadow give it a subtle lift without
 * straying from the flat S'investir aesthetic.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-6",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_8px_30px_-12px_rgba(0,0,0,0.6)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5 flex flex-col gap-1", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}

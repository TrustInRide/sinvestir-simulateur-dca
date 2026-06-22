type ClassValue = string | number | false | null | undefined;

/**
 * Minimal, dependency-free className combiner.
 *
 * Kept intentionally simple (no `clsx` / `tailwind-merge`): the design system
 * owns its variants, so callers rarely need conflict resolution. Falsy values
 * are dropped so conditional classes read cleanly: `cn("base", open && "open")`.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "light" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Blue gradient pill — matches S'investir "Enregistrer la simulation"
  primary:
    "bg-gradient-to-r from-[#1a9bf7] to-[#0a6fd8] text-white shadow-[0_8px_20px_-8px_rgba(16,152,247,0.65)] hover:from-[#1490ee] hover:to-[#0a63c6]",
  secondary:
    "bg-secondary text-background hover:bg-secondary-hover active:bg-secondary-hover",
  // Near-white pill — matches S'investir "Partager mes résultats"
  light:
    "bg-white text-[#0b1020] shadow-[0_8px_20px_-10px_rgba(255,255,255,0.5)] hover:bg-white/90",
  ghost:
    "border border-border-strong bg-transparent text-foreground hover:bg-white/5 active:bg-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-11 gap-2 px-6 text-sm",
  lg: "h-12 gap-2 px-7 text-[0.95rem]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-full font-semibold",
        "transition-[background-color,transform,box-shadow,opacity] duration-150 ease-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="size-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

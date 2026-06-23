import { cn } from "@/lib/utils";

interface SInvestirLogoProps {
  className?: string;
}

/**
 * S'investir brand mark — the official gold "S'investir" emblem
 * (public/sinvestir-logo.png, background keyed to transparent). Height is
 * driven by `className`; width follows the intrinsic 48×50 ratio.
 */
export function SInvestirLogo({ className }: SInvestirLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/sinvestir-logo.png"
      alt="S'investir"
      width={48}
      height={50}
      className={cn("block h-9 w-auto select-none", className)}
      draggable={false}
    />
  );
}

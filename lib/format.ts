/* ------------------------------------------------------------------ */
/*  Locale-aware formatting (fr-FR) — currency, signed currency, %.    */
/* ------------------------------------------------------------------ */

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const eurSigned = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const percent = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

/** `1 234,56 €` */
export function formatEUR(value: number): string {
  return eur.format(Number.isFinite(value) ? value : 0);
}

/** `+1 234,56 €` / `-1 234,56 €` — for gains/losses. */
export function formatEURSigned(value: number): string {
  return eurSigned.format(Number.isFinite(value) ? value : 0);
}

/**
 * Formats a percentage already expressed in **percent units** (e.g. `42.5`
 * → `+42,50 %`). `Intl` percent style multiplies by 100, so we divide first.
 */
export function formatPercent(value: number): string {
  return percent.format((Number.isFinite(value) ? value : 0) / 100);
}

/**
 * Compact currency for chart axes — `1,2 k€`, `3,4 M€`, `850 €`.
 *
 * Hand-rolled rather than `Intl` `notation: "compact"` to keep ticks tight
 * (no non-breaking space before the symbol) so they fit a 60px Y-axis.
 */
export function formatEURCompact(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000) {
    return `${(v / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M€`;
  }
  if (abs >= 1_000) {
    return `${(v / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: abs >= 10_000 ? 0 : 1 })} k€`;
  }
  return `${Math.round(v).toLocaleString("fr-FR")} €`;
}

/** Coin units with a sensible precision for small/large holdings. */
export function formatUnits(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const decimals = value !== 0 && Math.abs(value) < 1 ? 6 : 4;
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: decimals,
  }).format(value);
}

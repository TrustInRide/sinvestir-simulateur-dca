/* ------------------------------------------------------------------ */
/*  Shareable-link codec.                                              */
/*  A simulation is fully described by its URL query string, so any     */
/*  result can be reproduced from a link (and restored on load).        */
/* ------------------------------------------------------------------ */

import type { DCAParams, Frequency } from "@/lib/types";

const FREQUENCIES: Frequency[] = ["one-shot", "daily", "weekly", "monthly"];

/** Serialisable scenario passed from the server page to the client. */
export interface ShareScenario {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  frequency: Frequency;
  /** `YYYY-MM-DD` (UTC). */
  startISO: string;
  /** `YYYY-MM-DD` (UTC). */
  endISO: string;
}

/** First value of a (possibly repeated) query param. */
function pick(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Builds the query string (without `?`) encoding a completed simulation. */
export function encodeShareParams(params: DCAParams): string {
  const q = new URLSearchParams({
    coin: params.coinId,
    sym: params.coinSymbol,
    name: params.coinName,
    amount: String(params.amount),
    freq: params.frequency,
    from: toISODate(params.startDate),
    to: toISODate(params.endDate),
  });
  return q.toString();
}

/**
 * Validates raw search params into a scenario, or `null` when the link does
 * not describe a usable simulation (so a normal visit is unaffected).
 */
export function parseShareScenario(
  searchParams: Record<string, string | string[] | undefined>,
): ShareScenario | null {
  const coinId = pick(searchParams.coin)?.trim();
  const coinSymbol = pick(searchParams.sym)?.trim();
  const coinName = pick(searchParams.name)?.trim();
  const amount = Number(pick(searchParams.amount));
  const frequency = pick(searchParams.freq) as Frequency | undefined;
  const startISO = pick(searchParams.from)?.trim();
  const endISO = pick(searchParams.to)?.trim();

  if (!coinId || !coinSymbol || !coinName) return null;
  if (!Number.isFinite(amount) || amount < 1) return null;
  if (!frequency || !FREQUENCIES.includes(frequency)) return null;
  if (!startISO || !endISO) return null;

  const start = new Date(`${startISO}T00:00:00.000Z`);
  const end = new Date(`${endISO}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (start.getTime() >= end.getTime()) return null;

  return { coinId, coinSymbol, coinName, amount, frequency, startISO, endISO };
}

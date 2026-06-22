/* ------------------------------------------------------------------ */
/*  Server-only Coinbase Exchange client.                              */
/*  Provides full-history daily EUR candles (no API key) for coins      */
/*  listed against EUR — used as the primary price source so the DCA    */
/*  simulation can span multiple years (CoinGecko's free tier caps at   */
/*  365 days). Returns null when the EUR pair is unavailable, so the    */
/*  route can fall back to CoinGecko.                                    */
/* ------------------------------------------------------------------ */

import { fetchWithTimeout } from "@/lib/http";
import type { PricePoint } from "@/lib/types";

const BASE_URL = "https://api.exchange.coinbase.com";
const USER_AGENT = "trustinride-dca-simulator/1.0";
const DAY_SEC = 86_400;
const DAY_MS = 86_400_000;
const MAX_CANDLES = 300; // Coinbase hard cap per request.
const MAX_PAGES = 40; // ~33 years of daily data — a safety bound.

const iso = (unixSec: number) => new Date(unixSec * 1000).toISOString();

/** Collapses to one point per UTC day (open price), sorted ascending. */
function normalize(points: PricePoint[]): PricePoint[] {
  const byDay = new Map<number, number>();
  for (const { timestamp, price } of points) {
    if (!Number.isFinite(timestamp) || !Number.isFinite(price) || price <= 0) {
      continue;
    }
    const day = Math.floor(timestamp / DAY_MS) * DAY_MS;
    if (!byDay.has(day)) byDay.set(day, price);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, price]) => ({ timestamp, price }));
}

/**
 * Fetches daily EUR prices for `symbol` (e.g. `BTC`) between two unix-second
 * bounds, paginating Coinbase's 300-candle window.
 *
 * @returns price points, or `null` when the `{SYMBOL}-EUR` product does not
 *          exist / is unavailable (signal to fall back to another source).
 */
export async function fetchCoinbaseDailyEUR(
  symbol: string,
  fromUnix: number,
  toUnix: number,
): Promise<PricePoint[] | null> {
  const product = `${symbol.trim().toUpperCase()}-EUR`;
  const collected: PricePoint[] = [];

  let windowStart = fromUnix;
  for (let page = 0; page < MAX_PAGES && windowStart <= toUnix; page++) {
    const windowEnd = Math.min(toUnix, windowStart + (MAX_CANDLES - 1) * DAY_SEC);
    const url =
      `${BASE_URL}/products/${encodeURIComponent(product)}/candles` +
      `?granularity=${DAY_SEC}&start=${iso(windowStart)}&end=${iso(windowEnd)}`;

    const res = await fetchWithTimeout(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    // Unknown / non-EUR pair → let the caller fall back to CoinGecko.
    if (res.status === 404) return null;
    if (!res.ok) {
      // Rate-limited or upstream error: use whatever we have, else give up.
      return collected.length > 0 ? normalize(collected) : null;
    }

    // Coinbase candles: [time(sec), low, high, open, close, volume], newest first.
    const rows = (await res.json()) as unknown;
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      if (Array.isArray(row) && row.length >= 5) {
        collected.push({ timestamp: Number(row[0]) * 1000, price: Number(row[3]) });
      }
    }

    windowStart = windowEnd + DAY_SEC;
  }

  const normalized = normalize(collected);
  return normalized.length > 0 ? normalized : null;
}

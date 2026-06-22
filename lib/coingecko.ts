/* ------------------------------------------------------------------ */
/*  Browser-side client for our own /api/coingecko proxy routes.       */
/* ------------------------------------------------------------------ */

import type { CoinSearchResult, PricePoint } from "@/lib/types";

/** Typed error carrying the HTTP status returned by the proxy. */
export class CoingeckoError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CoingeckoError";
    this.status = status;
  }
}

/** Extracts the `{ error }` message from a failed proxy response. */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
    ) {
      return (body as { error: string }).error;
    }
  } catch {
    /* fall through to generic message */
  }
  return "Une erreur est survenue. Réessayez.";
}

/** Searches coins by free-text query (top 8 matches). */
export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const res = await fetch(
    `/api/coingecko/search?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new CoingeckoError(await errorMessage(res), res.status);
  return (await res.json()) as CoinSearchResult[];
}

/**
 * Fetches historical EUR prices for a coin between two dates (inclusive).
 * `symbol` lets the proxy resolve the Coinbase EUR pair (full history);
 * `coinId` is the CoinGecko fallback. The window is widened by one day so the
 * end day's point is captured regardless of granularity; `calculateDCA` clips.
 */
export async function getHistoricalPrices(
  coinId: string,
  symbol: string,
  from: Date,
  to: Date,
): Promise<PricePoint[]> {
  const fromUnix = Math.floor(from.getTime() / 1000);
  const toUnix = Math.floor(to.getTime() / 1000) + 86_400;

  const res = await fetch(
    `/api/coingecko/history?id=${encodeURIComponent(coinId)}` +
      `&symbol=${encodeURIComponent(symbol)}&from=${fromUnix}&to=${toUnix}`,
  );
  if (!res.ok) throw new CoingeckoError(await errorMessage(res), res.status);
  return (await res.json()) as PricePoint[];
}

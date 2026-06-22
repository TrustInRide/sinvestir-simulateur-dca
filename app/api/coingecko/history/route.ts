import { coingeckoGet } from "@/lib/coingecko-server";
import { fetchCoinbaseDailyEUR } from "@/lib/coinbase-server";
import { isAbortError } from "@/lib/http";
import type { PricePoint } from "@/lib/types";

const CACHE_HEADER = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };

// CoinGecko's free tier only serves the past 365 days; keep a small margin.
const GECKO_MAX_DAYS = 364;

/**
 * GET /api/coingecko/history?id={id}&symbol={SYM}&from={unix}&to={unix}
 *   → PricePoint[]
 *
 * Primary source: Coinbase (full daily EUR history, no key). Falls back to
 * CoinGecko (clipped to the last year) when the coin has no Coinbase EUR pair.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const id = params.get("id")?.trim();
  const symbol = params.get("symbol")?.trim();
  const from = params.get("from");
  const to = params.get("to");

  if (!id || !from || !to) {
    return Response.json(
      { error: "Paramètres « id », « from » et « to » requis." },
      { status: 400 },
    );
  }

  const fromUnix = Number(from);
  const toUnix = Number(to);
  if (
    !Number.isFinite(fromUnix) ||
    !Number.isFinite(toUnix) ||
    fromUnix >= toUnix
  ) {
    return Response.json(
      { error: "Plage temporelle invalide." },
      { status: 400 },
    );
  }

  try {
    // 1) Primary source — Coinbase (full multi-year history in EUR).
    if (symbol) {
      const coinbase = await fetchCoinbaseDailyEUR(symbol, fromUnix, toUnix);
      if (coinbase && coinbase.length > 0) {
        return Response.json(coinbase, { headers: CACHE_HEADER });
      }
    }

    // 2) Fallback — CoinGecko, clipped to its 365-day free window.
    const minFrom = Math.floor(Date.now() / 1000) - GECKO_MAX_DAYS * 86_400;
    const effFrom = Math.max(fromUnix, minFrom);
    if (effFrom >= toUnix) {
      return Response.json(
        {
          error:
            "Historique de plus d’un an indisponible pour cette crypto sur les sources gratuites. Choisissez une grande capitalisation (BTC, ETH, SOL…) ou une période dans les 12 derniers mois.",
        },
        { status: 422 },
      );
    }

    const res = await coingeckoGet(
      `/coins/${encodeURIComponent(id)}/market_chart/range` +
        `?vs_currency=eur&from=${effFrom}&to=${toUnix}`,
    );

    if (res.status === 404) {
      return Response.json(
        { error: "Cryptomonnaie introuvable." },
        { status: 404 },
      );
    }
    if (res.status === 429) {
      return Response.json(
        { error: "Trop de requêtes. Réessayez dans un instant." },
        { status: 429 },
      );
    }
    if (!res.ok) {
      return Response.json(
        { error: "Service de données indisponible." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { prices?: unknown };
    const prices: PricePoint[] = Array.isArray(data.prices)
      ? data.prices
          .filter(
            (p): p is [number, number] =>
              Array.isArray(p) &&
              p.length >= 2 &&
              typeof p[0] === "number" &&
              typeof p[1] === "number",
          )
          .map(([timestamp, price]) => ({ timestamp, price }))
      : [];

    return Response.json(prices, { headers: CACHE_HEADER });
  } catch (error) {
    if (isAbortError(error)) {
      return Response.json(
        { error: "Délai d'attente dépassé." },
        { status: 504 },
      );
    }
    return Response.json({ error: "Erreur réseau." }, { status: 502 });
  }
}

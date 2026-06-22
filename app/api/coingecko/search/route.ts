import { coingeckoGet } from "@/lib/coingecko-server";
import { isAbortError } from "@/lib/http";
import type { CoinSearchResult } from "@/lib/types";

interface RawCoin {
  id?: unknown;
  symbol?: unknown;
  name?: unknown;
  thumb?: unknown;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** GET /api/coingecko/search?q={query} → CoinSearchResult[] (top 8). */
export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return Response.json({ error: "Paramètre « q » requis." }, { status: 400 });
  }

  try {
    const res = await coingeckoGet(`/search?query=${encodeURIComponent(q)}`);

    if (res.status === 429) {
      return Response.json(
        { error: "Trop de requêtes. Réessayez dans un instant." },
        { status: 429 },
      );
    }
    if (!res.ok) {
      return Response.json(
        { error: "Service de recherche indisponible." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { coins?: RawCoin[] };
    const coins: CoinSearchResult[] = (data.coins ?? [])
      .slice(0, 8)
      .map((c) => ({
        id: str(c.id),
        symbol: str(c.symbol),
        name: str(c.name),
        thumb: str(c.thumb),
      }))
      .filter((c) => c.id !== "");

    return Response.json(coins, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
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

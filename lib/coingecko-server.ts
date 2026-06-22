/* ------------------------------------------------------------------ */
/*  Server-only CoinGecko upstream client.                             */
/*  Imported exclusively by the /api/coingecko route handlers so the   */
/*  (optional) demo API key never reaches the browser.                 */
/* ------------------------------------------------------------------ */

import { fetchWithTimeout, sleep } from "@/lib/http";

const BASE_URL = "https://api.coingecko.com/api/v3";

function authHeaders(): Record<string, string> {
  const key = process.env.COINGECKO_API_KEY;
  // Demo plan key raises the rate limit; the public API works without it.
  return key ? { "x-cg-demo-api-key": key } : {};
}

/**
 * GETs an absolute CoinGecko path (e.g. `/search?query=btc`) with a 10s
 * timeout and a single retry on `429 Too Many Requests`.
 */
export async function coingeckoGet(path: string): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, { headers: authHeaders() });
  if (res.status !== 429) return res;

  // Back off briefly, then try once more.
  await sleep(1_200);
  return fetchWithTimeout(url, { headers: authHeaders() });
}

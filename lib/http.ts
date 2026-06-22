/* ------------------------------------------------------------------ */
/*  Shared server-side fetch helpers (timeout + abort detection).      */
/* ------------------------------------------------------------------ */

interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
}

/** `fetch` with an abort-based timeout. Upstream caching is disabled; the      */
/*  proxy routes set their own Cache-Control. */
export async function fetchWithTimeout(
  url: string,
  { timeoutMs = 10_000, headers }: FetchOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { accept: "application/json", ...headers },
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

/** True when a thrown error is an aborted (timed-out) fetch. */
export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

"use client";

import { useCallback, useRef, useState } from "react";
import { SimulatorForm } from "@/components/SimulatorForm";
import { ResultsPanel, type ResultsStatus } from "@/components/ResultsPanel";
import { calculateDCA } from "@/lib/calculations";
import { CoingeckoError, getHistoricalPrices } from "@/lib/coingecko";
import type { DCAParams, DCAResult } from "@/lib/types";

/** Below this many daily points a DCA simulation isn't meaningful. */
const MIN_DATA_POINTS = 30;

function messageFor(error: unknown): string {
  if (error instanceof CoingeckoError) return error.message;
  if (error instanceof Error) return error.message;
  return "Une erreur inattendue est survenue.";
}

interface SimulatorProps {
  defaultCoin?: string;
}

export function Simulator({ defaultCoin }: SimulatorProps = {}) {
  const [result, setResult] = useState<DCAResult | null>(null);
  const [params, setParams] = useState<DCAParams | null>(null);
  const [status, setStatus] = useState<ResultsStatus>("idle");
  const [error, setError] = useState<string>();

  // Last submitted params, so the error state's "Réessayer" can replay them.
  const lastParams = useRef<DCAParams | null>(null);

  const runSimulation = useCallback(async (next: DCAParams) => {
    lastParams.current = next;
    setStatus("loading");
    setError(undefined);
    try {
      const prices = await getHistoricalPrices(
        next.coinId,
        next.coinSymbol,
        next.startDate,
        next.endDate,
      );
      const computed = calculateDCA(next, prices);

      if (computed.portfolioHistory.length < MIN_DATA_POINTS) {
        throw new Error(
          "Données insuffisantes : moins de 30 jours de cours disponibles sur cette période. Élargissez la plage de dates ou choisissez une crypto plus ancienne.",
        );
      }

      setResult(computed);
      setParams(next);
      setStatus("success");
    } catch (err) {
      setResult(null);
      setError(messageFor(err));
      setStatus("error");
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastParams.current) void runSimulation(lastParams.current);
  }, [runSimulation]);

  return (
    <main className="mt-10 grid flex-1 grid-cols-1 gap-6 md:grid-cols-5">
      <section
        aria-label="Formulaire simulateur"
        className="animate-fade-in-up min-w-0 md:col-span-2"
        style={{ animationDelay: "80ms" }}
      >
        <SimulatorForm
          onSubmit={(p) => void runSimulation(p)}
          isLoading={status === "loading"}
          defaultCoin={defaultCoin}
        />
      </section>

      <section
        aria-label="Résultats"
        className="animate-fade-in-up min-w-0 md:col-span-3"
        style={{ animationDelay: "160ms" }}
      >
        <ResultsPanel
          result={result}
          status={status}
          params={params}
          error={error}
          onRetry={handleRetry}
        />
      </section>
    </main>
  );
}

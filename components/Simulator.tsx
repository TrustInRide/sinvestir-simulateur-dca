"use client";

import { useCallback, useRef, useState } from "react";
import { SimulatorForm } from "@/components/SimulatorForm";
import { ResultsPanel, type ResultsStatus } from "@/components/ResultsPanel";
import { ChartSection } from "@/components/ChartSection";
import { Button } from "@/components/ui/Button";
import { calculateDCA } from "@/lib/calculations";
import { CoingeckoError, getHistoricalPrices } from "@/lib/coingecko";
import type { DCAParams, DCAResult } from "@/lib/types";

const MIN_DATA_POINTS = 30;

function messageFor(error: unknown): string {
  if (error instanceof CoingeckoError) return error.message;
  if (error instanceof Error) return error.message;
  return "Une erreur inattendue est survenue.";
}

interface SimulatorProps {
  defaultCoin?: string;
  embedded?: boolean;
}

export function Simulator({ defaultCoin, embedded = false }: SimulatorProps) {
  const [result, setResult] = useState<DCAResult | null>(null);
  const [params, setParams] = useState<DCAParams | null>(null);
  const [status, setStatus] = useState<ResultsStatus>("idle");
  const [error, setError] = useState<string>();

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
    <div className="flex flex-1 flex-col">
      {/* Two-column: form (2/5) · metrics (3/5) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
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
      </div>

      {/* Action buttons — shown once user has submitted at least once, hidden in embed */}
      {!embedded && (
        <div
          className="animate-fade-in-up mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
          style={{ animationDelay: "240ms" }}
        >
          <Button
            variant="primary"
            size="lg"
            disabled={status !== "success"}
            className="sm:min-w-52"
          >
            <SaveActionIcon />
            Enregistrer la simulation
          </Button>
          <Button
            variant="ghost"
            size="lg"
            disabled={status !== "success"}
            className="sm:min-w-52"
          >
            <ShareIcon />
            Partager mes résultats
          </Button>
        </div>
      )}

      {/* Chart section — full width below both columns */}
      {(status === "success" || status === "loading") && (
        <div
          className="animate-fade-in-up mt-2"
          style={{ animationDelay: "300ms" }}
        >
          <ChartSection result={result} isLoading={status === "loading"} />
        </div>
      )}
    </div>
  );
}

function SaveActionIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2h7.5L13 4.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 2v3.5h5V2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 9.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12.5" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3.5" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12.5" cy="12.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.3 7 10.7 4.3M5.3 9 10.7 11.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

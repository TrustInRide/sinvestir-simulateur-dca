"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SimulatorForm } from "@/components/SimulatorForm";
import { ResultsPanel, type ResultsStatus } from "@/components/ResultsPanel";
import { ChartSection } from "@/components/ChartSection";
import { Button } from "@/components/ui/Button";
import { calculateDCA } from "@/lib/calculations";
import { CoingeckoError, getHistoricalPrices } from "@/lib/coingecko";
import { encodeShareParams, type ShareScenario } from "@/lib/share";
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
  /** A scenario decoded from the URL — restored (and auto-run) on first load. */
  initialScenario?: ShareScenario | null;
}

export function Simulator({
  defaultCoin,
  embedded = false,
  initialScenario,
}: SimulatorProps) {
  const [result, setResult] = useState<DCAResult | null>(null);
  const [params, setParams] = useState<DCAParams | null>(null);
  const [status, setStatus] = useState<ResultsStatus>("idle");
  const [error, setError] = useState<string>();
  const [toast, setToast] = useState<string>();

  const lastParams = useRef<DCAParams | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ranInitial = useRef(false);

  const initialParams = useMemo<DCAParams | null>(() => {
    if (!initialScenario) return null;
    const startDate = new Date(`${initialScenario.startISO}T00:00:00.000Z`);
    const endDate = new Date(`${initialScenario.endISO}T00:00:00.000Z`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return null;
    }
    return {
      coinId: initialScenario.coinId,
      coinName: initialScenario.coinName,
      coinSymbol: initialScenario.coinSymbol,
      amount: initialScenario.amount,
      frequency: initialScenario.frequency,
      startDate,
      endDate,
    };
  }, [initialScenario]);

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

  // Restore a shared simulation the first time the component mounts.
  useEffect(() => {
    if (initialParams && !ranInitial.current) {
      ranInitial.current = true;
      void runSimulation(initialParams);
    }
  }, [initialParams, runSimulation]);

  const flashToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(undefined), 2800);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const handleShare = useCallback(async () => {
    if (!params) return;
    const url = `${window.location.origin}/?${encodeShareParams(params)}`;
    try {
      await navigator.clipboard.writeText(url);
      flashToast("Lien de simulation copié — il rouvre ce résultat à l’identique.");
    } catch {
      flashToast(`Copie impossible. Lien : ${url}`);
    }
  }, [params, flashToast]);

  const handleSave = useCallback(() => {
    flashToast("Connectez-vous à S’investir pour enregistrer vos simulations.");
  }, [flashToast]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Two-column: form (2/5) · metrics (3/5) — stacks below lg to breathe next to the rail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section
          aria-label="Formulaire simulateur"
          className="animate-fade-in-up min-w-0 lg:col-span-2"
          style={{ animationDelay: "80ms" }}
        >
          <SimulatorForm
            onSubmit={(p) => void runSimulation(p)}
            isLoading={status === "loading"}
            defaultCoin={defaultCoin}
            initialCoin={
              initialScenario
                ? {
                    id: initialScenario.coinId,
                    symbol: initialScenario.coinSymbol,
                    name: initialScenario.coinName,
                    thumb: "",
                  }
                : undefined
            }
            initialAmount={initialScenario?.amount}
            initialFrequency={initialScenario?.frequency}
            initialStart={initialScenario?.startISO}
            initialEnd={initialScenario?.endISO}
          />
        </section>

        <section
          aria-label="Résultats"
          className="animate-fade-in-up min-w-0 lg:col-span-3"
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
          className="animate-fade-in-up mt-6 flex flex-col items-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="primary"
              size="lg"
              disabled={status !== "success"}
              onClick={handleSave}
              className="sm:min-w-52"
            >
              <SaveActionIcon />
              Enregistrer la simulation
            </Button>
            <Button
              variant="light"
              size="lg"
              disabled={status !== "success"}
              onClick={() => void handleShare()}
              className="sm:min-w-52"
            >
              <ShareIcon />
              Partager mes résultats
            </Button>
          </div>
          {toast && (
            <p
              role="status"
              aria-live="polite"
              className="animate-fade-in-up text-center text-xs text-muted"
            >
              {toast}
            </p>
          )}
        </div>
      )}

      {/* Chart section — full width below both columns */}
      {(status === "success" || status === "loading") && (
        <div
          className="animate-fade-in-up mt-2"
          style={{ animationDelay: "300ms" }}
        >
          <ChartSection
            result={result}
            isLoading={status === "loading"}
            symbol={params?.coinSymbol}
          />
        </div>
      )}

      {/* Graph disclaimer — shown alongside the results, like the original sim */}
      {status === "success" && (
        <div
          className="animate-fade-in-up mt-6"
          style={{ animationDelay: "340ms" }}
        >
          <GraphDisclaimer />
        </div>
      )}
    </div>
  );
}

function GraphDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-card border border-border bg-surface/40 px-5 py-4">
      <svg
        className="mt-0.5 size-4 shrink-0 text-muted"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <p className="text-xs leading-relaxed text-muted">
        L&rsquo;illustration graphique et les résultats présentés ne constituent pas un
        indicateur fiable quant aux performances futures de vos investissements. Ils ont
        seulement pour but d&rsquo;illustrer les mécanismes de votre investissement sur la
        durée de placement. L&rsquo;évolution de la valeur de votre investissement pourra
        s&rsquo;écarter de ce qui est affiché, à la hausse comme à la baisse. Les gains et
        les pertes peuvent dépasser les montants affichés, respectivement, dans les
        scénarios les plus favorables et les plus défavorables. En poursuivant votre
        navigation, vous reconnaissez avoir pris connaissance de cet avertissement, et
        l&rsquo;avoir compris.
      </p>
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

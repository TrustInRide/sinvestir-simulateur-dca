"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";
import type { DCAParams, DCAResult, Frequency } from "@/lib/types";
import { formatEUR, formatEURSigned, formatPercent, formatUnits } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Singular / plural period word per cadence, for "Investi … en N …". */
const PERIOD_WORD: Record<Frequency, [string, string]> = {
  "one-shot": ["versement", "versements"],
  daily: ["jour", "jours"],
  weekly: ["semaine", "semaines"],
  monthly: ["mois", "mois"],
};

function periodsLabel(frequency: Frequency, n: number): string {
  const [singular, plural] = PERIOD_WORD[frequency];
  return `${n.toLocaleString("fr-FR")} ${n > 1 ? plural : singular}`;
}

export type ResultsStatus = "idle" | "loading" | "success" | "error";

interface ResultsPanelProps {
  result: DCAResult | null;
  status: ResultsStatus;
  params?: DCAParams | null;
  error?: string;
  onRetry?: () => void;
}

export function ResultsPanel({
  result,
  status,
  params,
  error,
  onRetry,
}: ResultsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
        Vos résultats
      </h2>

      {status === "idle" && <IdleState />}
      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState message={error} onRetry={onRetry} />}
      {status === "success" && result && (
        <SuccessState result={result} params={params} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Success                                                           */
/* ------------------------------------------------------------------ */

const FREQUENCY_LABELS: Record<Frequency, string> = {
  "one-shot": "en une fois",
  daily: "chaque jour",
  weekly: "chaque semaine",
  monthly: "chaque mois",
};

const dayMonthYearFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function SuccessState({
  result,
  params,
}: {
  result: DCAResult;
  params?: DCAParams | null;
}) {
  const isGain = result.gainLoss >= 0;

  // Proportion bar segments.
  // Gain: invested (blue) + plus-value (gold). Loss: remaining value (blue) + loss (red).
  const denom = isGain
    ? result.finalValue || 1
    : result.totalInvested || 1;
  const bluePct = clamp((isGain ? result.totalInvested : result.finalValue) / denom);
  const otherPct = 100 - bluePct;

  const symbol = (params?.coinSymbol ?? "").toUpperCase();

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Hero card — Capital final */}
      <Card className="p-5">
        <FieldLabel info="Valeur actuelle de l’ensemble des unités accumulées sur la période.">
          Capital final
        </FieldLabel>
        <div className="animate-fade-in-up mt-1.5 text-3xl font-bold tracking-tight tabular-nums text-foreground sm:text-[2.1rem]">
          {formatEUR(result.finalValue)}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-muted">Investi</span>
            <span className="font-semibold tabular-nums text-primary">
              {formatEUR(result.totalInvested)}
            </span>
            <span className="text-xs text-muted/80">
              · {periodsLabel(params?.frequency ?? "monthly", result.contributions)}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "size-2.5 rounded-full",
                isGain ? "bg-secondary" : "bg-loss",
              )}
              aria-hidden="true"
            />
            <span className="text-muted">
              {isGain ? "Plus-value" : "Moins-value"}
            </span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                isGain ? "text-secondary" : "text-loss",
              )}
            >
              {formatEURSigned(result.gainLoss)}
            </span>
          </span>
        </div>

        {/* Proportion bar */}
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${bluePct}%` }}
          />
          <div
            className={cn(
              "h-full transition-[width] duration-700 ease-out",
              isGain ? "bg-secondary" : "bg-loss",
            )}
            style={{ width: `${otherPct}%` }}
          />
        </div>
      </Card>

      {/* Secondary metrics — Performance · Acquis · Prix moyen d'acquisition */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Performance"
          info="Rendement total sur la période (plus ou moins-value rapportée au total investi)."
          value={formatPercent(result.gainLossPercent)}
          tone={isGain ? "gain" : "loss"}
          badge={
            <Badge variant={isGain ? "gain" : "loss"} withArrow>
              {isGain ? "Gain" : "Perte"}
            </Badge>
          }
        />
        <MetricCard
          label="Acquis"
          info="Quantité totale de crypto accumulée sur la période."
          value={`${formatUnits(result.totalUnits)}${symbol ? ` ${symbol}` : ""}`}
          tone="default"
        />
        <MetricCard
          label="Prix moyen d’acquisition"
          info="Prix moyen payé par unité (total investi ÷ quantité acquise)."
          value={formatEUR(result.averagePrice)}
          tone="default"
        />
      </div>

      {/* Narrative */}
      {params && (
        <Card className="bg-surface/60 p-5">
          <p className="text-sm leading-relaxed text-muted">
            En investissant{" "}
            <strong className="font-semibold text-foreground">
              {formatEUR(params.amount)}
            </strong>{" "}
            {FREQUENCY_LABELS[params.frequency]} en{" "}
            <strong className="font-semibold text-foreground">
              {params.coinName}
            </strong>{" "}
            du {dayMonthYearFmt.format(params.startDate)} au{" "}
            {dayMonthYearFmt.format(params.endDate)}, vous auriez investi{" "}
            <strong className="font-semibold text-foreground">
              {formatEUR(result.totalInvested)}
            </strong>
            , aujourd’hui valorisés{" "}
            <strong className="font-semibold text-foreground">
              {formatEUR(result.finalValue)}
            </strong>{" "}
            — soit{" "}
            <strong
              className={cn(
                "font-semibold",
                isGain ? "text-gain" : "text-loss",
              )}
            >
              {formatEURSigned(result.gainLoss)} ({formatPercent(result.gainLossPercent)})
            </strong>
            .
          </p>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  label,
  info,
  value,
  tone = "default",
  badge,
}: {
  label: string;
  info?: string;
  value: string;
  tone?: "default" | "gain" | "loss";
  badge?: ReactNode;
}) {
  return (
    <Card className="animate-fade-in-up p-4">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel info={info}>{label}</FieldLabel>
        {badge}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight tabular-nums",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function clamp(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(100, ratio * 100));
}

/* ------------------------------------------------------------------ */
/*  Idle                                                              */
/* ------------------------------------------------------------------ */

function IdleState() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card className="p-5">
        <div className="text-[0.8rem] font-medium text-label">Valeur finale</div>
        <div className="mt-2 h-9 w-2/3 rounded bg-white/[0.06]" />
        <div className="mt-5 h-2.5 w-full rounded-full bg-white/[0.05]" />
      </Card>
      <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-card border border-dashed border-border-strong bg-surface/30 p-8">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <ChartGlyph />
          <p className="text-sm text-muted">
            Configurez votre simulation puis lancez le calcul pour découvrir
            performance, plus-value et courbe d’évolution.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading                                                           */
/* ------------------------------------------------------------------ */

function LoadingState() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card className="p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-9 w-1/2 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-2.5 w-full animate-pulse rounded-full bg-white/10" />
      </Card>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-3/4 animate-pulse rounded bg-white/10" />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error                                                             */
/* ------------------------------------------------------------------ */

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-card border border-loss/30 bg-loss/[0.06] p-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-loss/15 text-loss">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v5M12 16.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Le calcul a échoué</p>
        <p className="max-w-xs text-sm text-muted">
          {message ?? "Une erreur est survenue. Réessayez."}
        </p>
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

function ChartGlyph() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 48 48"
      fill="none"
      className="text-border-strong"
      aria-hidden="true"
    >
      <path d="M6 40V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 40h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 32l8-9 7 5 9-14"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="41" cy="14" r="2.5" fill="var(--color-primary)" />
    </svg>
  );
}

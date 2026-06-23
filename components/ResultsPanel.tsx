"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DCAParams, DCAResult, Frequency } from "@/lib/types";
import { formatEUR, formatEURSigned, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ResultsStatus = "idle" | "loading" | "success" | "error";

interface ResultsPanelProps {
  result: DCAResult | null;
  status: ResultsStatus;
  params?: DCAParams | null;
  error?: string;
  onRetry?: () => void;
}

const STATUS_BADGE: Record<
  ResultsStatus,
  { label: string; variant: "neutral" | "gain" | "loss" }
> = {
  idle: { label: "En attente", variant: "neutral" },
  loading: { label: "Calcul…", variant: "neutral" },
  success: { label: "Terminé", variant: "neutral" },
  error: { label: "Erreur", variant: "loss" },
};

export function ResultsPanel({
  result,
  status,
  params,
  error,
  onRetry,
}: ResultsPanelProps) {
  const badge = STATUS_BADGE[status];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Résultats</CardTitle>
            <CardDescription>Performance de votre simulation</CardDescription>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>

      {status === "idle" && <IdleState />}
      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState message={error} onRetry={onRetry} />}
      {status === "success" && result && (
        <SuccessState result={result} params={params} />
      )}

    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Success                                                           */
/* ------------------------------------------------------------------ */

const FREQUENCY_LABELS: Record<Frequency, string> = {
  "one-shot": "Investissement unique",
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
};

const monthYearFmt = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
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

  return (
    <div className="flex flex-1 flex-col">
      {params && <ContextLine params={params} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Metric
          delay="0ms"
          icon={<WalletIcon />}
          label="Total investi"
          value={formatEUR(result.totalInvested)}
        />
        <Metric
          delay="60ms"
          icon={<CoinsIcon />}
          label="Valeur finale"
          value={formatEUR(result.finalValue)}
        />
        <Metric
          delay="120ms"
          icon={<TrendIcon up={isGain} />}
          label="Gain / Perte"
          value={formatEURSigned(result.gainLoss)}
          tone={isGain ? "gain" : "loss"}
        />
        <Metric
          delay="180ms"
          icon={<PercentIcon />}
          label="Performance"
          value={formatPercent(result.gainLossPercent)}
          tone={isGain ? "gain" : "loss"}
          badge={
            <Badge variant={isGain ? "gain" : "loss"} withArrow>
              {formatPercent(result.gainLossPercent)}
            </Badge>
          }
        />
      </div>

    </div>
  );
}

function ContextLine({ params }: { params: DCAParams }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <span className="font-medium text-foreground/80">{params.coinName}</span>
      <Separator />
      <span className="tabular-nums">
        {formatEUR(params.amount)} · {FREQUENCY_LABELS[params.frequency]}
      </span>
      <Separator />
      <span className="tabular-nums">
        {cap(monthYearFmt.format(params.startDate))} →{" "}
        {cap(monthYearFmt.format(params.endDate))}
      </span>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = "default",
  badge,
  delay,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "gain" | "loss";
  badge?: ReactNode;
  delay: string;
}) {
  return (
    <div
      className="animate-fade-in-up rounded-control border border-border bg-background/40 p-4 transition-colors hover:border-border-strong"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span className="text-muted/70">{icon}</span>
          {label}
        </span>
        {badge}
      </div>
      <div
        className={cn(
          "mt-2 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Idle                                                              */
/* ------------------------------------------------------------------ */

function IdleState() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {["Total investi", "Valeur finale", "Gain / Perte", "Performance"].map(
          (label) => (
            <div
              key={label}
              className="rounded-control border border-border bg-background/40 p-4"
            >
              <div className="text-xs text-muted">{label}</div>
              <div className="mt-3 h-6 w-2/3 rounded bg-white/[0.06]" />
            </div>
          ),
        )}
      </div>

      <div className="mt-6 flex min-h-[260px] flex-1 items-center justify-center rounded-control border border-dashed border-border-strong bg-background/30 p-8">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <ChartGlyph />
          <p className="text-sm text-muted">
            Configurez votre simulation pour voir les résultats — performance et
            courbe d’évolution du portefeuille.
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
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-control border border-border bg-background/40 p-4"
          >
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-3/4 animate-pulse rounded bg-white/10" />
          </div>
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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-control border border-loss/30 bg-loss/[0.06] p-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-loss/15 text-loss">
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 8v5M12 16.5h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
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

/* ------------------------------------------------------------------ */
/*  Bits                                                              */
/* ------------------------------------------------------------------ */

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Separator() {
  return (
    <span aria-hidden="true" className="text-border-strong">
      ·
    </span>
  );
}

function WalletIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="3.5"
        width="12"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M11 8h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="4.5" rx="5" ry="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 4.5v3c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-3M3 7.5v3c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function TrendIcon({ up }: { up: boolean }) {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {up ? (
        <>
          <path
            d="M2 11 6.5 6.5 9.5 9 14 4.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 4.5H14V8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M2 5 6.5 9.5 9.5 7 14 11.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 11.5H14V8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 12.5 12.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5" cy="5" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11" cy="11" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
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

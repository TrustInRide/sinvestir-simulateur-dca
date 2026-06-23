"use client";

import { useState } from "react";
import { PortfolioChart } from "@/components/PortfolioChart";
import { HistoriqueChart } from "@/components/HistoriqueChart";
import type { DCAResult } from "@/lib/types";
import { formatEUR, formatEURSigned, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tab = "graphiques" | "calendrier";
type ChartType = "gains-pertes" | "historique";

interface ChartSectionProps {
  result: DCAResult | null;
  isLoading: boolean;
}

export function ChartSection({ result, isLoading }: ChartSectionProps) {
  const [tab, setTab] = useState<Tab>("graphiques");
  const [chartType, setChartType] = useState<ChartType>("gains-pertes");

  return (
    <div className="mt-8">
      {/* Tab bar */}
      <div className="flex gap-1">
        {(["graphiques", "calendrier"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "border border-border-strong bg-white/[0.08] text-foreground"
                : "border border-transparent text-muted hover:text-foreground",
            )}
          >
            {t === "graphiques" ? <GraphIcon /> : <CalendarIcon />}
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </div>

      {tab === "graphiques" && (
        <div className="mt-6">
          {/* Large metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <LargeMetric
              label="Total investi"
              value={result ? formatEUR(result.totalInvested) : "—"}
            />
            <LargeMetric
              label="Valeur finale"
              value={result ? formatEUR(result.finalValue) : "—"}
            />
            <LargeMetric
              label="Gain / Perte"
              value={result ? formatEURSigned(result.gainLoss) : "—"}
              tone={
                result
                  ? result.gainLoss >= 0
                    ? "gain"
                    : "loss"
                  : "default"
              }
              sub={result ? formatPercent(result.gainLossPercent) : undefined}
            />
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <span className="text-xs text-muted">Type de graphique</span>
            <div className="flex gap-0.5 rounded-lg bg-white/[0.06] p-1">
              <button
                onClick={() => setChartType("gains-pertes")}
                title="Gains / Pertes"
                className={cn(
                  "rounded p-1.5 transition-colors",
                  chartType === "gains-pertes"
                    ? "bg-white/10 text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                <LineChartIcon />
              </button>
              <button
                onClick={() => setChartType("historique")}
                title="Historique"
                className={cn(
                  "rounded p-1.5 transition-colors",
                  chartType === "historique"
                    ? "bg-white/10 text-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                <MultiLineIcon />
              </button>
            </div>
          </div>

          {/* Chart */}
          {chartType === "gains-pertes" ? (
            <PortfolioChart
              data={result?.portfolioHistory ?? null}
              isLoading={isLoading}
            />
          ) : (
            <HistoriqueChart
              data={result?.portfolioHistory ?? null}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {tab === "calendrier" && (
        <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-control border border-dashed border-border-strong bg-white/[0.02] text-sm text-muted">
          Vue Calendrier — fonctionnalité à venir
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Large metric                                                       */
/* ------------------------------------------------------------------ */

function LargeMetric({
  label,
  value,
  tone = "default",
  sub,
}: {
  label: string;
  value: string;
  tone?: "default" | "gain" | "loss";
  sub?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums tracking-tight",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "text-xs tabular-nums mt-0.5",
            tone === "gain" && "text-gain/70",
            tone === "loss" && "text-loss/70",
            tone === "default" && "text-muted",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function GraphIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 12l3-4 3 2 3-5 3 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LineChartIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 11 6 7l3 3 5-6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MultiLineIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12 5 8l3 1 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 13.5 6 10l2 2 6-5" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

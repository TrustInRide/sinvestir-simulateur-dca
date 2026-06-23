"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { HistoriqueChart } from "@/components/HistoriqueChart";
import { GainsPertesChart } from "@/components/GainsPertesChart";
import type { DCAResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "graphiques" | "calendrier";

interface ChartSectionProps {
  result: DCAResult | null;
  isLoading: boolean;
  symbol?: string;
}

export function ChartSection({ result, isLoading, symbol }: ChartSectionProps) {
  const [tab, setTab] = useState<Tab>("graphiques");

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
        <div className="mt-6 space-y-6">
          <ChartPanel title="Historique" icon={<ChartBarsIcon />}>
            <HistoriqueChart
              data={result?.portfolioHistory ?? null}
              isLoading={isLoading}
              unitSymbol={symbol}
            />
          </ChartPanel>

          <ChartPanel title="Gains / Pertes" icon={<ChartBarsIcon />}>
            <GainsPertesChart
              data={result?.portfolioHistory ?? null}
              isLoading={isLoading}
            />
          </ChartPanel>
        </div>
      )}

      {tab === "calendrier" && (
        <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-card border border-dashed border-border-strong bg-white/[0.02] text-sm text-muted">
          Vue Calendrier — fonctionnalité à venir
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart panel — branded title header + body (mirrors the crypto sim) */
/* ------------------------------------------------------------------ */

function ChartPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-border-strong bg-surface/60">
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-primary to-[#0a6fd8] px-4 py-2.5 text-white">
        <span className="text-white/90">{icon}</span>
        <span className="text-sm font-semibold tracking-wide">{title}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function GraphIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12l3-4 3 2 3-5 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

function ChartBarsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 14V2M2 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="4" y="8" width="2.2" height="4" rx="0.6" fill="currentColor" />
      <rect x="7.4" y="5" width="2.2" height="7" rx="0.6" fill="currentColor" />
      <rect x="10.8" y="9.5" width="2.2" height="2.5" rx="0.6" fill="currentColor" />
    </svg>
  );
}

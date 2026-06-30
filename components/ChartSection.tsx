"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { HistoriqueChart } from "@/components/HistoriqueChart";
import { GainsPertesChart } from "@/components/GainsPertesChart";
import type { ContributionEvent, DCAResult } from "@/lib/types";
import { formatEUR, formatUnits } from "@/lib/format";
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
        <div className="mt-6">
          <ContributionsTable schedule={result?.schedule ?? null} symbol={symbol} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendrier — per-purchase breakdown table                         */
/* ------------------------------------------------------------------ */

const ROW_CAP = 366;

const calDateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function ContributionsTable({
  schedule,
  symbol,
}: {
  schedule: ContributionEvent[] | null;
  symbol?: string;
}) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-card border border-dashed border-border-strong bg-white/[0.02] px-6 text-center text-sm text-muted">
        Lancez une simulation pour détailler chaque versement, jour par jour.
      </div>
    );
  }

  const sym = (symbol ?? "").toUpperCase();
  const truncated = schedule.length > ROW_CAP;
  const rows = truncated ? schedule.slice(-ROW_CAP) : schedule;

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        {schedule.length.toLocaleString("fr-FR")} versement
        {schedule.length > 1 ? "s" : ""} sur la période
        {truncated && ` · affichage des ${ROW_CAP} plus récents`}
      </p>

      <div className="max-h-[480px] overflow-auto rounded-card border border-border-strong">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface text-xs font-medium text-muted">
            <tr>
              <Th className="text-left">Date</Th>
              <Th>Prix unitaire</Th>
              <Th>Investi</Th>
              <Th>Unités{sym ? ` (${sym})` : ""}</Th>
              <Th>Cumul investi</Th>
              <Th>Valeur</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e, i) => (
              <tr
                key={`${e.date.getTime()}-${i}`}
                className="border-t border-border transition-colors hover:bg-white/[0.03]"
              >
                <Td className="whitespace-nowrap text-left text-foreground">
                  {calDateFmt.format(e.date)}
                </Td>
                <Td>{formatEUR(e.price)}</Td>
                <Td>{formatEUR(e.amount)}</Td>
                <Td>{formatUnits(e.units)}</Td>
                <Td>{formatEUR(e.cumulativeInvested)}</Td>
                <Td className="font-medium text-foreground">
                  {formatEUR(e.portfolioValue)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-2.5 text-right font-medium", className)}>
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-2 text-right tabular-nums text-muted", className)}>
      {children}
    </td>
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

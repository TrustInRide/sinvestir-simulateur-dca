"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PortfolioPoint } from "@/lib/types";
import { formatEUR, formatEURCompact, formatUnits } from "@/lib/format";

const VALEUR = "#1098f7"; // portfolio value (blue area)
const INVESTI = "#f8d047"; // cumulative invested (gold)
const ACQUIS = "#a78bfa"; // accumulated units (purple, right axis)
const AXIS = "#6b7280";

const MAX_POINTS = 420;

interface HistoriqueDatum {
  t: number;
  value: number;
  invested: number;
  units: number;
}

function prepare(points: PortfolioPoint[]): HistoriqueDatum[] {
  const n = points.length;
  const src =
    n <= MAX_POINTS
      ? points
      : Array.from(
          { length: MAX_POINTS },
          (_, i) => points[Math.round((i * (n - 1)) / (MAX_POINTS - 1))],
        );
  return src.map((p) => ({
    t: p.date.getTime(),
    value: p.value,
    invested: p.invested,
    units: p.units,
  }));
}

const axisMonthFmt = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "2-digit",
});
const tooltipDateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatAxisDate(t: number): string {
  const label = axisMonthFmt.format(new Date(t)).replace(/\./g, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface HistoriqueChartProps {
  data: PortfolioPoint[] | null;
  isLoading: boolean;
  unitSymbol?: string;
}

export function HistoriqueChart({ data, isLoading, unitSymbol }: HistoriqueChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!data || data.length === 0) return null;

  const chartData = prepare(data);
  const sym = (unitSymbol ?? "").toUpperCase();

  return (
    <div className="w-full">
      <ChartLegend sym={sym} />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 56, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="hist-valeur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VALEUR} stopOpacity={0.28} />
              <stop offset="100%" stopColor={VALEUR} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="1 1" stroke="#ffffff08" vertical={false} />

          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatAxisDate}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={44}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          {/* Left Y — euros (value & invested) */}
          <YAxis
            yAxisId="eur"
            orientation="left"
            tickFormatter={formatEURCompact}
            width={60}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            domain={[0, "auto"]}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          {/* Right Y — accumulated units */}
          <YAxis
            yAxisId="units"
            orientation="right"
            tickFormatter={(v: number) => formatUnits(v)}
            width={56}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            domain={[0, "auto"]}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          <Tooltip content={<CustomTooltip sym={sym} />} cursor={{ stroke: "#ffffff20", strokeWidth: 1 }} />

          <Area
            yAxisId="eur"
            type="monotone"
            dataKey="value"
            name="Valeur"
            stroke={VALEUR}
            strokeWidth={2.4}
            fill="url(#hist-valeur)"
            activeDot={{ r: 4, fill: VALEUR, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
          />
          <Line
            yAxisId="eur"
            type="stepAfter"
            dataKey="invested"
            name="Investi"
            stroke={INVESTI}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
            animationDuration={650}
          />
          <Line
            yAxisId="units"
            type="monotone"
            dataKey="units"
            name="Acquis"
            stroke={ACQUIS}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: ACQUIS, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend({ sym }: { sym: string }) {
  const items = [
    { color: VALEUR, label: "Valeur du portefeuille" },
    { color: INVESTI, label: "Total investi" },
    { color: ACQUIS, label: sym ? `Acquis (${sym})` : "Acquis" },
  ];
  return (
    <div className="mb-3 flex flex-wrap items-center justify-end gap-4 text-xs text-muted">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

interface TooltipPayload {
  payload: HistoriqueDatum;
}

function CustomTooltip({
  active,
  payload,
  sym,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  sym: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="min-w-44 rounded-lg border border-border-strong bg-surface px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
      <p className="mb-2 text-xs font-medium text-foreground">
        {tooltipDateFmt.format(new Date(d.t))}
      </p>
      <dl className="space-y-1.5 text-xs">
        <Row color={VALEUR} label="Valeur" value={formatEUR(d.value)} />
        <Row color={INVESTI} label="Investi" value={formatEUR(d.invested)} />
        <Row color={ACQUIS} label="Acquis" value={`${formatUnits(d.units)}${sym ? ` ${sym}` : ""}`} />
      </dl>
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="inline-flex items-center gap-1.5 text-muted">
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-end gap-4">
        {[28, 20, 24].map((w) => (
          <div key={w} className="h-3 animate-pulse rounded bg-white/10" style={{ width: w * 4 }} />
        ))}
      </div>
      <div className="relative h-[300px] w-full overflow-hidden rounded-control bg-white/[0.03]">
        <div className="absolute inset-0 flex flex-col justify-between py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-white/[0.04]" />
          ))}
        </div>
        <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-white/[0.04] to-transparent" />
      </div>
    </div>
  );
}

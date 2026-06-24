"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PortfolioPoint } from "@/lib/types";
import { formatEUR, formatEURCompact, formatEURSigned } from "@/lib/format";

const VALEUR = "#1098f7"; // portfolio value (blue line)
const INVESTI = "#f8d047"; // cumulative invested (gold line)
const GAIN = "#22c55e"; // plus / minus value (green area)
const AXIS = "#6b7280";
const MAX_POINTS = 420;

interface PnLDatum {
  t: number;
  valeur: number;
  investi: number;
  gains: number;
}

function prepare(points: PortfolioPoint[]): PnLDatum[] {
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
    valeur: p.value,
    investi: p.invested,
    gains: p.value - p.invested,
  }));
}

const axisMonthFmt = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" });
const tooltipDateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatAxisDate(t: number): string {
  const label = axisMonthFmt.format(new Date(t)).replace(/\./g, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface GainsPertesChartProps {
  data: PortfolioPoint[] | null;
  isLoading: boolean;
}

export function GainsPertesChart({ data, isLoading }: GainsPertesChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!data || data.length === 0) return null;

  const chartData = prepare(data);

  return (
    <div className="w-full">
      <ChartLegend />
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="pnl-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GAIN} stopOpacity={0.3} />
              <stop offset="100%" stopColor={GAIN} stopOpacity={0.02} />
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
          <YAxis
            tickFormatter={formatEURCompact}
            width={60}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            domain={["auto", "auto"]}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          <ReferenceLine y={0} stroke="#ffffff20" strokeWidth={1} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff20", strokeWidth: 1 }} />

          {/* Gains / Pertes (area) */}
          <Area
            type="monotone"
            dataKey="gains"
            name="Gains / Pertes"
            stroke={GAIN}
            strokeWidth={2.2}
            fill="url(#pnl-fill)"
            activeDot={{ r: 4, fill: GAIN, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
          />
          {/* Valeur (line) */}
          <Line
            type="monotone"
            dataKey="valeur"
            name="Valeur"
            stroke={VALEUR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: VALEUR, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
          />
          {/* Investi (line) */}
          <Line
            type="stepAfter"
            dataKey="investi"
            name="Investi"
            stroke={INVESTI}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
            animationDuration={650}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend() {
  const items = [
    { color: VALEUR, label: "Valeur du portefeuille" },
    { color: INVESTI, label: "Total investi" },
    { color: GAIN, label: "Gains / Pertes" },
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
  payload: PnLDatum;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const positive = d.gains >= 0;

  return (
    <div className="min-w-44 rounded-lg border border-border-strong bg-surface px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
      <p className="mb-2 text-xs font-medium text-foreground">
        {tooltipDateFmt.format(new Date(d.t))}
      </p>
      <dl className="space-y-1.5 text-xs">
        <Row color={VALEUR} label="Valeur" value={formatEUR(d.valeur)} />
        <Row color={INVESTI} label="Investi" value={formatEUR(d.investi)} />
        <div className="flex items-center justify-between gap-6">
          <dt className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full" style={{ backgroundColor: GAIN }} />
            Gains / Pertes
          </dt>
          <dd className={positive ? "font-semibold tabular-nums text-gain" : "font-semibold tabular-nums text-loss"}>
            {formatEURSigned(d.gains)}
          </dd>
        </div>
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
      <div className="relative h-[280px] w-full overflow-hidden rounded-control bg-white/[0.03]">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-white/[0.04] to-transparent" />
      </div>
    </div>
  );
}

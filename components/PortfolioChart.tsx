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
import { formatEUR, formatEURCompact, formatPercent } from "@/lib/format";

const PRIMARY = "#1098f7"; // Valeur
const SECONDARY = "#f8d047"; // Investi
const AXIS = "#6b7280";
const PAGE_BG = "#141414";

/** Cap on rendered points — keeps the curve smooth and hover snappy on long ranges. */
const MAX_POINTS = 420;

interface ChartDatum {
  /** Epoch ms — drives the time-scaled X axis. */
  t: number;
  value: number;
  invested: number;
}

/* ------------------------------------------------------------------ */
/*  Data prep & formatting                                            */
/* ------------------------------------------------------------------ */

const toDatum = (p: PortfolioPoint): ChartDatum => ({
  t: p.date.getTime(),
  value: Math.max(0, p.value),
  invested: p.invested,
});

/**
 * Even-stride downsample that always keeps the first and last observation, so
 * the final portfolio value (and its dot) is never dropped.
 */
function prepare(points: PortfolioPoint[]): ChartDatum[] {
  const n = points.length;
  if (n <= MAX_POINTS) return points.map(toDatum);

  const out: ChartDatum[] = [];
  const step = (n - 1) / (MAX_POINTS - 1);
  for (let i = 0; i < MAX_POINTS; i++) {
    out.push(toDatum(points[Math.round(i * step)]));
  }
  const last = toDatum(points[n - 1]);
  if (out[out.length - 1].t !== last.t) out.push(last);
  return out;
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

/** `Janv 24`, `Févr 24` — capitalised, dot stripped for cleaner ticks. */
function formatAxisDate(t: number): string {
  const label = axisMonthFmt.format(new Date(t)).replace(/\./g, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface PortfolioChartProps {
  data: PortfolioPoint[] | null;
  isLoading: boolean;
}

export function PortfolioChart({ data, isLoading }: PortfolioChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!data || data.length === 0) return null;

  const chartData = prepare(data);
  const lastIndex = chartData.length - 1;
  const renderLastDot = makeLastDot(lastIndex);

  return (
    <div className="w-full">
      <ChartLegend />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.26} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="1 1"
            stroke="#ffffff08"
            vertical={false}
          />

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
            domain={[0, "auto"]}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#ffffff20", strokeWidth: 1 }}
          />

          {/* Soft gradient under the value line — atmosphere, not a 3rd series. */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#valueFill)"
            isAnimationActive={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Valeur"
            stroke={PRIMARY}
            strokeWidth={2.5}
            dot={renderLastDot}
            activeDot={{
              r: 4,
              fill: PRIMARY,
              stroke: PAGE_BG,
              strokeWidth: 2,
            }}
            animationDuration={650}
          />
          <Line
            type="monotone"
            dataKey="invested"
            name="Investi"
            stroke={SECONDARY}
            strokeWidth={2}
            dot={false}
            activeDot={false}
            animationDuration={650}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                            */
/* ------------------------------------------------------------------ */

function ChartLegend() {
  return (
    <div className="mb-3 flex items-center justify-end gap-4 text-xs text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: PRIMARY }}
        />
        Valeur du portefeuille
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: SECONDARY }}
        />
        Total investi
      </span>
    </div>
  );
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

/** Renders a dot only on the final point of the value line. */
function makeLastDot(lastIndex: number) {
  return function LastDot({ cx, cy, index }: DotProps) {
    if (index !== lastIndex || cx == null || cy == null) {
      return <g key={`empty-${index}`} />;
    }
    return (
      <g key="last-dot">
        <circle cx={cx} cy={cy} r={6} fill={PRIMARY} fillOpacity={0.2} />
        <circle
          cx={cx}
          cy={cy}
          r={3.5}
          fill={PRIMARY}
          stroke={PAGE_BG}
          strokeWidth={1.5}
        />
      </g>
    );
  };
}

interface TooltipPayloadItem {
  payload: ChartDatum;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const perf = d.invested > 0 ? ((d.value - d.invested) / d.invested) * 100 : 0;
  const isGain = perf >= 0;

  return (
    <div className="min-w-44 rounded-lg border border-border-strong bg-surface px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
      <p className="mb-2 text-xs font-medium text-foreground">
        {tooltipDateFmt.format(new Date(d.t))}
      </p>
      <dl className="space-y-1.5 text-xs">
        <TooltipRow
          color={PRIMARY}
          label="Valeur"
          value={formatEUR(d.value)}
        />
        <TooltipRow
          color={SECONDARY}
          label="Investi"
          value={formatEUR(d.invested)}
        />
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-border pt-1.5">
          <dt className="text-muted">Performance</dt>
          <dd
            className={`font-semibold tabular-nums ${isGain ? "text-gain" : "text-loss"}`}
          >
            {formatPercent(perf)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="inline-flex items-center gap-1.5 text-muted">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full">
      {/* legend placeholder */}
      <div className="mb-3 flex items-center justify-end gap-4">
        <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
      </div>
      <div className="relative h-[300px] w-full overflow-hidden rounded-control bg-white/[0.03]">
        {/* faux gridlines */}
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

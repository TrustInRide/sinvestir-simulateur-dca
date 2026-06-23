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

const GAIN = "#22c55e"; // plus/minus value (green area)
const PRICE = "#38bdf8"; // crypto price (sky-blue line, right axis)
const AXIS = "#6b7280";
const MAX_POINTS = 420;

interface PnLDatum {
  t: number;
  pv: number;
  price: number | null;
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
  let lastPrice: number | null = null;
  return src.map((p) => {
    const price = p.units > 0 ? p.value / p.units : lastPrice;
    if (price !== null) lastPrice = price;
    return { t: p.date.getTime(), pv: p.value - p.invested, price };
  });
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
      <div className="mb-3 flex flex-wrap items-center justify-end gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: GAIN }} />
          Plus / moins-value
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: PRICE }} />
          Prix de la crypto
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 56, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="pnl-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GAIN} stopOpacity={0.32} />
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

          {/* Left Y — plus/minus value (€) */}
          <YAxis
            yAxisId="pv"
            orientation="left"
            tickFormatter={formatEURCompact}
            width={60}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            domain={["auto", "auto"]}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          {/* Right Y — crypto price (€) */}
          <YAxis
            yAxisId="price"
            orientation="right"
            tickFormatter={formatEURCompact}
            width={56}
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            domain={[0, "auto"]}
            tick={{ fill: AXIS, fontSize: 11 }}
          />

          <ReferenceLine yAxisId="pv" y={0} stroke="#ffffff20" strokeWidth={1} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff20", strokeWidth: 1 }} />

          <Area
            yAxisId="pv"
            type="monotone"
            dataKey="pv"
            name="Plus / moins-value"
            stroke={GAIN}
            strokeWidth={2.2}
            fill="url(#pnl-fill)"
            activeDot={{ r: 4, fill: GAIN, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            name="Prix de la crypto"
            stroke={PRICE}
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 4, fill: PRICE, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
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
  const positive = d.pv >= 0;

  return (
    <div className="min-w-44 rounded-lg border border-border-strong bg-surface px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
      <p className="mb-2 text-xs font-medium text-foreground">
        {tooltipDateFmt.format(new Date(d.t))}
      </p>
      <dl className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-6">
          <dt className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full" style={{ backgroundColor: GAIN }} />
            Plus / moins-value
          </dt>
          <dd className={positive ? "font-semibold tabular-nums text-gain" : "font-semibold tabular-nums text-loss"}>
            {formatEURSigned(d.pv)}
          </dd>
        </div>
        {d.price !== null && (
          <div className="flex items-center justify-between gap-6">
            <dt className="inline-flex items-center gap-1.5 text-muted">
              <span className="size-2 rounded-full" style={{ backgroundColor: PRICE }} />
              Prix
            </dt>
            <dd className="font-medium tabular-nums text-foreground">{formatEUR(d.price)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-end gap-4">
        <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div className="relative h-[260px] w-full overflow-hidden rounded-control bg-white/[0.03]">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-white/[0.04] to-transparent" />
      </div>
    </div>
  );
}

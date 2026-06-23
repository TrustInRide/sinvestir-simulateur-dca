"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PortfolioPoint } from "@/lib/types";
import { formatEUR, formatEURCompact } from "@/lib/format";

const PRIMARY = "#1098f7";
const SECONDARY = "#f8d047";
const UNITS_COLOR = "#a78bfa";
const AXIS = "#6b7280";

const MAX_POINTS = 420;

interface HistoriqueDatum {
  t: number;
  price: number | null;
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

  let lastPrice: number | null = null;
  return src.map((p) => {
    const price = p.units > 0 ? p.value / p.units : lastPrice;
    if (price !== null) lastPrice = price;
    return { t: p.date.getTime(), price, invested: p.invested, units: p.units };
  });
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

function formatUnits(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 0.01) return n.toFixed(6);
  if (n < 1) return n.toFixed(4);
  if (n < 1000) return n.toFixed(3);
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

interface HistoriqueChartProps {
  data: PortfolioPoint[] | null;
  isLoading: boolean;
}

export function HistoriqueChart({ data, isLoading }: HistoriqueChartProps) {
  if (isLoading) return <ChartSkeleton />;
  if (!data || data.length === 0) return null;

  const chartData = prepare(data);

  return (
    <div className="w-full">
      <ChartLegend />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 56, bottom: 0, left: 0 }}
        >
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

          {/* Left Y — price & invested (€) */}
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

          {/* Right Y — crypto units */}
          <YAxis
            yAxisId="units"
            orientation="right"
            tickFormatter={formatUnits}
            width={56}
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

          <Line
            yAxisId="eur"
            type="monotone"
            dataKey="price"
            name="Prix"
            stroke={PRIMARY}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: PRIMARY, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
            connectNulls
          />
          <Line
            yAxisId="eur"
            type="stepAfter"
            dataKey="invested"
            name="Investi"
            stroke={SECONDARY}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
            animationDuration={650}
          />
          <Line
            yAxisId="units"
            type="stepAfter"
            dataKey="units"
            name="Unités"
            stroke={UNITS_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: UNITS_COLOR, stroke: "#09090f", strokeWidth: 2 }}
            animationDuration={650}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend() {
  const items = [
    { color: PRIMARY, label: "Prix de la crypto" },
    { color: SECONDARY, label: "Total investi" },
    { color: UNITS_COLOR, label: "Unités accumulées" },
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
  name: string;
  color: string;
  value: number | null;
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

  return (
    <div className="min-w-44 rounded-lg border border-border-strong bg-surface px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]">
      <p className="mb-2 text-xs font-medium text-foreground">
        {tooltipDateFmt.format(new Date(d.t))}
      </p>
      <dl className="space-y-1.5 text-xs">
        {d.price !== null && (
          <Row color={PRIMARY} label="Prix" value={formatEUR(d.price)} />
        )}
        <Row color={SECONDARY} label="Investi" value={formatEUR(d.invested)} />
        <Row color={UNITS_COLOR} label="Unités" value={formatUnits(d.units)} />
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
        {[28, 20, 32].map((w) => (
          <div key={w} className={`h-3 w-${w} animate-pulse rounded bg-white/10`} />
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

/* ------------------------------------------------------------------ */
/*  DCA simulation engine.                                             */
/* ------------------------------------------------------------------ */

import type {
  ContributionEvent,
  DCAParams,
  DCAResult,
  Frequency,
  PortfolioPoint,
  PricePoint,
} from "@/lib/types";

const DAY_MS = 86_400_000;

interface DailyBucket {
  /** UTC midnight of the day. */
  date: Date;
  price: number;
}

/** Epoch-ms of the UTC midnight starting the day that contains `ms`. */
function startOfUTCDay(ms: number): number {
  return Math.floor(ms / DAY_MS) * DAY_MS;
}

function daysInUTCMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Collapses raw price points to one representative price per UTC day.
 *
 * CoinGecko's granularity depends on the range (5-min / hourly / daily), so a
 * naive "every point" cadence would over-count. Bucketing to one price per day
 * (the first observation, ≈ the daily open) makes the cadence logic correct and
 * deterministic regardless of how the upstream returned the data.
 */
function bucketByDay(prices: PricePoint[]): DailyBucket[] {
  const byDay = new Map<number, number>();
  for (const { timestamp, price } of prices) {
    if (!Number.isFinite(timestamp) || !Number.isFinite(price)) continue;
    const day = startOfUTCDay(timestamp);
    if (!byDay.has(day)) byDay.set(day, price);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, price]) => ({ date: new Date(day), price }));
}

/**
 * Indices of the daily buckets on which an investment occurs, per frequency.
 * Always returns at least one index (the first available day) so a range too
 * short for the chosen cadence still yields a single investment.
 */
function investmentIndices(
  buckets: DailyBucket[],
  frequency: Frequency,
  startDate: Date,
): Set<number> {
  const indices = new Set<number>();
  if (buckets.length === 0) return indices;

  switch (frequency) {
    case "one-shot":
      indices.add(0);
      break;
    case "daily":
      buckets.forEach((_, i) => indices.add(i));
      break;
    case "weekly": {
      const weekday = startDate.getUTCDay();
      buckets.forEach((b, i) => {
        if (b.date.getUTCDay() === weekday) indices.add(i);
      });
      break;
    }
    case "monthly": {
      const dom = startDate.getUTCDate();
      buckets.forEach((b, i) => {
        const inMonth = daysInUTCMonth(
          b.date.getUTCFullYear(),
          b.date.getUTCMonth(),
        );
        // Clamp e.g. the 31st to the last day of shorter months.
        if (b.date.getUTCDate() === Math.min(dom, inMonth)) indices.add(i);
      });
      break;
    }
  }

  if (indices.size === 0) indices.add(0);
  return indices;
}

/**
 * Runs a Dollar-Cost-Averaging simulation.
 *
 * @throws if the period is invalid or no price data covers it.
 */
export function calculateDCA(
  params: DCAParams,
  prices: PricePoint[],
): DCAResult {
  const { amount, frequency, startDate, endDate } = params;

  if (startDate.getTime() >= endDate.getTime()) {
    throw new Error("Période invalide");
  }
  if (!prices || prices.length === 0) {
    throw new Error("Aucune donnée disponible pour cette période");
  }

  const lo = startOfUTCDay(startDate.getTime());
  const hi = startOfUTCDay(endDate.getTime());
  const buckets = bucketByDay(prices).filter((b) => {
    const t = b.date.getTime();
    return t >= lo && t <= hi;
  });

  if (buckets.length === 0) {
    throw new Error("Aucune donnée disponible pour cette période");
  }

  const investDays = investmentIndices(buckets, frequency, startDate);

  let units = 0;
  let invested = 0;
  let contributions = 0;
  const schedule: ContributionEvent[] = [];
  const portfolioHistory: PortfolioPoint[] = buckets.map((bucket, i) => {
    // Buy first (at this day's price), then snapshot the portfolio so the
    // value reflects the freshly purchased units.
    if (investDays.has(i) && bucket.price > 0) {
      const bought = amount / bucket.price;
      units += bought;
      invested += amount;
      contributions += 1;
      schedule.push({
        date: bucket.date,
        price: bucket.price,
        amount,
        units: bought,
        cumulativeInvested: invested,
        cumulativeUnits: units,
        portfolioValue: units * bucket.price,
      });
    }
    return {
      date: bucket.date,
      value: units * bucket.price,
      invested,
      units,
    };
  });

  const lastPrice = buckets[buckets.length - 1].price;
  const finalValue = units * lastPrice;
  const gainLoss = finalValue - invested;
  const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;
  const averagePrice = units > 0 ? invested / units : 0;

  return {
    totalInvested: invested,
    finalValue,
    gainLoss,
    gainLossPercent,
    totalUnits: units,
    contributions,
    averagePrice,
    portfolioHistory,
    schedule,
  };
}

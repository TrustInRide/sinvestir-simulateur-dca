/* ------------------------------------------------------------------ */
/*  Domain types — shared across API layer, calculations and UI.       */
/* ------------------------------------------------------------------ */

/** A coin as returned by CoinGecko's `/search` endpoint (trimmed). */
export interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

/** A single market price observation. `timestamp` is epoch **milliseconds**. */
export interface PricePoint {
  timestamp: number;
  price: number;
}

/** Investment cadence for the DCA simulation. */
export type Frequency = "one-shot" | "daily" | "weekly" | "monthly";

/** User-supplied parameters driving a simulation. */
export interface DCAParams {
  coinId: string;
  coinName: string;
  /** Ticker (e.g. `BTC`) — used to resolve the Coinbase EUR pair. */
  coinSymbol: string;
  amount: number;
  frequency: Frequency;
  startDate: Date;
  endDate: Date;
}

/** One point on the portfolio value curve (one per calendar day in range). */
export interface PortfolioPoint {
  date: Date;
  /** Portfolio market value on that day: `units × price`. */
  value: number;
  /** Cumulative amount invested up to and including that day. */
  invested: number;
  /** Cumulative coin units held up to and including that day. */
  units: number;
}

/** A single executed purchase (one row of the "Calendrier" table). */
export interface ContributionEvent {
  /** Day of the purchase. */
  date: Date;
  /** Unit price paid that day. */
  price: number;
  /** Amount invested that day (the recurring amount). */
  amount: number;
  /** Units bought that day: `amount / price`. */
  units: number;
  /** Cumulative amount invested up to and including this purchase. */
  cumulativeInvested: number;
  /** Cumulative units held up to and including this purchase. */
  cumulativeUnits: number;
  /** Portfolio market value right after this purchase. */
  portfolioValue: number;
}

/** Outcome of a DCA simulation. */
export interface DCAResult {
  totalInvested: number;
  finalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  totalUnits: number;
  /** Number of effective purchases (used for "Investi … en N versements"). */
  contributions: number;
  /** Average acquisition price: `totalInvested / totalUnits`. */
  averagePrice: number;
  portfolioHistory: PortfolioPoint[];
  /** Per-purchase breakdown powering the "Calendrier" table. */
  schedule: ContributionEvent[];
}

"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CryptoSearch } from "@/components/CryptoSearch";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { CoinSearchResult, DCAParams, Frequency } from "@/lib/types";

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "one-shot", label: "Investissement unique" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
];

const MIN_DATE = "2010-01-01";

/** `YYYY-MM-DD` for a date, read in UTC. */
function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses an `<input type="date">` value as UTC midnight. */
function parseISODate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

interface SimulatorFormProps {
  onSubmit: (params: DCAParams) => void;
  isLoading: boolean;
  defaultCoin?: string;
}

interface TouchedState {
  coin: boolean;
  amount: boolean;
  start: boolean;
  end: boolean;
}

export function SimulatorForm({ onSubmit, isLoading, defaultCoin }: SimulatorFormProps) {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const defaultStartISO = useMemo(() => {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - 3);
    return toISODate(d);
  }, []);

  const [coin, setCoin] = useState<CoinSearchResult | null>(null);
  const [amount, setAmount] = useState("50");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [start, setStart] = useState(defaultStartISO);
  const [end, setEnd] = useState(todayISO);
  const [touched, setTouched] = useState<TouchedState>({
    coin: false,
    amount: false,
    start: false,
    end: false,
  });

  const amountValue = Number(amount);
  const startDate = start ? parseISODate(start) : null;
  const endDate = end ? parseISODate(end) : null;

  const errors = {
    coin: !coin ? "Sélectionnez une cryptomonnaie." : undefined,
    amount:
      amount.trim() === "" || !Number.isFinite(amountValue) || amountValue < 1
        ? "Montant minimum : 1 €."
        : undefined,
    start: !start ? "Date de début requise." : undefined,
    end: !end
      ? "Date de fin requise."
      : startDate && endDate && endDate.getTime() <= startDate.getTime()
        ? "La date de fin doit être postérieure au début."
        : undefined,
  };

  const isValid = !errors.coin && !errors.amount && !errors.start && !errors.end;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ coin: true, amount: true, start: true, end: true });
    if (!isValid || !coin || !startDate || !endDate) return;
    onSubmit({
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol,
      amount: amountValue,
      frequency,
      startDate,
      endDate,
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Paramètres</CardTitle>
        <CardDescription>Configurez votre stratégie d’investissement</CardDescription>
      </CardHeader>

      <form className="@container space-y-4" onSubmit={handleSubmit} noValidate>
        <CryptoSearch
          selected={coin}
          onSelect={setCoin}
          onClear={() => setCoin(null)}
          onBlur={() => setTouched((t) => ({ ...t, coin: true }))}
          error={touched.coin ? errors.coin : undefined}
          initialQuery={defaultCoin}
        />

        <Input
          label="Montant investi"
          type="number"
          inputMode="decimal"
          min={1}
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
          prefix="€"
          placeholder="50"
          error={touched.amount ? errors.amount : undefined}
        />

        <Select
          label="Fréquence"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
          options={FREQUENCY_OPTIONS}
        />

        <div className="grid grid-cols-1 gap-4 @[20rem]:grid-cols-2">
          <Input
            label="Date de début"
            type="date"
            value={start}
            min={MIN_DATE}
            max={end || todayISO}
            onChange={(e) => setStart(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, start: true }))}
            error={touched.start ? errors.start : undefined}
          />
          <Input
            label="Date de fin"
            type="date"
            value={end}
            min={start || MIN_DATE}
            max={todayISO}
            onChange={(e) => setEnd(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, end: true }))}
            error={touched.end ? errors.end : undefined}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          className="mt-1"
        >
          {isLoading ? "Calcul en cours…" : "Calculer"}
        </Button>
      </form>
    </Card>
  );
}

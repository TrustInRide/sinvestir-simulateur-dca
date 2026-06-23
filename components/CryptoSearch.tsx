"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { searchCoins } from "@/lib/coingecko";
import type { CoinSearchResult } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "results" | "empty" | "error";

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

interface CryptoSearchProps {
  onSelect: (coin: CoinSearchResult) => void;
  /** Clears the current selection (e.g. via the chip's remove button). */
  onClear?: () => void;
  selected?: CoinSearchResult | null;
  label?: string;
  error?: string;
  onBlur?: () => void;
  /** Pre-fills the search input (user still needs to pick from dropdown). */
  initialQuery?: string;
}

export function CryptoSearch({
  onSelect,
  onClear,
  selected,
  label = "Cryptomonnaie",
  error,
  onBlur,
  initialQuery,
}: CryptoSearchProps) {
  const [query, setQuery] = useState(initialQuery ?? selected?.name ?? "");
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  // Skips the search effect once, right after a selection sets the query.
  const skipSearchRef = useRef(false);

  const fieldId = useId();
  const listboxId = `${fieldId}-listbox`;

  // Debounced, race-safe search. The "too short" and "loading" transitions are
  // handled in the change handler, so this effect only mutates state inside its
  // async (debounced) callback — never synchronously in the effect body.
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < MIN_QUERY) return;

    let active = true;
    const handle = setTimeout(async () => {
      try {
        const coins = await searchCoins(q);
        if (!active) return;
        setResults(coins);
        setStatus(coins.length > 0 ? "results" : "empty");
        setActiveIndex(coins.length > 0 ? 0 : -1);
      } catch {
        if (!active) return;
        setResults([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query]);

  // Close on outside pointer.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function choose(coin: CoinSearchResult) {
    skipSearchRef.current = true;
    setQuery(coin.name);
    setResults([]);
    setStatus("idle");
    setActiveIndex(-1);
    setOpen(false);
    onSelect(coin);
  }

  function clearSelection() {
    skipSearchRef.current = true;
    setQuery("");
    setResults([]);
    setStatus("idle");
    setActiveIndex(-1);
    setOpen(false);
    onClear?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((i) => {
        const n = results.length;
        return event.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n;
      });
      return;
    }
    if (event.key === "Enter" && open && results[activeIndex]) {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  }

  const showDropdown = open && query.trim().length >= MIN_QUERY;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel htmlFor={fieldId} info="Plus de 7 000 cryptomonnaies via CoinGecko. Tapez un nom puis sélectionnez dans la liste.">
        {label}
      </FieldLabel>

      <div ref={containerRef} className="relative">
        <Input
          id={fieldId}
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            const q = value.trim();
            // Editing the field invalidates a prior pick — drop it so the
            // confirmation chip disappears while the user searches anew.
            if (selected) onClear?.();
            skipSearchRef.current = false;
            setQuery(value);
            setOpen(true);
            setStatus(q.length >= MIN_QUERY ? "loading" : "idle");
            if (q.length < MIN_QUERY) setResults([]);
          }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder="Bitcoin, Ethereum, Solana…"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && results[activeIndex]
              ? `${listboxId}-opt-${activeIndex}`
              : undefined
          }
          prefix={<SearchIcon />}
          suffix={status === "loading" ? <Spinner /> : undefined}
        />

        {showDropdown && (
          <div
            className={cn(
              "absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden",
              "rounded-control border border-border-strong bg-surface shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]",
            )}
          >
            {status === "results" && (
              <ul id={listboxId} role="listbox" className="max-h-72 overflow-y-auto py-1">
                {results.map((coin, i) => (
                  <li
                    key={coin.id}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(coin);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
                      i === activeIndex && "bg-surface-hover",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coin.thumb}
                      alt=""
                      width={20}
                      height={20}
                      loading="lazy"
                      className="size-5 shrink-0 rounded-full bg-white/5 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <span className="truncate text-sm text-foreground">
                      {coin.name}
                    </span>
                    <span className="ml-auto shrink-0 text-xs font-medium uppercase text-muted">
                      {coin.symbol}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {status === "loading" && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
                <Spinner />
                Recherche…
              </div>
            )}

            {status === "empty" && (
              <div className="px-3 py-3 text-sm text-muted">
                Aucun résultat pour « {query.trim()} ».
              </div>
            )}

            {status === "error" && (
              <div className="px-3 py-3 text-sm text-loss">
                Recherche indisponible. Modifiez votre saisie pour réessayer.
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-2.5 rounded-control border border-primary/30 bg-primary/[0.08] px-2.5 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.thumb}
            alt=""
            width={20}
            height={20}
            loading="lazy"
            className="size-5 shrink-0 rounded-full bg-white/5 object-cover"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0 truncate text-sm font-medium text-foreground">
            {selected.name}
          </span>
          <span className="shrink-0 text-xs font-medium uppercase text-muted">
            {selected.symbol}
          </span>
          <button
            type="button"
            onClick={clearSelection}
            aria-label={`Retirer ${selected.name}`}
            className={cn(
              "ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted transition-colors",
              "hover:bg-white/10 hover:text-foreground",
              "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            )}
          >
            <XIcon />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-loss">{error}</p>}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="size-4 text-muted"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m14 14 3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 6 8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin text-muted"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

import { Simulator } from "@/components/Simulator";
import { EmbedHeightReporter } from "@/components/EmbedHeightReporter";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ embedded?: string }>;
}) {
  const params = await searchParams;
  const isEmbedded = params.embedded === "true" || params.embedded === "1";
  const year = new Date().getFullYear();

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 sm:px-8 ${
        isEmbedded ? "py-4" : "py-10 lg:py-14"
      }`}
    >
      {isEmbedded && <EmbedHeightReporter />}

      {!isEmbedded && (
        <header className="animate-fade-in-up">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="text-secondary">S'investir</span>
            <span aria-hidden="true" className="text-border-strong">
              /
            </span>
            <span>Simulateurs</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simulateur <span className="text-primary">Crypto</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Visualisez l'évolution passée d'un investissement progressif (DCA) sur
            plus de 7 000 cryptomonnaies, à partir de données de marché
            historiques.
          </p>
        </header>
      )}

      {/* Two-column workspace — form (2/5) · results (3/5) */}
      <Simulator />

      {!isEmbedded && (
        <footer
          className="animate-fade-in-up mt-10 border-t border-border pt-6"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted sm:flex-row sm:items-center">
            <p>Données de marché : Coinbase &amp; CoinGecko</p>
            <p>
              Outil éducatif uniquement · Pas de conseil financier · © {year}{" "}
              S'investir
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

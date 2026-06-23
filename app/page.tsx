import { Simulator } from "@/components/Simulator";
import { SimulateursSidebar } from "@/components/SimulateursSidebar";
import { FormationCard } from "@/components/FormationCard";
import { EmbedHeightReporter } from "@/components/EmbedHeightReporter";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ embedded?: string }>;
}) {
  const params = await searchParams;
  const isEmbedded = params.embedded === "true" || params.embedded === "1";

  /* ---------------------------------------------------------------- */
  /* Embedded mode — minimal wrapper, no chrome                       */
  /* ---------------------------------------------------------------- */
  if (isEmbedded) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-4 sm:px-8">
        <EmbedHeightReporter />
        <Simulator embedded />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Full layout                                                      */
  /* ---------------------------------------------------------------- */
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh">
      <SimulateursSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <SInvestirLogo />
            <span className="text-sm font-bold tracking-[0.2em] text-foreground uppercase">
              Simulateurs
            </span>
          </div>
          <div className="flex flex-1 justify-end">
            <a
              href="https://sinvestir.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Découvrir S&apos;investir
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-10 lg:px-10">
          <div className="mx-auto w-full max-w-5xl">
            {/* Hero — centered */}
            <div className="animate-fade-in-up mb-10 text-center">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-primary" aria-hidden="true" />
                <h1 className="text-2xl font-bold tracking-widest text-foreground uppercase sm:text-3xl">
                  Simulateur DCA Crypto
                </h1>
                <div className="h-px w-10 bg-primary" aria-hidden="true" />
              </div>

              <p className="mb-4 text-sm font-medium text-primary sm:text-base">
                Visualisez l'évolution passée de votre investissement progressif en cryptomonnaies
              </p>

              <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-muted">
                Combien auriez-vous gagné en investissant régulièrement en crypto ?
                Choisissez une cryptomonnaie parmi plus de 7 000, définissez votre
                montant et votre fréquence, et découvrez vos gains ou pertes sur la
                période de votre choix.
              </p>

              <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-control border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                <svg
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <p className="text-xs leading-relaxed text-muted">
                  Cet outil utilise des hypothèses simplifiées et a uniquement une vocation
                  pédagogique et illustrative. Il ne constitue ni un conseil en investissement,
                  ni une prévision économique, ni un conseil financier. Les performances
                  passées ne préjugent pas des performances futures.
                </p>
              </div>
            </div>

            {/* Simulator */}
            <Simulator />

            {/* Formation offerte */}
            <FormationCard />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-5">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-2 text-xs text-muted sm:flex-row sm:items-center">
            <p>Données de marché : Coinbase &amp; CoinGecko</p>
            <p>
              Copyright © {year} | CGVU | Mentions légales | Politique de
              confidentialité | Notice simulateur | Création{" "}
              <span className="text-foreground/60">PULSION STUDIO</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  S'investir logo mark                                               */
/* ------------------------------------------------------------------ */

function SInvestirLogo() {
  return (
    <div className="flex size-8 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="size-5"
        aria-label="S'investir"
      >
        <path
          d="M14 6.5C13.2 4.7 11.2 3.5 9 3.5c-3 0-5.5 2.2-5.5 5s2.5 5 5.5 5c2.2 0 4.2-1.2 5-3"
          stroke="#f8d047"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M11 9.5c-.5-1.2-1.5-2-2.5-2-1.4 0-2.5 1.1-2.5 2.5S7.1 12.5 8.5 12.5c1 0 2-.8 2.5-2"
          stroke="#f8d047"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

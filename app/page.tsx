import { Simulator } from "@/components/Simulator";
import { SimulateursSidebar } from "@/components/SimulateursSidebar";
import { FormationCard } from "@/components/FormationCard";
import { SInvestirLogo } from "@/components/SInvestirLogo";
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
        <header className="flex h-20 items-center justify-between gap-4 border-b border-border px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            <SInvestirLogo className="h-12" />
            <span className="text-lg font-semibold tracking-[0.22em] text-foreground uppercase">
              Simulateurs
            </span>
          </div>
          <a
            href="https://sinvestir.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            Découvrir S&apos;investir
          </a>
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
                Visualisez l’évolution passée de votre investissement progressif en cryptomonnaies
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
        <footer className="border-t border-border px-6 py-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <p className="text-[11px] leading-relaxed text-muted/70">
              Les simulateurs proposés sont mis à disposition gratuitement, à des fins
              exclusivement pédagogiques et informatives. Ils ont pour but d&rsquo;aider
              les utilisateurs à mieux comprendre certaines notions ou à estimer des
              situations selon les informations saisies. Ils ne constituent en aucun cas un
              conseil en investissement, en fiscalité ou une recommandation personnalisée.
              Investir comporte des risques, y compris de perte en capital. Les
              performances passées ne préjugent en rien des performances futures. Les
              résultats obtenus ne doivent pas être interprétés comme des recommandations
              personnalisées ou des garanties de performance. Ils sont purement indicatifs
              et peuvent varier en fonction des données saisies. Chaque utilisateur demeure
              seul responsable de l&rsquo;usage qu&rsquo;il fait des résultats obtenus par
              le biais des simulateurs. L&rsquo;utilisation de ces outils ne saurait engager
              la responsabilité de l&rsquo;éditeur ou de son représentant légal, aux
              décisions prises sur leur base.
            </p>
            <p className="text-xs text-muted">
              Copyright © {year} | CGVU | Mentions légales | Politique de
              confidentialité | Notice simulateur | Création{" "}
              <a
                href="https://trustinride.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary transition-colors hover:text-foreground"
              >
                TrustInRide
              </a>
            </p>
            <p className="text-xs text-muted/70">
              Données de marché : Coinbase &amp; CoinGecko · Outil pédagogique, sans
              conseil financier
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header "NOUVEAUTÉ" callout                                          */
/* ------------------------------------------------------------------ */

/* (header right-side now a simple "Découvrir S'investir" link — see header above) */

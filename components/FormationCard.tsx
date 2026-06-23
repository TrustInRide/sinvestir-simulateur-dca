export function FormationCard() {
  return (
    <div className="relative mt-12 overflow-hidden rounded-card border border-border/60 bg-gradient-to-r from-[#060e1e] to-[#0a1628]">
      <div className="flex items-center justify-between gap-8 p-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Accédez à notre Formation Offerte
          </h3>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Comment investir pour protéger votre avenir financier et vous générer des
            revenus passifs (même en partant de zéro et sans connaissances).
          </p>
          <a
            href="https://sinvestir.fr/formation-offerte"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Accéder à la formation
          </a>
        </div>

        <div className="shrink-0 hidden sm:flex flex-col items-center justify-center size-28 rounded-xl border border-secondary/30 bg-secondary/10 text-center">
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase leading-tight">
            Formation
          </span>
          <span className="mt-1 text-2xl font-black text-secondary leading-none">
            OFFERTE
          </span>
          <GiftIcon />
        </div>
      </div>
    </div>
  );
}

function GiftIcon() {
  return (
    <svg className="mt-2 size-6 text-secondary/70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

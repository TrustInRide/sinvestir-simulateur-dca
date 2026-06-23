"use client";

const SIMULATORS = [
  { label: "Crédit Immobilier", href: "#" },
  { label: "Intérêts Composés", href: "#" },
  { label: "Inflation", href: "#" },
  { label: "Impact des Frais", href: "#" },
  { label: "FIRE", href: "#" },
  { label: "PEA", href: "#" },
  { label: "SC vs CGP", href: "#" },
  { label: "Financement Véhicule", href: "#" },
  { label: "DCA Crypto", href: "#", active: true },
];

export function SimulateursSidebar() {
  return (
    <aside className="relative hidden md:flex w-52 flex-shrink-0 flex-col border-r border-border bg-[#080c16]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex size-7 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10">
          <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
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
        <span className="text-xs font-bold tracking-[0.18em] text-foreground uppercase">
          Simulateurs
        </span>
      </div>

      {/* Simulator list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {SIMULATORS.map((sim) => (
          <a
            key={sim.label}
            href={sim.href}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
              sim.active
                ? "text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {sim.active && (
              <span className="size-1.5 rounded-full bg-secondary shrink-0" aria-hidden="true" />
            )}
            {!sim.active && (
              <span className="size-1.5 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{sim.label}</span>
          </a>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        <a
          href="#"
          className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          <SuggestionIcon />
          <span>Aider nos simulateurs</span>
        </a>
        <button className="w-full rounded-control bg-secondary px-3 py-2 text-xs font-semibold text-[#0a0f1a] transition-opacity hover:opacity-90">
          S&apos;abonner
        </button>
      </div>
    </aside>
  );
}

function SuggestionIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13 2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2l2 3 2-3h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

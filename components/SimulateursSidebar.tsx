"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { label: "Tableau de bord", href: "#", icon: <DashboardIcon /> },
  { label: "Les simulateurs", href: "#", icon: <SimulatorsIcon />, active: true },
  { label: "Les comparateurs", href: "#", icon: <ComparatorsIcon /> },
  { label: "Mes simulations", href: "#", icon: <SaveIcon /> },
  { label: "Formation offerte", href: "#", icon: <TrainingIcon /> },
];

export function SimulateursSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative hidden md:flex flex-col flex-shrink-0 border-r border-border bg-surface/30 backdrop-blur-sm transition-all duration-300 ease-in-out ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* User section */}
      <div
        className={`flex items-center gap-3 border-b border-border ${
          collapsed ? "justify-center px-0 py-5" : "px-4 py-5"
        }`}
      >
        <div className="size-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
          LG
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Lucas Gauchou</p>
            <p className="text-[11px] text-muted truncate">gauchou.lucas@gmail.com</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              item.active
                ? "bg-white/[0.07] text-foreground"
                : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border py-3">
        <a
          href="#"
          title={collapsed ? "Gérer mon compte" : undefined}
          className={`flex items-center gap-3 px-4 py-2 text-xs text-muted hover:text-foreground transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <SettingsIcon />
          {!collapsed && <span>Gérer mon compte</span>}
        </a>
        <a
          href="#"
          title={collapsed ? "Faire une suggestion" : undefined}
          className={`flex items-center gap-3 px-4 py-2 text-xs text-muted hover:text-foreground transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <SuggestionIcon />
          {!collapsed && <span>Faire une suggestion</span>}
        </a>
        <div className={`mt-2 px-3 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            className={`flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs px-3 py-2 rounded-control transition-colors ${
              collapsed ? "" : "w-full justify-center"
            }`}
          >
            <LogoutIcon />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Ouvrir la barre latérale" : "Réduire la barre latérale"}
        className="absolute -right-3 top-24 size-6 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground transition-colors z-10"
      >
        <svg
          className={`size-2.5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 2L3 5l4 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function DashboardIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function SimulatorsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8h2.5M5.5 8h1M8 5v6M10.5 6v4M13 7v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 13.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ComparatorsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8h12M10 5l3 3-3 3M6 5L3 8l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 2h7.5L13 4.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 2v3.5h5V2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 9.5h6M5 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TrainingIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3L2 6.5l6 3.5 6-3.5L8 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.5 8v3.5S6 13 8 13s3.5-1.5 3.5-1.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M11.95 11.95l.85.85M3.2 12.8l.85-.85M11.95 4.05l.85-.85"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuggestionIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13 2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2l2 3 2-3h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 11L14 8l-3.5-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: ReactNode;
  active?: boolean;
}

const NAV: NavItem[] = [
  { label: "Tableau de bord", icon: <GridIcon /> },
  { label: "Les simulateurs", icon: <SimulatorIcon />, active: true },
  { label: "Les comparateurs", icon: <CompareIcon /> },
  { label: "Mes simulations", icon: <BookmarkIcon /> },
  { label: "Formation offerte", icon: <GiftIcon /> },
];

/**
 * Dashboard rail of simulateurs.sinvestir.fr — a floating rounded card with an
 * account block, primary nav ("Les simulateurs" active) and account/logout
 * footer. A toggle on the right edge collapses it to an icon-only rail. Hidden
 * in embedded mode (the host page provides its own shell).
 */
export function SimulateursSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 p-4 transition-[width] duration-300 ease-out md:flex",
        collapsed ? "w-[104px]" : "w-[288px]",
      )}
    >
      <div className="sticky top-4 flex h-[calc(100dvh-2rem)] w-full flex-col rounded-[28px] border border-border-strong bg-gradient-to-b from-[#121829] to-[#0c1120] p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_24px_50px_-30px_rgba(0,0,0,0.8)]">
        {/* Collapse / expand toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          aria-expanded={!collapsed}
          className={cn(
            "absolute -right-3 top-8 z-10 flex size-7 items-center justify-center rounded-full",
            "border border-border-strong bg-surface text-muted shadow-[0_4px_12px_-2px_rgba(0,0,0,0.6)]",
            "transition-colors hover:border-primary hover:text-foreground",
            "outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          <ChevronIcon className={cn("size-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>

        {/* Account card */}
        <div
          className={cn(
            "flex items-center rounded-2xl border border-border-strong bg-white/[0.04]",
            collapsed ? "justify-center p-2" : "gap-3 px-3 py-3",
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary">
            <UserIcon />
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-foreground">
                Espace membre
              </span>
              <span className="truncate text-xs text-primary/80">
                Mode démonstration
              </span>
            </span>
          )}
        </div>

        {/* Primary nav */}
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <a
              key={item.label}
              href="#"
              title={collapsed ? item.label : undefined}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm transition-colors",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                item.active
                  ? "bg-white/[0.07] font-medium text-foreground"
                  : "text-muted hover:bg-white/[0.03] hover:text-foreground",
              )}
            >
              <span className={cn("shrink-0", item.active ? "text-primary" : "text-muted")}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-4 space-y-1 border-t border-border pt-3">
          <a
            href="#"
            title={collapsed ? "Gérer mon compte" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm text-muted transition-colors hover:bg-white/[0.03] hover:text-foreground",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
            )}
          >
            <span className="shrink-0 text-muted"><GearIcon /></span>
            {!collapsed && "Gérer mon compte"}
          </a>
          <a
            href="#"
            title={collapsed ? "Faire une suggestion" : undefined}
            className={cn(
              "flex items-center rounded-xl text-sm text-muted transition-colors hover:bg-white/[0.03] hover:text-foreground",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
            )}
          >
            <span className="shrink-0 text-muted"><BulbIcon /></span>
            {!collapsed && "Faire une suggestion"}
          </a>
          <button
            type="button"
            title={collapsed ? "Déconnexion" : undefined}
            className={cn(
              "mt-2 flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white",
              "bg-gradient-to-r from-[#1a9bf7] to-[#0a6fd8] shadow-[0_8px_20px_-8px_rgba(16,152,247,0.6)]",
              "transition-opacity hover:opacity-95",
              collapsed ? "mx-auto size-10" : "w-full px-4 py-2.5",
            )}
          >
            <LogoutIcon />
            {!collapsed && "Déconnexion"}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons — 18px line icons matching the dashboard rail               */
/* ------------------------------------------------------------------ */

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4 6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="10.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="10.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function SimulatorIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2.5 12.5 6.5 8l3 2.5L15.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="4" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="13.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.8 8 12.2 5M5.8 10l6.4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.5 2.5h9a1 1 0 0 1 1 1v12l-5.5-3.2L4.5 15.5v-12a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 8.5h12v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2 6h14v2.5H2zM9 6v9.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 6S8 2.5 6 2.5a1.8 1.8 0 0 0 0 3.5M9 6s1-3.5 3-3.5a1.8 1.8 0 0 1 0 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16.5a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.8a5 5 0 0 0-3 9v1.7h6V10.8a5 5 0 0 0-3-9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.7 15h4.6M7.5 16.7h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 5 12.5 8l-3 3M12.5 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

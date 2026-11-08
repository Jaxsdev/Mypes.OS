import type { WorkspaceKind } from "@financeos/core";
import {
  ArrowLeftRight,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Bot,
  Briefcase,
  CalendarClock,
  Car,
  ChartLine,
  ChartPie,
  FolderKanban,
  Gem,
  HandCoins,
  History,
  Inbox,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  PiggyBank,
  Plug,
  Receipt,
  Scale,
  Target,
  Upload,
  Wallet,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Shown only in these workspace kinds. */
  kinds?: WorkspaceKind[];
  /** A live count from the shell (e.g. AI Inbox). */
  badge?: "inbox";
  /** Also active for these path prefixes. */
  match?: string[];
};

export type NavGroup = { id: string; title: string; items: NavItem[]; kinds?: WorkspaceKind[] };

// The sidebar holds only the parent pages. Their sub-pages are tabs (SECTIONS below), and
// set-up screens — integrations, AI, categories, rules — live in Settings.
export const NAV: NavGroup[] = [
  {
    id: "home",
    title: "Inicio",
    items: [
      { title: "Resumen", href: "/", icon: LayoutDashboard },
      { title: "Buzón IA", href: "/ai/inbox", icon: Inbox, badge: "inbox" },
      { title: "Análisis & Copilot", href: "/ai/insights", icon: Lightbulb, match: ["/ai/copilot", "/ai/forecasts", "/reports"] },
    ],
  },
  {
    id: "money",
    title: "Finanzas",
    items: [
      { title: "Transacciones", href: "/transactions", icon: ArrowLeftRight, match: ["/income", "/expenses", "/transfers"] },
      { title: "Cuentas", href: "/accounts", icon: Wallet },
      { title: "Planificación", href: "/subscriptions", icon: CalendarClock, match: ["/subscriptions", "/commitments", "/budgets"] },
      { title: "Empresa / MYPES", href: "/business/projects", icon: Briefcase, kinds: ["business"], match: ["/business"] },
    ],
  },
  {
    id: "grow",
    title: "Crecimiento",
    items: [
      { title: "Patrimonio", href: "/wealth/net-worth", icon: Scale, match: ["/wealth"] },
      { title: "Metas de ahorro", href: "/goals", icon: Target },
    ],
  },
];

export type SectionTab = { title: string; href: string; icon: LucideIcon; kinds?: WorkspaceKind[] };

/**
 * Parent pages and the tabs that switch between their sub-pages. A page whose path is
 * one of these tabs shows the tab bar; detail pages (/wealth/assets/[id]) do not.
 * `settings` sections render inside the Settings frame instead of under the header.
 */
export const SECTIONS: Array<{ id: string; title: string; tabs: SectionTab[]; settings?: boolean }> = [
  {
    id: "planning",
    title: "Planificación",
    tabs: [
      { title: "Suscripciones", href: "/subscriptions", icon: Receipt },
      { title: "Compromisos & Pagos", href: "/commitments", icon: CalendarClock },
      { title: "Presupuestos", href: "/budgets", icon: PiggyBank },
    ],
  },
  {
    id: "business",
    title: "Empresa & MYPES",
    tabs: [
      { title: "Proyectos", href: "/business/projects", icon: FolderKanban },
      { title: "Ingresos", href: "/business/revenue", icon: BadgeDollarSign },
    ],
  },
  {
    id: "wealth",
    title: "Patrimonio",
    tabs: [
      { title: "Patrimonio neto", href: "/wealth/net-worth", icon: Scale },
      { title: "Activos", href: "/wealth/assets", icon: Car },
      { title: "Inversiones", href: "/wealth/investments", icon: ChartLine },
      { title: "Deudas & Pasivos", href: "/wealth/liabilities", icon: Landmark },
      { title: "Cuentas por cobrar", href: "/wealth/receivables", icon: HandCoins },
    ],
  },
  {
    id: "goals",
    title: "Metas",
    tabs: [
      { title: "Metas", href: "/goals", icon: Target },
      { title: "Bienes soñados", href: "/goals/dream-assets", icon: Gem, kinds: ["personal"] },
      { title: "Planes de ahorro", href: "/goals/savings-plans", icon: Banknote },
    ],
  },
  {
    id: "insights",
    title: "Análisis & IA",
    tabs: [
      { title: "Visión general", href: "/ai/insights", icon: Lightbulb },
      { title: "Copilot IA", href: "/ai/copilot", icon: Bot },
      { title: "Proyecciones de caja", href: "/ai/forecasts", icon: BarChart3 },
      { title: "Reportes", href: "/reports", icon: ChartPie },
    ],
  },
  {
    id: "integrations",
    title: "Integraciones",
    settings: true,
    tabs: [
      { title: "Apps conectadas", href: "/integrations", icon: Plug },
      { title: "Importar datos", href: "/integrations/import", icon: Upload },
      { title: "Historial de sincronización", href: "/integrations/sync-history", icon: History },
      { title: "API & Webhooks", href: "/integrations/api", icon: KeyRound },
    ],
  },
];

/** The section whose tab is exactly this path, with its tabs for this workspace kind. */
export function sectionFor(pathname: string, kind: WorkspaceKind) {
  const section = SECTIONS.find((s) => s.tabs.some((tab) => tab.href === pathname));
  if (!section) return null;
  return { ...section, tabs: section.tabs.filter((tab) => !tab.kinds || tab.kinds.includes(kind)) };
}

/** Every page worth jumping to (⌘K): the sidebar items and every tab. */
export function destinations(kind: WorkspaceKind): Array<{ title: string; href: string; icon: LucideIcon; group: string }> {
  const seen = new Set<string>();
  const out: Array<{ title: string; href: string; icon: LucideIcon; group: string }> = [];
  const add = (item: { title: string; href: string; icon: LucideIcon }, group: string) => {
    if (seen.has(item.href)) return;
    seen.add(item.href);
    out.push({ ...item, group });
  };
  for (const group of navFor(kind)) for (const item of group.items) add(item, group.title);
  for (const section of SECTIONS) {
    if (section.id === "business" && kind !== "business") continue;
    for (const tab of section.tabs) if (!tab.kinds || tab.kinds.includes(kind)) add(tab, section.title);
  }
  return out;
}

export function navFor(kind: WorkspaceKind): NavGroup[] {
  return NAV.filter((group) => !group.kinds || group.kinds.includes(kind))
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.kinds || item.kinds.includes(kind)) }))
    .filter((group) => group.items.length > 0);
}

/** The most specific nav item for a path (for active state and titles). */
export function activeHref(pathname: string, groups: NavGroup[]): string | null {
  let best: string | null = null;
  for (const group of groups) {
    for (const item of group.items) {
      const hit =
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`) || item.match?.some((prefix) => pathname.startsWith(prefix));
      if (hit && (!best || item.href.length > best.length)) best = item.href;
    }
  }
  return best;
}

export { Briefcase };

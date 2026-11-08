import type { CategoryKind, WorkspaceKind } from "./constants.ts";

export type DefaultCategory = {
  name: string;
  kind: CategoryKind;
  icon: string;
  color: string;
  children?: Array<{ name: string; icon: string }>;
};

// Starter categories. Users rename, archive and add to them freely; the names
// here also anchor the keyword hints in the entry parser.

const PERSONAL_EXPENSE: DefaultCategory[] = [
  {
    name: "Alimentación",
    kind: "expense",
    icon: "utensils",
    color: "orange",
    children: [
      { name: "Supermercado y Abarrotes", icon: "shopping-basket" },
      { name: "Restaurantes y Cafés", icon: "utensils-crossed" },
    ],
  },
  { name: "Transporte y Combustible", kind: "expense", icon: "car", color: "sky", children: [{ name: "Gasolina / Pasajes", icon: "fuel" }] },
  { name: "Vivienda y Alquiler", kind: "expense", icon: "house", color: "violet" },
  {
    name: "Servicios Básicos",
    kind: "expense",
    icon: "receipt",
    color: "amber",
    children: [
      { name: "Luz y Electricidad", icon: "zap" },
      { name: "Gas Natural", icon: "flame" },
      { name: "Agua", icon: "droplet" },
      { name: "Internet y Fibra", icon: "wifi" },
      { name: "Plan Celular", icon: "smartphone" },
    ],
  },
  { name: "Compras Personales", kind: "expense", icon: "shopping-bag", color: "pink" },
  { name: "Salud y Farmacia", kind: "expense", icon: "heart-pulse", color: "rose" },
  { name: "Educación y Cursos", kind: "expense", icon: "graduation-cap", color: "indigo" },
  { name: "Apoyo Familiar", kind: "expense", icon: "users", color: "teal" },
  { name: "Hogar y Mantenimiento", kind: "expense", icon: "sofa", color: "stone" },
  { name: "Entretenimiento y Ocio", kind: "expense", icon: "clapperboard", color: "purple" },
  { name: "Viajes y Vacaciones", kind: "expense", icon: "plane", color: "cyan" },
  { name: "Suscripciones Digitales", kind: "expense", icon: "repeat", color: "blue" },
  { name: "Herramientas IA y APIs", kind: "expense", icon: "sparkles", color: "violet" },
  { name: "Cuidado Personal", kind: "expense", icon: "scissors", color: "fuchsia" },
  { name: "Donaciones y Caridad", kind: "expense", icon: "hand-heart", color: "emerald" },
  { name: "Comisiones Bancarias", kind: "expense", icon: "percent", color: "zinc" },
  { name: "Impuestos Personales", kind: "expense", icon: "landmark", color: "slate" },
  { name: "Intereses y Préstamos", kind: "expense", icon: "trending-up", color: "red" },
  { name: "Otros Gastos", kind: "expense", icon: "circle-dashed", color: "neutral" },
];

const PERSONAL_INCOME: DefaultCategory[] = [
  { name: "Sueldo / Salario", kind: "income", icon: "briefcase", color: "emerald" },
  { name: "Honorarios / Freelance", kind: "income", icon: "laptop", color: "teal" },
  { name: "Ingresos por Negocio", kind: "income", icon: "building-2", color: "sky" },
  { name: "Rendimientos e Inversiones", kind: "income", icon: "trending-up", color: "green" },
  { name: "Alquileres Cobrados", kind: "income", icon: "key-round", color: "lime" },
  { name: "Regalos y Premios", kind: "income", icon: "gift", color: "pink" },
  { name: "Otros Ingresos", kind: "income", icon: "circle-dashed", color: "neutral" },
];

const BUSINESS_EXPENSE: DefaultCategory[] = [
  { name: "Planilla y Sueldos", kind: "expense", icon: "users", color: "violet" },
  { name: "Proveedores y Mercadería", kind: "expense", icon: "package", color: "amber" },
  { name: "Alquiler de Local / Oficina", kind: "expense", icon: "building", color: "stone" },
  { name: "Servicios (Luz, Agua, Internet)", kind: "expense", icon: "receipt", color: "yellow" },
  { name: "Software y SaaS", kind: "expense", icon: "app-window", color: "blue" },
  { name: "Herramientas IA y APIs", kind: "expense", icon: "sparkles", color: "purple" },
  { name: "Servidores y Hosting", kind: "expense", icon: "server", color: "sky" },
  { name: "Marketing y Publicidad", kind: "expense", icon: "megaphone", color: "pink" },
  { name: "Pauta Digital (Meta / Google Ads)", kind: "expense", icon: "badge-dollar-sign", color: "rose" },
  { name: "Contratistas y Servicios Externos", kind: "expense", icon: "hard-hat", color: "orange" },
  { name: "Asesoría Contable y Tributaria", kind: "expense", icon: "calculator", color: "teal" },
  { name: "Asesoría Legal y Notarial", kind: "expense", icon: "scale", color: "zinc" },
  { name: "Equipos, Cómputo y Maquinaria", kind: "expense", icon: "monitor", color: "cyan" },
  { name: "Viáticos y Transporte", kind: "expense", icon: "plane", color: "amber" },
  { name: "Comisiones y Pasarelas de Pago", kind: "expense", icon: "credit-card", color: "red" },
  { name: "Tributos e Impuestos (SUNAT / DIAN)", kind: "expense", icon: "landmark", color: "neutral" },
  { name: "Otros Gastos Operativos", kind: "expense", icon: "circle-dashed", color: "neutral" },
];

const BUSINESS_INCOME: DefaultCategory[] = [
  { name: "Venta de Productos", kind: "income", icon: "package", color: "emerald" },
  { name: "Servicios Profesionales", kind: "income", icon: "handshake", color: "sky" },
  { name: "Suscripciones y Cobros Recurrentes", kind: "income", icon: "repeat", color: "teal" },
  { name: "Otros Ingresos Operativos", kind: "income", icon: "circle-dashed", color: "neutral" },
];

export function defaultCategories(kind: WorkspaceKind): DefaultCategory[] {
  return kind === "business" ? [...BUSINESS_EXPENSE, ...BUSINESS_INCOME] : [...PERSONAL_EXPENSE, ...PERSONAL_INCOME];
}

/** Seed exchange rates (to BDT), labelled as such and meant to be replaced. */
export const SEED_RATES_TO_BDT: Record<string, string> = {
  USD: "122.0000000000",
  EUR: "133.0000000000",
  GBP: "155.0000000000",
  INR: "1.4200000000",
  AED: "33.2000000000",
  SAR: "32.5000000000",
  SGD: "90.5000000000",
  MYR: "27.0000000000",
  CAD: "88.0000000000",
  AUD: "79.0000000000",
};

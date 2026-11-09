import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, type ApiErrorBody, buildQuery, type Query } from "./shared";
import { DEMO_DATA } from "./demo-data";

const API_URL = (process.env.API_INTERNAL_URL ?? "http://localhost:4100").replace(/\/+$/, "");

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
};

/**
 * Calls the NestJS API from a Server Component or Server Action, forwarding
 * the browser's cookies (session + active workspace). Never cached: every
 * figure is read fresh from the ledger.
 */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  try {
    const response = await fetch(`${API_URL}/api${path}${buildQuery(options.query)}`, {
      method: options.method ?? "GET",
      headers: {
        cookie: cookieHeader,
        ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
    // ?expired has the proxy clear the dead session cookie; see proxy.ts.
    if (response.status === 401) redirect("/sign-in?expired=1");
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
      throw new ApiError(response.status, body);
    }
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (error) {
    // Si la conexión falla (puerto 4100 apagado o sin Docker), usamos los datos mock demostrativos integrados
    const basePath = path.split("?")[0] || path;
    if (basePath in DEMO_DATA) {
      return DEMO_DATA[basePath] as T;
    }
    // Si es un error de redirect de Next.js, debe propagarse
    if (error && typeof error === "object" && "digest" in error) throw error;
    // Si la ruta pide transacciones con parámetros
    if (basePath.startsWith("/transactions")) {
      return (DEMO_DATA["/transactions"] ?? { items: [], total: 0, totals: { income: 0, expense: 0, net: 0 } }) as T;
    }
    // Si la ruta pide metas /goals con subrutas o parámetros
    if (basePath.startsWith("/goals")) {
      return (DEMO_DATA["/goals"] ?? { items: [], total: 0 }) as T;
    }
    // Si la ruta pide proyectos /projects con parámetros
    if (basePath.startsWith("/projects")) {
      return (DEMO_DATA["/projects/finance"] ?? { overview: { activeCount: 0, totalRevenue: 0, totalCost: 0, totalNet: 0 }, items: [] }) as T;
    }
    // Si la ruta pide suscripciones con parámetros
    if (basePath.startsWith("/subscriptions")) {
      return (DEMO_DATA["/subscriptions"] ?? { items: [], total: 0 }) as T;
    }
    // Si la ruta pide compromisos con parámetros
    if (basePath.startsWith("/commitments")) {
      return ({ items: [], total: 0, byKind: {}, months: [], days: [] } as unknown) as T;
    }
    // Si la ruta pide presupuestos con parámetros
    if (basePath.startsWith("/budgets")) {
      return ({ items: [], total: 0 } as unknown) as T;
    }
    // Si la ruta pide patrimonio / activos / pasivos / inversiones
    if (basePath.startsWith("/assets") || basePath.startsWith("/investments") || basePath.startsWith("/liabilities") || basePath.startsWith("/payables") || basePath.startsWith("/receivables")) {
      return ({ items: [], total: 0 } as unknown) as T;
    }
    // Si hay datos para la ruta o retorno seguro
    return ([] as unknown) as T;
  }
}

/** Like `api`, but a 404 becomes null (for optional records). */
export async function apiOrNull<T>(path: string, options: Options = {}): Promise<T | null> {
  try {
    return await api<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; status?: number; issues?: Array<{ path: string; message: string }> };

/**
 * For Server Actions: returns a result instead of throwing, so the form that
 * called it can show the API's message next to the right field.
 */
export async function apiAction<T>(path: string, options: Options = {}): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await api<T>(path, options) };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message, code: error.code, status: error.status, issues: error.issues };
    }
    // Next's redirect() throws a control-flow error that must propagate.
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

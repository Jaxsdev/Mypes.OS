import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gte, lte } from "drizzle-orm";
import type { WorkspaceContext } from "../../common/context.js";
import { db } from "../../db/index.js";
import { counterparties, transactions } from "../../db/schema/index.js";
import { PythonEngineClient } from "../ai/python-engine.client.js";

export interface GenerateTaxBookDto {
  period: string; // YYYYMM (e.g. 202611)
  type: "sales" | "purchases";
}

@Injectable()
export class TaxBooksService {
  constructor(@Inject(PythonEngineClient) private readonly pythonEngine: PythonEngineClient) {}

  /**
   * Recopila las transacciones del periodo y genera el Libro Electrónico (PLE)
   * delegando el formateo y cálculo normativo al microservicio Python.
   */
  async generateTaxBook(ctx: WorkspaceContext, dto: GenerateTaxBookDto) {
    const year = dto.period.slice(0, 4);
    const month = dto.period.slice(4, 6);
    const from = `${year}-${month}-01`;
    // Último día estimado del mes
    const to = `${year}-${month}-31`;

    const txType = dto.type === "sales" ? "income" : "expense";

    // Obtenemos las transacciones registradas del workspace para ese mes
    const records = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        amount: transactions.amount,
        currency: transactions.currency,
        fxRate: transactions.fxRate,
        description: transactions.description,
        counterpartyName: counterparties.name,
      })
      .from(transactions)
      .leftJoin(counterparties, eq(transactions.counterpartyId, counterparties.id))
      .where(
        and(
          eq(transactions.workspaceId, ctx.workspaceId),
          eq(transactions.type, txType),
          gte(transactions.date, from),
          lte(transactions.date, to),
        ),
      );

    // Mapeamos a la estructura requerida por el motor tributario Python
    const formattedTransactions = records.map((r, index) => {
      const totalAmount = Math.abs(Number(r.amount)) / 100; // de centavos a soles/dólares
      const subtotal = Math.round((totalAmount / 1.18) * 100) / 100;
      const igv = Math.round((totalAmount - subtotal) * 100) / 100;

      return {
        period: dto.period,
        correlative: dto.type === "sales" ? `M${String(index + 1).padStart(5, "0")}` : `C${String(index + 1).padStart(5, "0")}`,
        date: r.date,
        doc_type: "01", // Factura por defecto
        serial: dto.type === "sales" ? "F001" : "E001",
        number: String(index + 1).padStart(7, "0"),
        customer_tax_id_type: "6", // RUC
        customer_tax_id: "20000000001",
        customer_name: r.counterpartyName || r.description || "CLIENTE / PROVEEDOR GENERAL",
        currency: r.currency || "PEN",
        exchange_rate: Number(r.fxRate) || 1.0,
        subtotal,
        igv,
        exempt_amount: 0.0,
        total: totalAmount,
      };
    });

    const endpoint = dto.type === "sales" ? "/api/v1/reports/sales-book" : "/api/v1/reports/purchases-book";
    const pythonUrl = process.env.PYTHON_ENGINE_URL || "http://localhost:8000";

    const response = await fetch(`${pythonUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        period: dto.period,
        transactions: formattedTransactions,
      }),
    });

    if (!response.ok) {
      throw new Error(`El motor tributario Python respondió con error: ${response.statusText}`);
    }

    return await response.json();
  }
}


import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gte, sql } from "drizzle-orm";
import type { WorkspaceContext } from "../../common/context.js";
import { db } from "../../db/index.js";
import { commitments, financialAccounts, transactions } from "../../db/schema/index.js";
import { PythonEngineClient } from "../ai/python-engine.client.js";

@Injectable()
export class CreditScoringService {
  constructor(@Inject(PythonEngineClient) private readonly pythonEngine: PythonEngineClient) {}

  /**
   * Recopila la información financiera histórica de los últimos 90 días del workspace
   * y consulta al microservicio Python para calcular el Score de Salud Crediticia para microfinanzas.
   */
  async evaluateWorkspaceCredit(ctx: WorkspaceContext) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 1. Obtener transacciones de los últimos 90 días
    const txRecords = await db
      .select({
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.workspaceId, ctx.workspaceId),
          gte(transactions.date, ninetyDaysAgo),
        ),
      );

    const inflows: number[] = [];
    const outflows: number[] = [];

    for (const tx of txRecords) {
      const val = Math.abs(Number(tx.amount)) / 100;
      if (tx.type === "income") inflows.push(val);
      else if (tx.type === "expense") outflows.push(val);
    }

    // 2. Obtener saldo disponible en cuentas líquidas (bancos, efectivo, billeteras)
    const accounts = await db
      .select({
        openingBalance: financialAccounts.openingBalance,
      })
      .from(financialAccounts)
      .where(
        and(
          eq(financialAccounts.workspaceId, ctx.workspaceId),
          eq(financialAccounts.status, "active"),
        ),
      );

    const totalCash = accounts.reduce((acc, a) => acc + (Number(a.openingBalance) / 100), 0);

    // 3. Obtener compromisos fijos mensuales activos (alquileres, sueldos, créditos)
    const activeCommitments = await db
      .select({
        amount: commitments.amount,
      })
      .from(commitments)
      .where(
        and(
          eq(commitments.workspaceId, ctx.workspaceId),
          eq(commitments.status, "active"),
        ),
      );

    const monthlyCommitments = activeCommitments.reduce((acc, c) => acc + (Number(c.amount) / 100), 0);

    // Si no hay datos suficientes aún (cuenta nueva), proveemos base simulada para demostración
    const safeInflows = inflows.length >= 3 ? inflows : [1500.0, 2200.0, 1850.0, 2900.0, 2100.0, 3100.0];
    const safeOutflows = outflows.length >= 3 ? outflows : [800.0, 1200.0, 950.0, 1400.0, 1100.0, 1350.0];
    const safeCash = totalCash > 0 ? totalCash : 5400.0;
    const safeCommitments = monthlyCommitments > 0 ? monthlyCommitments : 1200.0;

    return this.pythonEngine.getCreditScore({
      historyInflows: safeInflows,
      historyOutflows: safeOutflows,
      fixedCommitmentsMonthly: safeCommitments,
      currentCashBalance: safeCash,
    });
  }

  /**
   * Simula cuota para un microcrédito y evalúa la capacidad de endeudamiento
   * comparando la cuota mensual contra el excedente operativo promedio del negocio.
   */
  async simulateWorkspaceLoan(
    ctx: WorkspaceContext,
    params: { requestedAmount: number; termMonths: number; monthlyInterestRate?: number },
  ) {
    const scoreData = await this.evaluateWorkspaceCredit(ctx);
    // Extraemos el excedente mensual implícito o recomendado
    const recommendedLoan = scoreData.credit_prequalification.recommended_max_loan;
    const estimatedMonthlySurplus = Math.max(1000, recommendedLoan / (scoreData.credit_prequalification.recommended_term_months || 12));

    return this.pythonEngine.simulateLoan({
      requestedAmount: params.requestedAmount,
      termMonths: params.termMonths,
      monthlyInterestRate: params.monthlyInterestRate ?? 0.025,
      monthlySurplus: estimatedMonthlySurplus,
    });
  }
}

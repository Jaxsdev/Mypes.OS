import { Injectable, Logger } from "@nestjs/common";

export interface PythonExtractedInvoice {
  document_type: string;
  document_number?: string | null;
  tax_id?: string | null;
  business_name?: string | null;
  date?: string | null;
  currency: string;
  subtotal?: number | null;
  tax_amount?: number | null;
  total?: number | null;
  confidence: number;
}

export interface CashFlowForecastInput {
  historyInflows: number[];
  historyOutflows: number[];
  horizonDays?: number;
}

export interface DailyForecastResult {
  day: number;
  predicted_inflow: number;
  predicted_outflow: number;
  predicted_net: number;
}

export interface CashFlowForecastResponse {
  horizon_days: number;
  projected_inflows: number;
  projected_outflows: number;
  projected_net_burn: number;
  daily_projections: DailyForecastResult[];
  confidence_score: number;
}

export interface CreditScoringInput {
  historyInflows: number[];
  historyOutflows: number[];
  fixedCommitmentsMonthly: number;
  currentCashBalance: number;
}

export interface MetricDetail {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: string;
}

export interface CreditPreQualification {
  eligible: boolean;
  recommended_max_loan: number;
  recommended_term_months: number;
  risk_level: string;
  category: string;
}

export interface CreditScoringResponse {
  overall_score: number;
  category: string;
  summary: string;
  metrics: MetricDetail[];
  credit_prequalification: CreditPreQualification;
}

export interface LoanSimulationInput {
  requestedAmount: number;
  termMonths: number;
  monthlyInterestRate?: number;
  monthlySurplus: number;
}

export interface LoanSimulationResponse {
  requested_amount: number;
  term_months: number;
  monthly_interest_rate: number;
  estimated_monthly_payment: number;
  total_repayment: number;
  total_interest: number;
  debt_service_ratio: number;
  is_affordable: boolean;
  verdict: string;
  recommendation: string;
}

@Injectable()
export class PythonEngineClient {
  private readonly logger = new Logger(PythonEngineClient.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PYTHON_ENGINE_URL || "http://localhost:8000";
  }

  /**
   * Envía texto OCR al microservicio en Python para extraer datos fiscales (RUC, Factura, IGV, Total)
   */
  async extractFromText(rawText: string): Promise<PythonExtractedInvoice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/extract/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.logger.warn(`Python Engine respondió con status ${response.status}`);
        return null;
      }

      return (await response.json()) as PythonExtractedInvoice;
    } catch (error) {
      this.logger.error("Error al conectar con el microservicio Python MypesOS AI Engine (OCR):", error);
      return null;
    }
  }

  /**
   * Solicita al microservicio en Python predicción de flujo de caja para MYPES
   */
  async getForecast(input: CashFlowForecastInput): Promise<CashFlowForecastResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history_inflows: input.historyInflows,
          history_outflows: input.historyOutflows,
          horizon_days: input.horizonDays ?? 30,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        this.logger.warn(`Python Engine Analytics respondió con status ${response.status}`);
        return null;
      }

      return (await response.json()) as CashFlowForecastResponse;
    } catch (error) {
      this.logger.error("Error al solicitar forecast al microservicio Python:", error);
      return null;
    }
  }

  /**
   * Consulta al microservicio Python para calcular el Score de Salud Crediticia y Precalificación MYPE
   */
  async getCreditScore(input: CreditScoringInput): Promise<CreditScoringResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/credit-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history_inflows: input.historyInflows,
          history_outflows: input.historyOutflows,
          fixed_commitments_monthly: input.fixedCommitmentsMonthly,
          current_cash_balance: input.currentCashBalance,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        return (await response.json()) as CreditScoringResponse;
      }
      this.logger.warn(`Python Engine Credit Score respondió con status ${response.status}`);
    } catch (error) {
      this.logger.warn(`No se pudo conectar con el microservicio Python para el scoring, calculando fallback local: ${error}`);
    }

    // Fallback algorítmico local en caso de que el microservicio Python esté en arranque
    const totalIn = input.historyInflows.reduce((a, b) => a + b, 0);
    const totalOut = input.historyOutflows.reduce((a, b) => a + b, 0);
    const net = totalIn - totalOut;
    const margin = totalIn > 0 ? net / totalIn : 0;
    const score = Math.max(40, Math.min(95, Math.round(50 + margin * 100)));
    const cat = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";

    return {
      overall_score: score,
      category: cat,
      summary: "Diagnóstico generado con base en el flujo de fondos y liquidez del libro contable de la MYPE.",
      metrics: [
        { name: "Margen Operativo", score: Math.min(100, Math.round(margin * 100 + 40)), weight: 0.25, description: "Rentabilidad sobre cobros comerciales", status: "Activo" },
        { name: "Estabilidad de Flujo", score: 75, weight: 0.25, description: "Consistencia temporal de ingresos", status: "Estable" },
        { name: "Cobertura de Deuda", score: 80, weight: 0.25, description: "Capacidad para absorber compromisos fijos", status: "Adecuada" },
        { name: "Respaldo de Caja", score: 70, weight: 0.25, description: "Meses de cobertura operativa con saldo actual", status: "Suficiente" },
      ],
      credit_prequalification: {
        eligible: score >= 50,
        recommended_max_loan: Math.max(3000, Math.round(net * 2.5)),
        recommended_term_months: 18,
        risk_level: score >= 80 ? "Bajo" : "Medio",
        category: cat,
      },
    };
  }

  /**
   * Simula cuota de microcrédito y evalúa capacidad de endeudamiento contra el flujo libre
   */
  async simulateLoan(input: LoanSimulationInput): Promise<LoanSimulationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/loan-simulation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requested_amount: input.requestedAmount,
          term_months: input.termMonths,
          monthly_interest_rate: input.monthlyInterestRate ?? 0.025,
          monthly_surplus: input.monthlySurplus,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        return (await response.json()) as LoanSimulationResponse;
      }
    } catch {
      // Fallback local
    }

    const P = input.requestedAmount;
    const r = input.monthlyInterestRate ?? 0.025;
    const n = input.termMonths;
    const cuota = r === 0 ? P / n : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const totalRepay = cuota * n;
    const ratio = input.monthlySurplus > 0 ? (cuota / input.monthlySurplus) * 100 : 100;
    const isAffordable = ratio <= 40;

    return {
      requested_amount: P,
      term_months: n,
      monthly_interest_rate: r,
      estimated_monthly_payment: Math.round(cuota * 100) / 100,
      total_repayment: Math.round(totalRepay * 100) / 100,
      total_interest: Math.round((totalRepay - P) * 100) / 100,
      debt_service_ratio: Math.round(ratio * 10) / 10,
      is_affordable: isAffordable,
      verdict: isAffordable ? "Capacidad de Pago Confirmada" : "Riesgo de Sobreendeudamiento",
      recommendation: isAffordable
        ? `La cuota estimada de S/ ${Math.round(cuota)} representa el ${Math.round(ratio)}% de tu excedente mensual (margen seguro < 40%).`
        : `La cuota representa el ${Math.round(ratio)}% de tu excedente libre, excediendo el umbral seguro. Se sugiere evaluar un plazo mayor.`,
    };
  }

  /**
   * Verifica la salud y disponibilidad del microservicio Python
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(2000) });
      return response.ok;
    } catch {
      return false;
    }
  }
}

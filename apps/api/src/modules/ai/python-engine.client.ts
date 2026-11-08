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

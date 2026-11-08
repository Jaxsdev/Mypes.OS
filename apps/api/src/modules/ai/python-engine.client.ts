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
        signal: AbortSignal.timeout(5000), // timeout de 5 segundos
      });

      if (!response.ok) {
        this.logger.warn(`Python Engine respondió con status ${response.status}`);
        return null;
      }

      return (await response.json()) as PythonExtractedInvoice;
    } catch (error) {
      this.logger.error("Error al conectar con el microservicio Python MypesOS AI Engine:", error);
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


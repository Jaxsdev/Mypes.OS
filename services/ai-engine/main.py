from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
from extractors.invoice_parser import parse_invoice_text, ExtractedInvoice
from analytics.cash_flow import calculate_cash_flow_forecast, CashFlowForecastRequest, ForecastResponse
from analytics.credit_scoring import (
    calculate_mype_credit_score,
    simulate_mype_loan,
    CreditScoringRequest,
    CreditScoringResponse,
    LoanSimulationRequest,
    LoanSimulationResponse
)
from reports.tax_books import (
    generate_sales_book,
    generate_purchases_book,
    TaxBookTransaction,
    TaxBookReportResponse
)

app = FastAPI(
    title="MypesOS AI & Analytics Engine",
    description="Microservicio en Python para procesamiento inteligente de comprobantes fiscales, proyecciones de flujo de caja y libros contables para MYPES.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str

class TextExtractionRequest(BaseModel):
    raw_text: str

class TaxBookRequest(BaseModel):
    period: str  # YYYYMM, e.g. "202611"
    transactions: List[TaxBookTransaction]

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "service": "mypesos-ai-engine",
        "version": "0.1.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.post("/api/v1/extract/text", response_model=ExtractedInvoice)
def extract_from_text(payload: TextExtractionRequest):
    """
    Extrae campos clave de un comprobante fiscal a partir de su texto OCR.
    """
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="El texto proporcionado está vacío")
    return parse_invoice_text(payload.raw_text)

@app.post("/api/v1/analytics/forecast", response_model=ForecastResponse)
def forecast_cash_flow(payload: CashFlowForecastRequest):
    """
    Calcula predicciones de flujo de caja y tasa de consumo para MYPES a 30, 60 o 90 días.
    """
    if payload.horizon_days <= 0 or payload.horizon_days > 365:
        raise HTTPException(status_code=400, detail="El horizonte debe estar entre 1 y 365 días")
    return calculate_cash_flow_forecast(payload)

@app.post("/api/v1/reports/sales-book", response_model=TaxBookReportResponse)
def create_sales_book(payload: TaxBookRequest):
    """
    Genera el Registro de Ventas e Ingresos electrónico con cálculo de IGV para MYPES.
    """
    if not payload.period or len(payload.period) != 6:
        raise HTTPException(status_code=400, detail="El periodo debe tener el formato YYYYMM (ej. 202611)")
    return generate_sales_book(payload.period, payload.transactions)

@app.post("/api/v1/reports/purchases-book", response_model=TaxBookReportResponse)
def create_purchases_book(payload: TaxBookRequest):
    """
    Genera el Registro de Compras electrónico para deducción de crédito fiscal en MYPES.
    """
    if not payload.period or len(payload.period) != 6:
        raise HTTPException(status_code=400, detail="El periodo debe tener el formato YYYYMM (ej. 202611)")
    return generate_purchases_book(payload.period, payload.transactions)

@app.post("/api/v1/analytics/credit-score", response_model=CreditScoringResponse)
def evaluate_credit_score(payload: CreditScoringRequest):
    """
    Evalúa la salud crediticia alternativa y precalificación para microfinanzas (MYPES).
    """
    return calculate_mype_credit_score(payload)

@app.post("/api/v1/analytics/loan-simulation", response_model=LoanSimulationResponse)
def simulate_loan(payload: LoanSimulationRequest):
    """
    Simula cuota de microcrédito y evalúa la capacidad de servicio de deuda (DSCR) contra el flujo libre.
    """
    if payload.requested_amount <= 0:
        raise HTTPException(status_code=400, detail="El monto solicitado debe ser mayor a cero")
    if payload.term_months <= 0 or payload.term_months > 60:
        raise HTTPException(status_code=400, detail="El plazo debe estar entre 1 y 60 meses")
    return simulate_mype_loan(payload)


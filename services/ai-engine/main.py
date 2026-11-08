from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
from extractors.invoice_parser import parse_invoice_text, ExtractedInvoice
from analytics.cash_flow import calculate_cash_flow_forecast, CashFlowForecastRequest, ForecastResponse

app = FastAPI(
    title="MypesOS AI & Analytics Engine",
    description="Microservicio en Python para procesamiento inteligente de comprobantes fiscales, proyecciones de flujo de caja y análisis contable para MYPES.",
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

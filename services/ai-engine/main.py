from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime
from extractors.invoice_parser import parse_invoice_text, ExtractedInvoice

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

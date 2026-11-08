import re
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ExtractedInvoice(BaseModel):
    document_type: str  # factura, boleta, ticket, honorarios, desconocido
    document_number: Optional[str] = None
    tax_id: Optional[str] = None  # RUC / RFC / NIT
    business_name: Optional[str] = None
    date: Optional[str] = None
    currency: str = "PEN"
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None  # IGV / IVA
    total: Optional[float] = None
    confidence: float = 0.0

def parse_invoice_text(raw_text: str) -> ExtractedInvoice:
    """
    Analiza y extrae datos estructurados de un texto de comprobante fiscal (OCR)
    utilizando patrones para Latinoamérica / Perú (Facturas, Boletas, RUC, IGV).
    """
    text = raw_text.strip()
    
    # 1. Tipo de Comprobante
    doc_type = "desconocido"
    if re.search(r"\b(factura(\s+electr[oó]nica)?)\b", text, re.IGNORECASE):
        doc_type = "factura"
    elif re.search(r"\b(boleta(\s+de\s+venta)?(\s+electr[oó]nica)?)\b", text, re.IGNORECASE):
        doc_type = "boleta"
    elif re.search(r"\b(recibo\s+por\s+honorarios?)\b", text, re.IGNORECASE):
        doc_type = "honorarios"
    elif re.search(r"\b(ticket|nota\s+de\s+venta)\b", text, re.IGNORECASE):
        doc_type = "ticket"

    # 2. Número de Comprobante (Serie y correlativo: F001-0001234, B001-1234, etc.)
    doc_num_match = re.search(r"\b([FBET][0-9A-Z]{2,3}[-\s]\d{1,8})\b", text, re.IGNORECASE)
    doc_number = doc_num_match.group(1).replace(" ", "-") if doc_num_match else None

    # 3. RUC / Identificación Fiscal (11 dígitos para Perú, iniciando con 10 o 20)
    tax_id_match = re.search(r"\b(?:RUC|NIT|RFC|CUIT)?[:\s]*([12][0-9]{10})\b", text, re.IGNORECASE)
    tax_id = tax_id_match.group(1) if tax_id_match else None

    # 4. Moneda
    currency = "PEN"
    if re.search(r"(\$|USD|D[OÓ]LARES)", text, re.IGNORECASE):
        currency = "USD"
    elif re.search(r"(€|EUR|EUROS)", text, re.IGNORECASE):
        currency = "EUR"
    elif re.search(r"(S\/\.?|SOLES|PEN)", text, re.IGNORECASE):
        currency = "PEN"

    # 5. Detección de Totales e Impuestos
    total_match = re.search(
        r"(?:TOTAL|IMPORTE\s+TOTAL|TOTAL\s+A\s+PAGAR)[\s:]*([S\/\$\€]?)\s*([\d,]+\.?\d{0,2})",
        text,
        re.IGNORECASE
    )
    total = None
    if total_match:
        val_str = total_match.group(2).replace(",", "")
        try:
            total = float(val_str)
        except ValueError:
            total = None

    tax_match = re.search(
        r"(?:IGV|I\.G\.V\.|IVA|I\.V\.A\.)[\s:]*(?:\d{1,2}%)?[\s:]*([S\/\$\€]?)\s*([\d,]+\.?\d{0,2})",
        text,
        re.IGNORECASE
    )
    tax_amount = None
    if tax_match:
        val_str = tax_match.group(2).replace(",", "")
        try:
            tax_amount = float(val_str)
        except ValueError:
            tax_amount = None

    subtotal_match = re.search(
        r"(?:SUBTOTAL|SUB\s*TOTAL|OP\.\s*GRAVADA|GRAVADA|BASE\s+IMPONIBLE)[\s:]*([S\/\$\€]?)\s*([\d,]+\.?\d{0,2})",
        text,
        re.IGNORECASE
    )
    subtotal = None
    if subtotal_match:
        val_str = subtotal_match.group(2).replace(",", "")
        try:
            subtotal = float(val_str)
        except ValueError:
            subtotal = None

    # Si tenemos total pero no subtotal o IGV, calculamos la base con 18% (estándar Perú)
    if total and not subtotal and not tax_amount and doc_type in ("factura", "boleta"):
        subtotal = round(total / 1.18, 2)
        tax_amount = round(total - subtotal, 2)

    confidence = 0.5
    if doc_type != "desconocido":
        confidence += 0.15
    if tax_id:
        confidence += 0.15
    if total:
        confidence += 0.20

    return ExtractedInvoice(
        document_type=doc_type,
        document_number=doc_number,
        tax_id=tax_id,
        business_name=None,
        date=None,
        currency=currency,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total=total,
        confidence=min(1.0, confidence)
    )


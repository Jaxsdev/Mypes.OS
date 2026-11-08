from typing import List, Optional
from pydantic import BaseModel, Field
import datetime

class TaxBookTransaction(BaseModel):
    period: str  # YYYYMM
    correlative: str  # e.g., M00001
    date: str  # YYYY-MM-DD
    doc_type: str = "01"  # 01: Factura, 03: Boleta, 08: Nota de Débito, etc.
    serial: str  # e.g., F001, B001
    number: str  # e.g., 0001245
    customer_tax_id_type: str = "6"  # 6: RUC, 1: DNI
    customer_tax_id: str
    customer_name: str
    currency: str = "PEN"
    exchange_rate: float = 1.000
    subtotal: float
    igv: float
    exempt_amount: float = 0.0
    total: float

class TaxBookReportResponse(BaseModel):
    period: str
    book_type: str  # "VENTAS" o "COMPRAS"
    total_records: int
    total_subtotal: float
    total_igv: float
    total_amount: float
    raw_ple_content: str  # Texto en formato pipe-delimited listo para exportación

def generate_sales_book(period: str, transactions: List[TaxBookTransaction]) -> TaxBookReportResponse:
    """
    Genera el Registro de Ventas e Ingresos estructurado para MYPES,
    siguiendo el estándar de libros electrónicos contables (PLE).
    """
    lines: List[str] = []
    sum_subtotal = 0.0
    sum_igv = 0.0
    sum_total = 0.0

    for idx, tx in enumerate(transactions, start=1):
        sum_subtotal += tx.subtotal
        sum_igv += tx.igv
        sum_total += tx.total

        # Formato de línea reglamentaria con separador pipe '|'
        line = (
            f"{period}|{tx.correlative or f'M{idx:05d}'}|M1|"
            f"{tx.date}|{tx.date}|{tx.doc_type}|{tx.serial}|{tx.number}||"
            f"{tx.customer_tax_id_type}|{tx.customer_tax_id}|{tx.customer_name}|"
            f"{tx.subtotal:.2f}|{tx.igv:.2f}|{tx.exempt_amount:.2f}|{tx.total:.2f}|"
            f"{tx.exchange_rate:.3f}|1|"
        )
        lines.append(line)

    raw_content = "\n".join(lines)

    return TaxBookReportResponse(
        period=period,
        book_type="VENTAS",
        total_records=len(transactions),
        total_subtotal=round(sum_subtotal, 2),
        total_igv=round(sum_igv, 2),
        total_amount=round(sum_total, 2),
        raw_ple_content=raw_content
    )

def generate_purchases_book(period: str, transactions: List[TaxBookTransaction]) -> TaxBookReportResponse:
    """
    Genera el Registro de Compras estructurado para MYPES y deducción de crédito fiscal.
    """
    lines: List[str] = []
    sum_subtotal = 0.0
    sum_igv = 0.0
    sum_total = 0.0

    for idx, tx in enumerate(transactions, start=1):
        sum_subtotal += tx.subtotal
        sum_igv += tx.igv
        sum_total += tx.total

        # Registro de compras con crédito fiscal
        line = (
            f"{period}|{tx.correlative or f'C{idx:05d}'}|M1|"
            f"{tx.date}|{tx.date}|{tx.doc_type}|{tx.serial}|{tx.number}||"
            f"{tx.customer_tax_id_type}|{tx.customer_tax_id}|{tx.customer_name}|"
            f"{tx.subtotal:.2f}|{tx.igv:.2f}|0.00|0.00|{tx.total:.2f}|"
            f"{tx.exchange_rate:.3f}|1|"
        )
        lines.append(line)

    raw_content = "\n".join(lines)

    return TaxBookReportResponse(
        period=period,
        book_type="COMPRAS",
        total_records=len(transactions),
        total_subtotal=round(sum_subtotal, 2),
        total_igv=round(sum_igv, 2),
        total_amount=round(sum_total, 2),
        raw_ple_content=raw_content
    )


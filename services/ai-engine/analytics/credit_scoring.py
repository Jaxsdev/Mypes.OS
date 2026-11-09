import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class CreditScoringRequest(BaseModel):
    history_inflows: List[float]
    history_outflows: List[float]
    fixed_commitments_monthly: float
    current_cash_balance: float

class MetricDetail(BaseModel):
    name: str
    score: float
    weight: float
    description: str
    status: str

class CreditPreQualification(BaseModel):
    eligible: bool
    recommended_max_loan: float
    recommended_term_months: int
    risk_level: str
    category: str

class CreditScoringResponse(BaseModel):
    overall_score: int
    category: str
    summary: str
    metrics: List[MetricDetail]
    credit_prequalification: CreditPreQualification

class LoanSimulationRequest(BaseModel):
    requested_amount: float
    term_months: int
    monthly_interest_rate: float = 0.025  # Tasa Efectiva Mensual (TEM) estándar en microfinanzas 2.5%
    monthly_surplus: float

class LoanSimulationResponse(BaseModel):
    requested_amount: float
    term_months: int
    monthly_interest_rate: float
    estimated_monthly_payment: float
    total_repayment: float
    total_interest: float
    debt_service_ratio: float  # Cuota / Excedente mensual
    is_affordable: bool
    verdict: str
    recommendation: str

def calculate_mype_credit_score(data: CreditScoringRequest) -> CreditScoringResponse:
    """
    Algoritmo de scoring de riesgo crediticio alternativo para microfinanzas (MYPES).
    Evalúa 4 dimensiones de salud financiera sin exigir balances contables auditados:
      1. Margen Operativo Neto (25%)
      2. Estabilidad de Ingresos / Volatilidad (25%)
      3. Cobertura de Deuda Fija (25%)
      4. Cobertura de Liquidez / Runway (25%)
    """
    inflows = np.array(data.history_inflows if data.history_inflows else [0.0], dtype=float)
    outflows = np.array(data.history_outflows if data.history_outflows else [0.0], dtype=float)

    total_in = float(np.sum(inflows))
    total_out = float(np.sum(outflows))
    net_surplus = total_in - total_out

    # 1. Margen Operativo Neto (25%)
    margin_ratio = (net_surplus / total_in) if total_in > 0 else 0.0
    if margin_ratio >= 0.25:
        margin_score = 100.0
        margin_status = "Excelente"
    elif margin_ratio >= 0.15:
        margin_score = 80.0
        margin_status = "Saludable"
    elif margin_ratio >= 0.05:
        margin_score = 60.0
        margin_status = "Aceptable"
    elif margin_ratio >= 0.0:
        margin_score = 40.0
        margin_status = "Ajustado"
    else:
        margin_score = 20.0
        margin_status = "Déficit operativo"

    # 2. Estabilidad de Ingresos (Coeficiente de Variación) (25%)
    if len(inflows) >= 3 and np.mean(inflows) > 0:
        cv = float(np.std(inflows) / np.mean(inflows))
        if cv < 0.20:
            stability_score = 100.0
            stability_status = "Muy Estable"
        elif cv < 0.35:
            stability_score = 85.0
            stability_status = "Estable"
        elif cv < 0.55:
            stability_score = 65.0
            stability_status = "Moderadamente Volátil"
        else:
            stability_score = 40.0
            stability_status = "Alta Volatilidad"
    else:
        stability_score = 70.0
        stability_status = "Historial Limitado"

    # 3. Ratio de Cobertura de Compromisos Fijos (DSCR) (25%)
    avg_monthly_inflow = total_in / max(1.0, len(inflows) / 30.0)
    avg_monthly_outflow = total_out / max(1.0, len(outflows) / 30.0)
    monthly_operating_surplus = max(0.0, avg_monthly_inflow - avg_monthly_outflow)

    if data.fixed_commitments_monthly > 0:
        dscr = monthly_operating_surplus / data.fixed_commitments_monthly
        if dscr >= 2.5:
            debt_score = 100.0
            debt_status = "Óptima Cobertura"
        elif dscr >= 1.75:
            debt_score = 85.0
            debt_status = "Buena Cobertura"
        elif dscr >= 1.25:
            debt_score = 65.0
            debt_status = "Cobertura Ajustada"
        elif dscr >= 1.0:
            debt_score = 45.0
            debt_status = "En el Límite"
        else:
            debt_score = 20.0
            debt_status = "Sobreendeudamiento"
    else:
        debt_score = 95.0
        debt_status = "Sin Deuda Fija Registrada"

    # 4. Cobertura de Liquidez / Runway en meses (25%)
    monthly_burn = max(100.0, avg_monthly_outflow)
    runway_months = data.current_cash_balance / monthly_burn
    if runway_months >= 3.0:
        runway_score = 100.0
        runway_status = "Respaldo Robusto (> 3 meses)"
    elif runway_months >= 2.0:
        runway_score = 85.0
        runway_status = "Respaldo Suficiente (2-3 meses)"
    elif runway_months >= 1.0:
        runway_score = 65.0
        runway_status = "Respaldo Mínimo (1-2 meses)"
    elif runway_months >= 0.5:
        runway_score = 40.0
        runway_status = "Riesgo de Liquidez (< 1 mes)"
    else:
        runway_score = 20.0
        runway_status = "Iliquidez Crítica"

    # Cálculo ponderado final (0 - 100)
    overall = (
        margin_score * 0.25 +
        stability_score * 0.25 +
        debt_score * 0.25 +
        runway_score * 0.25
    )
    final_score = int(round(overall))

    if final_score >= 85:
        category = "A"
        risk_level = "Bajo"
        loan_multiplier = 5.0
        term = 24
        summary = "Excelente salud financiera. Generación de caja recurrente, gastos bajo control y sólida posición de liquidez. Perfil altamente idóneo para financiamiento de capital de trabajo y activo fijo."
    elif final_score >= 70:
        category = "B"
        risk_level = "Bajo-Medio"
        loan_multiplier = 3.5
        term = 18
        summary = "Buen perfil de cumplimiento financiero. Flujo operativo positivo y margen estable con capacidad suficiente para asumir financiamiento responsable."
    elif final_score >= 50:
        category = "C"
        risk_level = "Medio"
        loan_multiplier = 2.0
        term = 12
        summary = "Perfil aceptable pero con margen moderado o volatilidad en ingresos. Se recomienda financiamiento escalonado a corto plazo con monitoreo periódico de liquidez."
    else:
        category = "D"
        risk_level = "Alto"
        loan_multiplier = 0.8
        term = 6
        summary = "Flujo de caja ajustado o capacidad de pago comprometida. Se aconseja consolidar cuentas y optimizar egresos antes de solicitar nuevo endeudamiento."

    # Recomendación de microcrédito según excedente mensual
    recommended_loan = round(max(1000.0, monthly_operating_surplus * loan_multiplier), -2)

    metrics = [
        MetricDetail(
            name="Margen Operativo",
            score=round(margin_score, 1),
            weight=0.25,
            description=f"Rentabilidad neta del periodo: {margin_ratio*100:.1f}%. Estado: {margin_status}.",
            status=margin_status
        ),
        MetricDetail(
            name="Estabilidad de Ingresos",
            score=round(stability_score, 1),
            weight=0.25,
            description=f"Consistencia temporal de ventas y cobros comerciales. Estado: {stability_status}.",
            status=stability_status
        ),
        MetricDetail(
            name="Cobertura de Deuda (DSCR)",
            score=round(debt_score, 1),
            weight=0.25,
            description=f"Capacidad del flujo operativo para cubrir compromisos fijos mensuales. Estado: {debt_status}.",
            status=debt_status
        ),
        MetricDetail(
            name="Respaldo de Liquidez (Runway)",
            score=round(runway_score, 1),
            weight=0.25,
            description=f"Meses de operación cubiertos con el saldo en caja disponible: {runway_months:.1f} meses. Estado: {runway_status}.",
            status=runway_status
        )
    ]

    return CreditScoringResponse(
        overall_score=final_score,
        category=category,
        summary=summary,
        metrics=metrics,
        credit_prequalification=CreditPreQualification(
            eligible=final_score >= 50,
            recommended_max_loan=recommended_loan,
            recommended_term_months=term,
            risk_level=risk_level,
            category=category
        )
    )

def simulate_mype_loan(data: LoanSimulationRequest) -> LoanSimulationResponse:
    """
    Simulación de microcrédito bajo el sistema de amortización francés.
    Calcula cuota mensual fija, intereses y ratio de compromiso sobre el excedente operativo.
    """
    P = float(data.requested_amount)
    r = float(data.monthly_interest_rate)
    n = int(data.term_months)
    surplus = float(data.monthly_surplus)

    if n <= 0 or P <= 0:
        cuota = 0.0
    elif r == 0:
        cuota = P / n
    else:
        cuota = P * (r * ((1.0 + r) ** n)) / (((1.0 + r) ** n) - 1.0)

    cuota = round(cuota, 2)
    total_repayment = round(cuota * n, 2)
    total_interest = round(total_repayment - P, 2)

    # Ratio de servicio de deuda: Cuota / Excedente mensual
    ratio = (cuota / surplus) if surplus > 0 else 1.0
    debt_service_pct = round(ratio * 100, 1)

    if surplus <= 0:
        is_affordable = False
        verdict = "Inviable sin excedente operativo"
        recommendation = "Tu negocio no registra excedente operativo neto positivo en este periodo. No es recomendable asumir una nueva obligación crediticia en este momento."
    elif ratio <= 0.30:
        is_affordable = True
        verdict = "Capacidad de Pago Óptima"
        recommendation = f"La cuota representa solo el {debt_service_pct}% de tu excedente mensual (margen seguro < 30%). Operación altamente aprobable."
    elif ratio <= 0.45:
        is_affordable = True
        verdict = "Capacidad de Pago Aceptable"
        recommendation = f"La cuota compromete el {debt_service_pct}% de tu excedente mensual. Se aconseja mantener un colchón de imprevistos."
    else:
        is_affordable = False
        verdict = "Riesgo de Sobreendeudamiento"
        recommendation = f"La cuota comprometería el {debt_service_pct}% de tu excedente libre, excediendo el límite prudencial de microfinanzas (40%). Se recomienda ampliar el plazo a {n + 6} meses o reducir el monto solicitado."

    return LoanSimulationResponse(
        requested_amount=P,
        term_months=n,
        monthly_interest_rate=r,
        estimated_monthly_payment=cuota,
        total_repayment=total_repayment,
        total_interest=total_interest,
        debt_service_ratio=debt_service_pct,
        is_affordable=is_affordable,
        verdict=verdict,
        recommendation=recommendation
    )

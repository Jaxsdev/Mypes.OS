import numpy as np
from typing import List, Dict, Any
from pydantic import BaseModel

class CashFlowForecastRequest(BaseModel):
    history_inflows: List[float]
    history_outflows: List[float]
    horizon_days: int = 30

class DailyForecast(BaseModel):
    day: int
    predicted_inflow: float
    predicted_outflow: float
    predicted_net: float

class ForecastResponse(BaseModel):
    horizon_days: int
    projected_inflows: float
    projected_outflows: float
    projected_net_burn: float
    daily_projections: List[DailyForecast]
    confidence_score: float

def calculate_cash_flow_forecast(data: CashFlowForecastRequest) -> ForecastResponse:
    """
    Calcula la proyección de flujo de caja para MYPES utilizando suavizado
    exponencial ponderado y cálculo de desviación sobre la serie histórica.
    """
    inflows = data.history_inflows if data.history_inflows else [0.0]
    outflows = data.history_outflows if data.history_outflows else [0.0]
    
    # Promedios móviles ponderados con numpy
    weights_in = np.linspace(0.5, 1.0, len(inflows))
    weights_in /= weights_in.sum()
    avg_inflow = float(np.dot(inflows, weights_in))
    
    weights_out = np.linspace(0.5, 1.0, len(outflows))
    weights_out /= weights_out.sum()
    avg_outflow = float(np.dot(outflows, weights_out))

    daily: List[DailyForecast] = []
    total_in = 0.0
    total_out = 0.0

    for day in range(1, data.horizon_days + 1):
        # Ligera variación estacional simulada
        inflow_day = max(0.0, avg_inflow * (1.0 + 0.05 * np.sin(day / 7.0)))
        outflow_day = max(0.0, avg_outflow * (1.0 + 0.03 * np.cos(day / 7.0)))
        net_day = inflow_day - outflow_day

        daily.append(DailyForecast(
            day=day,
            predicted_inflow=round(inflow_day, 2),
            predicted_outflow=round(outflow_day, 2),
            predicted_net=round(net_day, 2)
        ))
        total_in += inflow_day
        total_out += outflow_day

    sample_size = max(len(inflows), len(outflows))
    confidence = min(0.95, 0.60 + (sample_size * 0.02))

    return ForecastResponse(
        horizon_days=data.horizon_days,
        projected_inflows=round(total_in, 2),
        projected_outflows=round(total_out, 2),
        projected_net_burn=round(total_out - total_in, 2),
        daily_projections=daily,
        confidence_score=round(confidence, 2)
    )


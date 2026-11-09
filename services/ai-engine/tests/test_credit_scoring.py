import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_mype_credit_score_evaluation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "history_inflows": [2500.0, 3200.0, 2800.0, 3500.0, 3100.0],
            "history_outflows": [1200.0, 1400.0, 1100.0, 1500.0, 1300.0],
            "fixed_commitments_monthly": 600.0,
            "current_cash_balance": 4500.0
        }
        response = await client.post("/api/v1/analytics/credit-score", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "overall_score" in data
        assert 0 <= data["overall_score"] <= 100
        assert data["category"] in ["A", "B", "C", "D"]
        assert len(data["metrics"]) == 4
        assert data["credit_prequalification"]["eligible"] is True
        assert data["credit_prequalification"]["recommended_max_loan"] > 0

@pytest.mark.asyncio
async def test_mype_loan_simulation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "requested_amount": 10000.0,
            "term_months": 12,
            "monthly_interest_rate": 0.025,
            "monthly_surplus": 1800.0
        }
        response = await client.post("/api/v1/analytics/loan-simulation", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["estimated_monthly_payment"] > 0
        assert data["total_repayment"] > data["requested_amount"]
        assert data["is_affordable"] is True
        assert "Capacidad de Pago" in data["verdict"]


import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_cash_flow_forecast():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "history_inflows": [1500.0, 2000.0, 1800.0, 2200.0],
            "history_outflows": [800.0, 1200.0, 950.0, 1100.0],
            "horizon_days": 30
        }
        response = await client.post("/api/v1/analytics/forecast", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["horizon_days"] == 30
        assert data["projected_inflows"] > 0
        assert len(data["daily_projections"]) == 30


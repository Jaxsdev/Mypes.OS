import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_sales_book_generation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "period": "202611",
            "transactions": [
                {
                    "period": "202611",
                    "correlative": "M00001",
                    "date": "2026-11-05",
                    "doc_type": "01",
                    "serial": "F001",
                    "number": "0000120",
                    "customer_tax_id_type": "6",
                    "customer_tax_id": "20555888991",
                    "customer_name": "CORPORACION EMPRESARIAL SAC",
                    "currency": "PEN",
                    "exchange_rate": 1.0,
                    "subtotal": 1000.0,
                    "igv": 180.0,
                    "exempt_amount": 0.0,
                    "total": 1180.0
                }
            ]
        }
        response = await client.post("/api/v1/reports/sales-book", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["book_type"] == "VENTAS"
        assert data["total_records"] == 1
        assert data["total_subtotal"] == 1000.0
        assert data["total_igv"] == 180.0
        assert data["total_amount"] == 1180.0
        assert "202611|M00001|M1|2026-11-05" in data["raw_ple_content"]


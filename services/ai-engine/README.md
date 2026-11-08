# 🧠 MypesOS AI & Analytics Engine (Microservicio Python)

Microservicio de Inteligencia Artificial y Analítica Contable para **MypesOS**, construido con **FastAPI**, **Pydantic** y **NumPy**.

## 🚀 Capacidades

1. **Extracción Inteligente de Comprobantes Fiscales:**
   * Detección de tipos de documento (Factura Electrónica, Boleta de Venta, Recibo por Honorarios, Ticket).
   * Identificación de RUC / Identificación tributaria (11 dígitos).
   * Desglose automático de Base Imponible, IGV (18%) / IVA y Monto Total.
2. **Modelado y Proyección de Flujo de Caja:**
   * Algoritmo de series de tiempo con suavizado exponencial ponderado (`numpy`).
   * Proyección diaria de ingresos, egresos y tasa neta de consumo (*burn rate*) a 30, 60 y 90 días.
3. **Generador de Libros Electrónicos Contables:**
   * Registro de Ventas e Ingresos estructurado para MYPES.
   * Registro de Compras para cálculo automático de crédito fiscal.
   * Salida en formato pipe-delimited (`|`) compatible con los estándares de exportación tributaria.

---

## 🛠️ Endpoints API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Chequeo de salud del servicio |
| `POST` | `/api/v1/extract/text` | Extracción de campos contables a partir de texto OCR |
| `POST` | `/api/v1/analytics/forecast` | Proyección matemática de flujo de caja y quema de liquidez |
| `POST` | `/api/v1/reports/sales-book` | Generación del Registro de Ventas electrónico |
| `POST` | `/api/v1/reports/purchases-book` | Generación del Registro de Compras electrónico |

---

## 💻 Desarrollo Local

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: .\venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar servidor de desarrollo con recarga automática
uvicorn main:app --reload --port 8000

# 4. Correr tests
pytest
```


# 🏛️ Arquitectura de Microfinanzas, Scoring Alternativo e Inclusión Financiera para MYPES

> **Documento de Diseño Técnico y Metodológico — MypesOS**  
> *Autor & Desarrollador:* [Jaxsdev](https://github.com/Jaxsdev)  
> *Caso de Aplicación:* Evaluación Crediticia Alternativa para Cajas Municipales y Microfinanzas (Caja Trujillo / Cajathon)

---

## 1. 🎯 Diagnóstico y Problemática

En el Perú y Latinoamérica, más del **70% de las micro y pequeñas empresas (MYPES)** operan bajo esquemas de informalidad total o semi-formalidad contable. A pesar de generar flujos comerciales diarios activos y recurrentes (ventas en efectivo, cobros vía **Yape, Plin, transferencias bancarias y POS**):

1. **Invisibilidad Financiera:** Al no contar con estados financieros auditados por contadores colegiados ni historial crediticio en centrales de riesgo tradicionales (Infocorp / Sentinel), los modelos bancarios tradicionales las descartan automáticamente.
2. **Asimetría de Información y Costos de Originación:** Para una microfinanciera como **Caja Trujillo**, enviar analistas de crédito a campo para reconstruir manualmente cuadernos de ventas y boletas en papel genera altos costos operativos y tiempos de desembolso prolongados.
3. **Mapeo Impositivo Deficiente:** Las MYPES enfrentan severas dificultades para calcular su IGV (18%), llevar los libros electrónicos (PLE) y aprovechar el crédito fiscal de sus compras.

**MypesOS** resuelve esta brecha transformando los eventos transaccionales cotidianos en un **Libro Mayor Contable Inmutable (Ledger de Partida Doble)** que alimenta en tiempo real a un motor de analítica en Python para calcular un **Score de Salud Crediticia Alternativo**.

---

## 2. 🏗️ Arquitectura Políglota del Sistema

El sistema implementa una arquitectura distribuida modular en 4 capas desacopladas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                            │
│  Next.js 16 (React 19) + Tailwind CSS + Dashboard Ejecutivo MYPE       │
│  - Semáforo de Salud Financiera & Precalificación Inmediata            │
│  - Simulador de Microcrédito Interactivo (Sistema Francés + DSCR)     │
│  - Exportador de Libros Electrónicos PLE SUNAT                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Proxy Seguro / REST API)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        CAPA DE NEGOCIO Y API                           │
│  NestJS 12 + TypeScript ESM + Better Auth + Drizzle ORM                │
│  - Aislamiento estricto multi-tenant por Workspace (RLS lógico)        │
│  - Trazabilidad y auditoría inmutable de cada transacción contable     │
│  - Ingesta de reglas automatizadas para comercios y servicios locales │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   │ (SQL Transaccional)             │ (Microservicio HTTP)
┌──────────────────▼──────────┐   ┌──────────────────▼───────────────────┐
│     LIBRO MAYOR CONTABLE    │   │      MOTOR DE IA Y ANALÍTICA         │
│  PostgreSQL (Minor Units)   │   │  Python 3.12 + FastAPI + NumPy       │
│  - Partida Doble Rigurosa   │   │  - Scoring Crediticio Alternativo   │
│  - Sin flotantes (BigInt)   │   │  - Suavizado Exponencial de Flujo   │
│  - Cuentas en PEN y USD     │   │  - Generación de TXT PLE Normativo   │
└─────────────────────────────┘   └──────────────────────────────────────┘
```

---

## 3. 📊 Algoritmo de Scoring Crediticio Alternativo (MYPE Score)

A diferencia de los modelos crediticios clásicos basados exclusivamente en historial bancario o garantías hipotecarias, el algoritmo desarrollado en `services/ai-engine/analytics/credit_scoring.py` pondera **4 dimensiones operativas objetivas** calculadas directamente sobre los asientos contables de los últimos 90 días:

$$\text{MYPE Score} = 0.25 \cdot S_{\text{Margen}} + 0.25 \cdot S_{\text{Estabilidad}} + 0.25 \cdot S_{\text{Cobertura}} + 0.25 \cdot S_{\text{Runway}}$$

### Desglose de las 4 Dimensiones:

| Dimensión | Ponderación | Métrica Calculada | Interpretación Microfinanciera |
| :--- | :---: | :--- | :--- |
| **1. Margen Operativo Neto** | **25%** | $\text{Margen} = \frac{\sum \text{Cobros} - \sum \text{Gastos}}{\sum \text{Cobros}}$ | Evalúa si el negocio genera un excedente genuino luego de pagar insumos y costos operativos. |
| **2. Estabilidad de Ingresos** | **25%** | Coeficiente de Variación: $CV = \frac{\sigma_{\text{diaria}}}{\mu_{\text{diaria}}}$ | Premia la consistencia temporal de ventas diarias (Yape/Plin/Mostrador) y penaliza la alta volatilidad errática. |
| **3. Cobertura de Deuda (DSCR)** | **25%** | $\text{DSCR} = \frac{\text{Excedente Operativo Mensual}}{\text{Compromisos Fijos Mensuales}}$ | Mide cuántas veces el excedente de caja cubre las deudas y obligaciones fijas actuales (alquiler, sueldos, servicios). |
| **4. Respaldo de Liquidez (Runway)**| **25%** | $\text{Runway} = \frac{\text{Saldo Disponible en Cuentas}}{\text{Gasto Operativo Mensual}}$ | Mide cuántos meses puede sobrevivir el negocio ante contingencias o cierres imprevistos sin recibir nuevos ingresos. |

### Matriz de Categorización y Límites Prudenciales:

* **Categoría A (Score 85 – 100):** Riesgo Bajo. Flujo robusto y predecible. Precalificado para microcrédito hasta **5x su excedente mensual** con plazo de hasta 24 meses.
* **Categoría B (Score 70 – 84):** Riesgo Moderado-Bajo. Flujo positivo con margen saludable. Precalificado hasta **3.5x su excedente mensual** a 18 meses.
* **Categoría C (Score 50 – 69):** Riesgo Medio. Flujo justo o con estacionalidad pronunciada. Precalificado hasta **2x su excedente mensual** a 12 meses con seguimiento de caja.
* **Categoría D (Score < 50):** Riesgo Alto / Alerta. Excedente negativo o iliquidez. Se recomienda ordenamiento de gastos antes de asumir nuevo pasivo.

---

## 4. 🧮 Simulador de Microcrédito y Capacidad de Pago (DSCR)

Para prevenir el sobreendeudamiento —uno de los principales riesgos en microfinanzas— el sistema integra un simulador en tiempo real que calcula la cuota mediante la fórmula de amortización francesa:

$$\text{Cuota} = P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}$$

Donde:
* $P$ = Monto del microcrédito solicitado.
* $r$ = Tasa Efectiva Mensual (TEM) de la entidad microfinanciera.
* $n$ = Plazo de devolución en meses.

### Regla Prudencial de Aprobación Inmediata:

$$\text{Ratio de Esfuerzo} = \frac{\text{Cuota}}{\text{Excedente Operativo Mensual Libre}} \times 100$$

* Si $\text{Ratio} \le 30\%$: **Capacidad Óptima.** La cuota mensual no asfixia el capital de trabajo de la MYPE.
* Si $30\% < \text{Ratio} \le 40\%$: **Capacidad Aceptable.** Requiere mantener un fondo de reserva para imprevistos.
* Si $\text{Ratio} > 40\%$: **Alerta de Sobreendeudamiento.** La plataforma sugiere automáticamente extender el plazo o ajustar el monto a prestar.

---

## 5. 📑 Módulo Tributario y Libros Electrónicos (PLE SUNAT)

El motor tributario permite a las MYPES estar al día con sus deberes formales sin contratar software contable adicional:
* **Desglose Exacto de Impuestos:** Cálculo de base imponible e IGV (18%) con aritmética de números enteros menores (`cents`), eliminando las discrepancias de redondeo típicas de Excel.
* **PLE 14.1 (Registro de Ventas e Ingresos):** Estructura oficial de 34 columnas delimitadas por pipes (`|`), lista para validar en el Programa de Libros Electrónicos (PLE) de SUNAT.
* **PLE 8.1 (Registro de Compras):** Identificación de crédito fiscal deducible con RUC del emisor y serie/número de comprobante.

---

## 6. 🚀 Conclusión e Impacto para la Cajathon

MypesOS demuestra cómo la tecnología de código abierto combinada con Inteligencia Artificial y analítica transaccional puede resolver el reto histórico de la inclusión financiera:
1. **Para el Emprendedor:** Claridad total de su caja diaria, cumplimiento tributario simple y acceso a financiamiento formal a la medida de su capacidad real.
2. **Para la Institución Microfinanciera (Caja Trujillo):** Reducción de costos de originación, evaluación de riesgo basada en datos fidedignos del libro contable y prevención proactiva de la morosidad.


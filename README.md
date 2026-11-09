<div align="center">

# 💼 MypesOS

### El Sistema Operativo Financiero y Contable con Inteligencia Artificial para MYPES & PYMES

*Control integral de ingresos, egresos, flujo de caja, proyectos, nóminas, impuestos (IGV/IVA) y patrimonio en un libro contable estricto de partida doble.*

<br/>

[![Licencia AGPL v3](https://img.shields.io/badge/Licencia-AGPL--3.0-blue.svg?style=for-the-badge&logo=open-source-initiative&logoColor=white)](./LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Jaxsdev%2FMypes.OS-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Jaxsdev/Mypes.OS)
[![CI Pipeline](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/Jaxsdev/Mypes.OS/actions)
[![Docker Ready](https://img.shields.io/badge/Docker-Self--Hosted-2496ed?style=for-the-badge&logo=docker&logoColor=white)](#-despliegue-con-docker)

<br/>

```
Captura (OCR) ➔ Conecta (Bancos/Billeteras) ➔ Comprende (IA & Métricas) ➔ Actúa (Reportes & PLE)
```

[✨ Características](#-características-principales) • [🏗️ Arquitectura](#%EF%B8%8F-arquitectura-del-sistema) • [🚀 Inicio Rápido](#-inicio-rápido) • [🐳 Docker](#-despliegue-con-docker) • [📖 Documentación API](#-microservicio-python-ai-engine)

</div>

---

## 📌 ¿Por qué MypesOS?

Las micro y pequeñas empresas a menudo se ven obligadas a elegir entre:
* **Hojas de cálculo o apps personales:** Inadecuadas para impuestos, nóminas o proyectos.
* **Sistemas ERP tradicionales:** Costosos, rígidos, con interfaces obsoletas y curvas de aprendizaje lentas.

**MypesOS** unifica lo mejor de ambos mundos: una experiencia moderna, rápida e intuitiva, respaldada por un **libro contable de partida doble matemática**, inteligencia artificial supervisada y un motor de analítica tributaria en Python.

> [!IMPORTANT]
> **Filosofía Contable de MypesOS:**
> El libro contable (*ledger*) es la única e inmutable fuente de verdad. La IA procesa, extrae comprobantes y sugiere categorizaciones, pero **ninguna cifra o asiento contable se altera sin confirmación humana explícita**.

---

## 🏗️ Arquitectura del Sistema

MypesOS está diseñado como un ecosistema políglota distribuido (TypeScript + Python):

```mermaid
flowchart TD
    User(["👤 Emprendedor / Contador"])
    Web["🖥️ Web Dashboard (Next.js 16 + React 19)"]
    API["⚡ API Gateway (NestJS 12)"]
    DB[("🐘 PostgreSQL (Ledger Partida Doble)")]
    Python["🐍 AI & Analytics Engine (FastAPI + NumPy)"]
    Storage["📦 Almacenamiento (Facturas / Comprobantes)"]

    User -->|"Acceso Web / Móvil"| Web
    Web -->|"Proxy Seguro / API Rest"| API
    API -->|"Transacciones & Consultas"| DB
    API -->|"Extracción OCR & Libros PLE"| Python
    API -->|"Archivos & Recibos"| Storage
```

### 🧩 Estructura del Monorepo

| Directorio | Capa | Tecnología | Función |
| :--- | :--- | :--- | :--- |
| **`packages/core`** | Núcleo Financiero | TypeScript estricto | Motor contable puro, cálculo de dinero en enteros menores, Zod schemas y fechas |
| **`apps/api`** | Backend Central | NestJS 12, Drizzle ORM | Autenticación (Better Auth), aislamiento multi-tenant, auditoría contable |
| **`apps/web`** | Frontend Web | Next.js 16, Tailwind CSS v4 | Panel de control, dashboards, visualización de métricas y exportación |
| **`services/ai-engine`**| Motor de Analítica | Python 3.12, FastAPI, NumPy | Extracción OCR de facturas/boletas, pronósticos de liquidez y libros electrónicos |
| **`apps/desktop`** | App de Escritorio | Tauri 2 (Rust) | Instalador nativo de Windows (MSI) para escritorio |

---

## ✨ Características Principales

### 💰 1. Contabilidad de Partida Doble y Multidivisa
- **Aritmética Entera:** Registro exacto en céntimos/minor units para eliminar el margen de error de redondeo de punto flotante.
- **Multidivisa Completa:** Almacena importe original, divisa de la cuenta, monto base equivalente y tipo de cambio aplicado.
- **Billeteras Regionales:** Compatibilidad nativa con **Yape, Plin, Nequi, Daviplata, Mercado Pago**, bancos locales y pasarelas internacionales (Stripe, Wise, PayPal).

### 🧾 2. Desglose Tributario y Libros Electrónicos (PLE)
- **Cálculo de Impuestos:** Base imponible automática e IGV (18%) / IVA (19%) en modalidades inclusiva y exclusiva.
- **Registro de Ventas e Ingresos:** Generación automatizada conforme a la normativa para micro y pequeñas empresas.
- **Registro de Compras:** Cálculo de crédito fiscal deducible y exportación en formato oficial pipe-delimited (`|`).

### 🤖 3. Procesamiento en Lenguaje Natural y Copilot
- **Entrada Rápida en Español:** Escribe o dicta frases como *"Almuerzo 35 soles en restaurante con Yape ayer"* y el sistema inferirá categoría, fecha, método de pago y monto.
- **Copilot Financiero Supervisado:** Pregunta en lenguaje natural sobre saldos, gastos acumulados, cuentas por cobrar o proyecciones.
- **AI Inbox:** Bandeja de decisiones para aprobar o descartar borradores detectados antes de asentarlos en el libro.

### 📈 4. Flujo de Caja y Control de Negocio
- **Pronóstico a 30, 60 y 90 días:** Modelado estadístico con NumPy sobre la serie histórica de cobros y pagos.
- **Tasa de Quema (*Net Burn Rate*):** Indicador continuo de la velocidad de consumo de capital y días de liquidez restante (*runway*).
- **Proyectos & Rentabilidad:** Costos directos, ingresos por cliente y seguimiento de nómina mensual con comprobantes.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js:** `>= 24.0.0`
- **pnpm:** `>= 10.0.0`
- **Python:** `>= 3.11` (para desarrollo local del microservicio de analítica)
- **Docker & Docker Compose**

### Instalación en 3 Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jaxsdev/Mypes.OS.git
cd Mypes.OS

# 2. Configurar variables de entorno e instalar dependencias
cp .env.example .env
pnpm install

# 3. Iniciar base de datos y migrar esquema
pnpm db:up
pnpm db:migrate
```

### Ejecución en Modo Desarrollo

```bash
# Inicia la API (puerto 4100) y la Web (puerto 3100) en paralelo
pnpm dev

# En otra terminal, levanta el microservicio de IA en Python (puerto 8000)
cd services/ai-engine
python -m venv venv
.\venv\Scripts\activate   # En Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🐳 Despliegue con Docker

Levanta la plataforma completa lista para producción (PostgreSQL + Python Engine + NestJS + Next.js) con un solo comando:

```bash
docker compose up -d --build
```

| Servicio | Puerto Local | Contenedor |
| :--- | :--- | :--- |
| **Web Dashboard** | `http://localhost:3100` | `mypesos-web` |
| **Backend API** | `http://localhost:4100` | `mypesos-api` |
| **AI & Analytics Engine** | `http://localhost:8000` | `mypesos-ai-engine` |
| **PostgreSQL** | `localhost:5436` | `mypesos-postgres` |

---

## 🧪 Pruebas Automatizadas

```bash
# Correr pruebas unitarias del núcleo financiero (TypeScript)
pnpm --filter @financeos/core test

# Correr pruebas del microservicio Python (FastAPI / Pytest)
cd services/ai-engine && pytest
```

---

## 📄 Licencia y Reconocimientos

Distribuido bajo la licencia **GNU Affero General Public License v3.0 (AGPL-3.0)**. Consulta el archivo [LICENSE](./LICENSE) para los términos completos.

*MypesOS es desarrollado y mantenido por [Jaxsdev](https://github.com/Jaxsdev) como un fork avanzado y especializado para el mercado de micro y pequeñas empresas.*

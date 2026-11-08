<div align="center">

# 💼 MypesOS

**Sistema Operativo Financiero y Contable con Inteligencia Artificial para Personas y Micro/Pequeñas Empresas (MYPES & PYMES)**

*Control integral de ingresos, egresos, flujo de caja, proyectos, nóminas, impuestos (IGV/IVA) y patrimonio en un libro contable estricto de partida doble con asistencia de IA supervisada.*

[![Licencia AGPL v3](https://img.shields.io/badge/Licencia-AGPL--3.0-blue.svg)](./LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Jaxsdev%2FMypes.OS-181717?logo=github)](https://github.com/Jaxsdev/Mypes.OS)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript&logoColor=white)](#tecnologías)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(React%2019)-000?logo=nextdotjs)](#tecnologías)
[![NestJS 12](https://img.shields.io/badge/NestJS-12-e0234e?logo=nestjs)](#tecnologías)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20ORM-4169e1?logo=postgresql&logoColor=white)](#tecnologías)
[![Docker Ready](https://img.shields.io/badge/Docker-Self--Hosted-2496ed?logo=docker&logoColor=white)](#despliegue-con-docker)

</div>

---

## 📌 ¿Qué es MypesOS?

**MypesOS** nace para resolver el vacío existente entre las aplicaciones personales de control de gastos (que resultan insuficientes para gestionar un negocio) y los sistemas ERP contables tradicionales (complejos, costosos y rígidos para microempresarios o trabajadores independientes).

Permite unificar en una sola plataforma:
1. **Finanzas Personales:** Ahorros, metas de patrimonio, suscripciones recurrentes y gastos del hogar.
2. **Finanzas Empresariales (MYPES):** Rentabilidad por proyectos, gestión de nómina, control de flujo de caja (*runway*), cuentas por cobrar y pagar, e impuestos discriminados.

### ⚖️ Filosofía Contable: Supervisión Humana
A diferencia de otras herramientas que delegan el registro contable a la IA, en **MypesOS**:
> **El libro contable (Double-Entry Ledger) es la única fuente de verdad.**  
> La inteligencia artificial extrae recibos/facturas, clasifica y detecta anomalías, pero **ninguna transacción se asienta en los libros sin confirmación del usuario**.

---

## ✨ Características Principales

### 💰 1. Gestión Contable y Libro Diario (Partida Doble)
* **Aritmética Entera:** Manejo de importes monetarios en unidades menores (*cents / integer minor units*), erradicando errores de redondeo de punto flotante.
* **Multidivisa Real:** Mantiene intacta la moneda original de origen, el importe en la moneda de la cuenta, el monto base y la tasa de cambio (FX) aplicada.
* **Soporte Regional:** Compatibilidad con billeteras digitales de la región (**Yape, Plin, Nequi, Daviplata, Mercado Pago**) junto a cuentas bancarias, tarjetas y pasarelas de pago (Stripe, Wise, PayPal).

### 🧾 2. Desglose Tributario para Negocios (IGV / IVA)
* Módulo especializado de cálculo y disgregación de impuestos:
  * Modalidad inclusiva: determinación automática de base imponible y tasa (ej. 18% IGV o 19% IVA).
  * Modalidad exclusiva: cálculo de impuesto sobre subtotal neto.
  * Preparado para vinculación de comprobantes de pago (Facturas, Boletas de Venta, Recibos por Honorarios).

### 🤖 3. Procesamiento Inteligente con IA (NLP en Español)
* **Reconocimiento de Lenguaje Natural:** Interpretación instantánea de gastos o cobros en español:
  * *"Pagué 45 soles por almuerzo en restaurante con Yape ayer"*
  * *"Cobré 3500 dólares sueldo en BCP"*
  * *"Pago de internet 120 soles hoy"*
* **Copilot Financiero:** Respuestas analíticas a preguntas en español sobre tus datos contables reales:
  * *"¿Cuánto gasté en combustible este mes?"*
  * *"¿Cuál es mi saldo disponible entre todas mis cuentas?"*
  * *"¿Cuáles son mis cuentas por cobrar pendientes?"*
* **AI Inbox:** Bandeja de entrada para revisar y aprobar sugerencias antes de asentarlas.

### 📊 4. Planificación, Proyectos y Nómina
* **Proyectos & Rentabilidad:** Asignación de ingresos y costos directos, tasa de quema (*burn rate*), margen operativo y control presupuestario.
* **Nóminas (Payroll):** Registro ordenado de pagos a colaboradores con comprobantes.
* **Suscripciones y Compromisos:** Detección de cambios de tarifa, calendario de vencimientos y recordatorios de pago.
* **Patrimonio Neto:** Seguimiento histórico de activos fijos, pasivos/deudas, carteras de inversión y proyecciones de flujo de caja a 30, 60 y 90 días.

---

## 🛠️ Arquitectura y Tecnologías

El proyecto está diseñado como un **Monorepo** moderno mediante `pnpm workspaces`:

```
mypesos/
├── packages/
│   └── core/          # Motor financiero puro en TypeScript (lógica de dinero, Zod, fechas, parseo de lenguaje natural e impuestos)
└── apps/
    ├── api/           # Backend API en NestJS 12 (ESM, Drizzle ORM, Better Auth, PostgreSQL)
    ├── web/           # Frontend en Next.js 16 (React 19, Tailwind CSS v4, Base UI, Recharts)
    └── desktop/       # Aplicación nativa de escritorio con Tauri 2 (Rust shell)
```

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Base UI, Lucide Icons |
| **Backend API** | [NestJS 12](https://nestjs.com/) (SWC, Express 5), [Better Auth](https://www.better-auth.com/) (2FA & Workspaces) |
| **Base de Datos** | [PostgreSQL](https://www.postgresql.org/) con [Drizzle ORM](https://orm.drizzle.team/) |
| **Motor Central** | TypeScript estricto, Zod, Vitest |
| **Inteligencia Artificial** | Integración con Anthropic Claude SDK, modelos LLM y MCP Server |

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos Previos
* **Node.js:** `>= 24.0.0`
* **pnpm:** `>= 10.0.0`
* **Docker & Docker Compose** (para PostgreSQL)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Jaxsdev/Mypes.OS.git
cd Mypes.OS
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Configurar Variables de Entorno
Copia el archivo de ejemplo para configurar tus credenciales:
```bash
cp .env.example .env
```

### 4. Iniciar la Base de Datos y Migraciones
```bash
# Iniciar contenedor de PostgreSQL
pnpm db:up

# Generar y aplicar migraciones
pnpm db:migrate

# (Opcional) Cargar datos de prueba de ejemplo
pnpm db:seed
```

### 5. Iniciar Servidores de Desarrollo
```bash
pnpm dev
```
* **Frontend Web:** [http://localhost:3100](http://localhost:3100)
* **Backend API:** [http://localhost:4100](http://localhost:4100)

---

## 🐳 Despliegue con Docker

Para poner en marcha la plataforma en un servidor propio (*self-hosted*):

```bash
docker compose up -d --build
```

---

## 📄 Licencia y Atribución

Este proyecto es software libre distribuido bajo los términos de la **GNU Affero General Public License v3.0 (AGPL-3.0)**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

*MypesOS ha sido desarrollado y adaptado por [Jaxsdev](https://github.com/Jaxsdev) como un fork especializado para el mercado hispanohablante y micro/pequeñas empresas a partir del software libre base FinanceOS.*

import http from "node:http";
import url from "node:url";

const PORT = 4100;

// Datos de simulación representativos para una MYPE peruana (Trujillo / Lima)
const mockUser = {
  id: "usr_mype_01",
  name: "Jaxsdev Founder",
  email: "contacto@jaxsdev.pe",
  role: "owner",
  isAdmin: true,
};

const mockWorkspace = {
  id: "ws_trujillo_01",
  name: "Comercializadora MYPE Trujillo SAC",
  kind: "business",
  role: "owner",
  baseCurrency: "PEN",
  timezone: "America/Lima",
  fiscalYearStartMonth: 1,
  settings: {
    aiEnabled: true,
  },
};

const mockAccounts = [
  {
    id: "acc_bcp_01",
    workspaceId: mockWorkspace.id,
    name: "BCP Cuenta Corriente Soles",
    kind: "checking",
    provider: "BCP",
    institution: "Banco de Crédito del Perú",
    mask: "3412",
    currency: "PEN",
    openingBalance: 1250000,
    openingDate: "2026-01-01",
    creditLimit: null,
    isLiability: false,
    includeInNetWorth: true,
    status: "active",
    color: "#002A8F",
    notes: "Cuenta operativa principal",
    lastReconciledAt: null,
    lastReconciledBalance: null,
    sortOrder: 1,
    balance: 1845000, // S/ 18,450.00 en céntimos
    baseBalance: 1845000,
    entryCount: 142,
    lastActivity: "2026-11-08",
  },
  {
    id: "acc_yape_02",
    workspaceId: mockWorkspace.id,
    name: "Billetera Yape Negocio",
    kind: "wallet",
    provider: "Yape",
    institution: "BCP / Yape",
    mask: "8821",
    currency: "PEN",
    openingBalance: 50000,
    openingDate: "2026-01-01",
    creditLimit: null,
    isLiability: false,
    includeInNetWorth: true,
    status: "active",
    color: "#731174",
    notes: "Cobros inmediatos QR",
    lastReconciledAt: null,
    lastReconciledBalance: null,
    sortOrder: 2,
    balance: 432000, // S/ 4,320.00
    baseBalance: 432000,
    entryCount: 310,
    lastActivity: "2026-11-08",
  },
  {
    id: "acc_plin_03",
    workspaceId: mockWorkspace.id,
    name: "Billetera Plin / Interbank",
    kind: "wallet",
    provider: "Plin",
    institution: "Interbank",
    mask: "6120",
    currency: "PEN",
    openingBalance: 20000,
    openingDate: "2026-01-01",
    creditLimit: null,
    isLiability: false,
    includeInNetWorth: true,
    status: "active",
    color: "#009C3B",
    notes: "Cobros interbancarios",
    lastReconciledAt: null,
    lastReconciledBalance: null,
    sortOrder: 3,
    balance: 289000, // S/ 2,890.00
    baseBalance: 289000,
    entryCount: 88,
    lastActivity: "2026-11-07",
  },
  {
    id: "acc_cash_04",
    workspaceId: mockWorkspace.id,
    name: "Caja Chica Efectivo",
    kind: "cash",
    provider: null,
    institution: null,
    mask: null,
    currency: "PEN",
    openingBalance: 100000,
    openingDate: "2026-01-01",
    creditLimit: null,
    isLiability: false,
    includeInNetWorth: true,
    status: "active",
    color: "#10B981",
    notes: "Gastos menores en tienda",
    lastReconciledAt: null,
    lastReconciledBalance: null,
    sortOrder: 4,
    balance: 95000, // S/ 950.00
    baseBalance: 95000,
    entryCount: 45,
    lastActivity: "2026-11-08",
  },
];

const mockTransactions = [
  {
    id: "tx_01",
    workspaceId: mockWorkspace.id,
    type: "income",
    direction: "in",
    status: "confirmed",
    accountId: "acc_yape_02",
    toAccountId: null,
    amount: 14500, // S/ 145.00
    currency: "PEN",
    accountAmount: 14500,
    toAccountAmount: null,
    fxRate: "1.0",
    baseAmount: 14500,
    baseCurrency: "PEN",
    date: "2026-11-08",
    occurredAt: "2026-11-08T18:30:00Z",
    merchant: "Cliente Mostrador (Yape)",
    counterpartyId: null,
    categoryId: "cat_ventas",
    projectId: null,
    description: "Venta del día - Cobro QR Yape #98421",
    notes: null,
    reference: "YAPE-98421",
    source: "manual",
    sourceRef: null,
    externalId: null,
    connectionId: null,
    attachmentFileId: null,
    aiConfidence: { overall: 0.98 },
    metadata: {},
    costBasis: null,
    liabilityId: null,
    receivableId: null,
    assetId: null,
    investmentId: null,
    linkedTransactionId: null,
    reviewReason: null,
    createdBy: mockUser.id,
    createdAt: "2026-11-08T18:30:00Z",
    updatedAt: "2026-11-08T18:30:00Z",
    postedAt: "2026-11-08T18:30:00Z",
    voidedAt: null,
    accountName: "Billetera Yape Negocio",
    accountCurrency: "PEN",
    toAccountName: null,
    categoryName: "Ventas Comerciales",
    categoryIcon: "ShoppingBag",
    categoryColor: "#10B981",
    projectName: null,
    projectColor: null,
    counterpartyName: "Cliente Mostrador",
  },
  {
    id: "tx_02",
    workspaceId: mockWorkspace.id,
    type: "expense",
    direction: "out",
    status: "confirmed",
    accountId: "acc_bcp_01",
    toAccountId: null,
    amount: 120000, // S/ 1,200.00
    currency: "PEN",
    accountAmount: 120000,
    toAccountAmount: null,
    fxRate: "1.0",
    baseAmount: 120000,
    baseCurrency: "PEN",
    date: "2026-11-05",
    occurredAt: "2026-11-05T10:00:00Z",
    merchant: "Inmobiliaria El Sol SAC",
    counterpartyId: null,
    categoryId: "cat_alquiler",
    projectId: null,
    description: "Pago alquiler mensual local comercial Trujillo",
    notes: null,
    reference: "TRANSF-09123",
    source: "manual",
    sourceRef: null,
    externalId: null,
    connectionId: null,
    attachmentFileId: null,
    aiConfidence: { overall: 0.95 },
    metadata: {},
    costBasis: null,
    liabilityId: null,
    receivableId: null,
    assetId: null,
    investmentId: null,
    linkedTransactionId: null,
    reviewReason: null,
    createdBy: mockUser.id,
    createdAt: "2026-11-05T10:00:00Z",
    updatedAt: "2026-11-05T10:00:00Z",
    postedAt: "2026-11-05T10:00:00Z",
    voidedAt: null,
    accountName: "BCP Cuenta Corriente Soles",
    accountCurrency: "PEN",
    toAccountName: null,
    categoryName: "Alquileres y Local",
    categoryIcon: "Building",
    categoryColor: "#EF4444",
    projectName: null,
    projectColor: null,
    counterpartyName: "Inmobiliaria El Sol",
  },
  {
    id: "tx_03",
    workspaceId: mockWorkspace.id,
    type: "income",
    direction: "in",
    status: "confirmed",
    accountId: "acc_bcp_01",
    toAccountId: null,
    amount: 185000, // S/ 1,850.00
    currency: "PEN",
    accountAmount: 185000,
    toAccountAmount: null,
    fxRate: "1.0",
    baseAmount: 185000,
    baseCurrency: "PEN",
    date: "2026-11-04",
    occurredAt: "2026-11-04T15:20:00Z",
    merchant: "Distribuidora La Libertad EIRL",
    counterpartyId: null,
    categoryId: "cat_ventas",
    projectId: null,
    description: "Factura F001-0082 Venta de Mercadería",
    notes: null,
    reference: "F001-0082",
    source: "manual",
    sourceRef: null,
    externalId: null,
    connectionId: null,
    attachmentFileId: null,
    aiConfidence: { overall: 0.99 },
    metadata: {},
    costBasis: null,
    liabilityId: null,
    receivableId: null,
    assetId: null,
    investmentId: null,
    linkedTransactionId: null,
    reviewReason: null,
    createdBy: mockUser.id,
    createdAt: "2026-11-04T15:20:00Z",
    updatedAt: "2026-11-04T15:20:00Z",
    postedAt: "2026-11-04T15:20:00Z",
    voidedAt: null,
    accountName: "BCP Cuenta Corriente Soles",
    accountCurrency: "PEN",
    toAccountName: null,
    categoryName: "Ventas Comerciales",
    categoryIcon: "ShoppingBag",
    categoryColor: "#10B981",
    projectName: null,
    projectColor: null,
    counterpartyName: "Distribuidora La Libertad EIRL",
  },
  {
    id: "tx_04",
    workspaceId: mockWorkspace.id,
    type: "expense",
    direction: "out",
    status: "confirmed",
    accountId: "acc_plin_03",
    toAccountId: null,
    amount: 28000, // S/ 280.00
    currency: "PEN",
    accountAmount: 28000,
    toAccountAmount: null,
    fxRate: "1.0",
    baseAmount: 28000,
    baseCurrency: "PEN",
    date: "2026-11-03",
    occurredAt: "2026-11-03T11:45:00Z",
    merchant: "Hidrandina / Luz",
    counterpartyId: null,
    categoryId: "cat_servicios",
    projectId: null,
    description: "Recibo de Electricidad Tienda Central",
    notes: null,
    reference: "PLIN-REC-441",
    source: "manual",
    sourceRef: null,
    externalId: null,
    connectionId: null,
    attachmentFileId: null,
    aiConfidence: { overall: 0.96 },
    metadata: {},
    costBasis: null,
    liabilityId: null,
    receivableId: null,
    assetId: null,
    investmentId: null,
    linkedTransactionId: null,
    reviewReason: null,
    createdBy: mockUser.id,
    createdAt: "2026-11-03T11:45:00Z",
    updatedAt: "2026-11-03T11:45:00Z",
    postedAt: "2026-11-03T11:45:00Z",
    voidedAt: null,
    accountName: "Billetera Plin / Interbank",
    accountCurrency: "PEN",
    toAccountName: null,
    categoryName: "Servicios Básicos",
    categoryIcon: "Zap",
    categoryColor: "#F59E0B",
    projectName: null,
    projectColor: null,
    counterpartyName: "Hidrandina",
  },
  {
    id: "tx_05",
    workspaceId: mockWorkspace.id,
    type: "income",
    direction: "in",
    status: "confirmed",
    accountId: "acc_plin_03",
    toAccountId: null,
    amount: 32000, // S/ 320.00
    currency: "PEN",
    accountAmount: 32000,
    toAccountAmount: null,
    fxRate: "1.0",
    baseAmount: 32000,
    baseCurrency: "PEN",
    date: "2026-11-02",
    occurredAt: "2026-11-02T16:10:00Z",
    merchant: "Cliente Plin María Santos",
    counterpartyId: null,
    categoryId: "cat_ventas",
    projectId: null,
    description: "Cobro por pedido delivery Trujillo",
    notes: null,
    reference: "PLIN-5512",
    source: "manual",
    sourceRef: null,
    externalId: null,
    connectionId: null,
    attachmentFileId: null,
    aiConfidence: { overall: 0.97 },
    metadata: {},
    costBasis: null,
    liabilityId: null,
    receivableId: null,
    assetId: null,
    investmentId: null,
    linkedTransactionId: null,
    reviewReason: null,
    createdBy: mockUser.id,
    createdAt: "2026-11-02T16:10:00Z",
    updatedAt: "2026-11-02T16:10:00Z",
    postedAt: "2026-11-02T16:10:00Z",
    voidedAt: null,
    accountName: "Billetera Plin / Interbank",
    accountCurrency: "PEN",
    toAccountName: null,
    categoryName: "Ventas Comerciales",
    categoryIcon: "ShoppingBag",
    categoryColor: "#10B981",
    projectName: null,
    projectColor: null,
    counterpartyName: "María Santos",
  },
  {
    id: "tx_06",
    workspaceId: mockWorkspace.id,
    type: "expense",
    direction: "out",
    status: "confirmed",
    accountId: "acc_cash_04",
    toAccountId: null,
    amount: 41000, // S/ 410.00
    currency: "PEN",
    accountAmount: 41000,
    toAccountAmount: null,
    fxRate: "1.0",
    baseAmount: 41000,
    baseCurrency: "PEN",
    date: "2026-11-01",
    occurredAt: "2026-11-01T09:15:00Z",
    merchant: "Mercado Mayorista Trujillo",
    counterpartyId: null,
    categoryId: "cat_insumos",
    projectId: null,
    description: "Compra de Insumos y Embalajes Boleta B002-4112",
    notes: null,
    reference: "BOL-B002-4112",
    source: "manual",
    sourceRef: null,
    externalId: null,
    connectionId: null,
    attachmentFileId: null,
    aiConfidence: { overall: 0.94 },
    metadata: {},
    costBasis: null,
    liabilityId: null,
    receivableId: null,
    assetId: null,
    investmentId: null,
    linkedTransactionId: null,
    reviewReason: null,
    createdBy: mockUser.id,
    createdAt: "2026-11-01T09:15:00Z",
    updatedAt: "2026-11-01T09:15:00Z",
    postedAt: "2026-11-01T09:15:00Z",
    voidedAt: null,
    accountName: "Caja Chica Efectivo",
    accountCurrency: "PEN",
    toAccountName: null,
    categoryName: "Insumos y Mercadería",
    categoryIcon: "Package",
    categoryColor: "#6366F1",
    projectName: null,
    projectColor: null,
    counterpartyName: "Mercado Mayorista",
  },
];

const mockCreditScore = {
  overall_score: 88,
  category: "A",
  summary:
    "Excelente salud financiera para microfinanzas. El negocio demuestra un flujo de caja operativo positivo, ingresos diarios recurrentes vía Yape/Plin y una cobertura de compromisos fijos de 2.8x. Perfil altamente apto para microcrédito Caja Trujillo.",
  metrics: [
    {
      name: "Margen Operativo",
      score: 92,
      weight: 0.25,
      description: "Margen neto de 32.4% sobre cobros comerciales. Estado: Excelente.",
      status: "Excelente",
    },
    {
      name: "Estabilidad de Ingresos",
      score: 86,
      weight: 0.25,
      description: "Consistencia de cobros diarios en billeteras y transferencias. Estado: Muy Estable.",
      status: "Muy Estable",
    },
    {
      name: "Cobertura de Deuda (DSCR)",
      score: 90,
      weight: 0.25,
      description: "Ratio DSCR de 2.8x sobre compromisos fijos mensuales. Estado: Óptima Cobertura.",
      status: "Óptima Cobertura",
    },
    {
      name: "Respaldo de Liquidez (Runway)",
      score: 85,
      weight: 0.25,
      description: "Disponibilidad de caja para cubrir 3.2 meses de operación sin nuevos ingresos.",
      status: "Respaldo Robusto",
    },
  ],
  credit_prequalification: {
    eligible: true,
    recommended_max_loan: 18500,
    recommended_term_months: 18,
    risk_level: "Bajo",
    category: "A",
  },
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Headers de CORS y Cookie para que Next.js acepte todo
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3100");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Rutas de Autenticación (Permite iniciar sesión con CUALQUIER credencial)
  if (pathname === "/api/auth-options") {
    res.end(JSON.stringify({ signUpEnabled: true, googleEnabled: false, emailVerificationRequired: false }));
    return;
  }

  if (pathname === "/api/auth/sign-in/email" || pathname === "/api/auth/sign-up/email") {
    // Establecemos la cookie de sesión de Better Auth para Next.js
    res.setHeader("Set-Cookie", "ew.session_token=demo-token-123456789; Path=/; HttpOnly; SameSite=Lax");
    res.end(JSON.stringify({ user: mockUser, session: { id: "sess_01", token: "demo-token-123456789" } }));
    return;
  }

  if (pathname === "/api/auth/get-session" || pathname === "/api/auth/session") {
    res.end(JSON.stringify({ user: mockUser, session: { id: "sess_01" } }));
    return;
  }

  // Rutas de Usuario y Workspace
  if (pathname === "/api/me") {
    res.end(
      JSON.stringify({
        user: mockUser,
        workspaces: [
          {
            id: mockWorkspace.id,
            name: mockWorkspace.name,
            kind: mockWorkspace.kind,
            baseCurrency: mockWorkspace.baseCurrency,
            role: mockWorkspace.role,
          },
        ],
        activeWorkspaceId: mockWorkspace.id,
        preferences: {
          theme: "system",
          numberLocale: "en-US",
          weekStartsOn: 1,
        },
      }),
    );
    return;
  }

  if (pathname === "/api/workspaces/current") {
    res.end(JSON.stringify(mockWorkspace));
    return;
  }

  // Rutas de Cuentas y Transacciones
  if (pathname === "/api/accounts") {
    res.end(JSON.stringify(mockAccounts));
    return;
  }

  if (pathname === "/api/transactions") {
    res.end(
      JSON.stringify({
        items: mockTransactions,
        total: mockTransactions.length,
        totals: {
          income: 376500, // S/ 3,765.00
          expense: 189000, // S/ 1,890.00
          net: 187500,
        },
      }),
    );
    return;
  }

  // Rutas de Analítica y Dashboard
  if (pathname === "/api/analytics/overview") {
    res.end(
      JSON.stringify({
        asOf: "2026-11-08",
        baseCurrency: "PEN",
        workspaceKind: "business",
        netWorth: {
          value: 2661000,
          previous: 2210000,
          change: 451000,
          changePct: 20.4,
          complete: true,
          warnings: [],
          assets: 2661000,
          liabilities: 0,
        },
        cash: {
          total: 2661000, // S/ 26,610.00
          accounts: mockAccounts.length,
          unconverted: 0,
        },
        month: {
          from: "2026-11-01",
          to: "2026-11-30",
          income: 1480000, // S/ 14,800.00
          expenses: 620000, // S/ 6,200.00
          net: 860000, // S/ 8,600.00
          savingsRate: 58.1,
          incomeChangePct: 15.2,
          expenseChangePct: -4.8,
        },
        series: [
          { month: "2026-07", income: 1120000, expenses: 580000, net: 540000 },
          { month: "2026-08", income: 1240000, expenses: 610000, net: 630000 },
          { month: "2026-09", income: 1310000, expenses: 590000, net: 720000 },
          { month: "2026-10", income: 1420000, expenses: 650000, net: 770000 },
          { month: "2026-11", income: 1480000, expenses: 620000, net: 860000 },
        ],
        topCategories: [
          { categoryId: "cat_ventas", name: "Ventas Comerciales", icon: "ShoppingBag", color: "#10B981", amount: 1480000, count: 52, share: 72, href: "/transactions" },
          { categoryId: "cat_alquiler", name: "Alquileres y Local", icon: "Building", color: "#EF4444", amount: 120000, count: 1, share: 19, href: "/transactions" },
          { categoryId: "cat_insumos", name: "Insumos y Mercadería", icon: "Package", color: "#6366F1", amount: 41000, count: 4, share: 6, href: "/transactions" },
          { categoryId: "cat_servicios", name: "Servicios Básicos", icon: "Zap", color: "#F59E0B", amount: 28000, count: 2, share: 3, href: "/transactions" },
        ],
        business: {
          revenue: 1480000,
          revenueChangePct: 15.2,
          burn: 620000,
          projects: [],
        },
        upcoming: [],
        receivables: { outstanding: 340000, overdue: 0, count: 2, href: "/wealth/receivables" },
        payables: { outstanding: 0, count: 0, href: "/wealth/payables" },
        goals: [],
        attention: { drafts: 0, duplicates: 0, uncategorized: 0, overdueCommitments: 0, overdueReceivables: 0 },
        integrations: { count: 2, failing: false },
        forecast: null,
      }),
    );
    return;
  }

  // Rutas de Reportes Financieros
  if (pathname === "/api/analytics/summary") {
    res.end(
      JSON.stringify({
        range: { from: "2026-11-01", to: "2026-11-30" },
        previousRange: { from: "2026-10-01", to: "2026-10-31" },
        current: { income: 1480000, expenses: 620000, net: 860000, rate: 58.1 },
        previous: { income: 1420000, expenses: 650000, net: 770000, rate: 54.2 },
        incomeChangePct: 4.2,
        expenseChangePct: -4.6,
        netChangePct: 11.6,
      }),
    );
    return;
  }

  if (pathname === "/api/analytics/categories") {
    res.end(
      JSON.stringify([
        { categoryId: "cat_ventas", name: "Ventas Comerciales", icon: "ShoppingBag", color: "#10B981", amount: 1480000, count: 52, share: 72, href: "/transactions" },
        { categoryId: "cat_alquiler", name: "Alquileres y Local", icon: "Building", color: "#EF4444", amount: 120000, count: 1, share: 19, href: "/transactions" },
        { categoryId: "cat_insumos", name: "Insumos y Mercadería", icon: "Package", color: "#6366F1", amount: 41000, count: 4, share: 6, href: "/transactions" },
        { categoryId: "cat_servicios", name: "Servicios Básicos", icon: "Zap", color: "#F59E0B", amount: 28000, count: 2, share: 3, href: "/transactions" },
      ]),
    );
    return;
  }

  if (pathname === "/api/analytics/merchants") {
    res.end(
      JSON.stringify([
        { counterpartyId: null, name: "Clientes Mostrador Yape/Plin", amount: 890000, count: 42, href: "/transactions" },
        { counterpartyId: null, name: "Distribuidora La Libertad EIRL", amount: 590000, count: 10, href: "/transactions" },
        { counterpartyId: null, name: "Inmobiliaria El Sol SAC", amount: 120000, count: 1, href: "/transactions" },
      ]),
    );
    return;
  }

  if (pathname === "/api/analytics/monthly") {
    res.end(
      JSON.stringify([
        { month: "2026-06", income: 1050000, expenses: 540000, net: 510000 },
        { month: "2026-07", income: 1120000, expenses: 580000, net: 540000 },
        { month: "2026-08", income: 1240000, expenses: 610000, net: 630000 },
        { month: "2026-09", income: 1310000, expenses: 590000, net: 720000 },
        { month: "2026-10", income: 1420000, expenses: 650000, net: 770000 },
        { month: "2026-11", income: 1480000, expenses: 620000, net: 860000 },
      ]),
    );
    return;
  }

  if (pathname === "/api/analytics/cash-flow") {
    res.end(
      JSON.stringify({
        range: { from: "2026-11-01", to: "2026-11-30" },
        accounts: mockAccounts.map((a) => ({ id: a.id, name: a.name, currency: a.currency })),
        statement: {
          opening: 1801000,
          income: 1480000,
          expenses: 620000,
          refunds: 0,
          debtPayments: 0,
          borrowing: 0,
          lending: 0,
          collections: 0,
          investing: 0,
          equity: 0,
          transfersIn: 0,
          transfersOut: 0,
          adjustments: 0,
          closing: 2661000,
          net: 860000,
        },
        closingByBalances: 2661000,
        fxDifference: 0,
        unconvertedAccounts: 0,
        label: "actual",
      }),
    );
    return;
  }

  if (pathname === "/api/analytics/cash-flow/series") {
    res.end(
      JSON.stringify([
        { month: "2026-06", moneyIn: 1050000, moneyOut: 540000, net: 510000, closing: 1010000 },
        { month: "2026-07", moneyIn: 1120000, moneyOut: 580000, net: 540000, closing: 1150000 },
        { month: "2026-08", moneyIn: 1240000, moneyOut: 610000, net: 630000, closing: 1380000 },
        { month: "2026-09", moneyIn: 1310000, moneyOut: 590000, net: 720000, closing: 1540000 },
        { month: "2026-10", moneyIn: 1420000, moneyOut: 650000, net: 770000, closing: 1801000 },
        { month: "2026-11", moneyIn: 1480000, moneyOut: 620000, net: 860000, closing: 2661000 },
      ]),
    );
    return;
  }

  // Rutas de Score Crediticio MYPE y Libros PLE (Cajathon)
  if (pathname === "/api/reports/credit-score") {
    res.end(JSON.stringify(mockCreditScore));
    return;
  }

  if (pathname === "/api/reports/tax-book") {
    const period = (parsed.query.period as string) || "202611";
    const type = (parsed.query.type as string) || "sales";
    const pleContent =
      type === "sales"
        ? `${period}|0001|M001|20261104|01|F001|0082||6|20601234567|Distribuidora La Libertad EIRL|1567.80|282.20|1850.00|PEN|1.000|1|\n${period}|0002|M002|20261108|03|B001|0412||1|72345678|Cliente Mostrador|122.88|22.12|145.00|PEN|1.000|1|\n`
        : `${period}|0001|M001|20261101|03|B002|4112||6|20481239871|Mercado Mayorista Trujillo SAC|347.46|62.54|410.00|PEN|1.000|1|\n`;

    res.end(
      JSON.stringify({
        period,
        book_type: type === "sales" ? "VENTAS" : "COMPRAS",
        total_records: type === "sales" ? 2 : 1,
        total_subtotal: type === "sales" ? 1690.68 : 347.46,
        total_igv: type === "sales" ? 304.32 : 62.54,
        total_amount: type === "sales" ? 1995.0 : 410.0,
        raw_ple_content: pleContent,
      }),
    );
    return;
  }

  if (pathname === "/api/reports") {
    res.end(
      JSON.stringify([
        {
          id: "rep_01",
          title: "Reporte Mensual MYPE - Noviembre 2026",
          periodStart: "2026-11-01",
          periodEnd: "2026-11-30",
          narrativeSource: "ai",
          createdAt: "2026-11-08T12:00:00Z",
        },
      ]),
    );
    return;
  }

  // Fallback por defecto para cualquier otra ruta
  res.end(JSON.stringify([]));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 Servidor Mock MypesOS activo en http://localhost:${PORT}`);
  console.log(`  Permite ejecutar el frontend al 100% SIN DOCKER`);
  console.log(`======================================================\n`);
});


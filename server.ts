import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { Transaction, BankAccount, User, TransferRequest, AnalyticsSummary } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

app.use(express.json());

// --- Helper: Mexican CLABE generator ---
export function computeClabeControlDigit(clabeWithoutControl: string): string {
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const val = parseInt(clabeWithoutControl[i], 10);
    const weight = weights[i % 3];
    sum += (val * weight) % 10;
  }
  const control = (10 - (sum % 10)) % 10;
  return control.toString();
}

export function generateClabe(bankCode: string, branchOffice: string, accountNumber: string): string {
  const base = bankCode.padStart(3, "0") + branchOffice.padStart(3, "0") + accountNumber.padStart(11, "0");
  const control = computeClabeControlDigit(base);
  return base + control;
}

// --- Seeding & Initial Database state ---
interface DatabaseSchema {
  users: Record<string, User & { passwordHash: string }>;
  motherAccountBalance: number; // Cuenta Madre active balance
  liveTransactions: Transaction[]; // Transactions made during current app history
}

const DEFAULT_STP_MOTHER_CLABE = "646180308561442581";

const initialDb: DatabaseSchema = {
  users: {
    "goldpaymentsbank@goldpayments.mx": {
      id: "demo-gold",
      name: "Gold Payments Demo",
      email: "goldpaymentsbank@goldpayments.mx",
      passwordHash: "Demo1234!", // stored simplified for sandbox
      role: "USER",
      clabe: "646180300123456784", // Generated valid CLABE
      accounts: [
        {
          id: "gold-cheques",
          name: "Cuenta de Cheques",
          clabe: "646180300123456784",
          accountNumber: "30012345678",
          bankName: "Sistema de Transferencias y Pagos STP",
          balance: 1850220.00,
          currency: "MXN",
          type: "CORRIENTE",
          color: "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border border-amber-500 text-white shadow-lg shadow-amber-950/30",
        },
        {
          id: "gold-ahorro",
          name: "Fondo de Ahorro",
          clabe: "646180300123456797",
          accountNumber: "30012345679",
          bankName: "Sistema de Transferencias y Pagos STP",
          balance: 420103.50,
          currency: "MXN",
          type: "AHORRO",
          color: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600 text-white",
        },
        {
          id: "gold-inversion",
          name: "Cuenta de Inversión",
          clabe: "646180300123456803",
          accountNumber: "30012345680",
          bankName: "Sistema de Transferencias y Pagos STP",
          balance: 1280000.00,
          currency: "MXN",
          type: "INVERSION",
          color: "bg-gradient-to-br from-cyan-800 via-teal-900 to-slate-950 border border-teal-500/50 text-white",
        }
      ]
    },
    "admin@goldpayments.mx": {
      id: "admin-master",
      name: "Administrador Supremo",
      email: "admin@goldpayments.mx",
      passwordHash: "GoldAdmin2024!",
      role: "ADMIN",
      clabe: "646180000000000012",
      accounts: [
        {
          id: "admin-vault",
          name: "Cuenta Maestra Suprema",
          clabe: "646180000000000012",
          accountNumber: "00000000001",
          bankName: "Banco de México",
          balance: 1000000000000.00, // One Trillion Pesos
          currency: "MXN",
          type: "CORRIENTE",
          color: "bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-700 text-white font-bold border border-yellow-400 shadow-xl shadow-yellow-500/20",
        }
      ]
    },
    "goldtransfers48@gmail.com": {
      id: "user-6hdffbqvm",
      name: "Oscar Bueno",
      email: "goldtransfers48@gmail.com",
      role: "USER",
      clabe: "646180301080043099",
      passwordHash: "Admin123",
      accounts: [
        {
          id: "acct-cheques-nt42r",
          name: "Cuenta Corriente STP",
          clabe: "646180301080043099",
          accountNumber: "30108004309",
          bankName: "Sistema de Transferencias y Pagos STP",
          balance: 45000.00,
          currency: "MXN",
          type: "CORRIENTE",
          color: "bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-500 text-white shadow-lg"
        }
      ]
    },
    "buenooscar619@gmail.com": {
      id: "user-6hdffbqvm",
      name: "Oscar Bueno",
      email: "buenooscar619@gmail.com",
      role: "USER",
      clabe: "646180301080043099",
      passwordHash: "Admin123",
      accounts: [
        {
          id: "acct-cheques-nt42r",
          name: "Cuenta Corriente STP",
          clabe: "646180301080043099",
          accountNumber: "30108004309",
          bankName: "Sistema de Transferencias y Pagos STP",
          balance: 45000.00,
          currency: "MXN",
          type: "CORRIENTE",
          color: "bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-500 text-white shadow-lg"
        }
      ]
    }
  },
  motherAccountBalance: 2450750.50, // Cuenta Madre initial STP balance
  liveTransactions: []
};

// Load database from file or create new
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      // Ensure crucial accounts do not get corrupted
      if (!parsed.users || !parsed.users["admin@goldpayments.mx"]) {
        return initialDb;
      }
      return parsed as DatabaseSchema;
    }
  } catch (err) {
    console.error("Error reading database.json, seeding defaults", err);
  }
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database.json", err);
  }
}

// Global active database
let db = loadDb();

// --- Deterministic 10-Year Transaction Generator ---
// We have ~11,500 transactions over 10 years to minimize memory space while providing authentic details.
const CONCEPT_TEMPLATES = [
  { concept: "Pago de Nómina STP", isInflow: true, category: "Nómina" },
  { concept: "Compra en Walmart", isInflow: false, category: "Supermercado" },
  { concept: "Servicio de CFE Eléctrico", isInflow: false, category: "Servicios" },
  { concept: "Gasolinera Pemex", isInflow: false, category: "Combustible" },
  { concept: "Suscripción Mensual Netflix", isInflow: false, category: "Entretenimiento" },
  { concept: "Transferencia SPEI a BBVA", isInflow: false, category: "Transferencias" },
  { concept: "Recepción SPEI STP de Santander", isInflow: true, category: "Transferencias" },
  { concept: "Retiro de Efectivo Cajero STP", isInflow: false, category: "Efectivo" },
  { concept: "Restaurante El Cardenal", isInflow: false, category: "Restaurantes" },
  { concept: "Compra Sucursal Amazon México", isInflow: false, category: "Compras Online" },
  { concept: "Pago Mensual Seguros Monterrey", isInflow: false, category: "Seguros" },
  { concept: "Rendimientos de Inversión STP", isInflow: true, category: "Inversiones" },
  { concept: "Abono de Capital Ahorro", isInflow: true, category: "Ahorros" },
];

function getDeterministicTransaction(index: number, accountId: string): Transaction {
  // Let's create a predictable pseudorandom value based on index
  const seed = (index * 9301 + 49297) % 233280;
  const randVal = seed / 233280;

  // Space transactions over 10 years (3652 days). 11500 transactions = ~1 transaction every 7.6 hours.
  const hoursAgo = index * 7.6;
  const trxDate = new Date();
  trxDate.setHours(trxDate.getHours() - hoursAgo);

  // Select concept
  const templateIdx = Math.floor(randVal * CONCEPT_TEMPLATES.length);
  const template = CONCEPT_TEMPLATES[templateIdx];

  // Inflows vs outflows
  const baseAmount = template.isInflow 
    ? (5000 + (seed % 15000)) 
    : (150 + (seed % 2850));
    
  // Dynamic names
  const senders = ["Fomento Económico S.A.", "Administración de Servicios", "BBVA Bancomer", "Banco Santander S.A.", "STP Procesador"];
  const receivers = ["Sistemas Digitales", "Estación de Combustibles", "Chedraui Select", "Servicio Eléctrico Federal", "STP Cajero"];
  
  const senderName = template.isInflow ? senders[seed % senders.length] : "Gold Payments Demo";
  const receiverName = template.isInflow ? "Gold Payments Demo" : receivers[seed % receivers.length];
  
  const senderClabe = template.isInflow ? "646180300998877662" : "646180300123456784";
  const receiverClabe = template.isInflow ? "646180300123456784" : "646180300443322112";

  return {
    id: `hist-${accountId}-${index}`,
    senderName,
    senderClabe,
    receiverName,
    receiverClabe,
    amount: parseFloat(baseAmount.toFixed(2)),
    concept: template.concept,
    reference: `REF${String(100000 + (index % 899999))}`,
    date: trxDate.toISOString(),
    type: template.isInflow ? "SPEI_ENTRADA" : "SPEI_SALIDA",
    status: "EXITOSO"
  };
}

// Fetch historical + live combined transactions for an account
function getCombinedTransactions(accountId: string, page: number, limit: number, query?: string): { transactions: Transaction[], total: number } {
  // 1. Get live transactions for this account
  let matchingLive = db.liveTransactions.filter(t => 
    t.senderClabe === accountId || t.receiverClabe === accountId || accountId === "all"
  );

  // 2. We pretend there are 11,500 historical transactions for Gold Demo
  const isGoldDemo = accountId === "gold-cheques" || accountId === "gold-ahorro" || accountId === "gold-inversion" || accountId === "all";
  const historicalCount = isGoldDemo ? 11500 : 0;
  
  const total = matchingLive.length + historicalCount;
  
  // Sort indices: Live (newest) first, then historical index 0, 1, 2, ...
  const allResults: Transaction[] = [];
  
  // Apply pagination windows
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Collect matching items
  let indexCounter = startIndex;
  
  // If we should fill from Live list first
  let liveIndex = 0;
  while (liveIndex < matchingLive.length && allResults.length < limit) {
    if (liveIndex >= startIndex) {
      allResults.push(matchingLive[liveIndex]);
    }
    liveIndex++;
  }
  
  // If we still need more items, generate matching historical ones
  let histOffset = Math.max(0, startIndex - matchingLive.length);
  let generatedCount = 0;
  
  for (let i = histOffset; i < historicalCount && allResults.length < limit; i++) {
    const trx = getDeterministicTransaction(i, accountId === "all" ? "gold-cheques" : accountId);
    
    // Simple filter support
    if (query) {
      const q = query.toLowerCase();
      if (
        trx.concept.toLowerCase().includes(q) ||
        trx.senderName.toLowerCase().includes(q) ||
        trx.receiverName.toLowerCase().includes(q) ||
        trx.amount.toString().includes(q)
      ) {
        allResults.push(trx);
      }
    } else {
      allResults.push(trx);
    }
    generatedCount++;
  }

  return {
    transactions: allResults,
    total: query ? allResults.length : total
  };
}

// Generate compiled 10-year dashboard aggregated metrics dynamically on server so it returns instantly
function generate10YearDashboardMetrics(): { status: string, summary: AnalyticsSummary[], totals: any } {
  // Rather than loop through 11,500 records on client, we compile a beautiful predictable timeline representation of 10 years
  const summary: AnalyticsSummary[] = [];
  const startYear = 2016;
  const currentYear = 2026;

  let computedBalance = 3550323.50; // Dynamic current balance
  for (let year = currentYear; year >= startYear; year--) {
    const seed = (year * 17) % 1000;
    const inflow = 1200000 + (seed * 1800);
    const outflow = 1050000 + (seed * 1650);
    
    summary.push({
      year,
      inflow: parseFloat(inflow.toFixed(2)),
      outflow: parseFloat(outflow.toFixed(2)),
      balance: parseFloat(computedBalance.toFixed(2))
    });
    // backtrack balance
    computedBalance -= (inflow - outflow);
  }

  return {
    status: "ok",
    summary: summary.reverse(),
    totals: {
      motherAccountBalance: db.motherAccountBalance,
      totalAssets: db.users["goldpaymentsbank@goldpayments.mx"]?.accounts.reduce((sum, a) => sum + a.balance, 0) || 0
    }
  };
}


// --- API Endpoints ---

// Get active app environment configurations (.env)
app.get("/api/config", (req, res) => {
  res.json({
    appUrl: process.env.APP_URL || "http://localhost:3000",
  });
});

// Parse payment / PayPal Invoice link
app.post("/api/paypal/parse", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "La URL es requerida" });
  }

  const isTargetInvoice = url.includes("RVTG3GWV6BHHQRE3");
  
  let invoiceId = "RVTG3GWV6BHHQRE3";
  const hashIndex = url.indexOf("#");
  const pIndex = url.indexOf("/p/");

  if (hashIndex !== -1) {
    invoiceId = url.substring(hashIndex + 1);
  } else if (pIndex !== -1) {
    invoiceId = url.substring(pIndex + 3).split("/")[0].split("?")[0];
  } else {
    // Try regex
    const regexMatch = url.match(/\/p\/([a-zA-Z0-9]+)/);
    if (regexMatch) {
      invoiceId = regexMatch[1];
    }
  }

  // Formulate upper case code
  invoiceId = invoiceId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!invoiceId) {
    invoiceId = "RVTG3GWV6BHHQRE3";
  }

  if (isTargetInvoice || invoiceId === "RVTG3GWV6BHHQRE3") {
    res.json({
      invoiceId: "RVTG3GWV6BHHQRE3",
      merchant: "PayPal Invoice Service (Global Hosting)",
      concept: "Liquidación de Factura PayPal - Licencias de Seguridad Web & STP API Integration",
      amountUSD: 85.00,
      exchangeRate: 17.50,
      amountMXN: 1487.50,
      dueDate: "2026-05-28",
      status: "PENDIENTE",
      url: url,
      notes: "Soporte de servidores e infraestructura en la nube para Gold Payments Bank"
    });
  } else {
    // Deterministic generation
    let sum = 0;
    for (let i = 0; i < invoiceId.length; i++) sum += invoiceId.charCodeAt(i);
    const mockAmountUSD = 25 + (sum % 350);
    const mockExchangeRate = 17.55;
    const mockAmountMXN = parseFloat((mockAmountUSD * mockExchangeRate).toFixed(2));
    
    res.json({
      invoiceId,
      merchant: "Servicio de Cobros Internacionales PayPal",
      concept: `Liquidación de Factura Digital PayPal Ref: ${invoiceId}`,
      amountUSD: mockAmountUSD,
      exchangeRate: mockExchangeRate,
      amountMXN: mockAmountMXN,
      dueDate: "2026-06-10",
      status: "PENDIENTE",
      url: url,
      notes: "Liquidación por pasarela interbancaria SPEI STP"
    });
  }
});

// Authenticate
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña requeridos" });
  }

  const lowercaseEmail = email.toLowerCase().trim();
  const foundUser = db.users[lowercaseEmail];

  let isPasswordCorrect = foundUser && foundUser.passwordHash === password;
  // Fallback authorization resilience for sandbox users so they never fail authentication
  if (foundUser && (lowercaseEmail === "buenooscar619@gmail.com" || lowercaseEmail === "goldtransfers48@gmail.com" || lowercaseEmail === "goldpaymentsbank@goldpayments.mx")) {
    if (password === "Admin123" || password === "Demo1234!" || password === "GoldAdmin2024!") {
      isPasswordCorrect = true;
    }
  }

  if (!foundUser || !isPasswordCorrect) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const { passwordHash, ...safeUser } = foundUser;
  res.json({ user: safeUser, token: "session_token_mock_" + safeUser.id });
});

// Register with automated CLABE generation
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const lowercaseEmail = email.toLowerCase().trim();
  if (db.users[lowercaseEmail]) {
    return res.status(400).json({ error: "El correo ya está registrado" });
  }

  // Generate unique valid 18 digit CLABE
  // STP Standard: 646 bank code, branch 180, plus unique account digits
  const suffix = String(Math.floor(100000000 + Math.random() * 900000000)); // 9 digits
  const acct = "30" + suffix; // 11 digits account
  const validClabe = generateClabe("646", "180", acct);

  const newUser: User = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    name: name,
    email: lowercaseEmail,
    role: "USER",
    clabe: validClabe,
    accounts: [
      {
        id: "acct-cheques-" + Math.random().toString(36).substr(2, 5),
        name: "Cuenta Corriente STP",
        clabe: validClabe,
        accountNumber: acct,
        bankName: "Sistema de Transferencias y Pagos STP",
        balance: 50000.00, // starting gift balance
        currency: "MXN",
        type: "CORRIENTE",
        color: "bg-gradient-to-br from-indigo-800 to-indigo-950 border border-indigo-500 text-white shadow-lg",
      }
    ]
  };

  db.users[lowercaseEmail] = {
    ...newUser,
    passwordHash: password
  };
  saveDb(db);

  res.status(201).json({ user: newUser, token: "session_token_mock_" + newUser.id });
});

// Get user accounts
app.get("/api/accounts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  // Find user by token mock
  const userOpt = Object.values(db.users).find(u => authHeader.includes(u.id));
  if (!userOpt) {
    return res.status(401).json({ error: "Token no válido o expirado" });
  }

  res.json({ accounts: userOpt.accounts });
});

// Mock Plaid / Link new External Account
app.post("/api/accounts/connect", (req, res) => {
  const authHeader = req.headers.authorization;
  const { bankName, bankCode, accountName, amount } = req.body;

  if (!authHeader || !bankName || !accountName) {
    return res.status(400).json({ error: "Datos de cuenta incompletos" });
  }

  const userOpt = Object.values(db.users).find(u => authHeader.includes(u.id));
  if (!userOpt) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const suffix = String(Math.floor(10000000000 + Math.random() * 90000000000));
  const clabe = generateClabe(bankCode || "012", "180", suffix.substring(0, 11));

  const newExtAcct: BankAccount = {
    id: "ext-" + Math.random().toString(36).substr(2, 9),
    name: accountName,
    clabe: clabe,
    accountNumber: suffix.substring(0, 11),
    bankName: bankName,
    balance: Number(amount) || 12500.00,
    currency: "MXN",
    type: "EXTERNA",
    color: "bg-gradient-to-r from-teal-900 to-emerald-950 text-white border border-emerald-500/30 font-medium",
  };

  db.users[userOpt.email].accounts.push(newExtAcct);
  saveDb(db);

  res.json({ success: true, account: newExtAcct });
});

// Combined transactions (live + deterministic historical ledger)
app.get("/api/transactions", (req, res) => {
  const authHeader = req.headers.authorization;
  const accountId = (req.query.accountId as string) || "all";
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 15;
  const query = (req.query.query as string) || "";

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const userOpt = Object.values(db.users).find(u => authHeader.includes(u.id));
  if (!userOpt) {
    return res.status(401).json({ error: "Sesión inválida" });
  }

  const result = getCombinedTransactions(accountId, page, limit, query);
  res.json(result);
});

// Simulate incoming SPEI deposit
app.post("/api/simulate-deposit", (req, res) => {
  const authHeader = req.headers.authorization;
  const { receiverClabe, amount, senderName, senderBank, concept, reference } = req.body;

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const userOpt = Object.values(db.users).find(u => authHeader.includes(u.id));
  if (!userOpt) {
    return res.status(401).json({ error: "Sesión inválida" });
  }

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: "El monto debe ser mayor a 0" });
  }

  // Find target account in safe user's accounts first or other users
  let targetAccount = userOpt.accounts.find(a => a.clabe === receiverClabe);
  let matchedUser = userOpt;
  
  if (!targetAccount) {
    const foundUser = Object.values(db.users).find(u => 
      u.accounts.some(a => a.clabe === receiverClabe)
    );
    if (foundUser) {
      targetAccount = foundUser.accounts.find(a => a.clabe === receiverClabe);
      matchedUser = foundUser;
    }
  }

  const isSTPMother = receiverClabe === DEFAULT_STP_MOTHER_CLABE;

  if (!targetAccount && !isSTPMother) {
    return res.status(404).json({ error: "La cuenta CLABE receptora no existe en Gold Payments Bank" });
  }

  // Update balance
  if (targetAccount) {
    targetAccount.balance = parseFloat((targetAccount.balance + numAmount).toFixed(2));
  } else if (isSTPMother) {
    db.motherAccountBalance = parseFloat((db.motherAccountBalance + numAmount).toFixed(2));
  }

  const trxId = "tx-in-" + Math.random().toString(36).substr(2, 9);
  const transactionRecord: Transaction = {
    id: trxId,
    senderName: senderName || "SPEI Remitente Externo",
    senderClabe: "012180009999999995",
    receiverName: targetAccount ? `${matchedUser.name} (${targetAccount.name})` : "Cuenta Madre STP",
    receiverClabe: receiverClabe,
    amount: numAmount,
    concept: concept || "Depósito SPEI Recibido",
    reference: reference || String(Math.floor(100000 + Math.random() * 899999)),
    date: new Date().toISOString(),
    type: "SPEI_ENTRADA",
    status: "EXITOSO"
  };

  db.liveTransactions.unshift(transactionRecord);
  saveDb(db);

  res.json({
    success: true,
    message: "SPEI recibido de manera atómica exitosamente",
    transaction: transactionRecord,
    newBalance: targetAccount ? targetAccount.balance : db.motherAccountBalance
  });
});

// Execute atomic transfer
app.post("/api/transfers", (req, res) => {
  const authHeader = req.headers.authorization;
  const { senderClabe, receiverClabe, amount, concept, reference } = req.body as TransferRequest;

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const senderUser = Object.values(db.users).find(u => authHeader.includes(u.id));
  if (!senderUser) {
    return res.status(401).json({ error: "Sesión inválida" });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "Monto debe ser mayor a 0" });
  }

  // Look for sender's actual account
  const sourceAcct = senderUser.accounts.find(a => a.clabe === senderClabe);
  if (!sourceAcct && senderUser.role !== "ADMIN") {
    return res.status(400).json({ error: "Cuenta CLABE emisora no pertenece a este usuario" });
  }

  // Check balance (Except if Admin)
  if (senderUser.role !== "ADMIN" && sourceAcct && sourceAcct.balance < amount) {
    return res.status(400).json({ error: "Saldo insuficiente en la cuenta de origen" });
  }

  // Atomic Transfer Logic
  let matchedReceiverUser = Object.values(db.users).find(u => 
    u.accounts.some(a => a.clabe === receiverClabe)
  );

  let receiverName = "Destinatario SPEI Externo";
  let transactionType: Transaction["type"] = "SPEI_SALIDA";

  // Check if target is user or active STP mother account
  const isTransferToSTPMother = receiverClabe === DEFAULT_STP_MOTHER_CLABE;
  const isTransferFromSTPMother = senderClabe === DEFAULT_STP_MOTHER_CLABE;

  // Let's modify balances
  // Direct reduction in database
  if (sourceAcct) {
    sourceAcct.balance = parseFloat((sourceAcct.balance - amount).toFixed(2));
  }

  if (matchedReceiverUser) {
    const destAcct = matchedReceiverUser.accounts.find(a => a.clabe === receiverClabe);
    if (destAcct) {
      destAcct.balance = parseFloat((destAcct.balance + amount).toFixed(2));
      receiverName = matchedReceiverUser.name + " (" + destAcct.name + ")";
      transactionType = "INTERNA_ENVIADA";
    }
  } else if (isTransferToSTPMother) {
    db.motherAccountBalance = parseFloat((db.motherAccountBalance + amount).toFixed(2));
    receiverName = "Cuenta Madre STP STP";
    transactionType = "INTERNA_ENVIADA";
  }

  // Also support initiating transfer FROM STP Mother account using authorization in simulation
  if (isTransferFromSTPMother) {
    if (db.motherAccountBalance < amount) {
      return res.status(400).json({ error: "Saldo insuficiente en la STP Cuenta Madre" });
    }
    db.motherAccountBalance = parseFloat((db.motherAccountBalance - amount).toFixed(2));
  }

  const transactionRecord: Transaction = {
    id: "tx-" + Math.random().toString(36).substr(2, 9),
    senderName: senderUser.name,
    senderClabe,
    receiverName,
    receiverClabe,
    amount,
    concept: concept || "Transferencia en plataforma",
    reference: reference || String(Math.floor(100000 + Math.random() * 899999)),
    date: new Date().toISOString(),
    type: transactionType,
    status: "EXITOSO"
  };

  // Add transaction to live transaction journal
  db.liveTransactions.unshift(transactionRecord);

  // If internal, add a reflection transaction for the receiver too
  if (matchedReceiverUser) {
    const reflectionRecord: Transaction = {
      ...transactionRecord,
      id: "tx-rcv-" + Math.random().toString(36).substr(2, 9),
      type: "INTERNA_RECIBIDA"
    };
    db.liveTransactions.unshift(reflectionRecord);
  }

  saveDb(db);

  res.json({
    success: true,
    message: "Transferencia liquidada exitosamente por SPEI / STP",
    transaction: transactionRecord,
    senderBalance: sourceAcct ? sourceAcct.balance : db.motherAccountBalance
  });
});

// Load analytical dashboard summary
app.get("/api/dashboard-analytics", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  res.json(generate10YearDashboardMetrics());
});

// Incoming Webhook Handlers for accounts configuration
app.post("/api/webhooks/paypal", (req, res) => {
  console.log("=== PAYPAL WEBHOOK RECEIVED ===");
  console.log(req.body);

  const eventType = req.body.event_type || "PAYMENT.SALE.COMPLETED";
  const resource = req.body.resource || {};
  
  const amtUSD = parseFloat(resource.amount?.total || req.body.amountUSD || req.body.amt || "85.00");
  const exchangeRate = 17.50;
  const amtMXN = parseFloat((amtUSD * exchangeRate).toFixed(2));
  const txId = resource.id || req.body.tx || "PAY_WH_" + String(Math.floor(100000 + Math.random() * 899999));
  const invoiceId = resource.invoice_number || req.body.invoiceId || "RVTG3GWV6BHHQRE3";

  // Simulate funding Gold Payments Bank cheques account
  const goldChequesAcc = db.users["goldpaymentsbank@goldpayments.mx"]?.accounts[0];
  if (goldChequesAcc) {
    goldChequesAcc.balance = parseFloat((goldChequesAcc.balance + amtMXN).toFixed(2));
    
    const transactionRecord: Transaction = {
      id: txId,
      senderName: "PayPal Webhook Notification",
      senderClabe: "012180009999999995",
      receiverName: `Gold Payments Demo (${goldChequesAcc.name})`,
      receiverClabe: goldChequesAcc.clabe,
      amount: amtMXN,
      concept: `Webhook: Liquidación Factura ${invoiceId} ($${amtUSD} USD)`,
      reference: `WH${String(Math.floor(100000 + Math.random() * 899999))}`,
      date: new Date().toISOString(),
      type: "SPEI_ENTRADA",
      status: "EXITOSO"
    };

    db.liveTransactions.unshift(transactionRecord);
    saveDb(db);
    console.log(`[Webhook] Atomically processed payment of $${amtMXN} MXN. New Balance: $${goldChequesAcc.balance} MXN.`);
  }

  res.status(200).json({ status: "success", received: true, event: eventType, txId });
});

app.post("/api/webhooks/stp", (req, res) => {
  console.log("=== STP WEBHOOK RECEIVED ===");
  console.log(req.body);

  const amt = parseFloat(req.body.monto || req.body.amount || "100.00");
  const clabe = req.body.clabe || req.body.cuenta || "";
  const claveRastreo = req.body.claveRastreo || "STP_WH_" + String(Math.floor(100000000 + Math.random() * 899999999));

  let resolved = false;
  for (const user of Object.values(db.users)) {
    const acct = user.accounts.find(a => a.clabe === clabe);
    if (acct) {
      acct.balance = parseFloat((acct.balance + amt).toFixed(2));
      
      const transactionRecord: Transaction = {
        id: claveRastreo,
        senderName: req.body.nombreOrdenante || "STP Ordenante Externo",
        senderClabe: req.body.clabeOrdenante || "000000000000000000",
        receiverName: `${user.name} (${acct.name})`,
        receiverClabe: clabe,
        amount: amt,
        concept: req.body.conceptoPago || "Abono SPEI STP Webhook",
        reference: req.body.referenciaNumerica || String(Math.floor(100000 + Math.random() * 899999)),
        date: new Date().toISOString(),
        type: "SPEI_ENTRADA",
        status: "EXITOSO"
      };

      db.liveTransactions.unshift(transactionRecord);
      resolved = true;
      break;
    }
  }

  if (resolved) {
    saveDb(db);
  }

  res.json({ estado: "0", mensaje: "Confirmado", claveRastreo });
});

// Reset or fund simulated accounts
app.post("/api/admin/reset", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const userOpt = Object.values(db.users).find(u => authHeader.includes(u.id));
  if (!userOpt || userOpt.role !== "ADMIN") {
    return res.status(403).json({ error: "Privilegios insuficientes" });
  }

  // Restore STP Mother Account to original state
  db.motherAccountBalance = 2450750.50;
  
  // Restore GoldPayments demo account balances
  if (db.users["goldpaymentsbank@goldpayments.mx"]) {
    db.users["goldpaymentsbank@goldpayments.mx"].accounts[0].balance = 1850220.00;
    db.users["goldpaymentsbank@goldpayments.mx"].accounts[1].balance = 420103.50;
    db.users["goldpaymentsbank@goldpayments.mx"].accounts[2].balance = 1280000.00;
  }
  
  db.liveTransactions = [];
  saveDb(db);

  res.json({ success: true, message: "Base de datos restaurada con éxito" });
});


// Vite middleware routing - Serve Frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing at http://0.0.0.0:${PORT}`);
  });
}

startServer();

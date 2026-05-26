/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  senderName: string;
  senderClabe: string;
  receiverName: string;
  receiverClabe: string;
  amount: number;
  concept: string;
  reference: string;
  date: string; // ISO String
  type: 'SPEI_ENTRADA' | 'SPEI_SALIDA' | 'INTERNA_ENVIADA' | 'INTERNA_RECIBIDA' | 'AJUSTE';
  status: 'EXITOSO' | 'PENDIENTE' | 'RECHAZADO';
}

export interface BankAccount {
  id: string;
  name: string; // e.g. "Cheques", "Ahorros", "Inversión", "BBVA", "Nu"
  clabe: string;
  accountNumber: string;
  bankName: string; // e.g. "Sistema de Transferencias y Pagos STP", "Banco de México", etc.
  balance: number;
  currency: 'MXN' | 'USD';
  type: 'CORRIENTE' | 'AHORRO' | 'INVERSION' | 'EXTERNA';
  color: string; // Tailwind color classes
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  clabe: string; // Primary CLABE STP for SPEI
  accounts: BankAccount[];
}

export interface AuthResponse {
  user: User;
  token?: string;
  error?: string;
}

export interface TransferRequest {
  senderClabe: string;
  receiverClabe: string;
  amount: number;
  concept: string;
  reference: string;
}

export interface AnalyticsSummary {
  year: number;
  inflow: number;
  outflow: number;
  balance: number;
}

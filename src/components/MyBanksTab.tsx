import React, { useState } from 'react';
import { BankAccount } from '../types';
import { Building2, Plus, ArrowRight, Shield, RefreshCw, X } from 'lucide-react';

interface MyBanksTabProps {
  accounts: BankAccount[];
  token: string;
  onAccountAdded: () => void;
}

const POPULAR_BANKS = [
  { name: 'BBVA Bancomer', code: '012', color: 'from-blue-700 via-blue-800 to-blue-950 border-blue-500 text-white' },
  { name: 'Santander SERFIN', code: '014', color: 'from-red-650 via-red-700 to-red-950 border-red-500 text-white' },
  { name: 'Banorte / IXE', code: '072', color: 'from-neutral-700 via-rose-900 to-neutral-900 border-rose-600 text-white' },
  { name: 'Citibanamex', code: '002', color: 'from-sky-700 via-indigo-900 to-neutral-950 border-sky-500' },
  { name: 'Nu México', code: '638', color: 'from-purple-700 via-purple-900 to-neutral-950 border-purple-500' },
  { name: 'HSBC', code: '021', color: 'from-red-600 via-neutral-800 to-neutral-950 border-red-500' }
];

export default function MyBanksTab({ accounts, token, onAccountAdded }: MyBanksTabProps) {
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<typeof POPULAR_BANKS[0] | null>(null);
  const [accountName, setAccountName] = useState('');
  const [depositAmount, setDepositAmount] = useState('15000');
  const [isConnecting, setIsConnecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountName) return;

    setIsConnecting(true);
    setSuccessMsg('');

    try {
      const response = await fetch('/api/accounts/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          bankName: selectedBank.name,
          bankCode: selectedBank.code,
          accountName: accountName,
          amount: parseFloat(depositAmount) || 10000
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo conectar la cuenta');
      }

      setSuccessMsg(`¡Conexión SPEI exitosa de tu cuenta ${selectedBank.name}!`);
      setTimeout(() => {
        onAccountAdded();
        setShowPlaidModal(false);
        setSelectedBank(null);
        setAccountName('');
        setSuccessMsg('');
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div id="my-banks-wrapper" className="space-y-6">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#111827] to-[#1e1b4b] border border-indigo-950 p-6 rounded-2xl gap-4">
        <div>
          <h2 className="text-xl font-display font-medium text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" /> Mis Bancos Conectados
          </h2>
          <p className="text-sm text-slate-400 mt-1">Conecta tus cuentas e integra saldos en tiempo real a través del protocolo seguro Plaid y transferencias SPEI.</p>
        </div>
        <button
          onClick={() => setShowPlaidModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#090d16] font-semibold rounded-xl text-sm transition-all focus:ring-2 focus:ring-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Enlazar Cuenta (Plaid)
        </button>
      </div>

      {/* Grid displays current connected accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acct) => (
          <div
            key={acct.id}
            className={`rounded-2xl p-6 flex flex-col justify-between h-48 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl shadow-md border ${acct.color || 'bg-slate-800 border-slate-700'}`}
          >
            {/* Ambient overlay */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

            {/* Account Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300/80">
                  {acct.bankName}
                </p>
                <h3 className="text-lg font-bold font-display text-white mt-1">
                  {acct.name}
                </h3>
              </div>
              <Building2 className="w-6 h-6 text-white/50" />
            </div>

            {/* Account CLABE display */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-300/80 uppercase tracking-widest">Cuenta Clabe (SPEI)</p>
              <p className="text-sm font-mono text-white tracking-widest">{acct.clabe}</p>
            </div>

            {/* Balance area */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-300/80 uppercase">Saldo Disponible</p>
                <p className="text-2xl font-bold font-display text-white mt-0.5">
                  ${acct.balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal">MXN</span>
                </p>
              </div>
              
              <span className="px-2 py-0.5 text-[9px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white uppercase flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" /> STP Activa
              </span>
            </div>
          </div>
        ))}

        {/* Visually distinct card inside the grid to link account via Plaid */}
        <button
          onClick={() => setShowPlaidModal(true)}
          className="rounded-2xl border-2 border-dashed border-indigo-900/60 hover:border-amber-500/50 bg-[#0c1220]/40 hover:bg-[#111827]/60 p-6 flex flex-col justify-between h-48 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl shadow-md cursor-pointer group text-left relative overflow-hidden"
          title="Vincular nueva cuenta con Plaid"
        >
          {/* Subtle top decoration beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-550/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-[8px] font-bold font-mono tracking-wider uppercase">
                Plaid® Integration
              </span>
              <h3 className="text-base font-bold font-display text-slate-200 group-hover:text-amber-400 transition-colors mt-2">
                Enlazar Cuenta Plaid
              </h3>
            </div>
            <div className="p-2.5 bg-slate-800/80 group-hover:bg-amber-500/10 text-slate-400 group-hover:text-amber-500 rounded-xl border border-slate-700/50 group-hover:border-amber-500/30 transition-all duration-300">
              <Plus className="w-5 h-5" />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px] mb-2">
            Sincroniza balances bancarios históricos e integra de inmediato con tu pasarela STP.
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 group-hover:text-amber-400 font-bold transition-colors">
            <span>Iniciar Proceso de Autenticación</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Plaid Simulation Modal */}
      {showPlaidModal && (
        <div id="plaid-modal" className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0f172a] rounded-2xl w-full max-w-lg border border-slate-800 shadow-2xl p-6 relative">
            <button 
              onClick={() => { setShowPlaidModal(false); setSelectedBank(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Conexión Segura vía Plaid®</h3>
                <p className="text-xs text-slate-400">Autentica con tus credenciales bancarias para sincronizar tus balances</p>
              </div>
            </div>

            {successMsg ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 justify-center rounded-full flex items-center mx-auto border border-emerald-500/20">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h4 className="text-lg font-bold text-white font-display">{successMsg}</h4>
                <p className="text-sm text-slate-400">Estableciendo túnel STP de liquidación y sincronizando balances históricos...</p>
              </div>
            ) : !selectedBank ? (
              // Step 1: Choose Bank
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selecciona un Banco Mexicano</h4>
                <div className="grid grid-cols-2 gap-3">
                  {POPULAR_BANKS.map((bank) => (
                    <button
                      key={bank.name}
                      onClick={() => {
                        setSelectedBank(bank);
                        setAccountName(`Mi Cuenta ${bank.name.split(' ')[0]}`);
                      }}
                      className="p-4 bg-slate-800/80 hover:bg-slate-800 hover:border-amber-500/50 border border-slate-700 rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Building2 className="w-5 h-5 text-amber-500 mb-2" />
                      <div className="font-bold text-xs text-slate-200">{bank.name}</div>
                      <div className="text-[9px] text-slate-400">SPEI Code: {bank.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Step 2: Configure Account Details
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 mb-2 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Banco Seleccionado</h4>
                    <p className="text-sm font-bold text-white mt-1">{selectedBank.name}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedBank(null)} 
                    className="text-xs text-amber-500 hover:underline"
                  >
                    Cambiar banco
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Nombre Descriptivo de la Cuenta</label>
                  <input
                    type="text"
                    required
                    maxLength={32}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
                    placeholder="ej. Cuenta de Nómina BBVA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">Saldo Histórico Inicial (Simulado)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-505 font-medium">$</span>
                    <input
                      type="number"
                      required
                      min={100}
                      max={50000000}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-12 py-2.5 text-sm text-slate-100 font-mono"
                      placeholder="Monto"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">MXN</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  {isConnecting ? 'Autenticando API...' : 'Finalizar e Importar Balance'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 text-center flex items-center justify-center gap-2 text-[10px] text-slate-505 font-semibold text-emerald-500 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Encriptación AES-256 de Extremo a Extremo
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

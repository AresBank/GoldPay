import React, { useState, useEffect } from 'react';
import { User, BankAccount } from './types';
import AuthPage from './components/AuthPage';
import OverviewTab from './components/OverviewTab';
import MyBanksTab from './components/MyBanksTab';
import TransactionsTab from './components/TransactionsTab';
import TransferTab from './components/TransferTab';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import UserAgreementPage from './components/UserAgreementPage';
import { Landmark, FolderSync, CreditCard, LayoutDashboard, Copy, Check, ChevronDown, LogOut, RefreshCcw, Bell } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'bancos' | 'transacciones' | 'transferencia'>('dashboard');
  
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  
  // Custom Success state for PayPal Automatic Redirection
  const [successBanner, setSuccessBanner] = useState<{ show: boolean; txId: string; amount: string } | null>(null);
  const [isPrivacyRoute, setIsPrivacyRoute] = useState(false);
  const [isAgreementRoute, setIsAgreementRoute] = useState(false);

  // Check if current path matches privacy policy or user agreement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/privacy' || path === '/privacidad') {
        setIsPrivacyRoute(true);
      }
      if (path === '/agreement' || path === '/acuerdo' || path === '/user-agreement') {
        setIsAgreementRoute(true);
      }
    }
  }, []);

  // Parse check for PayPal auto-redirect parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        const txId = params.get('tx') || 'PAY' + String(Math.floor(100000 + Math.random() * 900000));
        const amount = params.get('amt') || '85.00';
        setSuccessBanner({ show: true, txId, amount });
        
        // Clean up URL parameters so they don't persist on subsequent full refreshes
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, []);

  // Restore authentication state from client side sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('gold_user');
    const storedToken = sessionStorage.getItem('gold_token');
    
    if (storedUser && storedToken) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setToken(storedToken);
      } catch (e) {
        console.error("Session restore failure:", e);
      }
    }
  }, []);

  const fetchAccounts = async (currentToken: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': currentToken
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAccounts(token);
    }
  }, [token]);

  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    setUser(loggedInUser);
    setToken(sessionToken);
    sessionStorage.setItem('gold_user', JSON.stringify(loggedInUser));
    sessionStorage.setItem('gold_token', sessionToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setAccounts([]);
    setActiveTab('dashboard');
    sessionStorage.removeItem('gold_user');
    sessionStorage.removeItem('gold_token');
  };

  const copyClabeToClipboard = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.clabe);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2000);
  };

  const handleResetDatabase = async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        alert("Base de datos y cuenta STP Cuenta Madre restaurada exitosamente.");
        fetchAccounts(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isPrivacyRoute) {
    return <PrivacyPolicyPage />;
  }

  if (isAgreementRoute) {
    return <UserAgreementPage />;
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="application-root" className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      
      {/* Dynamic Success Redirect Banner */}
      {successBanner?.show && (
        <div id="paypal-success-redirect-banner" className="bg-[#052e16] border-b border-emerald-500/30 text-emerald-200 px-4 py-3 text-xs flex justify-between items-center animate-fade-in relative z-50">
          <div className="flex items-center gap-2.5 max-w-4xl">
            <span className="p-1 px-2 bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 rounded uppercase text-[9px] tracking-wider shrink-0 animate-pulse">
              Redirección Activa
            </span>
            <p className="leading-relaxed">
              <strong>{successBanner.txId.startsWith('STP') ? '¡Dispersión SPEI STP Liquidada!' : '¡Pago Completado con Éxito por PayPal!'}</strong> Has regresado automáticamente a Gold Payments Bank tras realizar la liquidación. La transacción fue asentada en el ledger central STP con clave de rastreo <span className="font-mono text-white font-bold ml-1">{successBanner.txId}</span> por un monto de <span className="text-white font-bold">${parseFloat(successBanner.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>.
            </p>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)} 
            className="text-[10px] text-emerald-400 hover:text-white font-semibold underline ml-4 select-none cursor-pointer border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1 rounded-lg transition-colors animate-pulse"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Top Banking Navbar */}
      <nav className="border-b border-slate-900 bg-[#0c1220]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Brand Area */}
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 font-bold">
              <Landmark className="w-5 h-5" />
            </span>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-white tracking-tight">GOLD PAYMENTS <span className="text-amber-500">BANK</span></span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">Dispersor STP SPEI Oficial</p>
            </div>
          </div>

          {/* User STP Address bar */}
          <div className="bg-[#111c33] border border-amber-500/15 rounded-xl px-3 py-1.5 flex items-center gap-3 max-w-sm md:max-w-md">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">MI CLABE STP REGISTRADA</p>
              <p className="text-xs font-mono font-bold text-amber-500 tracking-wider mb-0.5">{user.clabe}</p>
            </div>
            <button
              onClick={copyClabeToClipboard}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Copiar CLABE"
            >
              {copiedClabe ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => fetchAccounts(token)}
              disabled={isRefreshing}
              className="p-2 bg-slate-850 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
              title="Sincronizar saldos de Plaid"
            >
              <FolderSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNavDropdown(!showNavDropdown)}
                className="flex items-center gap-2 p-1.5 pr-2.5 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 bg-amber-500/20 text-amber-400 font-bold uppercase text-xs flex items-center justify-center rounded-xl">
                  {user.name.substring(0, 2)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                  <p className="text-[9px] text-amber-500 font-semibold uppercase tracking-wider leading-none mt-1">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showNavDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl p-2 z-50">
                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        handleResetDatabase();
                        setShowNavDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 rounded-xl cursor-pointer"
                    >
                      Restaurar Base de Datos
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión STP
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </nav>

      {/* Main Body Grid with Sidebar Navigation */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-lg space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Menú de Navegación</p>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Resumen y Métricas
            </button>
            <button
              onClick={() => setActiveTab('bancos')}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'bancos' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Landmark className="w-4 h-4" /> Mis Bancos (Plaid)
            </button>
            <button
              onClick={() => setActiveTab('transacciones')}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'transacciones' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <FolderSync className="w-4 h-4" /> Historial de Cuentas
            </button>
            <button
              onClick={() => setActiveTab('transferencia')}
              className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'transferencia' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <CreditCard className="w-4 h-4" /> Transferencias SPEI
            </button>
          </div>

          {/* Quick Informational Box */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-xs space-y-1.5 leading-relaxed text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Notificaciones de Seguridad
            </div>
            <p>Este portal ejecuta transacciones reales en el STP Sandbox Homologado del Administrador Supremo. Cada SPEI emitido debita localmente el balance correspondiente.</p>
          </div>
        </div>

        {/* Dynamic Pages Area rendering active tabs */}
        <div className="lg:col-span-3">
          {activeTab === 'dashboard' && (
            <OverviewTab
              accounts={accounts}
              token={token}
              userRole={user.role}
              onNavigateToTransfer={() => setActiveTab('transferencia')}
              onRefreshBalances={() => fetchAccounts(token)}
            />
          )}

          {activeTab === 'bancos' && (
            <MyBanksTab
              accounts={accounts}
              token={token}
              onAccountAdded={() => fetchAccounts(token)}
            />
          )}

          {activeTab === 'transacciones' && (
            <TransactionsTab
              accounts={accounts}
              token={token}
            />
          )}

          {activeTab === 'transferencia' && (
            <TransferTab
              accounts={accounts}
              token={token}
              user={user}
              onRefreshBalances={() => fetchAccounts(token)}
            />
          )}
        </div>

      </div>

    </div>
  );
}

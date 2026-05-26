import React, { useState } from 'react';
import { User, AuthResponse } from '../types';
import { KeyRound, Mail, UserPlus, LogIn, Sparkles, Building2, ShieldAlert } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto load demo values
  const loadDemo = (role: 'USER' | 'ADMIN') => {
    if (role === 'USER') {
      setEmail('GoldPaymentsBank@goldpayments.mx');
      setPassword('Demo1234!');
    } else {
      setEmail('admin@goldpayments.mx');
      setPassword('GoldAdmin2024!');
    }
    setIsLogin(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password } 
      : { name: fullname, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal. Por favor intente de nuevo.');
      }

      onLoginSuccess(data.user, data.token || `session_token_mock_${data.user.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen relative flex items-center justify-center bg-[#090d16] px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-md rounded-2xl p-8 border border-amber-500/20 shadow-2xl z-10 transition-all duration-300">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-medium mb-3">
            <Building2 className="w-3.5 h-3.5" />
            STP SPEI INTEGRATED
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-2">
            GOLD PAYMENTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">BANK</span>
          </h1>
          <p className="text-sm text-slate-400">
            {isLogin 
              ? 'Panel de control bancario y liquidación SPEI' 
              : 'Únete para abrir tu cuenta homologada STP'}
          </p>
        </div>

        {/* Dynamic error alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Nombre Completo</label>
              <div className="relative">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="ej. Juan Pérez"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#131d35] rounded-xl border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Email Bancario</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="ej. contacto@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#131d35] rounded-xl border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Contraseña</label>
              {isLogin && <span className="text-xs text-amber-500 hover:underline cursor-pointer">¿Olvidaste tu clave STP?</span>}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#131d35] rounded-xl border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#090d16] font-semibold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 active:scale-[0.99] transition-all duration-200 border border-amber-400/20 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> Autenticarse e Ingresar
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Crear Cuenta CLABE STP
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-amber-500 transition-colors"
          >
            {isLogin 
              ? '¿No tienes cuenta? Regístrate y genera una CLABE SPEI' 
              : '¿Ya eres usuario? Inicia sesión aquí'}
          </button>
        </div>

        {/* Demo Fast Access Box */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">CONEXIÓN RÁPIDA DEMO LISTOS</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loadDemo('USER')}
              className="py-2.5 px-3 bg-[#131d35]/50 hover:bg-[#131d35] border border-amber-500/10 hover:border-amber-500/40 rounded-xl text-left text-xs transition-all cursor-pointer group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-amber-400">Cuenta Demo (STP)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">3 cuentas + 11.5k hist</div>
            </button>
            <button
              onClick={() => loadDemo('ADMIN')}
              className="py-2.5 px-3 bg-[#131d35]/50 hover:bg-[#131d35] border border-amber-500/10 hover:border-amber-500/40 rounded-xl text-left text-xs transition-all cursor-pointer group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-amber-400">Admin Maestro</div>
              <div className="text-[10px] text-slate-500 mt-0.5">$1 Trillón MXN único</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { BankAccount, AnalyticsSummary } from '../types';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Zap, Target, Landmark, Shield, RefreshCw, X, CheckCircle } from 'lucide-react';

interface OverviewTabProps {
  accounts: BankAccount[];
  token: string;
  userRole: 'USER' | 'ADMIN';
  onNavigateToTransfer: () => void;
  onRefreshBalances: () => void;
}

export default function OverviewTab({ accounts, token, userRole, onNavigateToTransfer, onRefreshBalances }: OverviewTabProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary[]>([]);
  const [motherBalance, setMotherBalance] = useState<number>(2450750.50);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeHoverPoint, setActiveHoverPoint] = useState<AnalyticsSummary | null>(null);

  // Simulated Deposit States
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveTargetClabe, setReceiveTargetClabe] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('25000.00');
  const [receiveSenderName, setReceiveSenderName] = useState('MercadoLibre Distribuidor S.A.');
  const [receiveConcept, setReceiveConcept] = useState('Liquidación Diaria STP');
  const [receiveReference, setReceiveReference] = useState('1109283');
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState('');
  const [receiveSuccess, setReceiveSuccess] = useState<any | null>(null);
  
  // For responsive chart sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(600);
  const [chartHeight, setChartHeight] = useState(240);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard-analytics', {
        headers: { 'Authorization': token }
      });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data.summary || []);
        setMotherBalance(data.totals?.motherAccountBalance || 2450750.50);
        setTotalAssets(data.totals?.totalAssets || 0);
      }
    } catch (err) {
      console.error("Error fetching dashboard analytics page:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Resize listener for responsive SVG
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth - 32);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [accounts]);

  useEffect(() => {
    if (accounts.length > 0 && !receiveTargetClabe) {
      setReceiveTargetClabe(accounts[0].clabe);
    }
  }, [accounts]);

  const handleOpenReceiveModal = () => {
    if (accounts.length > 0) {
      setReceiveTargetClabe(accounts[0].clabe);
    } else {
      setReceiveTargetClabe('646180308561442581'); // Mother account if no personal acts
    }
    setReceiveReference(String(Math.floor(100000 + Math.random() * 899999)));
    setReceiveError('');
    setReceiveSuccess(null);
    setShowReceiveModal(true);
  };

  const handleExecuteSimulatedDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReceiving(true);
    setReceiveError('');
    setReceiveSuccess(null);
    try {
      const response = await fetch('/api/simulate-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          receiverClabe: receiveTargetClabe,
          amount: parseFloat(receiveAmount),
          senderName: receiveSenderName,
          concept: receiveConcept,
          reference: receiveReference
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo simular el SPEI entrante');
      }
      setReceiveSuccess(data.transaction);
      fetchAnalytics();
      onRefreshBalances();
    } catch (err: any) {
      setReceiveError(err.message);
    } finally {
      setIsReceiving(false);
    }
  };

  // Calculations for custom SVG Area Graph
  const padding = { top: 20, right: 30, bottom: 30, left: 65 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  let minBalance = 0;
  let maxBalance = 0;
  let minYear = 2016;
  let maxYear = 2026;

  if (analytics.length > 0) {
    const balances = analytics.map(a => a.balance);
    minBalance = Math.min(...balances) * 0.95; // 5% padding under
    maxBalance = Math.max(...balances) * 1.05; // 5% padding over
    
    minYear = Math.min(...analytics.map(a => a.year));
    maxYear = Math.max(...analytics.map(a => a.year));
  }

  // Map coordinates helpers
  const getX = (year: number) => {
    if (maxYear === minYear) return padding.left;
    const pct = (year - minYear) / (maxYear - minYear);
    return padding.left + pct * graphWidth;
  };

  const getY = (val: number) => {
    if (maxBalance === minBalance) return padding.top + graphHeight / 2;
    const pct = (val - minBalance) / (maxBalance - minBalance);
    return padding.top + graphHeight - pct * graphHeight; // SVG y goes down
  };

  // Build the SVG path strings
  let linePath = '';
  let areaPath = '';
  
  if (analytics.length > 0) {
    const points = analytics.map(a => ({
      x: getX(a.year),
      y: getY(a.balance)
    }));

    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaPath = linePath + ` L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`;
  }

  // Balance values formatted
  const formattedAssets = totalAssets.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedMother = motherBalance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div id="overview-wrapper" className="space-y-6">
      
      {/* 2x2 or 3x1 Bento Cards for high visual fidelity balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total portfolio value / Consolidado */}
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg h-44">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Consolidado STP</p>
              <h3 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mt-2">
                ${formattedAssets} <span className="text-sm font-normal text-slate-400">MXN</span>
              </h3>
            </div>
            <div className="p-3 bg-amber-600/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 py-1.5 px-3 rounded-xl w-fit border border-emerald-500/10">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% Rendimiento Histórico
          </div>
        </div>

        {/* Live account details for STP mother active account */}
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg h-44">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cuenta Madre Activa STP</p>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mt-2">
                ${formattedMother} <span className="text-sm font-normal text-slate-400">MXN</span>
              </h3>
            </div>
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] space-y-0.5">
            <p className="text-slate-400 font-medium">CLABE: <span className="font-mono text-slate-200 tracking-wider">646180308561442581</span></p>
            <p className="text-slate-500">Banco: <span className="text-slate-300 font-medium">STP (646)</span> • Sucursal: <span className="text-slate-300 font-medium">180</span></p>
          </div>
        </div>

        {/* Quick action panel */}
        <div className="bg-gradient-to-br from-[#121b2e] to-[#162744] border border-indigo-950 p-6 rounded-2xl flex flex-col justify-between h-44">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Operaciones Inteligentes</h4>
            <p className="text-xs text-slate-400 mt-1">Liquida e inicia ordenes de dispersión SPEI hacia cualquier CLABE bancaria de la red STP.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onNavigateToTransfer}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#090d16] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Transferir SPEI
            </button>
            <button
              onClick={handleOpenReceiveModal}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Recibir SPEI
            </button>
          </div>
        </div>

      </div>

      {/* 10-Year Interactive SVG Area Trend Line */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Historial Financiero Consolidado
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Visión integrada de 10 años (2016 - 2026). Coloca el cursor para ver el balance de cada año.</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="self-end sm:self-auto p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Sincronizar transacciones"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <span className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative" ref={containerRef}>
            
            {/* SVG Elements */}
            <svg width={chartWidth} height={chartHeight} className="overflow-visible select-none">
              <defs>
                <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = padding.top + p * graphHeight;
                const valueLabel = minBalance + (1 - p) * (maxBalance - minBalance);
                return (
                  <g key={idx} className="opacity-20">
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      ${(valueLabel / 1e6).toFixed(1)}M
                    </text>
                  </g>
                );
              })}

              {/* X Axes (Years) */}
              {analytics.map((pt, idx) => {
                const x = getX(pt.year);
                return (
                  <g key={idx} className="opacity-70">
                    <line
                      x1={x}
                      y1={padding.top + graphHeight}
                      x2={x}
                      y2={padding.top + graphHeight + 6}
                      stroke="#475569"
                    />
                    <text
                      x={x}
                      y={padding.top + graphHeight + 18}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {pt.year}
                    </text>
                  </g>
                );
              })}

              {/* Filled Area path */}
              {areaPath && (
                <path d={areaPath} fill="url(#goldAreaGrad)" />
              )}

              {/* Main Line path */}
              {linePath && (
                <path d={linePath} fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Interactive Hover Point Circles */}
              {analytics.map((pt, idx) => {
                const x = getX(pt.year);
                const y = getY(pt.balance);
                const isHovered = activeHoverPoint?.year === pt.year;
                return (
                  <g key={idx}>
                    {/* Hover hotspot */}
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveHoverPoint(pt)}
                      onMouseLeave={() => setActiveHoverPoint(null)}
                    />
                    {/* Visible point circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? "6" : "3.5"}
                      fill={isHovered ? "#f59e0b" : "#b45309"}
                      stroke="#0f172a"
                      strokeWidth={isHovered ? "3" : "1.5"}
                      style={{ transition: 'all 0.1s ease' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {activeHoverPoint && (
              <div 
                className="absolute z-20 bg-slate-950/95 border border-amber-500 rounded-xl p-3 shadow-xl text-xs space-y-1"
                style={{
                  left: `${Math.min(chartWidth - 180, Math.max(20, getX(activeHoverPoint.year) - 70))}px`,
                  top: `${Math.min(chartHeight - 40, Math.max(5, getY(activeHoverPoint.balance) - 90))}px`
                }}
              >
                <p className="font-bold text-white font-display">Periodo {activeHoverPoint.year}</p>
                <p className="text-slate-400">Balance: <span className="font-mono text-amber-400 font-bold">${activeHoverPoint.balance.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN</span></p>
                <div className="flex gap-2.5 text-[10px] mt-1 pt-1 border-t border-slate-800">
                  <span className="text-emerald-400">↑ Inflow: ${(activeHoverPoint.inflow / 1e3).toFixed(0)}k</span>
                  <span className="text-rose-400">↓ Outflow: ${(activeHoverPoint.outflow / 1e3).toFixed(0)}k</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* STYLISH SPEI INCOMING SIMULATOR MODAL */}
      {showReceiveModal && (
        <div id="spei-receive-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-150">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-[#0c1220] p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                  <ArrowDownLeft className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Simular SPEI de Entrada</h4>
                  <p className="text-[10px] text-slate-400">Canaliza liquidez atómica inmediata vía STP Sandbox</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReceiveModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            {receiveSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="text-base font-bold text-white">¡SPEI Liquidado Exitosamente!</h5>
                  <p className="text-xs text-slate-400 mt-1">El monto fue abonado directamente a tu cuenta en tiempo real.</p>
                </div>

                <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-4 text-left space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-500">BANCO EMISOR:</span>
                    <span className="text-white font-semibold">STP SIMULATOR (646)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-500">REMITENTE:</span>
                    <span className="text-white font-semibold">{receiveSuccess.senderName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-500">CUENTA DEPOSITADA:</span>
                    <span className="text-white font-semibold">
                      {accounts.find(a => a.clabe === receiveSuccess.receiverClabe)?.name || 'Cuenta Madre STP'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-505">CLAVE RASTREO:</span>
                    <span className="text-amber-500 font-semibold tracking-wider">
                      {receiveSuccess.id.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-505">CONCEPTO:</span>
                    <span className="text-white">{receiveSuccess.concept}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-sm text-emerald-400">
                    <span>IMPORTE ABONADO:</span>
                    <span>${receiveSuccess.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteSimulatedDeposit} className="p-5 space-y-4">
                {receiveError && (
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                    {receiveError}
                  </div>
                )}

                {/* Target CLABE selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide mb-1.5">Cuenta Destinataria (Tu cuenta STP)</label>
                  <select
                    value={receiveTargetClabe}
                    onChange={(e) => setReceiveTargetClabe(e.target.value)}
                    className="w-full bg-[#11192a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    required
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.clabe}>
                        {a.name} - CLABE {a.clabe} (Bal: ${a.balance.toLocaleString('es-MX')})
                      </option>
                    ))}
                    <option value="646180308561442581">
                      [ADMIN] STP Cuenta Madre - Bal: ${motherBalance.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
                    </option>
                  </select>
                </div>

                {/* Amount to simulate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide mb-1.5">Monto de Transferencia (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.1"
                      value={receiveAmount}
                      onChange={(e) => setReceiveAmount(e.target.value)}
                      className="w-full bg-[#11192a] border border-slate-800 rounded-xl pl-6 pr-12 py-2 text-xs text-slate-100 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold">MXN</span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {['1500.00', '12500.00', '50000.00', '250000.00'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReceiveAmount(val)}
                        className="py-1 px-2.5 bg-slate-900 border border-slate-805 hover:bg-slate-800 text-[10px] text-slate-300 font-semibold rounded-lg cursor-pointer transition-all"
                      >
                        +${parseFloat(val).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sender Name suggestions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 tracking-wide mb-1.5">Nombre del Remitente (Empresa o Contacto)</label>
                  <input
                    type="text"
                    required
                    maxLength={35}
                    value={receiveSenderName}
                    onChange={(e) => setReceiveSenderName(e.target.value)}
                    className="w-full bg-[#11192a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    placeholder="ej. Corp de Inversiones Internacionales"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['BBVA Pago Directo', 'Walmart México', 'MercadoLibre Distribuidor', 'OXXO Pay Logística', 'Pedro Gómez García'].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setReceiveSenderName(name);
                          if (name.includes('Distribuidor') || name.includes('Directo') || name.includes('Pay')) {
                            setReceiveConcept('Liquidación Diaria STP');
                          } else {
                            setReceiveConcept('Reembolso de compra');
                          }
                        }}
                        className="py-1 px-2 bg-[#0c1220] border border-slate-800/80 hover:bg-slate-800 text-[9px] text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concept and reference keys */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-1">Concepto</label>
                    <input
                      type="text"
                      required
                      maxLength={25}
                      value={receiveConcept}
                      onChange={(e) => setReceiveConcept(e.target.value)}
                      className="w-full bg-[#11192a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-1">Referencia Numérica</label>
                    <input
                      type="text"
                      required
                      maxLength={7}
                      value={receiveReference}
                      onChange={(e) => setReceiveReference(e.target.value.replace(/\D/g,''))}
                      className="w-full bg-[#11192a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Execute */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReceiveModal(false)}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-805 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isReceiving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
                  >
                    {isReceiving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} /> Abonar SPEI Entrada
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

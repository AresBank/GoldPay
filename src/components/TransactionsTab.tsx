import React, { useState, useEffect } from 'react';
import { BankAccount, Transaction } from '../types';
import { Search, ChevronLeft, ChevronRight, Download, Filter, HelpCircle } from 'lucide-react';

interface TransactionsTabProps {
  accounts: BankAccount[];
  token: string;
}

export default function TransactionsTab({ accounts, token }: TransactionsTabProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const limit = 15;

  // Debouncing search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // reset to page 1 on active search
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const url = `/api/transactions?accountId=${selectedAccountId}&page=${page}&limit=${limit}&query=${encodeURIComponent(debouncedQuery)}`;
      const response = await fetch(url, {
        headers: { 'Authorization': token }
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccountId, page, debouncedQuery]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handleExportCSV = () => {
    const headers = 'ID,Fecha,Concepto,Monto,Tipo,Emisor,Referencia\n';
    const csvContent = transactions.map(t => 
      `"${t.id}","${t.date}","${t.concept}",${t.amount},"${t.type}","${t.senderName || ''}","${t.reference}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledgers_spei_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="transactions-wrapper" className="space-y-6">
      
      {/* Search and Account Selector Filters Bar */}
      <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" /> Libro de Transacciones STP
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Sistemas de liquidación SPEI históricos y en tiempo real con trazabilidad íntegra.</p>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="self-end md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Descargar listado CSV"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Bank Account Selector */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Filtro por Cuenta</label>
            <select
              value={selectedAccountId}
              onChange={(e) => { setSelectedAccountId(e.target.value); setPage(1); }}
              className="bg-[#131d35] border border-slate-750 text-slate-200 py-2 px-3 rounded-xl text-sm w-full focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Todas las cuentas integradas</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.bankName.split(' ')[0]})</option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Búsqueda Avanzada</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por concepto, emisor, receptor, referencia o monto..."
                className="w-full pl-10 pr-4 py-2 bg-[#131d35] border border-slate-750 text-slate-200 text-sm focus:ring-1 focus:ring-amber-500 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions list layout */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <span className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 text-slate-600" />
            <p>No se encontraron registros de transferencias para esta consulta o cuenta.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131d35]/60 text-slate-300 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-4 px-6">Detalles / Concepto</th>
                  <th className="py-4 px-6">Remitente / CLABE</th>
                  <th className="py-4 px-6">Referencia SPEI</th>
                  <th className="py-4 px-6">Fecha / Hora</th>
                  <th className="py-4 px-6 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs text-slate-200">
                {transactions.map((t) => {
                  const isIncoming = t.type === 'SPEI_ENTRADA' || t.type === 'INTERNA_RECIBIDA';
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{t.concept}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.receiverName}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] tracking-wider">
                        <div className="text-slate-300">{t.senderName}</div>
                        <div className="text-slate-500">{t.senderClabe}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-slate-800 rounded font-mono text-[10px] font-semibold text-slate-400">
                          {t.reference}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(t.date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className={`py-4 px-6 text-right font-display font-bold text-sm ${isIncoming ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {isIncoming ? '+' : '-'}${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Custom Pagination Footer styling */}
        <div className="p-4 bg-[#111827] border-t border-slate-800 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            Mostrando registros <span className="text-white font-bold">{Math.min(total, (page - 1) * limit + 1)}</span> a <span className="text-white font-bold">{Math.min(total, page * limit)}</span> de <span className="text-amber-500 font-bold">{total.toLocaleString()}</span> transacciones
          </p>

          <div className="inline-flex gap-2.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/45 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-slate-300 py-1 px-2.5 bg-slate-800 border border-slate-700 rounded-lg">
              Pág. <span className="text-amber-400 font-bold">{page}</span> de <span className="text-slate-400 font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/45 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer text-xs flex items-center gap-1.5"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

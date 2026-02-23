import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import { 
  History, Calendar, Layers, RefreshCcw, 
  X, CheckCircle2, AlertCircle, Search,
  ArrowDownLeft, ArrowUpRight, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TransactionsPage() {
  const { activeTenantId } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filters, setFilters] = useState({ type: '', specificDate: '', fullMonth: '' });

  const fetchTransactions = useCallback(async () => {
    if (!activeTenantId) return;
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('tx_type', filters.type);
      const dateValue = filters.specificDate || filters.fullMonth;
      if (dateValue) params.append('month', dateValue);

      const response = await api.get(`/gameplay/wallet/dashboard?tenant_id=${activeTenantId}&${params.toString()}`);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      toast.error("Failed to sync transaction ledger");
    } finally {
      setFetching(false);
    }
  }, [filters, activeTenantId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4 italic uppercase">
             <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <History className="text-indigo-400 w-8 h-8" />
             </div>
             Transaction <span className="text-indigo-400">Ledger</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Review your historical deposits, withdrawals, and game settlements.</p>
        </div>
      </header>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl flex flex-col xl:flex-row items-center gap-6 shadow-2xl">
        <div className="relative group flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400" size={18} />
           <input 
              type="text" 
              placeholder="Filter by Transaction ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
           />
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <select 
            value={filters.type}
            onChange={(e) => setFilters(f => ({...f, type: e.target.value}))}
            className="bg-transparent text-[10px] font-black text-slate-300 px-4 py-2 outline-none cursor-pointer uppercase tracking-widest"
          >
            <option value="" className="bg-slate-900">All Types</option>
            <option value="deposit" className="bg-slate-900">Deposits</option>
            <option value="withdrawal" className="bg-slate-900">Withdrawals</option>
            <option value="bet" className="bg-slate-900">Bets</option>
            {/* <option value="win" className="bg-slate-900">Winnings</option> */}
          </select>
          
          <div className="w-px h-6 bg-slate-800" />
          
          <div className="flex items-center px-4 gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <Calendar size={14} className="text-teal-500" />
            <input 
              type="date"
              value={filters.specificDate}
              onChange={(e) => setFilters(f => ({...f, specificDate: e.target.value, fullMonth: ''}))}
              className="bg-transparent outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          <div className="w-px h-6 bg-slate-800" />

          <button 
            onClick={() => setFilters({ type: '', specificDate: '', fullMonth: '' })}
            className="p-2 text-red-500 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <button onClick={fetchTransactions} className="p-4 bg-slate-800 border border-slate-700 text-teal-400 rounded-2xl hover:bg-slate-700 transition-all shadow-xl">
           <RefreshCcw size={20} className={fetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 bg-slate-900/40 border-b border-slate-800">
                <th className="px-8 py-6">Reference / Type</th>
                <th className="px-8 py-6">Delta Amount</th>
                <th className="px-8 py-6">Vault Balance</th>
                <th className="px-8 py-6">Execution Time</th>
                <th className="px-8 py-6 text-right">Confirmation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <tr 
                    key={tx.id} 
                    className="group hover:bg-slate-700/20 transition-all duration-200"
                    style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.04}s both` }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                         </div>
                         <div>
                            <div className="font-bold text-slate-100 uppercase tracking-tight group-hover:text-teal-400 transition-colors">{tx.type}</div>
                            <div className="text-[10px] text-slate-500 font-mono">#{tx.id.slice(0, 12)}</div>
                         </div>
                      </div>
                    </td>
                    <td className={`px-8 py-6 text-lg font-black tracking-tighter ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-6 font-mono text-sm text-slate-400">${tx.after.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    
                    {/* THE FIXED TIME COLUMN */}
                    <td className="px-8 py-6">
                       <div className="text-xs font-bold text-slate-300">
                          {new Date(tx.date + "Z").toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                       </div>
                       <div className="text-[10px] text-slate-500 font-black uppercase mt-1 flex items-center gap-1">
                          <Clock size={12} className="text-slate-600" />
                          {new Date(tx.date + "Z").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                       </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {tx.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <History className="mx-auto text-slate-800 mb-4" size={56} />
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-sm italic">Ledger Empty: No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
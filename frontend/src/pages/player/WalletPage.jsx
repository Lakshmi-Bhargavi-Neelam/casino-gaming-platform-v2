import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, 
  CreditCard, Landmark, ChevronRight, AlertCircle,
  Clock, CheckCircle2, RefreshCcw, X, Calendar, Layers 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WalletPage() {
  const { updateBalance } = useAuth(); 
  const [activeTab, setActiveTab] = useState('deposit');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 🎯 Unified Filter State for Type, Specific Date, and Full Month
  const [filters, setFilters] = useState({
    type: '',
    specificDate: '', // Format: YYYY-MM-DD
    fullMonth: ''     // Format: YYYY-MM
  });

  const quickAmounts = [10, 50, 100, 500];

  const fetchWalletData = useCallback(async () => {
    setFetching(true);
    try {
      // 🛠 Construct URL with Query Parameters for Filtering
      const params = new URLSearchParams();
      if (filters.type) params.append('tx_type', filters.type);
      
      // 🎯 Prioritize Specific Date over Full Month if both are somehow set
      const dateValue = filters.specificDate || filters.fullMonth;
      if (dateValue) {
        params.append('month', dateValue);
      }

      const response = await api.get(`/gameplay/wallet/dashboard?${params.toString()}`);
      
      setBalance(response.data.balance);
      setTransactions(response.data.transactions || []);
      updateBalance(response.data.balance);
    } catch (err) {
      console.error("Wallet sync error:", err);
      toast.error("Failed to sync wallet data");
    } finally {
      setFetching(false);
    }
  }, [filters, updateBalance]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleAction = async (type) => {
    if (!amount || parseFloat(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    setLoading(true);
    try {
      // 🎯 URLs are correct based on your prefix="/payments" in payments.py
      const endpoint = type === 'deposit' ? '/payments/deposit' : '/payments/withdraw';
      const response = await api.post(endpoint, { amount: parseFloat(amount) });
      
      toast.success(response.data.message);
      
      // 🔄 Syncing the UI
      // Since 'withdraw' doesn't return the new balance in the JSON, 
      // fetchWalletData() is mandatory to see the deducted amount.
      await fetchWalletData(); 
      
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* --- BALANCE CARD --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest opacity-80">Total Balance</p>
            <h1 className="text-5xl font-black mt-1">$ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <Wallet size={40} />
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* --- TABS --- */}
      <div className="bg-slate-900 p-1.5 rounded-2xl flex gap-2 border border-slate-800">
        <button 
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'deposit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ArrowUpCircle size={18} /> Deposit
        </button>
        <button 
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'withdraw' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ArrowDownCircle size={18} /> Withdraw
        </button>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <div>
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-4">
              Enter {activeTab} Amount
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500">$</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black focus:outline-none focus:border-indigo-500 transition-all text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map(val => (
              <button key={val} onClick={() => setAmount(val)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl font-bold text-slate-300 transition-colors">
                +${val}
              </button>
            ))}
          </div>

          <button onClick={() => handleAction(activeTab)} disabled={loading} className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${activeTab === 'deposit' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'}`}>
            {loading ? 'Processing...' : (activeTab === 'deposit' ? 'DEPOSIT NOW' : 'REQUEST WITHDRAWAL')}
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-200 text-sm">
              <AlertCircle size={18} className="text-indigo-400" /> Payment Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
                <CreditCard className="text-slate-400" size={18} />
                <span className="text-xs font-medium text-slate-300">Credit / Debit Card</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
                <Landmark className="text-slate-400" size={18} />
                <span className="text-xs font-medium text-slate-300">Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRANSACTION HISTORY TABLE WITH DUAL FILTERS --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-500" size={20} />
            <h2 className="font-bold text-lg text-white">History</h2>
          </div>

          {/* 🎯 Unified Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 items-center">
              {/* 1. Type Filter */}
              <select 
                value={filters.type}
                onChange={(e) => setFilters(f => ({...f, type: e.target.value}))}
                className="bg-transparent text-[10px] font-bold text-slate-300 px-2 py-1.5 outline-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="bet">Bets</option>
                <option value="win">Winnings</option>
              </select>
              
              <div className="w-px h-4 bg-slate-700 mx-1" />
              
              {/* 2. Specific Date Filter (Calendar) */}
              <div className="flex items-center px-2 gap-1">
                <Calendar size={12} className="text-slate-500" />
                <input 
                  type="date"
                  value={filters.specificDate}
                  onChange={(e) => setFilters(f => ({...f, specificDate: e.target.value, fullMonth: ''}))}
                  className="bg-transparent text-[10px] font-bold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                  title="Filter by specific day"
                />
              </div>

              <div className="w-px h-4 bg-slate-700 mx-1" />

              {/* 3. Month Filter (Dropdown Style) */}
              <div className="flex items-center px-2 gap-1">
                <Layers size={12} className="text-slate-500" />
                <input 
                  type="month"
                  value={filters.fullMonth}
                  onChange={(e) => setFilters(f => ({...f, fullMonth: e.target.value, specificDate: ''}))}
                  className="bg-transparent text-[10px] font-bold text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
                  title="Filter by entire month"
                />
              </div>
            </div>

            {/* Clear Button (Only shows when any filter is active) */}
            {(filters.type || filters.specificDate || filters.fullMonth) && (
              <button 
                onClick={() => setFilters({ type: '', specificDate: '', fullMonth: '' })}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                title="Clear All Filters"
              >
                <X size={18} />
              </button>
            )}

            <button onClick={fetchWalletData} className="text-slate-500 hover:text-white transition p-2 bg-slate-800 rounded-lg border border-slate-700">
              <RefreshCcw size={16} className={fetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Type / ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Balance After</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white capitalize group-hover:text-indigo-400 transition-colors">{tx.type || 'Transaction'}</div>
                      <div className="text-[10px] text-slate-600 font-mono">#{tx.id.slice(0, 8)}</div>
                    </td>
                    <td className={`px-6 py-4 font-black ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">${tx.after.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {tx.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                    No transactions found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, 
  CreditCard, Landmark, ChevronRight, 
  Zap, Coins, ShieldCheck, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WalletPage() {
  const { updateBalance, balance: contextBalance, activeTenantId } = useAuth(); 
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10, 50, 100, 500];

  const handleAction = async (type) => {
    if (!amount || parseFloat(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    // Safety check: Ensure a casino is actually selected
    if (!activeTenantId) {
      return toast.error("No active casino session found. Please re-enter from Marketplace.");
    }

    setLoading(true);
    try {
      const endpoint = type === 'deposit' ? '/payments/deposit' : '/payments/withdraw';
      
      // 1. Define the payload correctly
      const payload = { 
        amount: parseFloat(amount),
        tenant_id: activeTenantId 
      };

      // 2. FIX: You must pass the 'payload' variable here!
      const response = await api.post(endpoint, payload);
      
      toast.success(response.data.message);
      
      // 3. Sync balance after action using the tenant context
      const syncRes = await api.get(`/gameplay/wallet/dashboard?tenant_id=${activeTenantId}`);
      updateBalance(syncRes.data.balance);
      
      setAmount('');
    } catch (err) {
      // 3. Crash-proof error handling for validation objects
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        // Handle FastAPI 422 errors (Array of objects)
        toast.error(detail[0]?.msg || "Validation Error");
      } else if (typeof detail === 'object' && detail !== null) {
        // Handle custom error objects
        toast.error(detail.message || "Action failed");
      } else {
        // Handle strings or fallback
        toast.error(detail || "Transaction failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* ---  BALANCE CARD --- */}
      <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] -z-10 group-hover:bg-teal-500/20 transition-all duration-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={14} className="text-teal-500" /> Secure Player Vault
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-500/50">$</span>
              <h1 className="text-6xl font-black text-white tracking-tighter italic">
                {Number(contextBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h1>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
               Available Credits <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </p>
          </div>
          
          <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl flex items-center justify-center border border-slate-700 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
            <Coins size={40} className="text-teal-400" />
          </div>
        </div>
      </div>

      {/* --- EXCHANGE INTERFACE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Input & Controls */}
        <div className="lg:col-span-2 space-y-8 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl">
          
          {/* Segmented Tab Toggle */}
          <div className="inline-flex p-1.5 bg-slate-950 border border-slate-800 rounded-2xl w-full">
            <button 
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ArrowUpCircle size={18} /> Deposit
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ArrowDownCircle size={18} /> Withdrawal
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Transaction Amount</label>
              <div className="relative group">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-700 group-focus-within:text-teal-500 transition-colors">$</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] py-8 pl-16 pr-8 text-5xl font-black focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all text-white placeholder-slate-800"
                />
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-4">
              {quickAmounts.map(val => (
                <button 
                  key={val} 
                  onClick={() => setAmount(val)} 
                  className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 py-4 rounded-2xl font-black text-xs text-slate-400 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  +${val}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleAction(activeTab)} 
              disabled={loading} 
              className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 transform hover:-translate-y-1 ${activeTab === 'deposit' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 shadow-teal-500/20' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {activeTab === 'deposit' ? 'Authorize Deposit' : 'Process Cashout'}
                  <Zap size={20} fill="currentColor" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700/50 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-teal-500 flex items-center gap-2">
              <ShieldCheck size={16} /> Instant Processing
            </h3>
            <div className="space-y-4">
              <PaymentMethod icon={<CreditCard size={20} />} label="Card / Apple Pay" />
              <PaymentMethod icon={<Landmark size={20} />} label="Bank Transfer" />
            </div>
            
            <div className="pt-6 border-t border-slate-800">
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                 Deposits are credited instantly. Withdrawals are subject to security audit and typically processed within 2-4 hours.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function PaymentMethod({ icon, label }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-teal-500/30 transition-all cursor-pointer">
      <div className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-teal-400 transition-colors">
        {icon}
      </div>
      <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">{label}</span>
    </div>
  );
}
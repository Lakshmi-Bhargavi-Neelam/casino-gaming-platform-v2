import React, { useState } from 'react';
import { X, Coins, Zap, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function ContributeModal({ jackpot, isOpen, onClose, onConfirm, loading }) {
  const [amount, setAmount] = useState('');
  const quickAmounts = [10, 50, 100, 500];

  if (!isOpen || !jackpot) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    onConfirm(parseFloat(amount));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-6">
          <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 mx-auto">
             <Coins className="text-teal-400" size={32} />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Boost the Pool</h2>
            <p className="text-slate-400 text-sm font-medium">
              Contribute to <span className="text-teal-400 font-bold">{jackpot.jackpot_name}</span> and increase the total prize.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-700 group-focus-within:text-teal-500 transition-colors">$</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-white placeholder-slate-800"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map(val => (
                  <button 
                    key={val} 
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-xl text-[10px] font-black text-slate-400 hover:text-white transition-all"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
               <AlertCircle size={18} className="text-amber-500 shrink-0" />
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                  Every contribution gives you a chance to be the random winner when the deadline expires.
               </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || !amount}
                className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16} /> Confirm</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
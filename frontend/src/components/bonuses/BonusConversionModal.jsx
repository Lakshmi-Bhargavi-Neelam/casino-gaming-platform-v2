import React from 'react';
import { X, CheckCircle2, AlertCircle, Coins, Loader2 } from 'lucide-react';

export default function BonusConversionModal({ bonus, isOpen, onClose, onConfirm, loading }) {
  if (!isOpen || !bonus) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-6">
          <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 mx-auto">
             <Coins className="text-teal-400" size={32} />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Convert Bonus?</h2>
            <p className="text-slate-400 text-sm font-medium">
              You are about to convert <span className="text-teal-400 font-bold">{bonus.bonus_amount} points</span> into your real cash wallet.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
             <AlertCircle size={18} className="text-amber-500 shrink-0" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                Once converted, these credits are added to your withdrawable balance.
             </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Confirm</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
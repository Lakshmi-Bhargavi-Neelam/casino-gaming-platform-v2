import React from 'react';
import { Zap, Clock, Trophy } from 'lucide-react';

export default function JackpotCard({ jackpot, onAction, index }) {
  const isSponsored = jackpot.jackpot_type === 'SPONSORED';

  return (
    <div 
      className="group relative bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl hover:border-amber-500/30 transition-all duration-500"
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
    >
      <div className="absolute top-6 right-8">
         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
           isSponsored ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
         }`}>
           {jackpot.jackpot_type}
         </span>
      </div>

      <div>
        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <Zap className={isSponsored ? 'text-teal-400 animate-pulse' : 'text-indigo-400'} size={32} />
        </div>
        
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 leading-none">{jackpot.jackpot_name}</h3>
        
        <div className="flex items-baseline gap-2 mb-8">
           <span className="text-teal-500 font-black text-lg">$</span>
           <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-teal-400 transition-all duration-700">
             {Number(jackpot.current_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </h2>
        </div>

        {isSponsored && jackpot.deadline && (
          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-8 flex items-center gap-4">
             <Clock className="text-amber-500" size={20} />
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Draw Date</p>
                <p className="text-sm font-bold text-slate-200">{new Date(jackpot.deadline).toLocaleDateString()}</p>
             </div>
          </div>
        )}
      </div>

      {isSponsored ? (
        <button 
          onClick={() => onAction(jackpot)}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all"
        >
           Contribute to Pool
        </button>
      ) : (
        <div className="py-5 text-center bg-slate-950/50 rounded-2xl border border-slate-800 group-hover:border-indigo-500/20 transition-colors">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recurring Draw: {jackpot.reset_cycle}</p>
        </div>
      )}
    </div>
  );
}
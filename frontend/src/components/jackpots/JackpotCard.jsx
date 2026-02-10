import React from 'react';
import { Zap, Clock, Trophy, Lock, TimerOff } from 'lucide-react';

export default function JackpotCard({ jackpot, onAction, index }) {
  const isSponsored = jackpot.jackpot_type === 'SPONSORED';
  
  // 🎯 LOGIC: Check if current time is past the deadline
  // We use new Date() to get the browser's current local time
  const isExpired = isSponsored && jackpot.deadline && new Date() > new Date(jackpot.deadline);

  return (
    <div 
      className={`group relative border rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl transition-all duration-500 
      ${isExpired 
        ? 'bg-slate-950/80 border-slate-800 opacity-75 grayscale-[50%]' // Dimmed style for expired
        : 'bg-[#0f172a] border-slate-800 hover:border-amber-500/30' // Active style
      }`}
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
    >
      <div className="absolute top-6 right-8">
         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
           isExpired ? 'bg-slate-800 text-slate-500 border-slate-700' :
           isSponsored ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
         }`}>
           {isExpired ? 'CLOSED' : jackpot.jackpot_type}
         </span>
      </div>

      <div>
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border shadow-inner transition-transform duration-500 ${
            isExpired ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800 group-hover:scale-110'
        }`}>
          {isExpired ? (
             <Lock className="text-slate-600" size={32} />
          ) : (
             <Zap className={isSponsored ? 'text-teal-400 animate-pulse' : 'text-indigo-400'} size={32} />
          )}
        </div>
        
        <h3 className={`text-2xl font-black uppercase italic tracking-tight mb-2 leading-none ${isExpired ? 'text-slate-500' : 'text-white'}`}>
            {jackpot.jackpot_name}
        </h3>
        
        <div className="flex items-baseline gap-2 mb-8">
           <span className={`${isExpired ? 'text-slate-600' : 'text-teal-500'} font-black text-lg`}>$</span>
           <h2 className={`text-5xl font-black tracking-tighter tabular-nums transition-all duration-700 ${
               isExpired ? 'text-slate-600' : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-teal-400'
           }`}>
             {Number(jackpot.current_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </h2>
        </div>

        {isSponsored && jackpot.deadline && (
          <div className={`rounded-2xl p-4 border mb-8 flex items-center gap-4 ${isExpired ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-950/50 border-slate-800'}`}>
             {isExpired ? <TimerOff className="text-red-900" size={20} /> : <Clock className="text-amber-500 animate-spin-slow" size={20} />}
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                    {isExpired ? "Draw Status" : "Draw Closes In"}
                </p>
                <p className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-slate-200'}`}>
                    {isExpired ? "DEADLINE REACHED" : new Date(jackpot.deadline).toLocaleDateString() + " at " + new Date(jackpot.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
             </div>
          </div>
        )}
      </div>

      {/* ACTION AREA */}
      {isSponsored ? (
        <button 
          onClick={() => !isExpired && onAction(jackpot)}
          disabled={isExpired}
          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              isExpired 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-[1.02]'
          }`}
        >
           {isExpired ? (
               <><Lock size={14} /> Contributions Locked</>
           ) : (
               "Contribute to Pool"
           )}
        </button>
      ) : (
        <div className="py-5 text-center bg-slate-950/50 rounded-2xl border border-slate-800 group-hover:border-indigo-500/20 transition-colors">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recurring Draw: {jackpot.reset_cycle}</p>
        </div>
      )}
    </div>
  );
}
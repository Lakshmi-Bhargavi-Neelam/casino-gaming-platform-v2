import React from 'react';
import { Zap, Clock, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BonusCard({ bonus, onConvert }) {
  const progress = (bonus.wagering_completed / bonus.wagering_required) * 100;
const isEligible = bonus.status === 'eligible';
  const isCompleted = bonus.status === 'completed';

  return (
    <div className={`group relative bg-slate-900/40 backdrop-blur-md border rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 ${
      isEligible ? 'border-teal-500/40 shadow-[0_0_30px_rgba(20,184,166,0.1)]' : 'border-slate-800'
    }`}>
      
      {/* Header Info */}
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl border transition-colors ${
          isEligible ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-slate-950 border-slate-800 text-slate-500'
        }`}>
          <Zap size={24} className={isEligible ? "animate-pulse" : ""} />
        </div>
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
          isEligible ? 'bg-teal-500/10 text-teal-400 border-teal-400/20' : 
          isCompleted ? 'bg-slate-800 text-slate-500 border-slate-700' : 
          'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {bonus.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="space-y-1 mb-8">
        <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">
          {bonus.bonus_amount.toLocaleString()} <span className="text-teal-500">Points</span>
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Type: {bonus.bonus_type || 'Deposit Bonus'}
        </p>
      </div>

      {/* Progress Section */}
      {!isCompleted && (
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wagering Core</span>
            <span className={`text-xs font-mono font-bold ${isEligible ? 'text-teal-400' : 'text-slate-300'}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 p-[2px]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isEligible ? 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-indigo-600'
              }`} 
              style={{ width: `${Math.min(progress, 100)}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-tighter uppercase">
            <span>Unlocked: ${bonus.wagering_completed.toLocaleString()}</span>
            <span>Target: ${bonus.wagering_required.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Action Logic */}
      <div className="flex gap-3">
        {isEligible ? (
          <button 
            onClick={() => onConvert(bonus)}
            className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trophy size={16} /> Convert to Cash
          </button>
        ) : !isCompleted ? (
          <Link 
            to={`/player/bonuses/${bonus.bonus_usage_id}`}
            className="flex-1 bg-slate-800/50 text-slate-300 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-center border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            View Specs <ArrowRight size={14} />
          </Link>
        ) : (
          <div className="flex-1 py-4 text-center bg-slate-950/50 rounded-xl text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] border border-slate-900">
            Locked & Cleared
          </div>
        )}
      </div>
    </div>
  );
}
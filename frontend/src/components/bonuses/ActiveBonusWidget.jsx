import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Gift, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ActiveBonusWidget() {
  const [activeBonus, setActiveBonus] = useState(null);

  useEffect(() => {
    api.get('/player/bonuses/active').then(res => {
      if (res.data.length > 0) setActiveBonus(res.data[0]);
    });
  }, []);

  if (!activeBonus) return null;

  const progress = (activeBonus.wagering_completed / activeBonus.wagering_required) * 100;
const isEligible = activeBonus.status === 'eligible';

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${isEligible ? 'bg-teal-500/5 border-teal-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-slate-950 rounded-lg">
              <Gift size={16} className={isEligible ? 'text-teal-400' : 'text-slate-500'} />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Reward</p>
              <p className="text-xs font-bold text-white">{activeBonus.bonus_amount} Points</p>
           </div>
        </div>
        {isEligible && <Zap size={14} className="text-teal-400 animate-pulse" />}
      </div>

      <div className="space-y-2">
         <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${isEligible ? 'bg-teal-400' : 'bg-indigo-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
         </div>
         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
            <span className="text-slate-500">{progress.toFixed(0)}% Unlocked</span>
            <Link to="/player/bonuses" className="text-teal-500 flex items-center hover:underline">
               Portal <ChevronRight size={10} />
            </Link>
         </div>
      </div>
    </div>
  );
}
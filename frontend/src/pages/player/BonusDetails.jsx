import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  ChevronLeft, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle2, 
  Trophy, 
  History, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  Coins
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function BonusDetails() {
  const { bonusUsageId } = useParams();
  const navigate = useNavigate();
  const { updateBalance } = useAuth();
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/player/bonuses/${bonusUsageId}`);
        setBonus(res.data);
      } catch (err) {
        toast.error("Could not retrieve bonus details");
        navigate('/player/bonuses');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [bonusUsageId, navigate]);

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await api.post(`/player/bonuses/${bonusUsageId}/convert`);
      toast.success(res.data.message);
      updateBalance(res.data.cash_balance);
      // Refresh local data
      const updated = await api.get(`/player/bonuses/${bonusUsageId}`);
      setBonus(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="animate-spin text-teal-500" size={48} />
      <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Decoding Bonus Metadata...</p>
    </div>
  );

  const progress = (bonus.wagering_completed / bonus.wagering_required) * 100;
  const isEligible = bonus.status === 'eligible';
  const isCompleted = bonus.status === 'completed';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* 1. Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Link 
            to="/player/bonuses" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Bonuses
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <Zap className="text-teal-400 w-8 h-8" />
             </div>
             Bonus <span className="text-teal-400">Inspector</span>
          </h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Instance ID</p>
              <p className="text-xs font-mono text-slate-300">#{bonus.bonus_usage_id.slice(0, 12)}</p>
           </div>
        </div>
      </div>

      {/* 2. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Wagering Terminal */}
        <div className="lg:col-span-2 space-y-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] -z-10" />
          
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Wagering Efficiency</h3>
                <p className="text-5xl font-black text-white mt-2 italic">
                  {progress.toFixed(1)}<span className="text-teal-500 text-2xl ml-1">%</span>
                </p>
             </div>
             <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                isEligible ? 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'bg-slate-950 border-slate-800 text-slate-500'
             }`}>
                {bonus.status.replace('_', ' ')}
             </div>
          </div>

          {/* Progress Visualizer */}
          <div className="space-y-6">
             <div className="h-4 w-full bg-slate-950 rounded-full border border-slate-800 p-1 overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                    isEligible ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
                <SpecItem icon={<Target size={14} />} label="Total Target" value={`$${bonus.wagering_required}`} color="slate" />
                <SpecItem icon={<CheckCircle2 size={14} />} label="Cleared" value={`$${bonus.wagering_completed}`} color="teal" />
                <SpecItem icon={<Coins size={14} />} label="Conversion Value" value={`${bonus.bonus_amount} PTS`} color="indigo" />
             </div>
          </div>

          {/* Action Area */}
          {isEligible && (
            <div className="mt-8 animate-in zoom-in-95 duration-500">
               <button 
                onClick={handleConvert}
                disabled={converting}
                className="w-full py-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 {converting ? <Loader2 className="animate-spin" /> : <><Trophy size={20} /> Finalize Conversion</>}
               </button>
            </div>
          )}
        </div>

        {/* 3. Audit Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <History size={16} className="text-teal-500" /> Audit Timeline
          </h3>

          <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
             <TimelineStep 
                active={true} 
                done={true} 
                label="Bonus Granted" 
                sub={new Date(bonus.granted_at).toLocaleString()} 
             />
             <TimelineStep 
                active={bonus.status === 'active'} 
                done={bonus.status !== 'active'} 
                label="Wagering Threshold" 
                sub={bonus.status === 'active' ? 'Verification in progress' : 'Target reached'} 
             />
             <TimelineStep 
                active={bonus.status === 'eligible'} 
                done={isCompleted} 
                label="Eligible for Cash" 
                sub={isEligible ? 'Manual action required' : isCompleted ? 'Verification passed' : 'Waiting...'} 
             />
             <TimelineStep 
                active={isCompleted} 
                done={isCompleted} 
                label="Ledger Settled" 
                sub={isCompleted ? `Converted on ${new Date(bonus.completed_at).toLocaleDateString()}` : 'Final settlement pending'} 
             />
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
             <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck size={16} className="text-teal-500/50" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Encryption Key: SHA-256 <br/> Validated by platform core
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Help Alert */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex items-center gap-4 max-w-2xl">
         <AlertCircle className="text-indigo-400 shrink-0" />
         <p className="text-xs text-slate-500 font-medium">
           Only bets placed on <strong>Active Games</strong> contribute to the wagering efficiency. 
           Calculations are performed real-time by the gaming logic engine.
         </p>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value, color }) {
  const colors = {
    slate: "text-slate-500",
    teal: "text-teal-400",
    indigo: "text-indigo-400"
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
        {icon} {label}
      </div>
      <p className={`text-sm font-black uppercase tracking-tight ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}

function TimelineStep({ active, done, label, sub }) {
  return (
    <div className="flex gap-6 relative z-10">
       <div className={`w-6 h-6 rounded-full border-4 flex-shrink-0 transition-all duration-500 ${
         done ? 'bg-teal-500 border-teal-500/20 shadow-[0_0_10px_#14b8a6]' : 
         active ? 'bg-slate-900 border-indigo-500' : 
         'bg-slate-900 border-slate-800'
       }`}>
         {done && <CheckCircle2 size={12} className="text-slate-950 m-auto mt-[2px]" />}
       </div>
       <div className="space-y-1">
          <p className={`text-xs font-black uppercase tracking-widest ${active || done ? 'text-white' : 'text-slate-600'}`}>
            {label}
          </p>
          <p className="text-[10px] font-medium text-slate-500">{sub}</p>
       </div>
    </div>
  );
}
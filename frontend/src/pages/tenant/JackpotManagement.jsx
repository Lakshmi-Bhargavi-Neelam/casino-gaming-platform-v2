import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Coins, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronDown, 
  TrendingUp, 
  Percent, 
  MousePointerClick 
} from 'lucide-react';

export default function JackpotManagement() {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { 
      jackpot_type: 'FIXED', 
      reset_cycle: 'DAILY',
      contribution_percentage: 1.0,
      opt_in_required: true 
    }
  });

  const jackpotType = watch("jackpot_type");

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        seed_amount: parseFloat(data.seed_amount),
        currency_id: 1, // Standardizing on ID 1
        // Progressive specifics
        contribution_percentage: data.jackpot_type === 'PROGRESSIVE' ? parseFloat(data.contribution_percentage) : 0,
        opt_in_required: data.jackpot_type === 'PROGRESSIVE' ? data.opt_in_required : false,
        // Sponsored specifics
        deadline: data.jackpot_type === 'SPONSORED' ? new Date(data.deadline).toISOString() : null,
        // Fixed specifics
        reset_cycle: data.jackpot_type === 'FIXED' ? data.reset_cycle : 'NEVER'
      };

      await api.post('/tenant/jackpots', payload);
      toast.success(`${data.jackpot_type} Jackpot deployed successfully!`);
      reset();
    } catch (err) {
    // 🎯 FIX: This block prevents the white screen crash
    const detail = err.response?.data?.detail;
    
    if (Array.isArray(detail)) {
      // If FastAPI sends a list of validation errors
      toast.error(detail[0]?.msg || "Validation Error");
    } else if (typeof detail === 'string') {
      toast.error(detail);
    } else {
      toast.error("An unexpected error occurred while deploying the jackpot.");
    }
    console.error("Jackpot Deployment Error:", err);
  }
  };

  const inputClasses = "w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder-slate-700 font-medium";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase italic">
          <div className="p-2 bg-amber-500/10 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Trophy className="text-amber-500 w-8 h-8" />
          </div>
          Jackpot <span className="text-amber-500">Commander</span>
        </h1>
        <p className="text-slate-400 mt-1 ml-1 font-medium">Configure global prize pools, community pools, or bet-based progressives.</p>
      </header>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-teal-500 to-indigo-600"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-10">
          
          {/* Main Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Campaign Name</label>
              <input {...register('jackpot_name', { required: true })} className={inputClasses} placeholder="e.g. Mega Progressive" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Jackpot Engine</label>
              <div className="relative">
                <select {...register('jackpot_type', { required: true })} className={`${inputClasses} appearance-none cursor-pointer`}>
                  <option value="FIXED">Fixed (Static Draw)</option>
                  <option value="PROGRESSIVE">Progressive (Bet-Contribution)</option>
                  <option value="SPONSORED">Sponsored (Community Pool)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Dynamic Logic Container */}
          <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 space-y-8 shadow-inner relative overflow-hidden">
             
             {/* 💰 Seed Amount - Always Shown */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Coins size={12}/> Initial Pool / Seed ($)
                    </label>
                    <input type="number" step="0.01" {...register('seed_amount', { required: true })} className={`${inputClasses} text-2xl font-black italic text-amber-400`} placeholder="100.00" />
                </div>

                {/* TYPE 1: FIXED - Reset Cycle */}
                {jackpotType === 'FIXED' && (
                    <div className="space-y-2 animate-in slide-in-from-right duration-300">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Zap size={12}/> Auto-Reset Cycle
                        </label>
                        <select {...register('reset_cycle')} className={inputClasses}>
                            <option value="DAILY">Every 24 Hours</option>
                            <option value="WEEKLY">Every 7 Days</option>
                            <option value="MONTHLY">Monthly Draw</option>
                            <option value="NEVER">One-time Event</option>
                        </select>
                    </div>
                )}

                {/* TYPE 3: SPONSORED - Deadline */}
                {jackpotType === 'SPONSORED' && (
                    <div className="space-y-2 animate-in slide-in-from-right duration-300">
                        <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Clock size={12}/> Contribution Deadline
                        </label>
                        <input type="datetime-local" {...register('deadline')} className={`${inputClasses} [color-scheme:dark]`} />
                    </div>
                )}

                {/* TYPE 2: PROGRESSIVE - Contribution % */}
                {jackpotType === 'PROGRESSIVE' && (
                    <div className="space-y-2 animate-in slide-in-from-right duration-300">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Percent size={12}/> Bet Contribution Fee (%)
                        </label>
                        <input type="number" step="0.1" {...register('contribution_percentage')} className={`${inputClasses} text-indigo-300 font-bold`} placeholder="1.0" />
                    </div>
                )}
             </div>

             {/* PROGRESSIVE ADDITIONAL OPTIONS */}
             {jackpotType === 'PROGRESSIVE' && (
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between animate-in fade-in duration-500">
                    <div className="space-y-1">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            <MousePointerClick size={16} className="text-indigo-400" /> Player Opt-In Model
                        </h4>
                        <p className="text-[10px] text-slate-500 max-w-sm">Players choose whether to pay the fee and compete for the jackpot.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register('opt_in_required')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 shadow-inner"></div>
                    </label>
                </div>
             )}
          </div>

          {/* Action Button */}
          <button type="submit" disabled={isSubmitting} className="w-full relative group overflow-hidden bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 text-slate-950 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all">
            <div className="relative z-10 flex items-center justify-center gap-3">
               {isSubmitting ? "Processing Build..." : <><ShieldCheck size={20} /> Deploy Jackpot Instance</>}
            </div>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>
      </div>
    </div>
  );
}
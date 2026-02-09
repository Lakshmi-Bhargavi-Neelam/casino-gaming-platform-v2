import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Trophy, Target, Calendar, Coins, Zap, ShieldCheck, Clock, ChevronDown } from 'lucide-react';

export default function JackpotManagement() {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { jackpot_type: 'FIXED', reset_cycle: 'DAILY' }
  });

  const jackpotType = watch("jackpot_type");

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        seed_amount: parseFloat(data.seed_amount),
        currency_id: 1, // Defaulting to 1 for now
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null
      };
      await api.post('/tenant/jackpots', payload);
      toast.success("Jackpot deployed successfully!");
      reset();
    } catch (err) {
      toast.error("Failed to create jackpot campaign");
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
        <p className="text-slate-400 mt-1 ml-1 font-medium">Configure global prize pools and community sponsored raffles.</p>
      </header>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-600"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Campaign Name</label>
              <input {...register('jackpot_name', { required: true })} className={inputClasses} placeholder="e.g. Midnight Mega Draw" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Jackpot Engine</label>
              <div className="relative">
                <select {...register('jackpot_type', { required: true })} className={`${inputClasses} appearance-none cursor-pointer`}>
                  <option value="FIXED">Fixed (Daily/Recurring)</option>
                  <option value="SPONSORED">Sponsored (Community Pool)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Coins size={12}/> Seed / Initial Pool ($)
                </label>
                <input type="number" step="0.01" {...register('seed_amount', { required: true })} className={`${inputClasses} text-2xl font-black italic text-amber-400`} placeholder="1000.00" />
             </div>

             {jackpotType === 'FIXED' ? (
                <div className="space-y-2 animate-in slide-in-from-right duration-300">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Zap size={12}/> Reset Cycle
                  </label>
                  <select {...register('reset_cycle')} className={inputClasses}>
                    <option value="DAILY">Every 24 Hours</option>
                    <option value="WEEKLY">Every 7 Days</option>
                    <option value="NEVER">One-time Event</option>
                  </select>
                </div>
             ) : (
                <div className="space-y-2 animate-in slide-in-from-right duration-300">
                  <label className="text-[10px] font-black text-teal-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12}/> Draw Deadline
                  </label>
                  <input type="datetime-local" {...register('deadline')} className={`${inputClasses} [color-scheme:dark]`} />
                </div>
             )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full relative group overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all">
            <div className="relative z-10 flex items-center justify-center gap-3">
               <ShieldCheck size={20} /> Deploy Jackpot
            </div>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>
      </div>
    </div>
  );
}
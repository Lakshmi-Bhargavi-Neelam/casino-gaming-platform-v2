import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  Gift, 
  Zap, 
  ShieldCheck, 
  Coins, 
  Percent, 
  Wallet, 
  Calendar, 
  RefreshCw, 
  ChevronDown 
} from 'lucide-react';

export default function BonusManagement() {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      bonus_type: 'DEPOSIT',
      bonus_percentage: 100,
      wagering_multiplier: 30,
      min_deposit_amount: 10,
      max_bonus_amount: 500,
      bonus_amount: 20
    }
  });

  const bonusType = watch("bonus_type");

  const onSubmit = async (data) => {
    try {
      // 1. Prepare base payload with proper date formatting
      const payload = {
        bonus_name: data.bonus_name,
        bonus_type: data.bonus_type,
        wagering_multiplier: parseInt(data.wagering_multiplier) || 0,
        valid_from: new Date(data.valid_from).toISOString(),
        valid_to: new Date(data.valid_to).toISOString(),
        is_active: true,
        max_uses_per_player: 1,
      };

      // 2. Handle specific fields based on Bonus Strategy
      if (data.bonus_type === 'DEPOSIT') {
        payload.bonus_percentage = parseFloat(data.bonus_percentage) || 0;
        payload.max_bonus_amount = parseFloat(data.max_bonus_amount) || 0;
        payload.min_deposit_amount = parseFloat(data.min_deposit_amount) || 0;
        payload.bonus_amount = 0; // Not used for matches
      } else {
        payload.bonus_amount = parseFloat(data.bonus_amount) || 0;
        payload.bonus_percentage = 0;
        payload.max_bonus_amount = parseFloat(data.bonus_amount) || 0;
        payload.min_deposit_amount = 0; // No deposit required
      }

      await api.post('/tenant/bonuses', payload);
      toast.success("Promotion successfully deployed!");
      reset();
    } catch (err) {
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        // detail is an array of error objects like [{msg: "...", loc: "..."}]
        toast.error(detail[0]?.msg || "Validation Error");
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error("Failed to create promotion. Please check all fields.");
      }
    }
  };

  const inputClasses =
    "w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder-slate-700 font-medium shadow-inner";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
          <div className="p-2 bg-teal-500/10 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <Gift className="text-teal-400 w-8 h-8" />
          </div>
          Bonus Management
        </h1>
        <p className="text-slate-400 mt-1 ml-1 font-medium">
          Configure logic and deploy new player rewards to the platform.
        </p>
      </header>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-indigo-600"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-10">

          {/* Type Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Promotion Name
              </label>
              <input
                {...register('bonus_name', { required: "Name is required" })}
                className={inputClasses}
                placeholder="e.g. Welcome Match"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Bonus Strategy
              </label>
              <div className="relative">
                <select
                  {...register('bonus_type', { required: true })}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="DEPOSIT">Deposit Percentage Match</option>
  <option value="FIXED_CREDIT">Fixed Credit (No Deposit)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold">
                   <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[80px]">
            {bonusType === 'DEPOSIT' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Percent size={12}/> Match Percentage
                  </label>
                  <input
                    type="number"
                    {...register('bonus_percentage')}
                    className={inputClasses}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Wallet size={12}/> Max Bonus Cap
                  </label>
                  <input
                    type="number"
                    {...register('max_bonus_amount')}
                    className={inputClasses}
                    placeholder="500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Coins size={12}/> Min Deposit Req.
                  </label>
                  <input
                    type="number"
                    {...register('min_deposit_amount')}
                    className={inputClasses}
                    placeholder="10"
                  />
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-top-4 fade-in duration-500">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Coins size={12}/> Fixed Bonus Credit ($)
                  </label>
                  <input
                    type="number"
                    {...register('bonus_amount')}
                    className={`${inputClasses} border-teal-500/20 bg-teal-500/5 text-teal-100 text-lg font-black`}
                    placeholder="20.00"
                  />
                  <p className="text-[10px] text-slate-500 font-medium italic mt-1 ml-1">
                    This exact amount will be granted to the player's bonus wallet.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Wagering Requirements Container */}
          <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row items-center gap-8 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full" />
            
            <div className="flex-1 space-y-2 relative z-10">
              <h4 className="text-white font-bold flex items-center gap-3 text-lg italic">
                <div className="p-1.5 bg-teal-500/10 rounded-lg">
                    <Zap size={18} className="text-teal-400" />
                </div>
                Wagering Multiplier
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-md">
                Sets the turnover requirement. (e.g. 30x multiplier on $10 bonus = $300 wagering required).
              </p>
            </div>

            <div className="relative z-10">
                <input
                    type="number"
                    {...register('wagering_multiplier', { required: true, min: 0 })}
                    className="w-40 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-center text-teal-400 font-black text-3xl focus:border-teal-500 transition-all outline-none"
                    placeholder="30"
                />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded border border-slate-700">Multiplier</span>
            </div>
          </div>

          {/* Dates Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 group-focus-within:text-teal-500 transition-colors">
                <Calendar size={12} /> Activation Date
              </label>
              <input
                type="datetime-local"
                {...register('valid_from', { required: "Start date is required" })}
                className={`${inputClasses} [color-scheme:dark]`}
              />
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 group-focus-within:text-teal-500 transition-colors">
                <Calendar size={12} /> Expiration Date
              </label>
              <input
                type="datetime-local"
                {...register('valid_to', { required: "End date is required" })}
                className={`${inputClasses} [color-scheme:dark]`}
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="pt-6">
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95"
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? (
                        <RefreshCw className="animate-spin" size={20} />
                    ) : (
                        <>
                            <ShieldCheck size={20} className="group-hover:rotate-12 transition-transform" />
                            Deploy Promotion
                        </>
                    )}
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
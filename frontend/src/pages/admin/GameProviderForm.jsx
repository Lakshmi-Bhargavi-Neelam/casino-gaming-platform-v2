import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Gamepad2, 
  Globe, 
  Mail, 
  Lock, 
  Loader2, 
  PlusCircle, 
  ExternalLink 
} from 'lucide-react';
import api from '../../lib/axios';

export default function GameProviderForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/game-providers', data);
      toast.success(`Provider "${data.provider_name}" registered!`);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register provider');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Page Header */}
      <header className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
            <Gamepad2 className="text-teal-400 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Register Game Provider
          </h1>
        </div>
        <p className="text-slate-400 text-lg ml-1">
          Onboard a new game studio or content aggregator to the platform.
        </p>
      </header>

      {/* 2. Main Card Container */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-7">
          
          {/* Provider Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Provider Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                <Gamepad2 className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400" />
              </div>
              <input
                {...register('provider_name', { required: 'Name is required' })}
                type="text"
                className={`pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 
                focus:border-teal-500 transition-all duration-200 shadow-inner
                ${errors.provider_name ? 'border-red-500' : ''}`}
                placeholder="e.g. Evolution Gaming"
              />
            </div>
            {errors.provider_name && <p className="text-red-400 text-xs mt-1 font-medium">{errors.provider_name.message}</p>}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Official Website
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
              </div>
              <input
                {...register('website')}
                type="url"
                className="pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
                placeholder="https://evolution.com"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Contact Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
              </div>
              <input
                {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                type="email"
                className={`pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner
                ${errors.email ? 'border-red-500' : ''}`}
                placeholder="partners@studio.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Platform Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
              </div>
              <input
                {...register('password', { 
                    required: 'Password is required', 
                    minLength: { value: 8, message: 'Minimum 8 characters' } 
                })}
                type="password"
                className={`pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner
                ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-4 
              rounded-xl text-base font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 
              hover:from-teal-400 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-teal-500 
              focus:ring-offset-2 focus:ring-offset-slate-900 shadow-xl shadow-teal-500/20 
              transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Register Game Provider
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <ExternalLink size={14} className="text-teal-500/50" />
          <span>Automatic API Keys generation</span>
        </div>
        <div className="h-4 w-px bg-slate-800"></div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Lock size={14} className="text-teal-500/50" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
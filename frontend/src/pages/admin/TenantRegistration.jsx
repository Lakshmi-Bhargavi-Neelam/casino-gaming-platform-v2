import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Building2, Globe, CheckCircle, Info } from 'lucide-react';
import api from '../../lib/axios';

export default function TenantRegistration() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      tenant_name: data.tenant_name,
      domain: data.domain,
      allowed_countries: data.allowed_countries
        .split(',')
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 0)
    };

    try {
      await api.post('/tenants', payload);
      toast.success(`Tenant "${data.tenant_name}" created successfully!`);
      reset(); 
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to register tenant';
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      
      {/* 1. Page Header - Fixed Contrast & Alignment */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Tenant Registration
        </h1>
        <p className="text-slate-400 mt-2 text-base">
          Register and configure a new casino operator on the platform.
        </p>
      </header>

      {/* 2. Dark Card Container (Matches Login Screen) */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 p-8 md:p-10">
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenant Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-xs">
                Tenant Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {/* Icon turns Teal on focus */}
                  <Building2 className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors duration-200" />
                </div>
                <input
                  {...register('tenant_name', { 
                    required: 'Tenant name is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' }
                  })}
                  type="text"
                  className={`pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                  text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 
                  focus:border-teal-500 transition-all duration-200 shadow-inner
                  ${errors.tenant_name ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="e.g. Royal Casino"
                />
              </div>
              {errors.tenant_name && <p className="text-red-400 text-sm mt-1 pl-1">{errors.tenant_name.message}</p>}
            </div>

            {/* Domain URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-xs">
                Domain URL
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors duration-200" />
                </div>
                <input
                  {...register('domain')}
                  type="text"
                  className="pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                  text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 
                  focus:border-teal-500 transition-all duration-200 shadow-inner"
                  placeholder="e.g. royal-casino.com"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-1 flex items-center gap-1">
                 <Info className="w-3 h-3" /> Optional. Do not include https://
              </p>
            </div>
          </div>

          {/* Allowed Countries */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider text-xs">
              Allowed Countries (ISO-2)
            </label>
            <input
              {...register('allowed_countries', { required: 'At least one country is required' })}
              type="text"
              className={`block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
              text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 
              focus:border-teal-500 transition-all duration-200 shadow-inner
              ${errors.allowed_countries ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="US, GB, IN, DE"
            />
            
            {/* Visual Helper Badges */}
            <div className="flex flex-wrap items-center gap-3 mt-3 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-400">Format Example:</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-slate-700 border border-slate-600 text-xs font-mono text-teal-300">US</span>
                <span className="px-2 py-1 rounded bg-slate-700 border border-slate-600 text-xs font-mono text-teal-300">GB</span>
                <span className="px-2 py-1 rounded bg-slate-700 border border-slate-600 text-xs font-mono text-teal-300">IN</span>
              </div>
            </div>
            {errors.allowed_countries && <p className="text-red-400 text-sm mt-1 pl-1">{errors.allowed_countries.message}</p>}
          </div>

          {/* 3. Teal Gradient Button (Matches Login Screen) */}
          <div className="pt-4 border-t border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-8 py-3 rounded-xl text-sm font-bold text-white 
              bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 
              shadow-lg shadow-teal-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  Register Tenant <CheckCircle className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
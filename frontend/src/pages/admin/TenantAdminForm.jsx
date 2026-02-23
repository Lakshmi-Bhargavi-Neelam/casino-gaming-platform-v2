import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  UserCog, 
  Building, 
  Loader2, 
  User, 
  Lock, 
  ChevronDown, 
  CheckCircle,
  ShieldCheck,
  Mail 
} from 'lucide-react';
import api from '../../lib/axios';

//  Allowed domains based on your backend strict constraint
const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];

export default function TenantAdminForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [tenants, setTenants] = useState([]);
  const [fetchingTenants, setFetchingTenants] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await api.get('/tenants');
        setTenants(response.data);
      } catch (error) {
        toast.error("Failed to load tenants list");
      } finally {
        setFetchingTenants(false);
      }
    };
    fetchTenants();
  }, []);

  const onSubmit = async (data) => {
    try {
      //  Data payload now includes the real email provided by the user
      await api.post('/tenant-admins', data);
      toast.success(`Admin account created for ${data.email}!`);
      reset();
    } catch (error) {
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? (detail[0]?.msg || 'Validation error') : (detail || 'Failed to create tenant admin');
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <UserCog className="text-teal-400 w-8 h-8" />
          </div>
          Register Tenant Admin
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Assign a high-level administrator to manage an existing casino operator.
        </p>
      </header>

      <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
        
        <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-6">
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Select Operator Tenant
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                <Building className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400" />
              </div>
              <select
                {...register('tenant_id', { required: 'Please select a tenant' })}
                disabled={fetchingTenants}
                className="appearance-none pl-12 pr-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 
                transition-all duration-200 shadow-inner disabled:opacity-50 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  {fetchingTenants ? "Retrieving tenants..." : "Select an operator..."}
                </option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id} className="bg-slate-900 text-white">
                    {tenant.name} ({tenant.domain || 'no-domain'})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                {fetchingTenants ? <Loader2 size={18} className="animate-spin" /> : <ChevronDown size={18} />}
              </div>
            </div>
            {errors.tenant_id && <p className="text-red-400 text-xs mt-1 font-medium">{errors.tenant_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input
                {...register('first_name', { required: 'Required' })}
                placeholder="John"
                className="block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input
                {...register('last_name', { required: 'Required' })}
                placeholder="Doe"
                className="block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* LOGIC CHANGE: Replaced "Admin Username" with "Real Email Address" */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400" />
              </div>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' },
                  validate: value => {
                      const domain = value.split('@')[1]?.toLowerCase();
                      return ALLOWED_DOMAINS.includes(domain) || `Must be a reputable provider (${ALLOWED_DOMAINS.join(', ')})`;
                  }
                })}
                type="email"
                className={`pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-inner
                ${errors.email ? 'border-red-500' : ''}`}
                placeholder="admin@gmail.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400" />
              </div>
              <input
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: { value: 8, message: 'Minimum 8 characters' } 
                })}
                type="password"
                className={`pl-12 block w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3.5 
                text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-inner
                ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs font-medium">{errors.password.message}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || fetchingTenants}
              className="w-full relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-4 
              rounded-xl text-base font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 
              hover:from-teal-400 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-teal-500 
              focus:ring-offset-2 focus:ring-offset-slate-900 shadow-xl shadow-teal-500/20 
              transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Finalize Admin Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <footer className="text-center">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
          <CheckCircle size={14} className="text-teal-500" />
          Admins must log in with their real personal email address.
        </p>
      </footer>
    </div>
  );
}
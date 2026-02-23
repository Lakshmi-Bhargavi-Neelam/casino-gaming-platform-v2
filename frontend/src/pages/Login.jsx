import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, LogIn, ArrowRight, Building, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  
  // Logic States
  const [step, setStep] = useState(1); // 1: Credentials, 2: Tenant Selection
  const [showPassword, setShowPassword] = useState(false);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [tempCredentials, setTempCredentials] = useState(null);

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      
      //  Case A: Multi-tenant user needs to choose
      if (response.data.require_tenant_selection) {
        setAvailableTenants(response.data.tenants);
        setTempCredentials(data); // Save email/pass to resend with tenant_id
        setStep(2);
        toast('Please select a casino to enter', { icon: '🎰' });
      } 
      //  Case B: Direct login (Single tenant or SuperAdmin)
      else {
        toast.success('Welcome back!');
        login(response.data.access_token);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    }
  };

  const handleTenantSelect = async (tenantId) => {
    try {
      const finalPayload = {
        ...tempCredentials,
        tenant_id: tenantId
      };
      const response = await api.post('/auth/login', finalPayload);
      toast.success('Access granted!');
      login(response.data.access_token);
    } catch (error) {
      toast.error('Failed to authenticate with selected casino');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-4 relative overflow-hidden font-sans text-white">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1a2c38]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <AnimatePresence mode="wait">
          
          {/* --- STEP 1: CREDENTIALS --- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pt-10 pb-6 px-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 mb-6 shadow-lg shadow-emerald-500/30">
                  <span className="font-bold text-2xl text-white italic">C</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
                <p className="text-gray-400 text-sm italic">Initialize secure gaming session</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Protocol</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400" size={18} />
                    <input
                      {...register('email', { required: 'Required' })}
                      type="email"
                      className="block w-full rounded-xl border border-white/10 bg-[#0B0F1A]/80 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all py-4 pl-10"
                      placeholder="e.g. player@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Key</label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400" size={18} />
                    <input
                      {...register('password', { required: 'Required' })}
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full rounded-xl border border-white/10 bg-[#0B0F1A]/80 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all py-4 pl-10 pr-12"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? "Authenticating..." : "Identify Account"}
                </button>
              </form>
            </motion.div>
          )}

          {/* --- STEP 2: TENANT SELECTION --- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <div className="mb-8">
                 <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
                    <ArrowLeft size={14} /> Change Credentials
                 </button>
                 <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Select Casino</h2>
                 <p className="text-gray-400 text-sm mt-1">Which floor would you like to enter?</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {availableTenants.map((t) => (
                  <button
                    key={t.tenant_id}
                    onClick={() => handleTenantSelect(t.tenant_id)}
                    className="w-full flex items-center justify-between p-5 bg-slate-900/50 border border-white/5 hover:border-emerald-500/50 rounded-2xl group transition-all duration-300 hover:-translate-y-1 shadow-xl"
                  >
                    <div className="flex items-center gap-4 text-left">
                       <div className="p-3 bg-slate-800 rounded-xl border border-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                          <Building size={20} />
                       </div>
                       <div>
                          <p className="font-black text-white uppercase italic text-sm tracking-tight">{t.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.domain}</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Static Footer */}
        <div className="bg-black/20 p-5 text-center border-t border-white/5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {step === 1 ? "New Player?" : "Help?"}
            <Link to="/register-player" className="text-emerald-400 hover:text-emerald-300 ml-2 underline decoration-emerald-500/30">
              {step === 1 ? "Initialize Protocol" : "Contact Support"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div >
  );
}
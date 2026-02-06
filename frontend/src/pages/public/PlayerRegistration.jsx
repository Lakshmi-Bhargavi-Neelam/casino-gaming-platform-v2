import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Building, ChevronRight, Lock, Mail, ShieldCheck, Check, ArrowLeft, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios'; // Ensure this path is correct based on your folder structure

// --- MOCK DATA ---
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
];

// --- ANIMATION VARIANTS ---
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export default function PlayerRegistration() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // For slide animation direction
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  
  // Password Strength Logic
  const password = watch('password', '');
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };
  const passScore = getPasswordStrength(password);

  // --- HANDLERS ---

  const paginate = (newStep) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setIsLoadingTenants(true);
    try {
      const response = await api.get(`/tenants/by-country/${country.code}`);
      setAvailableTenants(response.data);
      
      if (response.data.length === 0) {
        toast.error(`No casinos currently operate in ${country.name}`);
        setIsLoadingTenants(false);
      } else {
        setIsLoadingTenants(false);
        paginate(2);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load casinos. Please try again.");
      setIsLoadingTenants(false);
    }
  };

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    paginate(3);
  };

  const onSubmit = async (data) => {
    const payload = {
      tenant_id: selectedTenant.tenant_id,
      country_code: selectedCountry.code,
      email: data.email,
      password: data.password
    };

    try {
      await api.post('/players/register', payload);
      toast.success('Account created successfully!');
      // Optional: Add a small delay for user to see success state
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative overflow-hidden flex flex-col items-center justify-center p-4 font-sans text-white">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-lg relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 mb-4 shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Join The Action</h1>
          <p className="text-gray-400 text-sm">Create your account in 3 simple steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex justify-between items-center px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gray-800 text-gray-500 border border-white/10'
                }`}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
              <span className={`text-[10px] mt-2 font-semibold uppercase tracking-wider ${step >= s ? 'text-emerald-400' : 'text-gray-600'}`}>
                {s === 1 ? 'Location' : s === 2 ? 'Casino' : 'Account'}
              </span>
            </div>
          ))}
          {/* Progress Line Background */}
          <div className="absolute top-[16px] left-0 w-full h-[2px] bg-gray-800 -z-10 px-8">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Content Container (Glassmorphism) */}
        <div className="bg-[#1a2c38]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
          
          {/* Back Button (Only for steps 2 & 3) */}
          {step > 1 && (
            <div className="px-6 pt-6">
              <button 
                onClick={() => paginate(step - 1)} 
                className="text-gray-400 hover:text-white flex items-center text-sm transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Back
              </button>
            </div>
          )}

          <div className="p-6 flex-1">
            <AnimatePresence custom={direction} mode="wait">
              
              {/* STEP 1: COUNTRY SELECTION */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Globe className="mr-2 text-emerald-400" /> Where are you playing from?
                  </h2>
                  
                  {isLoadingTenants ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 animate-pulse">Checking available casinos...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleCountrySelect(c)}
                          className="group relative p-4 bg-gray-800/50 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-xl transition-all duration-300 text-left overflow-hidden"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{c.flag}</span>
                            <ArrowRightIcon className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-400" />
                          </div>
                          <span className="font-bold text-gray-200 group-hover:text-white block">{c.name}</span>
                          <span className="text-xs text-gray-500 group-hover:text-emerald-300/70">{c.region}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: TENANT SELECTION */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Building className="mr-2 text-emerald-400" /> Choose your Casino
                  </h2>
                  <div className="space-y-3">
                    {availableTenants.map((t) => (
                      <div
                        key={t.tenant_id}
                        onClick={() => handleTenantSelect(t)}
                        className="group relative cursor-pointer bg-gradient-to-r from-gray-800 to-gray-800/50 hover:from-emerald-900/40 hover:to-gray-800 border border-white/5 hover:border-emerald-500/50 p-5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">{t.tenant_name}</h3>
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">VERIFIED</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                              <ShieldCheck size={12} /> {t.domain}
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: REGISTRATION FORM */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Lock className="mr-2 text-emerald-400" /> Secure your Account
                  </h2>

                  {/* Context Info */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-6 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-xl">{selectedCountry?.flag}</span>
                      <span>{selectedTenant?.tenant_name}</span>
                    </div>
                    <button onClick={() => paginate(2)} className="text-emerald-400 text-xs hover:underline">Change</button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          {...register('email', { 
                            required: 'Email is required',
                            validate: value => value.endsWith(selectedTenant?.domain) || `Email must end with @${selectedTenant?.domain}`
                          })}
                          type="email"
                          className={`w-full bg-[#0B0F1A] border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-emerald-500'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all`}
                          placeholder={`user@${selectedTenant?.domain}`}
                        />
                      </div>
                      {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          {...register('password', { 
                            required: 'Password is required', 
                            minLength: { value: 8, message: 'Minimum 8 characters' } 
                          })}
                          type="password"
                          className={`w-full bg-[#0B0F1A] border ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-emerald-500'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all`}
                          placeholder="••••••••"
                        />
                      </div>
                      
                      {/* Password Strength Meter */}
                      {password && (
                        <div className="flex gap-1 mt-2 h-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div 
                              key={i} 
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                passScore >= i 
                                  ? passScore < 3 ? 'bg-yellow-500' : 'bg-emerald-500' 
                                  : 'bg-gray-700'
                              }`} 
                            />
                          ))}
                        </div>
                      )}
                      {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors hover:underline">
              Log In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// Small helper component for the arrow icon
function ArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Check, 
  ArrowLeft, 
  Globe, 
  User, 
  Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';

const ALLOWED_DOMAINS = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@icloud.com"];

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
];

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
};

export default function PlayerRegistration() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  
  const password = watch('password', '');
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const passScore = getPasswordStrength(password);

  const paginate = (newStep) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    paginate(2);
  };

  const onSubmit = async (data) => {
    const payload = {
      country_code: selectedCountry.code,
      email: data.email,
      username: data.username,
      dob: data.dob,
      password: data.password
    };

    try {
      await api.post('/players/register', payload);
      toast.success('Global account created! Verification email sent.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative overflow-hidden flex flex-col items-center justify-center p-4 font-sans text-white">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 mb-4 shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-2xl">X</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Global Account</h1>
          <p className="text-gray-400 text-sm italic">One identity, endless casinos.</p>
        </div>

        <div className="mb-8 flex justify-center items-center gap-16 px-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gray-800 text-gray-500 border border-white/10'
                }`}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
              <span className={`text-[10px] mt-2 font-semibold uppercase tracking-wider ${step >= s ? 'text-emerald-400' : 'text-gray-600'}`}>
                {s === 1 ? 'Location' : 'Identity'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#1a2c38]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-h-[420px] flex flex-col">
          
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

          <div className="p-8 flex-1">
            <AnimatePresence custom={direction} mode="wait">
              
              {/* STEP 1: COUNTRY SELECTION */}
              {step === 1 && (
                <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Globe className="mr-2 text-emerald-400" size={20} /> Select Jurisdictional Region
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleCountrySelect(c)}
                        className="group relative p-4 bg-gray-800/50 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-xl transition-all duration-300 text-left"
                      >
                        <span className="text-2xl block mb-2">{c.flag}</span>
                        <span className="font-bold text-gray-200 group-hover:text-white block">{c.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-black">{c.region}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: GLOBAL IDENTITY FORM */}
              {step === 2 && (
                <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <User className="mr-2 text-emerald-400" size={20} /> Identity Setup
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Username */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unique Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                          {...register('username', { required: 'Username is required', minLength: 3 })}
                          className="w-full bg-[#0B0F1A] border border-gray-700 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all"
                          placeholder="e.g. gamer_pro"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Personal Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                          {...register('email', { 
                            required: 'Email is required',
                            validate: value => ALLOWED_DOMAINS.some(d => value.toLowerCase().endsWith(d)) || "Use a reputable provider (Gmail, Yahoo, etc.)"
                          })}
                          type="email"
                          className="w-full bg-[#0B0F1A] border border-gray-700 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all"
                          placeholder="yourname@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date of Birth */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    {...register('dob', { required: 'DOB required' })}
                                    type="date"
                                    className="w-full bg-[#0B0F1A] border border-gray-700 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    {...register('password', { required: 'Required', minLength: 8 })}
                                    type="password"
                                    className="w-full bg-[#0B0F1A] border border-gray-700 focus:border-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Strength*/}
                    {password && (
                        <div className="flex gap-1 mt-1 h-1 px-1">
                            {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${passScore >= i ? (passScore < 3 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-gray-700'}`} />
                            ))}
                        </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center uppercase tracking-widest text-xs"
                    >
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Register Global ID'}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors hover:underline">
              Log In
            </Link>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest animate-pulse">
            <ShieldCheck size={14} className="text-emerald-500/50" /> Secure SSL Protocol 256-bit
          </div>
        </div>

      </div>
    </div>
  );
}
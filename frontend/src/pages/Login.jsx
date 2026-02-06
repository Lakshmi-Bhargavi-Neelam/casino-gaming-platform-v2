import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      toast.success('Welcome back!');
      login(response.data.access_token); // Keeps your existing AuthContext logic
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-4 relative overflow-hidden font-sans text-white">
      
      {/* --- BACKGROUND DECORATIONS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* --- LOGIN CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#1a2c38]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 mb-6 shadow-lg shadow-emerald-500/30 group hover:scale-105 transition-transform cursor-pointer">
            <span className="font-bold text-2xl text-white">C</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Secure access to your casino dashboard</p>
        </div>
        
        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className={`block w-full rounded-lg border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'} bg-[#0B0F1A]/80 text-white placeholder-gray-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all py-3.5 pl-10 pr-4`}
                placeholder="player@casino.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Password</label>
              <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hover:underline">Forgot Password?</a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                className={`block w-full rounded-lg border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'} bg-[#0B0F1A]/80 text-white placeholder-gray-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all py-3.5 pl-10 pr-12`}
                placeholder="••••••••"
              />
              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-2 border border-transparent rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign In <LogIn size={18} /></>
            )}
          </button>
        </form>
        
        {/* Footer / Register Link */}
        <div className="bg-black/20 p-5 text-center border-t border-white/5">
          <p className="text-sm text-gray-400">
            New to CasinoX?{' '}
            <Link to="/register-player" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center justify-center gap-1 mt-1 hover:underline">
              Create an Account <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Back to Home (Outside Card) */}
      <div className="absolute top-6 left-6">
         <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            ← Back to Home
         </Link>
      </div>

    </div>
  );
}
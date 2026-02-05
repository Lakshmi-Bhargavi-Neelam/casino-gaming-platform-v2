import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Hexagon } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      toast.success('Welcome back!');
      login(response.data.access_token); // This triggers the redirect logic in AuthContext
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="bg-gray-800 p-8 text-center border-b border-gray-700">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <Hexagon className="text-white fill-current" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Portal Login</h1>
          <p className="text-gray-400 text-sm mt-2">Authorized Access Only</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all p-3"
                placeholder="name@company.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="pl-10 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all p-3"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all transform hover:scale-[1.02]"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
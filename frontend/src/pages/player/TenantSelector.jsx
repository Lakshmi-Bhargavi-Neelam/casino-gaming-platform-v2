import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import KYCUploadPanel from '../../components/kyc/KYCUploadPanel';
import { 
  Building2, Globe, ShieldCheck, ChevronRight, Loader2, Sparkles, 
  MapPin, LogOut, User, Calendar, Mail, ShieldAlert, Zap, 
  UserX, CheckCircle, Info, LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TenantSelector() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enteringId, setEnteringId] = useState(null);
  const [isSelfExcluded, setIsSelfExcluded] = useState(false);
  
  const { user, selectTenant, logout } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/tenants/by-country/${user.country_code}`);
        setTenants(res.data);
        // Check current self-exclusion status from user profile
        setIsSelfExcluded(user.status === 'self_excluded');
      } catch (err) {
        toast.error("Network synchronization failed");
      } finally {
        setLoading(false);
      }
    };
    if (user?.country_code) fetchData();
  }, [user]);

  const handleSelfExclusion = async () => {
    const confirmMessage = isSelfExcluded 
      ? "Reactivate your account access?" 
      : "Self-Exclusion will block access to ALL casinos on this platform. Continue?";
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.post('/players/self-exclusion', { status: !isSelfExcluded });
      setIsSelfExcluded(!isSelfExcluded);
      toast.success(isSelfExcluded ? "Access Restored" : "Self-Exclusion Active");
    } catch (err) {
      toast.error("Failed to update security status");
    }
  };

  const handleEnterCasino = async (tenantId) => {
    if (isSelfExcluded) return toast.error("Account is currently self-excluded");
    setEnteringId(tenantId);
    try {
      await api.post(`/tenants/${tenantId}/enter`);
      selectTenant(tenantId); 
      navigate('/player/lobby');
    } catch (err) {
      toast.error("Entry denied by casino protocol");
    } finally {
      setEnteringId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-teal-500 mb-4" size={48} />
      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Loading Global Identity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 relative overflow-hidden pb-20">
      
      {/* 1. Global Navigation Bar */}
      <nav className="sticky top-0 w-full p-6 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center z-50">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-teal-500/20">X</div>
            <div className="hidden md:block">
               <h1 className="text-sm font-black uppercase tracking-tighter">Casino<span className="text-teal-400">X</span> Global</h1>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Unified Player Protocol</p>
            </div>
         </div>
         <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest group">
           <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Disconnect Session
         </button>
      </nav>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* 2. Player Identity HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Personal Info Card */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><User size={120} className="text-teal-400" /></div>
            
            <div className="h-24 w-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl font-black text-teal-400 shadow-inner shrink-0 uppercase">
              {user.username?.[0] || 'P'}
            </div>
            
            <div className="flex-1 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Global Username</p>
                    <p className="text-xl font-black text-white">{user.username || 'Anonymous Player'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> Registered Email</p>
                    <p className="text-xl font-black text-white">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Date of Birth</p>
                    <p className="text-xl font-black text-white">{user.dob || 'Not Set'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Jurisdiction</p>
                    <p className="text-xl font-black text-teal-500 uppercase tracking-tighter">{user.country_code}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Safety & Status Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Security Status</p>
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${user.kyc_status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                {user.kyc_status === 'verified' ? <ShieldCheck size={24}/> : <ShieldAlert size={24} className="animate-pulse" />}
                <span className="font-black uppercase italic tracking-tighter">{user.kyc_status}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Self-Exclusion</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isSelfExcluded} onChange={handleSelfExclusion} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 shadow-inner border border-slate-700"></div>
                  </label>
               </div>
               <p className="text-[9px] text-slate-600 font-bold leading-tight">Activating this will instantly block entry to all platform casinos.</p>
            </div>
          </div>
        </div>

        {/* 3. Global Identity Vault (KYC Submission) */}
        <section className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <div className="w-2 h-8 bg-teal-500 rounded-full" />
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Identity <span className="text-teal-400">Vault</span></h2>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Super-Admin Audit Layer</span>
           </div>

           <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <KYCUploadPanel />
           </div>
        </section>

        {/* 4. Casino Marketplace */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Casino <span className="text-indigo-400">Marketplace</span></h2>
             </div>
             <div className="flex items-center gap-2 text-slate-500 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <Globe size={14} className="text-teal-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{tenants.length} Operators Online</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tenants.map((tenant) => (
              <div key={tenant.tenant_id} className="group relative bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-teal-500/50 transition-all duration-500 shadow-2xl">
                <div>
                  <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-8 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                    <Building2 className="text-teal-400" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 leading-none">{tenant.tenant_name}</h3>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-8">
                    <Globe size={14} /> {tenant.domain}
                  </p>
                </div>

                <button 
                  onClick={() => handleEnterCasino(tenant.tenant_id)}
                  disabled={enteringId === tenant.tenant_id || isSelfExcluded}
                  className="w-full relative group/btn overflow-hidden bg-slate-950 border border-slate-800 hover:border-teal-500/50 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {enteringId === tenant.tenant_id ? <Loader2 className="animate-spin text-teal-400" /> : <>Enter Floor <ChevronRight size={18} /></>}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
import React from 'react';
import KYCUploadPanel from '../../components/kyc/KYCUploadPanel';
import { 
  ShieldCheck, 
  Briefcase, 
  FileCheck, 
  Info, 
  ArrowRight, 
  Lock,
  Globe,
  CheckCircle2
} from 'lucide-react';

export default function ProviderKYC() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. Page Header: High Fidelity Identity */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <ShieldCheck className="text-indigo-400" size={36} />
            </div>
            Studio Verification
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">
            Activate your global game distribution rights by verifying your studio's corporate identity.
          </p>
        </div>

        {/* Global Compliance Badge */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-800/40 border border-slate-700 px-6 py-3 rounded-2xl shadow-xl">
           <Globe className="text-teal-500" size={20} />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Standard</span>
              <span className="text-sm font-bold text-slate-200">KYC Level 1</span>
           </div>
        </div>
      </header>

      {/* 2. Verification Roadmap: Staggered Entrance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] flex flex-col gap-3 hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform">
            <Briefcase size={20} className="text-indigo-400" />
          </div>
          <h3 className="text-white font-bold text-sm">Corporate Filing</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Submit Certificate of Incorporation and Tax Identification (TIN) documents.
          </p>
        </div>

        <div className="group bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] flex flex-col gap-3 hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform">
            <FileCheck size={20} className="text-indigo-400" />
          </div>
          <h3 className="text-white font-bold text-sm">IP & Licensing</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Upload game certification or intellectual property rights documentation.
          </p>
        </div>

        <div className="group bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] flex flex-col gap-3 hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={20} className="text-indigo-400" />
          </div>
          <h3 className="text-white font-bold text-sm">Audit & Activation</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Super Admin typically reviews Studio submissions within 24 business hours.
          </p>
        </div>
      </div>

      {/* 3. Main KYC Repository Container */}
      <div className="relative">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] -z-10 rounded-[3rem]" />
        
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
          
          {/* Header Bar inside the container */}
          <div className="p-8 pb-0 border-b border-transparent flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Document Vault</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <Lock size={12} /> TLS 1.3 Encryption
             </div>
          </div>
          
          <div className="p-8 md:p-12 pt-6">
             {/* 🎯 The Core Upload Component */}
             <KYCUploadPanel /> 
          </div>
        </div>
      </div>

      {/* 4. Help & Support Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em]">
          <Info size={16} className="text-indigo-500" />
          Need assistance?
        </div>
        <div className="h-4 w-px bg-slate-800 hidden md:block" />
        <a 
          href="mailto:compliance@casinox.com" 
          className="flex items-center gap-2 text-slate-300 hover:text-teal-400 transition-all text-xs font-black uppercase tracking-widest group"
        >
          Contact Studio Compliance
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom scrollbar for potentially long upload panels */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />
    </div>
  );
}
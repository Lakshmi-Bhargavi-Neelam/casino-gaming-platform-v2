import React from 'react';
import KYCUploadPanel from '../../components/kyc/KYCUploadPanel';
import { ShieldCheck, Briefcase, FileCheck, Info, ArrowRight } from 'lucide-react';

export default function MyVerification() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
              <ShieldCheck className="text-teal-400" size={36} />
            </div>
            Business Verification
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">
            Maintain your corporate compliance status and document registry.
          </p>
        </div>

        {/* Status Quick-Badge */}
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-5 py-3 rounded-2xl shadow-xl">
           <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
           <span className="text-xs font-black text-slate-300 uppercase tracking-widest">System Integrated</span>
        </div>
      </header>

      {/* 2. Verification Roadmap (Explainer Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] flex flex-col gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
            <Briefcase size={20} className="text-teal-400" />
          </div>
          <h3 className="text-white font-bold text-sm">Corporate Identity</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Upload Articles of Incorporation and Business Registration certificates.
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] flex flex-col gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
            <FileCheck size={20} className="text-teal-400" />
          </div>
          <h3 className="text-white font-bold text-sm">Regulatory Proof</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Provide valid gambling licenses or financial authority certifications.
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] flex flex-col gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
            <Info size={20} className="text-teal-400" />
          </div>
          <h3 className="text-white font-bold text-sm">Review Timeline</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">
            Super Admin typically reviews corporate submissions within 24-48 business hours.
          </p>
        </div>
      </div>

      {/* 3. Main Upload Panel Container */}
      <div className="relative group">
        {/* Glow effect behind panel */}
        <div className="absolute inset-0 bg-teal-500/5 blur-[100px] -z-10 rounded-[3rem]" />
        
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl p-2 md:p-4 overflow-hidden">
          {/* Important: KYCUploadPanel will contain the actual form/logic */}
          <div className="p-6 md:p-8">
             <div className="flex items-center gap-2 mb-8 text-slate-400">
                <ArrowRight size={16} className="text-teal-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Document Repository</span>
             </div>
             
             <KYCUploadPanel /> 
          </div>
        </div>
      </div>

      {/* Footer Support Info */}
      <footer className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
          <ShieldCheck size={14} className="text-teal-500/50" />
          Secure 256-bit Encrypted Storage
        </div>
        <div className="h-4 w-px bg-slate-800 hidden md:block" />
        <div className="text-slate-600 text-[11px] font-medium">
          Need help? <a href="#" className="text-teal-500 hover:text-teal-400 transition-colors underline underline-offset-4">Contact Compliance Support</a>
        </div>
      </footer>
    </div>
  );
}
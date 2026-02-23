import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  CheckCircle, 
  Clock, 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight,
  Lock
} from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

const ROLE_CONFIG = {
  TENANT_ADMIN: [
    { id: 'business_license', label: 'Business License', desc: 'Official incorporation document' },
    { id: 'identity_proof', label: 'Identity Proof', desc: 'Passport or National ID of the Admin' }
  ],
  GAME_PROVIDER: [
    { id: 'corporate_registration', label: 'Corporate Registration', desc: 'Business registration details' },
    { id: 'gaming_license', label: 'Gaming License', desc: 'Valid B2B gaming permit' },
    { id: 'rng_certificate', label: 'RNG Certificate', desc: 'Fairness certification for your engine' }
  ],
  PLAYER: [
    { id: 'government_id', label: 'Government ID', desc: 'Passport, Drivers License, or National ID' },
    { id: 'proof_of_address', label: 'Proof of Address', desc: 'Utility bill or bank statement (last 3 months)' }
  ]
};

export default function KYCUploadPanel() {
  const { user } = useAuth();
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const docConfig = ROLE_CONFIG[user?.role?.toUpperCase()] || [];

  const fetchStatus = () => {
    api.get('/kyc/my-status').then(res => {
      setKycData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', type);

    setUploading(type);
    try {
      await api.post('/kyc/submit-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchStatus();
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <RefreshCw className="animate-spin text-teal-500" size={32} />
      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Accessing Vault...</p>
    </div>
  );

  if (!kycData) return <div className="text-red-400 p-10 text-center font-bold">Error: Link to vault interrupted.</div>;

  const requiredTypes = docConfig.map(d => d.id);
  const uploadedTypes = kycData.documents.map(d => d.type);
  const missingDocs = requiredTypes.filter(t => !uploadedTypes.includes(t));
  const allUploaded = missingDocs.length === 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Global Status Banner */}
      <div className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-500 flex flex-col md:flex-row items-center gap-6 shadow-2xl ${
        kycData.user_status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/30' :
        kycData.user_status === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
        kycData.user_status === 'submitted' ? 'bg-blue-500/10 border-blue-500/30' :
        'bg-amber-500/10 border-amber-500/30'
      }`}>
        {/* Background Status Icon*/}
        <div className="absolute -right-6 -bottom-6 opacity-5">
            {kycData.user_status === 'verified' ? <ShieldCheck size={160} /> : <ShieldAlert size={160} />}
        </div>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
          kycData.user_status === 'verified' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
          kycData.user_status === 'rejected' ? 'bg-red-500 text-white shadow-red-500/20' :
          kycData.user_status === 'submitted' ? 'bg-blue-500 text-white shadow-blue-500/20' :
          'bg-amber-500 text-white shadow-amber-500/20 animate-pulse'
        }`}>
          {kycData.user_status === 'verified' ? <ShieldCheck size={28} /> : 
           kycData.user_status === 'rejected' ? <ShieldAlert size={28} /> : <Clock size={28} />}
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h3 className={`font-black text-lg uppercase tracking-tight flex items-center justify-center md:justify-start gap-2 ${
            kycData.user_status === 'verified' ? 'text-emerald-400' :
            kycData.user_status === 'rejected' ? 'text-red-400' :
            kycData.user_status === 'submitted' ? 'text-blue-400' : 'text-amber-400'
          }`}>
            {kycData.user_status === 'verified' ? 'Verification Complete' :
             kycData.user_status === 'submitted' ? 'Identity Under Audit' :
             kycData.user_status === 'rejected' ? 'Action Required: Re-submission' : 'Pending Verification'}
          </h3>
          <p className="text-slate-400 text-sm mt-1 font-medium max-w-lg">
            {kycData.user_status === 'pending' ? 'Your account distribution rights are restricted. Upload documents to activate.' :
              kycData.user_status === 'submitted' ? 'The security team is currently auditing your credentials.' :
              kycData.user_status === 'rejected' ? 'Your latest submission was flagged. Review the feedback below.' :
              'Access granted. Your business entity is fully authorized on the platform.'}
          </p>
        </div>

        {kycData.user_status === 'pending' && !allUploaded && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 flex items-center gap-2">
                <AlertCircle size={14} /> Missing {missingDocs.length} Docs
            </div>
        )}
      </div>

      {/* 2. Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {docConfig.map((type, index) => {
          const existingDoc = kycData.documents.find(d => d.type === type.id);

          return (
            <div 
              key={type.id} 
              className="group bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-teal-500/30 transition-all duration-300 shadow-xl"
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both` }}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-inner">
                    <FileText size={24} />
                  </div>
                  {existingDoc && <StatusBadge status={existingDoc.status} />}
                </div>

                <h3 className="text-white text-xl font-bold tracking-tight">{type.label}</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium mb-6 leading-relaxed">{type.desc}</p>

                {existingDoc?.status === 'rejected' && existingDoc.rejection_reason && (
                  <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-3">
                    <AlertCircle className="text-red-400 shrink-0" size={16} />
                    <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 underline">Audit Feedback:</p>
                        <p className="text-xs text-red-200/80 font-medium leading-relaxed italic">"{existingDoc.rejection_reason}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Action Button*/}
              <label className={`relative group/btn flex items-center justify-center gap-3 w-full py-4 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-widest overflow-hidden ${
                  existingDoc?.status === 'verified' || existingDoc?.status === 'submitted' || existingDoc?.status === 're-submitted'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 cursor-pointer active:scale-95'
                }`}>
                
                <RefreshCw size={16} className={uploading === type.id ? "animate-spin" : "group-hover/btn:rotate-180 transition-transform duration-500"} />

                {uploading === type.id ? "Uploading Data..." :
                  existingDoc?.status === 'verified' ? "Document Verified" :
                  existingDoc?.status === 'submitted' || existingDoc?.status === 're-submitted' ? "Awaiting Audit" :
                  existingDoc?.status === 'rejected' ? "Re-upload File" :
                  "Submit Document"
                }

                {(!existingDoc || existingDoc.status === 'rejected' || existingDoc.status === 'pending') && (
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, type.id)} />
                )}
                
    
                {!(existingDoc?.status === 'verified' || existingDoc?.status === 'submitted' || existingDoc?.status === 're-submitted') && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                )}
              </label>
            </div>
          );
        })}
      </div>

      {/* Vault Footer */}
      <div className="flex items-center justify-center gap-8 pt-6 border-t border-slate-800">
         <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <Lock size={14} className="text-teal-500/50" />
            256-bit Document Encryption
         </div>
         <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-teal-500/50" />
            Super-Admin Verified
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const styles = {
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "re-submitted": "bg-purple-500/10 text-purple-400 border-purple-200",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
        <div className="flex items-center gap-1.5">
            {status === 'verified' && <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />}
            {status.replace("-", " ")}
        </div>
    </span>
  );
};
import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Eye, 
  Clock, 
  X, 
  ShieldAlert, 
  Maximize2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReviewModal({ user, onClose, onRefresh, role = 'admin' }) {
  const [documents, setDocuments] = useState([]);
  const [reasons, setReasons] = useState({}); 
  const [loading, setLoading] = useState(true);

  const isPlayerReview = role === 'tenant-admin';
  const getPath = isPlayerReview 
    ? `/tenant-admin/kyc/player-documents/${user.user_id}`
    : `/admin/kyc/user-documents/${user.user_id}`;

  useEffect(() => {
    api.get(getPath)
      .then(res => {
        setDocuments(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Session expired or unauthorized");
        setLoading(false);
      });
  }, [user, getPath]);

  const handleAction = async (docId, status) => {
    const reason = reasons[docId] || "";

    if (status === 'rejected' && !reason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      const postPath = isPlayerReview
        ? `/tenant-admin/kyc/verify-player-document/${docId}`
        : `/admin/kyc/verify-document/${docId}`;

      await api.post(postPath, null, {
        params: { status, reason }
      });
      
      toast.success(`Document ${status}`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Verification failed");
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Cinematic Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-400">
        
        {/* 1. Sticky Header */}
        <header className="p-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center relative z-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
               <ShieldAlert className="text-teal-400" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Reviewing: {user.email}</h2>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Audit Mode: {isPlayerReview ? "Player KYC" : "Operator KYC"}
                 </span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    ID: {user.user_id}
                 </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-700 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </header>

        {/* 2. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-slate-950/20">
          {documents.map((doc, index) => (
            <div 
              key={doc.document_id} 
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-700 transition-colors shadow-inner"
              style={{ animation: `fadeInSlide 0.5s ease-out ${index * 0.1}s both` }}
            >
              
              {/* Left Column: Visual Document Preview */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <FileText className="text-teal-400" size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">
                        {doc.document_type.replace('_', ' ')}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">Document Version {doc.version}</p>
                    </div>
                  </div>
                  <StatusBadge status={doc.verification_status || doc.status} />
                </div>

                {/* The Image Viewport */}
                <div className="relative group aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                  <img 
                    src={doc.file_url || `${import.meta.env.VITE_API_BASE_URL}/${doc.file_path}`} 
                    alt="Identity Document" 
                    className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105" 
                  />
                  
                  {/* Glass Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                    <button
                      onClick={() => window.open(doc.file_url || `${import.meta.env.VITE_API_BASE_URL}/${doc.file_path}`, '_blank')}
                      className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                    >
                      <Maximize2 size={16} /> Inspect Original
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  <span className="flex items-center gap-2"><Clock size={14} /> Received: {new Date(doc.uploaded_at || doc.created_at).toLocaleDateString()}</span>
                  {doc.rejection_reason && (
                    <span className="text-red-400 flex items-center gap-1">
                       <AlertCircle size={14} /> Previously Flagged
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Audit Controls */}
              <div className="flex flex-col h-full bg-slate-900/20 rounded-2xl">
                <div className="flex-1 space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Internal Auditor Notes
                  </label>
                  <textarea
                    className="w-full h-full min-h-[180px] p-6 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 placeholder:text-slate-700 transition-all resize-none shadow-inner leading-relaxed"
                    placeholder="Provide specific feedback or internal audit notes here..."
                    value={reasons[doc.document_id] || ""}
                    onChange={(e) =>
                      setReasons(prev => ({ ...prev, [doc.document_id]: e.target.value }))
                    }
                  />
                </div>

                {/* Bottom Action Grid */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={() => handleAction(doc.document_id, 'rejected')}
                    className="flex items-center justify-center gap-2 py-4 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                  >
                    <XCircle size={18} /> Flag & Reject
                  </button>
                  <button
                    onClick={() => handleAction(doc.document_id, 'verified')}
                    className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CheckCircle size={18} /> Approve Entry
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Ambient Glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.pending} shadow-sm`}>
      {status}
    </span>
  );
}
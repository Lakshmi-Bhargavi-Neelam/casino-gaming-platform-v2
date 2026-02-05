import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { CheckCircle, XCircle, FileText, Eye, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReviewModal({ user, onClose, onRefresh, role = 'admin' }) {
  const [documents, setDocuments] = useState([]);
  const [reasons, setReasons] = useState({}); 
  const [loading, setLoading] = useState(true);

  // Define API paths based on role to maintain separation
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
        console.error("Error fetching docs:", err);
        toast.error("Unauthorized or session expired");
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
      // Use specific tenant-admin endpoint for players, admin endpoint for others
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
      console.error("Verification failed", err);
      toast.error(err.response?.data?.detail || "Verification failed");
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Reviewing: {user.email}</h2>
            <p className="text-xs text-gray-500 font-medium italic">
              Mode: {isPlayerReview ? "Player Verification" : "Provider Verification"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/50">
          {documents.map(doc => (
            <div key={doc.document_id} className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
              
              {/* Document Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                    <FileText size={16} />
                    {doc.document_type.replace('_', ' ')}
                    <span className="ml-2 text-gray-400 font-medium normal-case">v{doc.version}</span>
                  </div>
                  <StatusBadge status={doc.verification_status || doc.status} />
                </div>

                {doc.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded">
                    <strong>Previous Note:</strong> {doc.rejection_reason}
                  </div>
                )}

                <div className="relative group aspect-video bg-gray-100 border rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                  {/* Handle both local file_path and absolute file_url */}
                  <img 
                    src={doc.file_url || `${import.meta.env.VITE_API_BASE_URL}/${doc.file_path}`} 
                    alt="KYC Document" 
                    className="max-h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => window.open(doc.file_url || `${import.meta.env.VITE_API_BASE_URL}/${doc.file_path}`, '_blank')}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                    >
                      <Eye size={16} /> Open Full View
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                  <Clock size={12} /> Date: {new Date(doc.uploaded_at || doc.created_at).toLocaleString()}
                </div>
              </div>

              {/* Review Actions */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    Review Notes / Rejection Reason
                  </label>
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-xl text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Provide a detailed reason if rejecting this document..."
                    value={reasons[doc.document_id] || ""}
                    onChange={(e) =>
                      setReasons(prev => ({ ...prev, [doc.document_id]: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => handleAction(doc.document_id, 'verified')}
                    className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-100"
                  >
                    <CheckCircle size={18} /> Approve Document
                  </button>
                  <button
                    onClick={() => handleAction(doc.document_id, 'rejected')}
                    className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition shadow-lg shadow-red-100"
                  >
                    <XCircle size={18} /> Reject Document
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    verified: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    "re-submitted": "bg-purple-100 text-purple-700 border-purple-200",
    rejected: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
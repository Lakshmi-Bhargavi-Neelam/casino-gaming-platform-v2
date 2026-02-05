import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

// Define requirements per role based on your backend kyc_common.py
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
  const { user } = useAuth(); // Get user role from context
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  // Fallback to empty array if role is not found
const docConfig = ROLE_CONFIG[user?.role?.toUpperCase()] || [];

  const fetchStatus = () => {
    // Note: ensure your axios instance/endpoint matches @router.get("/my-status")
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

  if (loading) return <div className="animate-pulse text-indigo-400">Loading verification details...</div>;
  if (!kycData) return <div className="text-red-400">Error loading KYC data.</div>;

  const requiredTypes = docConfig.map(d => d.id);
  const uploadedTypes = kycData.documents.map(d => d.type);
  const missingDocs = requiredTypes.filter(t => !uploadedTypes.includes(t));
  const allUploaded = missingDocs.length === 0;

  return (
    <div className="space-y-6">
      {/* 🚩 Global Status */}
      <div className={`p-4 rounded-xl border flex items-center gap-4 ${
        kycData.user_status === 'verified' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
        kycData.user_status === 'rejected' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
        'bg-amber-500/10 border-amber-500/50 text-amber-400'
      }`}>
        {kycData.user_status === 'verified' ? <CheckCircle /> : <Clock />}
        <div>
          <h3 className="font-bold uppercase text-sm">Status: {kycData.user_status}</h3>
          {kycData.global_reason && <p className="text-xs opacity-80">{kycData.global_reason}</p>}
        </div>
      </div>

      {!allUploaded && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex gap-2">
          <AlertCircle size={16} />
          Please upload the remaining {missingDocs.length} required documents.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docConfig.map((type) => {
          const existingDoc = kycData.documents.find(d => d.type === type.id);

          return (
            <div key={type.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <FileText size={24} />
                  </div>
                  {existingDoc && <StatusBadge status={existingDoc.status} />}
                </div>
                <h3 className="text-white font-bold">{type.label}</h3>
                <p className="text-slate-400 text-xs mb-6">{type.desc}</p>
                
                {/* ❌ Show Rejection reason for specific doc */}
                {existingDoc?.status === 'rejected' && existingDoc.rejection_reason && (
                  <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-[11px] text-red-200">
                    <strong>Rejection Reason:</strong> {existingDoc.rejection_reason}
                  </div>
                )}
              </div>

              <label className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition text-sm font-medium">
                <RefreshCw size={14} className={uploading === type.id ? "animate-spin" : ""} />
                {uploading === type.id ? "Uploading..." : existingDoc ? "Update Document" : "Upload Document"}
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, type.id)} />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const styles = {
    verified: "bg-green-500/20 text-green-500",
    pending: "bg-amber-500/20 text-amber-500",
    submitted: "bg-blue-500/20 text-blue-400",
    "re-submitted": "bg-purple-500/20 text-purple-400",
    rejected: "bg-red-500/20 text-red-500",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${styles[status] || styles.pending}`}>
      {status.replace("-", " ")}
    </span>
  );
};
import React from 'react';
import KYCUploadPanel from '../../components/kyc/KYCUploadPanel';

export default function ProviderKYC() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Provider Business Verification</h1>
      <p className="text-slate-400 mb-8 text-sm">Submit your corporate documents to activate your game distribution rights.</p>
      <KYCUploadPanel />
    </div>
  );
}
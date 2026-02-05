import React from 'react';
import KYCUploadPanel from '../../components/kyc/KYCUploadPanel';

export default function PlayerKYC() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Account Verification</h1>
      <p className="text-slate-400 mb-8 text-sm">To ensure a safe gaming environment, please verify your identity.</p>
      <KYCUploadPanel />
    </div>
  );
}
import React from 'react';
import KYCUploadPanel from '../../components/kyc/KYCUploadPanel';

export default function MyVerification() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Business Verification</h1>
        <p className="text-gray-500">Submit your corporate documents for Super Admin approval.</p>
      </div>
      
      {/* 🎯 Reuse your existing component */}
      <KYCUploadPanel /> 
    </div>
  );
}
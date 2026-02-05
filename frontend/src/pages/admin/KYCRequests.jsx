// src/pages/SuperAdmin/KYCRequests.jsx
import React, { useState, useEffect } from 'react';
import api from '../../lib/axios'; 
import { Eye, Clock } from 'lucide-react';
import ReviewModal from './ReviewModal'; // 🎯 New Component

export default function KYCRequests() {
  const [activeTab, setActiveTab] = useState('tenant_admin');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // 🎯 Tracks which user to review

  const fetchRequests = () => {
    setLoading(true);
    api.get(`/admin/kyc/pending-requests?role_name=${activeTab}`)
      .then(res => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Document Requests</h1>
        <p className="text-gray-500 text-sm">Review and approve business entity verifications</p>
      </div>

      <div className="flex px-6 bg-gray-50 border-b border-gray-100">
        <TabButton 
          active={activeTab === 'tenant_admin'} 
          onClick={() => setActiveTab('tenant_admin')} 
          label="Tenant Admins" 
        />
        <TabButton 
          active={activeTab === 'game_provider'} 
          onClick={() => setActiveTab('game_provider')} 
          label="Game Providers" 
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50">
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.user_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600 font-medium">{req.email}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedUser(req)}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} /> Review Docs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🎯 The Review Modal */}
      {selectedUser && (
        <ReviewModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onRefresh={fetchRequests} 
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${
      active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}>
      {label}
    </button>
  );
}
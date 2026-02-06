import React, { useState, useEffect } from 'react';
import api from '../../lib/axios'; 
import { Eye, ShieldCheck, Users, Briefcase, Search, AlertCircle } from 'lucide-react';
import ReviewModal from './ReviewModal'; 

export default function KYCRequests() {
  const [activeTab, setActiveTab] = useState('tenant_admin');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-teal-400 w-8 h-8" />
            Document Requests
          </h1>
          <p className="text-slate-400 mt-1">
            Review and approve business entity verifications for platform partners.
          </p>
        </div>
        
        {/* Subtle Badge for Pending Count */}
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full hidden md:flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-slate-300 text-sm font-medium">{requests.length} Pending Review</span>
        </div>
      </header>

      {/* 2. Main Card Container */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden transition-all duration-300">
        
        {/* Tabs Section */}
        <div className="flex px-2 pt-2 bg-slate-900/40 border-b border-slate-700/50">
          <TabButton 
            active={activeTab === 'tenant_admin'} 
            onClick={() => setActiveTab('tenant_admin')} 
            label="Tenant Admins" 
            icon={<Users size={18} />}
          />
          <TabButton 
            active={activeTab === 'game_provider'} 
            onClick={() => setActiveTab('game_provider')} 
            label="Game Providers" 
            icon={<Briefcase size={18} />}
          />
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/20">
                <th className="px-8 py-5 font-semibold">Partner Email</th>
                <th className="px-8 py-5 font-semibold">Status</th>
                <th className="px-8 py-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                // Loading State
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="3" className="px-8 py-6">
                      <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    </td>
                  </tr>
                ))
              ) : requests.length > 0 ? (
                requests.map((req, index) => (
                  <tr 
                    key={req.user_id} 
                    className="group hover:bg-slate-700/30 transition-all duration-200"
                    style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-teal-400 font-bold text-xs border border-slate-600 group-hover:border-teal-500/50 transition-colors">
                          {req.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-200 font-medium group-hover:text-white transition-colors">
                          {req.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Pending Review
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedUser(req)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 
                        text-white px-5 py-2.5 rounded-xl hover:from-teal-400 hover:to-emerald-400 
                        transition-all duration-200 text-sm font-bold shadow-lg shadow-teal-500/10 
                        hover:shadow-teal-500/20 active:scale-95 group/btn"
                      >
                        <Eye size={16} className="group-hover/btn:scale-110 transition-transform" /> 
                        Review Docs
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-slate-600" />
                      <p className="text-slate-400 font-medium">No pending requests found for this category.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎯 The Review Modal */}
      {selectedUser && (
        <ReviewModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onRefresh={fetchRequests} 
        />
      )}

      {/* Internal CSS for simple row animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`relative flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all duration-300 rounded-t-xl ${
        active 
          ? 'text-teal-400 bg-slate-800/40' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 shadow-[0_-2px_10px_rgba(20,184,166,0.5)]"></span>
      )}
    </button>
  );
}
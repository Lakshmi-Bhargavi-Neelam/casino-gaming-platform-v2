import React, { useState, useEffect } from 'react';
import api from '../../lib/axios'; 
import { Eye, ShieldCheck, Users, Briefcase, Search, AlertCircle, UserCheck } from 'lucide-react';
import ReviewModal from './ReviewModal'; 

export default function KYCRequests() {
  // 🎯 Default remains tenant_admin, but now we support 'player'
  const [activeTab, setActiveTab] = useState('tenant_admin');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchRequests = () => {
    setLoading(true);
    // 🎯 The backend now handles role_name="player"
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
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 italic">
            <ShieldCheck className="text-teal-400 w-8 h-8" />
            Global <span className="text-teal-400">Audit</span> Queue
          </h1>
          <p className="text-slate-400 mt-1 font-medium">
            Review and authenticate identity protocols for all platform entities.
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 px-5 py-2.5 rounded-2xl hidden md:flex items-center gap-3 shadow-xl">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </div>
          <span className="text-slate-300 text-xs font-black uppercase tracking-widest">{requests.length} Pending Audit</span>
        </div>
      </header>

      {/* 2. Main Card Container */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-[2rem] shadow-2xl border border-slate-700/50 overflow-hidden transition-all duration-300">
        
        {/* 🎯 Tabs Section: Updated to include 3 options */}
        <div className="flex px-4 pt-4 bg-slate-900/40 border-b border-slate-700/50 gap-2">
          <TabButton 
            active={activeTab === 'tenant_admin'} 
            onClick={() => setActiveTab('tenant_admin')} 
            label="Operators" 
            icon={<Briefcase size={16} />}
          />
          <TabButton 
            active={activeTab === 'game_provider'} 
            onClick={() => setActiveTab('game_provider')} 
            label="Studios" 
            icon={<Users size={16} />}
          />
          <TabButton 
            active={activeTab === 'player'} 
            onClick={() => setActiveTab('player')} 
            label="Global Players" 
            icon={<UserCheck size={16} />}
          />
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-900/20">
                <th className="px-8 py-5">Entity Identity</th>
                <th className="px-8 py-5">Verification Link</th>
                <th className="px-8 py-5 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="3" className="px-8 py-8"><div className="h-4 bg-slate-700/50 rounded-lg w-1/2"></div></td>
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
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-teal-400 font-black text-sm shadow-inner group-hover:border-teal-500/50 transition-colors">
                          {req.email[0].toUpperCase()}
                        </div>
                        <div>
                           <span className="text-slate-200 font-bold group-hover:text-white transition-colors block leading-none">{req.email}</span>
                           <span className="text-[10px] font-mono text-slate-500 uppercase mt-1 inline-block tracking-tighter">ID: {req.user_id.slice(0,18)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                        Awaiting Review
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedUser(req)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 
                        text-slate-900 px-5 py-2.5 rounded-xl hover:from-teal-400 hover:to-emerald-400 
                        transition-all duration-200 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/10 
                        active:scale-95 group/btn"
                      >
                        <Eye size={16} className="group-hover/btn:scale-110 transition-transform" /> 
                        Inspect Docs
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <ShieldCheck className="w-16 h-16 text-slate-500" />
                      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Ledger Clear: No entries found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <ReviewModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onRefresh={fetchRequests} 
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`relative flex items-center gap-2 px-8 py-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 rounded-t-2xl ${
        active 
          ? 'text-teal-400 bg-slate-800/40 border-t border-x border-slate-700/50' 
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] z-10"></span>
      )}
    </button>
  );
}
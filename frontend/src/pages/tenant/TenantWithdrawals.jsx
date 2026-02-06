import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  CheckCircle, XCircle, Clock, Search, 
  User, DollarSign, ShieldAlert, Banknote,
  ArrowUpRight, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TenantWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await api.get('/payments/admin/withdrawals/pending');
      setRequests(response.data);
    } catch (err) {
      toast.error("Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.post(`/payments/admin/withdrawals/${id}/${action}`);
      toast.success(`Withdrawal ${action === 'approve' ? 'Approved' : 'Rejected'}`);
      fetchRequests(); 
    } catch (err) {
      toast.error(err.response?.data?.detail || "Action failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <Banknote className="animate-pulse text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 mt-6 font-bold tracking-[0.2em] text-xs uppercase text-center">
        Accessing Financial Ledger...
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header & Financial Overview */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <Banknote className="text-teal-400 w-8 h-8" />
             </div>
             Withdrawal Requests
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Review and finalize player cash-out applications with security audit.
          </p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-5">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Clock size={24} className="text-amber-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Review</p>
            <p className="text-2xl font-black text-white">{requests.length} <span className="text-xs text-slate-500 font-medium">Requests</span></p>
          </div>
        </div>
      </header>

      {/* 2. Filter Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Search by Player ID or Transaction Reference..."
          className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-inner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 3. Main Ledger Table */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase font-black tracking-[0.15em] text-slate-500 bg-slate-900/40">
                <th className="px-8 py-6">Player Identity</th>
                <th className="px-8 py-6">Net Amount</th>
                <th className="px-8 py-6">Submission Time</th>
                <th className="px-8 py-6">Status Risk</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {requests.length > 0 ? requests.map((req, index) => (
                <tr 
                  key={req.id} 
                  className="group hover:bg-slate-700/30 transition-all duration-200"
                  style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.04}s both` }}
                >
                  {/* Player Info */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-teal-400 flex items-center justify-center font-black border border-slate-600 group-hover:border-teal-500/50 transition-colors shadow-lg">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-white transition-colors">ID: {req.player_id.slice(0, 12)}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">REF: #{req.id.slice(0, 14)}</div>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xl tracking-tight">
                      <DollarSign size={16} className="text-emerald-500/70" />
                      {req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-300">
                      {new Date(req.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-sm">
                      <ShieldAlert size={14} className="animate-pulse" /> Pending Audit
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleAction(req.id, 'reject')}
                        className="p-3 text-slate-500 border border-slate-700 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                        title="Reject Withdrawal"
                      >
                        <XCircle size={22} />
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'approve')}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all active:scale-95 group/btn"
                      >
                        <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Banknote size={56} className="text-slate-400" />
                      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm italic">Clearance Complete: No Pending Requests</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
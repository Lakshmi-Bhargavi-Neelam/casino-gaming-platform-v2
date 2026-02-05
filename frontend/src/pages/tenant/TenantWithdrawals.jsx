import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  CheckCircle, XCircle, Clock, Search, 
  User, DollarSign, ShieldAlert, Banknote 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TenantWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      // Endpoint should fetch all withdrawals with status "requested"
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
      fetchRequests(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Withdrawal Requests</h1>
          <p className="text-slate-500 font-medium">Review and process player cash-out applications.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase">Pending</p>
              <p className="text-xl font-black text-slate-900">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by Player ID or Transaction Ref..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Player Identity</th>
                <th className="px-8 py-6">Requested Amount</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">Status Risk</th>
                <th className="px-8 py-6 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.length > 0 ? requests.map((req) => (
                <tr key={req.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">ID: {req.player_id.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">REF: #{req.id.slice(0, 12)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-emerald-600 font-black text-lg">
                      <DollarSign size={16} />
                      {req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-slate-600 font-medium">
                      {new Date(req.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(req.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full w-fit">
                      <ShieldAlert size={12} /> Pending Review
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleAction(req.id, 'reject')}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Reject Request"
                      >
                        <XCircle size={22} />
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'approve')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Banknote size={48} className="text-slate-300" />
                      <p className="text-slate-500 font-bold italic uppercase tracking-widest text-sm">No Pending Requests</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
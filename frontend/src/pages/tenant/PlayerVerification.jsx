import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import api from '../../lib/axios';
import ReviewModal from '../admin/ReviewModal';
import { toast } from 'react-hot-toast';

export default function PlayerVerification() {
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenant-admin/kyc/pending-player-requests');
      setPendingPlayers(res.data);
    } catch (err) {
      toast.error("Failed to load pending requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const filteredPlayers = pendingPlayers.filter(p => 
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 👑 HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" size={32} />
            Player Verification
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Review and manage player identity documents to ensure platform compliance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2">
            <Clock size={18} className="animate-pulse" />
            <span className="font-bold text-sm">{pendingPlayers.length} Pending Requests</span>
          </div>
        </div>
      </div>

      {/* 🔍 FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by email or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
          <Filter size={20} />
        </button>
      </div>

      {/* 🗂️ PLAYERS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map(player => (
            <PlayerCard 
              key={player.user_id} 
              player={player} 
              onReview={() => setSelectedUser(player)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserCheck className="text-slate-300" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
          <p className="text-slate-500">No pending player verifications at the moment.</p>
        </div>
      )}

      {/* 🔍 REVIEW MODAL */}
      {selectedUser && (
        <ReviewModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onRefresh={fetchPending}
          role="tenant-admin" // 👈 Added this to target player endpoints
        />
      )}
    </div>
  );
}

function PlayerCard({ player, onReview }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <Users size={28} />
          </div>
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
            Player
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 truncate" title={player.email}>
            {player.email}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">
            ID: {player.user_id.split('-')[0]}...
          </p>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">ID</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">POA</div>
          </div>
          <span className="text-xs text-slate-500 font-medium italic">Pending review</span>
        </div>
      </div>

      <button 
        onClick={onReview}
        className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-[0.98]"
      >
        Start Review
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
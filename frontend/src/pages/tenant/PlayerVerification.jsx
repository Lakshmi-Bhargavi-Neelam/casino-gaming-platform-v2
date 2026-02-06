import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  ShieldCheck,
  UserCheck,
  Loader2,
  FileText
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
    <div className="w-full max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in duration-700">
      
      {/* 👑 HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
              <ShieldCheck className="text-teal-400" size={36} />
            </div>
            Player Verification
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">
            Perform identity audits and verify player compliance documents.
          </p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Review</span>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <span className="text-amber-400 font-black text-lg">{pendingPlayers.length} Requests</span>
             </div>
          </div>
        </div>
      </header>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by email or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all shadow-inner"
          />
        </div>
        <button className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-lg group">
          <Filter size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* 🗂️ PLAYERS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-slate-800/20 animate-pulse rounded-[2.5rem] border border-slate-800" />
          ))}
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlayers.map((player, index) => (
            <PlayerCard 
              key={player.user_id} 
              player={player} 
              index={index}
              onReview={() => setSelectedUser(player)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-800/10 rounded-[3rem] border-2 border-dashed border-slate-800/50">
          <div className="bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-slate-700">
            <UserCheck className="text-slate-600" size={44} />
          </div>
          <h3 className="text-2xl font-bold text-slate-300">Queue is Empty</h3>
          <p className="text-slate-500 mt-2 font-medium">All player identity verifications are currently up to date.</p>
        </div>
      )}

      {/* 🔍 REVIEW MODAL */}
      {selectedUser && (
        <ReviewModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onRefresh={fetchPending}
          role="tenant-admin" 
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function PlayerCard({ player, onReview, index }) {
  return (
    <div 
      className="group bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-8 hover:border-teal-500/50 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between shadow-2xl relative overflow-hidden"
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
    >
      {/* Decorative Glow Background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors"></div>

      <div className="space-y-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-400 transition-all duration-300 shadow-xl">
            <Users size={32} />
          </div>
          <div className="flex flex-col items-end">
             <span className="bg-slate-900/80 text-teal-500 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-teal-500/20">
                Identity Check
             </span>
             <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <Clock size={12} /> Pending
             </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white truncate leading-tight group-hover:text-teal-400 transition-colors" title={player.email}>
            {player.email}
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-2 bg-slate-950/50 px-2 py-1 rounded w-fit border border-slate-800">
            UUID: {player.user_id.split('-')[0]}...
          </p>
        </div>

        {/* Verification Checklist Preview */}
        <div className="flex items-center gap-4 py-4 border-y border-slate-700/40">
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-full border-2 border-slate-800 bg-slate-900 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-colors" title="Passport/ID Card">ID</div>
            <div className="w-9 h-9 rounded-full border-2 border-slate-800 bg-slate-900 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-colors" title="Proof of Address">POA</div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-300 font-bold">2 Documents</span>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Awaiting Audit</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onReview}
        className="mt-8 w-full relative overflow-hidden group/btn bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <FileText size={18} className="group-hover/btn:rotate-12 transition-transform" />
        Start Review
        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
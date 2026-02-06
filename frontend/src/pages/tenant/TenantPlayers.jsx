import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Search, UserX, UserCheck, MapPin, Clock, Users, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TenantPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/tenant-admins/admin/players/list');
      setPlayers(response.data);
    } catch (err) {
      toast.error("Failed to fetch player records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, []);

  const toggleStatus = async (playerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.post(`/tenant-admins/admin/players/${playerId}/status`, { status: newStatus });
      toast.success(`User access ${newStatus === 'active' ? 'restored' : 'revoked'}`);
      fetchPlayers();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <Users className="animate-pulse text-teal-500" size={48} />
          <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
        </div>
        <p className="text-slate-500 mt-6 font-bold tracking-[0.2em] text-xs uppercase">Accessing Player Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <Users className="text-teal-400 w-8 h-8" />
             </div>
             Players
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Monitor activity, manage status, and oversee platform access.
          </p>
        </div>

        {/* Search Bar: Glass-morphism style */}
        <div className="relative group min-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-inner"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* 2. Main Player Table Card */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-[2rem] border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase font-black tracking-[0.15em] text-slate-500 bg-slate-900/40">
                <th className="px-8 py-5">Player Identity</th>
                <th className="px-6 py-5">Region</th>
                <th className="px-6 py-5">Activity Log</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/30">
              {players
                .filter(p =>
                    p.player_name.toLowerCase().includes(search.toLowerCase()) ||
                    p.email.toLowerCase().includes(search.toLowerCase())
                )
                .map((player, index) => (
                  <tr 
                    key={player.player_id} 
                    className="group hover:bg-slate-700/30 transition-all duration-200"
                    style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.04}s both` }}
                  >
                    {/* Player Details */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-teal-400 flex items-center justify-center font-black text-lg border border-slate-600 group-hover:border-teal-500/50 transition-colors shadow-lg">
                          {player.player_name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-white transition-colors">
                            {player.player_name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail size={12} className="text-slate-600" />
                            {player.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                        <MapPin size={14} className="text-teal-500/70" />
                        {player.country}
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock size={14} className="text-slate-600" />
                        <span className="font-medium text-[13px]">{player.last_login}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                        player.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${player.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {player.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => toggleStatus(player.player_id, player.status)}
                        className={`p-2.5 rounded-xl transition-all border ${
                          player.status === 'active'
                            ? 'text-slate-400 border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                            : 'text-teal-400 border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/20 hover:text-teal-300'
                        }`}
                        title={player.status === 'active' ? 'Suspend Player' : 'Restore Player'}
                      >
                        {player.status === 'active' ? <UserX size={20} /> : <UserCheck size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Empty State */}
        {players.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4 bg-slate-900/20">
            <ShieldCheck size={48} className="text-slate-700" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Player Records Found</p>
          </div>
        )}
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
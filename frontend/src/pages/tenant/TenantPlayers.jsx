import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Search, UserX, UserCheck, MapPin, Clock } from 'lucide-react';
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
      <div className="p-10 text-center animate-pulse font-bold text-slate-400">
        LOADING PLAYER REGISTRY...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Players</h1>
          <p className="text-slate-500 font-medium">
            Manage player status and platform access.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search name or email..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[11px] uppercase font-black tracking-widest text-slate-400">
              <th className="px-8 py-5">Player Details</th>
              <th className="px-6 py-5">Country</th>
              <th className="px-6 py-5">Last Login</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {players
              .filter(
                p =>
                  p.player_name.toLowerCase().includes(search.toLowerCase()) ||
                  p.email.toLowerCase().includes(search.toLowerCase())
              )
              .map((player) => (
                <tr key={player.player_id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {player.player_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{player.player_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{player.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {player.country}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {player.last_login}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      player.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {player.status}
                    </span>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => toggleStatus(player.player_id, player.status)}
                      className={`p-2 rounded-xl transition-all ${
                        player.status === 'active'
                          ? 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                          : 'text-slate-400 hover:bg-green-50 hover:text-green-500'
                      }`}
                    >
                      {player.status === 'active' ? <UserX size={20} /> : <UserCheck size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Trophy, TrendingUp, Zap } from 'lucide-react';
import api from '../../lib/axios';
import HistoryTable from '../../components/HistoryTable';

export default function History() {
const [data, setData] = useState({ 
    summary: { wagered: 0, won: 0, max_win: 0, profit: 0 }, 
    history: [] 
  });  
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGame, setFilterGame] = useState('all');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/gameplay/history/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Filter Logic: Runs whenever searchTerm or data changes
  const filteredHistory = useMemo(() => {
    return data.history.filter(item => {
      const matchesSearch = item.round_id.includes(searchTerm.toLowerCase());
      const matchesGame = filterGame === 'all' || item.game_name === filterGame;
      return matchesSearch && matchesGame;
    });
  }, [searchTerm, filterGame, data.history]);

  // Extract unique games for the dropdown
  const uniqueGames = [...new Set(data.history.map(item => item.game_name))];

  if (loading) return <div className="p-10 text-slate-500">Syncing with blockchain history...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Betting Dashboard</h1>
        
        {/* 🔍 FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search Round ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-indigo-500 outline-none transition"
            />
          </div>
          <select 
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 text-sm focus:border-indigo-500 outline-none transition cursor-pointer"
          >
            <option value="all">All Games</option>
            {uniqueGames.map(game => <option key={game} value={game}>{game}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Wagered" value={data.summary.wagered} icon={<Zap size={16} className="text-blue-400" />} />
        <StatCard title="Total Won" value={data.summary.won} icon={<Trophy size={16} className="text-yellow-500" />} />
        <StatCard title="Net Profit" value={data.summary.profit} highlight />
        <StatCard title="Biggest Hit" value={data.summary.max_win} icon={<TrendingUp size={16} className="text-green-400" />} />
      </div>

      {/* Render the extracted Table component */}
      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden">
         <HistoryTable history={filteredHistory} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight }) {
  const isPositive = value >= 0;
  return (
    <div className={`p-6 rounded-3xl border transition-all ${highlight ? (isPositive ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20') : 'bg-slate-900 border-slate-800'}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
        {icon}
      </div>
      <p className={`text-2xl font-black ${highlight ? (isPositive ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
        ${parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
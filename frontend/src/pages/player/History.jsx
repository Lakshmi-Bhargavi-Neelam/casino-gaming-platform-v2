import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trophy, 
  TrendingUp, 
  Zap, 
  Activity, 
  History as HistoryIcon, 
  ArrowUpRight,
  Target
} from 'lucide-react';
import api from '../../lib/axios';
import HistoryTable from '../../components/HistoryTable';

export default function History() {
  const [data, setData] = useState({ 
    summary: { wagered: 0, won: 0, max_win: 0, profit: 0 }, 
    history: [] 
  });  
  const [loading, setLoading] = useState(true);
  
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

  const filteredHistory = useMemo(() => {
    return data.history.filter(item => {
      const matchesSearch = item.round_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = filterGame === 'all' || item.game_name === filterGame;
      return matchesSearch && matchesGame;
    });
  }, [searchTerm, filterGame, data.history]);

  const uniqueGames = [...new Set(data.history.map(item => item.game_name))];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative">
        <Activity className="animate-spin text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-[10px]">Syncing with Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 🚀 HEADER & REAL-TIME STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 italic uppercase">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <HistoryIcon className="text-teal-400 w-8 h-8" />
             </div>
             Betting <span className="text-teal-400">Ledger</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live data synchronized with secure gaming core
          </p>
        </div>
        
        {/* 🔍 SEARCH & FILTERS: High Tech Style */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Round ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 outline-none transition-all"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select 
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
              className="appearance-none bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-10 pr-10 text-sm text-white focus:border-teal-500 outline-none transition cursor-pointer"
            >
              <option value="all">All Modules</option>
              {uniqueGames.map(game => <option key={game} value={game} className="bg-slate-900">{game}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 📊 ANALYTICS STATS: Cinematic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Wagered" 
            value={data.summary.wagered} 
            icon={<Zap size={20} className="text-indigo-400" />} 
            accent="indigo"
        />
        <StatCard 
            title="Total Payout" 
            value={data.summary.won} 
            icon={<Trophy size={20} className="text-amber-500" />} 
            accent="amber"
        />
        <StatCard 
            title="Net Performance" 
            value={data.summary.profit} 
            highlight 
        />
        <StatCard 
            title="Session Peak" 
            value={data.summary.max_win} 
            icon={<Target size={20} className="text-teal-400" />} 
            accent="teal"
        />
      </div>

      {/* 📑 TRANSACTION LEDGER: Glass Table */}
      <div className="relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-teal-500/5 blur-[100px] -z-10 rounded-[3rem]" />
          
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl transition-all hover:border-slate-700/50">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Activity Logs</h3>
                <span className="text-[10px] font-bold text-teal-500 bg-teal-500/5 px-2 py-1 rounded-md border border-teal-500/10">
                    {filteredHistory.length} ENTRIES FOUND
                </span>
            </div>
            <div className="p-2 md:p-4">
                <HistoryTable history={filteredHistory} />
            </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight, accent = "slate" }) {
  const isPositive = value >= 0;
  
  const accentColors = {
    indigo: "border-indigo-500/20 text-indigo-400",
    amber: "border-amber-500/20 text-amber-500",
    teal: "border-teal-500/20 text-teal-400",
    slate: "border-slate-800 text-slate-400"
  };

  return (
    <div className={`relative overflow-hidden group p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${
        highlight 
        ? (isPositive ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30') 
        : `bg-slate-900/40 border-slate-800 hover:border-slate-700 backdrop-blur-md`
    }`}>
      
      {/* Background Decorative Element */}
      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
          {icon}
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-xl bg-slate-950/50 border ${accentColors[accent]}`}>
            {icon || (isPositive ? <TrendingUp size={16} /> : <Zap size={16} />)}
        </div>
      </div>

      <div className="relative z-10">
        <p className={`text-3xl font-black tracking-tighter ${
            highlight 
            ? (isPositive ? 'text-emerald-400' : 'text-red-400') 
            : 'text-white'
        }`}>
          <span className="text-base opacity-50 mr-1">$</span>
          {parseFloat(Math.abs(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          {!isPositive && highlight && <span className="ml-1 opacity-50 font-normal">-</span>}
        </p>
        
        {highlight && (
            <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpRight size={12} /> : <Zap size={12} />}
                {isPositive ? 'Total Return' : 'Total Loss'}
            </div>
        )}
      </div>
    </div>
  );
}
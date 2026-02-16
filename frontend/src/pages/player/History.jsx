import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Trophy, 
  TrendingUp, 
  Zap, 
  Activity, 
  History as HistoryIcon, 
  Target,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RefreshCcw
} from 'lucide-react';
import api from '../../lib/axios';
import HistoryTable from '../../components/HistoryTable';

export default function History() {
  const [data, setData] = useState({ 
    summary: { wagered: 0, won: 0, max_win: 0, profit: 0 }, 
    history: [] 
  });  
  const [loading, setLoading] = useState(true);
  
  // 🎯 Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGame, setFilterGame] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all | wins | losses

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterGame !== 'all') params.append('game', filterGame);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const res = await api.get(`/gameplay/history/dashboard?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 RE-FETCH data whenever game or status changes
  useEffect(() => { 
    fetchDashboard(); 
  }, [filterGame, filterStatus]); 

  // 🎯 REFINED FILTER LOGIC (Case-Insensitive & Type-Safe)
  const filteredHistory = useMemo(() => {
    return data.history.filter(item => {
      // 1. Search Filter
      const matchesSearch = item.round_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Game Filter (Handling case sensitivity)
      const matchesGame = filterGame === 'all' || 
                         item.game_name.toLowerCase() === filterGame.toLowerCase();
      
      // 3. Status Filter (Logic: Win is any payout > 0)
      let matchesStatus = true;
      if (filterStatus === 'wins') matchesStatus = Number(item.win_amount) > 0;
      if (filterStatus === 'losses') matchesStatus = Number(item.win_amount) <= 0;

      return matchesSearch && matchesGame && matchesStatus;
    });
  }, [searchTerm, filterGame, filterStatus, data.history]);

  // Extract unique games for the dropdown
  const uniqueGames = useMemo(() => {
     return [...new Set(data.history.map(item => item.game_name))];
  }, [data.history]);
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative">
        <Activity className="animate-spin text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-[10px]">Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 🚀 PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 italic uppercase">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <HistoryIcon className="text-teal-400 w-8 h-8" />
             </div>
             Betting <span className="text-teal-400">Ledger</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-1 flex items-center gap-2 text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live data synchronized
          </p>
        </div>
        <button onClick={fetchDashboard} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-teal-400 transition-all shadow-xl active:scale-95">
           <RefreshCcw size={20} />
        </button>
      </div>

      {/* 📊 ANALYTICS STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Wagered" value={data.summary.wagered} icon={<Zap size={20} className="text-indigo-400" />} accent="indigo" />
        <StatCard title="Total Payout" value={data.summary.won} icon={<Trophy size={20} className="text-amber-500" />} accent="amber" />
        <StatCard title="Net Performance" value={data.summary.profit} highlight />
        <StatCard title="Session Peak" value={data.summary.max_win} icon={<Target size={20} className="text-teal-400" />} accent="teal" />
      </div>

      {/* 📑 ACTIVITY LOGS SECTION */}
      <div className="relative">
          <div className="absolute inset-0 bg-teal-500/5 blur-[100px] -z-10 rounded-[3rem]" />
          
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-2xl">
            
            {/* 🎯 INTEGRATED FILTER HEADER */}
            <div className="px-8 py-6 border-b border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-900/60">
                <div className="flex items-center gap-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Activity size={14} className="text-teal-500" /> Activity Logs
                   </h3>
                   <span className="text-[10px] font-black text-teal-500 bg-teal-500/5 px-3 py-1 rounded-full border border-teal-500/10 uppercase tracking-widest whitespace-nowrap">
                       {filteredHistory.length} Matches found
                   </span>
                </div>

                {/* 🔍 COMPACT FILTER CONSOLE INSIDE HEADER */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative group min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>

                  {/* Game Dropdown */}
                  <div className="relative group">
                    <select 
                      value={filterGame}
                      onChange={(e) => setFilterGame(e.target.value)}
                      className="appearance-none bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-3 pr-8 text-[10px] font-black text-slate-400 focus:border-teal-500 outline-none cursor-pointer uppercase tracking-widest"
                    >
                      <option value="all">All Games</option>
                      {uniqueGames.map(game => <option key={game} value={game} className="bg-slate-900">{game}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  </div>

                  {/* Status Toggles */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <FilterBtn active={filterStatus === 'all'} label="All" onClick={() => setFilterStatus('all')} />
                    <FilterBtn active={filterStatus === 'wins'} label="Wins" icon={<CheckCircle2 size={10}/>} color="text-emerald-400" onClick={() => setFilterStatus('wins')} />
                    <FilterBtn active={filterStatus === 'losses'} label="Losses" icon={<XCircle size={10}/>} color="text-rose-400" onClick={() => setFilterStatus('losses')} />
                  </div>
                </div>
            </div>

            <div className="p-2 md:p-4">
                <HistoryTable history={filteredHistory} />
                
                {filteredHistory.length === 0 && (
                   <div className="py-20 text-center flex flex-col items-center gap-4">
                      <Target size={48} className="text-slate-800 opacity-20" />
                      <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">No matches meet criteria</p>
                   </div>
                )}
            </div>
          </div>
      </div>
    </div>
  );
}

function FilterBtn({ active, label, onClick, icon, color }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                active 
                ? 'bg-slate-800 text-white shadow-lg border border-slate-700' 
                : `text-slate-600 hover:text-slate-400`
            }`}
        >
            {icon && <span className={active ? color : 'text-slate-700'}>{icon}</span>}
            {label}
        </button>
    )
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
    <div className={`relative overflow-hidden group p-8 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${
        highlight 
        ? (isPositive ? 'border-emerald-500/30' : 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]') 
        : `bg-slate-900/40 border-slate-800`
    }`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-xl bg-slate-950/50 border ${accentColors[accent]}`}>
            {icon || (isPositive ? <TrendingUp size={16} /> : <Zap size={16} />)}
        </div>
      </div>
      <div className="relative z-10">
        <p className={`text-3xl font-black tracking-tighter tabular-nums italic ${highlight ? (isPositive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
          <span className="text-base opacity-40 mr-1 not-italic font-normal">$</span>
          {parseFloat(Math.abs(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Zap, Trophy, Target, ShieldCheck, 
  Activity, Clock, Flame, Heart, 
  ArrowUpRight, RefreshCcw, BarChart3,
  Gamepad2, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function PlayerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/player/analytics/personal-hub');
      setData(res.data);
    } catch (err) {
      toast.error("Failed to sync personal records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // 1. Loading State
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <RefreshCcw className="animate-spin text-teal-500 mb-4" size={40} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Personal Ledger...</p>
    </div>
  );

  // 2.  SAFETY GUARD: Fallback UI if player has no activity yet
  if (!data || data.has_data === false) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center animate-in fade-in duration-700">
        <div className="bg-slate-900/40 backdrop-blur-md border-2 border-dashed border-slate-800 rounded-[3rem] p-16 flex flex-col items-center gap-6">
          <div className="p-6 bg-slate-900 rounded-full border border-slate-800 shadow-2xl">
            <Activity size={48} className="text-slate-700" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">No Performance Data</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
              You haven't placed any bets yet. Your personal performance analytics and safety audit will appear here once you start playing.
            </p>
          </div>
          <Link 
            to="/player/lobby" 
            className="flex items-center gap-2 bg-teal-500 text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-teal-500/20"
          >
            <Gamepad2 size={16} /> Enter Game Lobby
          </Link>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard (Only renders if data.has_data is true)
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <BarChart3 className="text-teal-400 w-8 h-8" />
             </div>
             Performance <span className="text-teal-400">Hub</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 uppercase text-[10px] tracking-widest ml-1">
             Your personalized gaming intelligence and safety audit
          </p>
        </div>
        <button onClick={fetchStats} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-teal-400 transition-all shadow-xl">
           <RefreshCcw size={20} />
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Staked Volume" value={`$${data.kpis.total_wagered.toLocaleString()}`} icon={<Zap size={20}/>} accent="indigo" />
        <StatCard title="Total Payouts" value={`$${data.kpis.total_won.toLocaleString()}`} icon={<Trophy size={20}/>} accent="teal" />
        <StatCard title="Net Result" value={`$${data.kpis.net_result.toLocaleString()}`} highlight positive={data.kpis.net_result >= 0} />
        <StatCard title="Experienced RTP" value={`${data.kpis.experienced_rtp}%`} icon={<Target size={20}/>} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Responsible Gaming Card */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5"><Heart size={140} className="text-rose-500" /></div>
           
           <h3 className="text-white font-black text-xs uppercase tracking-widest mb-10 flex items-center gap-3 relative z-10">
              <ShieldCheck className="text-teal-400" size={20} /> Responsible Gaming Audit
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Loss vs Deposit Density</p>
                    <div className="flex items-end gap-2">
                       <span className="text-4xl font-black text-white italic">{data.responsible_gaming.loss_to_deposit_ratio}%</span>
                       <span className={`text-[10px] font-black uppercase mb-1 ${data.responsible_gaming.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          • {data.responsible_gaming.status}
                       </span>
                    </div>
                 </div>
                 <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(data.responsible_gaming.loss_to_deposit_ratio, 100)}%` }} />
                 </div>
              </div>

              <div className="flex flex-col justify-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800"><Clock size={20} className="text-slate-400"/></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Time</p>
                       <p className="text-lg font-black text-white italic">{data.responsible_gaming.play_time_hours} Hours</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800"><Activity size={20} className="text-slate-400"/></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Sessions</p>
                       <p className="text-lg font-black text-white italic">{data.kpis.sessions} Entries</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bonus Tracker */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between group">
           <div className="space-y-6">
              <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-3">
                 <Flame className="text-orange-500" size={20} /> Active Reward
              </h3>
              {data.bonus.active ? (
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wagering Efficiency</span>
                      <span className="text-xl font-black text-teal-400 italic">{data.bonus.progress}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-teal-500 shadow-[0_0_15px_#14b8a6] transition-all duration-1000" style={{ width: `${data.bonus.progress}%` }} />
                   </div>
                   <Link to="/player/bonuses" className="block text-center w-full mt-4 py-3 bg-slate-800 hover:bg-teal-500 hover:text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                      View Conversion Specs
                   </Link>
                </div>
              ) : (
                <div className="py-10 text-center opacity-30 italic text-sm">No active bonus found</div>
              )}
           </div>
           
           <div className="mt-8 p-5 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex items-center gap-3">
              <ShieldCheck size={18} className="text-teal-500" />
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                 Vault data is verified and updated in real-time.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent, highlight, positive }) {
  const colors = {
    indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    teal: "text-teal-400 border-teal-500/20 bg-teal-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5"
  };

  return (
    <div className={`bg-slate-900 border p-8 rounded-[2rem] shadow-2xl relative overflow-hidden transition-all hover:-translate-y-1 ${highlight ? (positive ? 'border-emerald-500/30' : 'border-rose-500/30') : 'border-slate-800'}`}>
       <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
          <div className={`p-2 rounded-xl border ${highlight ? (positive ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20') : colors[accent]}`}>
             {icon || (positive ? <TrendingUp size={16}/> : <Zap size={16}/>)}
          </div>
       </div>
       <p className={`text-3xl font-black tracking-tighter tabular-nums italic ${highlight ? (positive ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
          {value}
       </p>
       <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
          <ArrowUpRight size={12} className="text-teal-500" /> Lifetime Records
       </div>
    </div>
  );
}
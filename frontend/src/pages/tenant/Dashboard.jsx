import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gamepad2, 
  Banknote, 
  TrendingUp, 
  Activity, 
  ShieldCheck,
  ArrowUpRight,
  RefreshCcw,
  Coins,
  Zap,
  BarChart3,
  Wallet,
  ArrowDownCircle,
  Gift,
  Award,
  PieChart
} from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function TenantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // 🎯 Switch State: 'analytics' or 'finance'
  const [view, setView] = useState('analytics'); 

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 🎯 We fetch both datasets to ensure smooth switching
      const [summaryRes, detailedRes] = await Promise.all([
        api.get('/tenant/analytics/dashboard-summary'),
        api.get('/tenant/analytics/detailed-stats')
      ]);
      
      setData({
        summary: summaryRes.data,
        detailed: detailedRes.data
      });
    } catch (err) {
      toast.error("Failed to sync live analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <RefreshCcw className="animate-spin text-teal-500 mb-4" size={40} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Global Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header & View Switcher */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">
            Platform <span className="text-teal-400">Intelligence</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium ml-1">Live operational audit for your casino floor.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
          <button 
            onClick={() => setView('analytics')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'analytics' ? 'bg-teal-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <PieChart size={14} /> Gaming
          </button>
          <button 
            onClick={() => setView('finance')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'finance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Banknote size={14} /> Financials
          </button>
          <div className="w-px h-6 bg-slate-800 mx-1" />
          <button onClick={fetchDashboardData} className="p-2.5 text-slate-500 hover:text-teal-400 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      {/* 2. Dynamic KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {view === 'analytics' ? (
          <>
            <StatCard title="Total Volume" value={`$${data.summary.overview.total_wagered.toLocaleString()}`} label="Total Bets Placed" icon={<Coins size={24} className="text-indigo-400" />} />
            <StatCard title="Gross Revenue" value={`$${data.summary.overview.total_revenue.toLocaleString()}`} label="GGR (Bets - Wins)" icon={<TrendingUp size={24} className="text-teal-400" />} positive={data.summary.overview.total_revenue >= 0} />
            <StatCard title="Player Payouts" value={`$${data.summary.overview.total_payouts.toLocaleString()}`} label="Total Wins Paid" icon={<Banknote size={24} className="text-amber-400" />} />
            <StatCard title="House RTP" value={`${data.summary.overview.rtp_live}%`} label="Return to Player" icon={<Zap size={24} className="text-purple-400" />} isRTP />
          </>
        ) : (
          <>
            <StatCard title="Total Deposits" value={`$${data.detailed.finance.deposits.toLocaleString()}`} label="Inflow to Vault" icon={<Wallet size={24} className="text-emerald-400" />} trend="Live" />
            <StatCard title="Withdrawals" value={`$${data.detailed.finance.withdrawals.toLocaleString()}`} label="Player Outflow" icon={<ArrowDownCircle size={24} className="text-rose-400" />} negative />
            <StatCard title="Net Cash Flow" value={`$${data.detailed.finance.net_cash_flow.toLocaleString()}`} label="Liquid Growth" icon={<Banknote size={24} className="text-amber-400" />} positive={data.detailed.finance.net_cash_flow >= 0} />
            <StatCard title="Bonus ROI" value={`${data.detailed.marketing.efficiency_ratio}x` || '0x'} label="Bonus Efficiency" icon={<Gift size={24} className="text-indigo-400" />} trend="Marketing" />
          </>
        )}
      </div>

      {/* 3. Dynamic Large Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Changes based on Tab */}
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl">
          {view === 'analytics' ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 italic uppercase tracking-tight">
                  <BarChart3 className="text-teal-500" /> Top Performing Games
                </h3>
              </div>
              <div className="space-y-4">
                {data.summary.top_games.map((game, index) => (
                  <GamePerformanceItem key={index} name={game.name} profit={game.profit} rank={index + 1} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 italic uppercase tracking-tight">
                  <Award className="text-amber-500" /> High Roller Leaderboard
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Global Ranking</span>
              </div>
              <div className="space-y-3">
                {data.detailed.leaderboard.map((player, index) => (
                  <PlayerRankItem key={index} name={player.name} email={player.email} wagered={player.wagered} rank={index + 1} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Section: System Status (Always Visible) */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/50 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="space-y-4 relative z-10">
            <ShieldCheck className="text-teal-400 w-12 h-12" />
            <h3 className="text-2xl font-black text-white leading-tight uppercase italic">Platform Integrity</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              All gaming engines are synchronized. SSL encryption and Provably Fair protocols are fully operational.
            </p>
          </div>
          <div className="mt-10 space-y-3 relative z-10">
             <StatusLine label="RNG Core" status="Validated" />
             <StatusLine label="Wallet API" status="Secure" />
             <StatusLine label="Global CDN" status="Active" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, value, label, icon, positive = true, negative = false, isRTP = false, trend = "Stable" }) {
  const isHealthy = isRTP ? parseFloat(value) < 100 : positive;
  return (
    <div className="bg-slate-900 border border-slate-800 p-7 rounded-[2rem] hover:border-teal-500/30 transition-all group shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-teal-500/50 transition-colors shadow-inner">
          {icon}
        </div>
        <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            negative ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            isHealthy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {negative ? 'Outflow' : trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">{title}</p>
        <p className="text-3xl font-black text-white mt-1 tracking-tighter tabular-nums">{value}</p>
        <p className="text-slate-600 text-[10px] font-bold mt-2 uppercase tracking-tighter">{label}</p>
      </div>
    </div>
  );
}

function GamePerformanceItem({ name, profit, rank }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:bg-slate-800/50 transition-all group">
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-500 group-hover:text-teal-400 transition-colors">0{rank}</div>
        <div>
          <p className="text-sm font-black text-white uppercase tracking-tight italic">{name}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Active Module</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-black italic tracking-tighter ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
        </p>
        <p className="text-[9px] text-slate-600 font-black uppercase mt-1">GGR contribution</p>
      </div>
    </div>
  );
}

function PlayerRankItem({ name, email, wagered, rank }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-950/30 border border-slate-800/50 hover:bg-slate-800/50 transition-all group">
      <div className="flex items-center gap-5">
        <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600 group-hover:text-teal-400 transition-colors">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : `0${rank}`}
        </div>
        <div>
          <p className="text-sm font-black text-slate-100 uppercase tracking-tight italic group-hover:text-white">{name || 'Unknown'}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-emerald-400 tabular-nums tracking-tighter italic">${wagered.toLocaleString()}</p>
        <p className="text-[9px] text-slate-600 font-black uppercase mt-1 tracking-widest">Total Stakes</p>
      </div>
    </div>
  );
}

function StatusLine({ label, status }) {
    return (
        <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] text-emerald-400 font-black uppercase">{status}</span>
            </div>
        </div>
    );
}
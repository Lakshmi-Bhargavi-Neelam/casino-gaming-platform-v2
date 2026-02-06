import React from 'react';
import { 
  Users, 
  Gamepad2, 
  Banknote, 
  TrendingUp, 
  Activity, 
  ShieldCheck,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export default function TenantDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 1. Welcome Header */}
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Welcome back, <span className="text-teal-400 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Operator</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Here is what's happening with your casino today.</p>
      </header>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Players" 
          value="1,284" 
          trend="+12%" 
          icon={<Users size={24} className="text-teal-400" />} 
        />
        <StatCard 
          title="Active Games" 
          value="24" 
          trend="Live" 
          icon={<Gamepad2 size={24} className="text-indigo-400" />} 
        />
        <StatCard 
          title="Withdrawal Vol." 
          value="$12,450" 
          trend="Pending" 
          icon={<Banknote size={24} className="text-emerald-400" />} 
        />
        <StatCard 
          title="Win Margin" 
          value="4.2%" 
          trend="+0.4%" 
          icon={<TrendingUp size={24} className="text-amber-400" />} 
        />
      </div>

      {/* 3. Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Activity className="text-teal-500" /> Recent Activity
            </h3>
            <button className="text-xs font-black text-teal-500 uppercase tracking-widest hover:text-teal-400 transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-6">
            <ActivityItem 
              user="player_992" 
              action="Requested Withdrawal" 
              amount="$450.00" 
              time="2 mins ago" 
            />
            <ActivityItem 
              user="New User" 
              action="Completed Verification" 
              amount="KYC Approved" 
              time="14 mins ago" 
            />
            <ActivityItem 
              user="Game Server" 
              action="New Game Added" 
              amount="Mines Pro" 
              time="1 hour ago" 
            />
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <ShieldCheck className="text-teal-400 w-12 h-12" />
            <h3 className="text-2xl font-bold text-white leading-tight">Platform <br/>Security Status</h3>
            <p className="text-slate-500 text-sm">All systems are operational. SSL certificates and game encryption verified.</p>
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-800">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Global CDN: Active</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">RNG Engine: Validated</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:border-teal-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 group-hover:border-teal-500/50 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black text-teal-500 bg-teal-500/10 px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
          <ArrowUpRight size={12} /> {trend}
        </span>
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-white mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, amount, time }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/50 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold group-hover:text-teal-400 transition-colors">
          {user[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{user}</p>
          <p className="text-[11px] text-slate-500 font-medium">{action}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-slate-300">{amount}</p>
        <p className="text-[10px] text-slate-600 flex items-center gap-1 justify-end mt-0.5">
          <Clock size={10} /> {time}
        </p>
      </div>
    </div>
  );
}
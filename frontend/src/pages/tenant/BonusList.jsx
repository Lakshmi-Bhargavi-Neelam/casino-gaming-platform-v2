import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Gift, 
  Users, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  MoreVertical,
  Clock,
  Plus,
  Target,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function BonusList() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBonuses = async () => {
    try {
      // Fetches the registry of bonuses created by this tenant
      const res = await api.get('/tenant/bonuses');
      setBonuses(res.data);
    } catch (err) {
      toast.error("Failed to sync promotion registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBonuses(); }, []);

  // 🎯 Logic: Determine the real-time status of a campaign
  const getStatus = (bonus) => {
    const now = new Date();
    const expiry = new Date(bonus.valid_to);
    const start = new Date(bonus.valid_from);

    if (!bonus.is_active) return { label: 'PAUSED', color: 'bg-slate-800 text-slate-500 border-slate-700' };
    if (now > expiry) return { label: 'EXPIRED', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (now < start) return { label: 'SCHEDULED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: 'LIVE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <TrendingUp className="animate-spin text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 mt-6 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header & Quick Actions */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 italic uppercase">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-lg">
                <BarChart3 className="text-teal-400 w-8 h-8" />
             </div>
             Promotion <span className="text-teal-400">Registry</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium ml-1 flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-500" />
            Audit and monitor all active player incentive campaigns.
          </p>
        </div>

        <Link 
          to="/console/bonus-management" 
          className="flex items-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Create New Campaign
        </Link>
      </header>

      {/* 2. Global Stats Bar - Dynamic Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem label="Total Records" value={bonuses.length} icon={<Gift size={20} className="text-indigo-400" />} />
        <StatItem label="Running Now" value={bonuses.filter(b => getStatus(b).label === 'LIVE').length} icon={<Zap size={20} className="text-emerald-400" />} />
        <StatItem label="Engagement" value="482 Players" icon={<Users size={20} className="text-amber-400" />} />
      </div>

      {/* 3. The Promotion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {bonuses.map((bonus, index) => {
          const status = getStatus(bonus);
          return (
            <div 
              key={bonus.bonus_id} 
              className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 hover:border-teal-500/30 transition-all duration-500 shadow-2xl overflow-hidden"
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
            >
              {/* Background Status Glow */}
              <div className={`absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-10 transition-colors ${bonus.is_active ? 'bg-teal-500' : 'bg-slate-500'}`} />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-teal-400 transition-colors">
                      {bonus.bonus_name}
                   </h3>
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">
                        REF: {bonus.bonus_id.slice(0, 14)}...
                     </span>
                   </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${status.color}`}>
                  {status.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                 <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 shadow-inner group-hover:border-slate-700 transition-colors">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <Target size={10} className="text-teal-500" /> Configuration
                    </p>
                    <p className="text-sm font-black text-slate-200">
                      {bonus.bonus_type === 'DEPOSIT' 
                        ? `${Number(bonus.bonus_percentage).toFixed(0)}% Deposit Match` 
                        : `$${Number(bonus.bonus_amount).toFixed(2)} Fixed Credit`}
                    </p>
                 </div>
                 <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 shadow-inner group-hover:border-slate-700 transition-colors">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <Zap size={10} className="text-amber-500" /> Wagering Req.
                    </p>
                    <p className="text-sm font-black text-amber-500">
                       {bonus.wagering_multiplier}x <span className="text-[10px] text-slate-600 ml-1 uppercase font-bold tracking-widest">Multiplier</span>
                    </p>
                 </div>
              </div>

              {/* Statistics Preview Section */}
              <div className="space-y-4 pt-6 border-t border-slate-800 relative z-10">
                 <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency Rating</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white tracking-tighter">68.4%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 p-[2px]">
                    <div className="h-full bg-indigo-500 w-[68%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
                 </div>
              </div>

              <div className="mt-8 flex items-center justify-between relative z-10">
                 <div className={`flex items-center gap-2 transition-colors ${status.label === 'EXPIRED' ? 'text-red-400/70' : 'text-slate-500'}`}>
                    {status.label === 'EXPIRED' ? <AlertCircle size={14} /> : <Clock size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                       {status.label === 'EXPIRED' ? 'Ended' : 'Expires'}: {new Date(bonus.valid_to).toLocaleDateString()}
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 rounded-xl transition-all shadow-inner">
                       <MoreVertical size={18} />
                    </button>
                 </div>
              </div>
            </div>
          );
        })}

        {bonuses.length === 0 && (
          <div className="col-span-full py-40 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
             <div className="p-6 bg-slate-900 rounded-full mb-6 border border-slate-800 shadow-2xl">
                <Gift size={64} className="text-slate-800" />
             </div>
             <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs italic">No Promotional Campaigns Tracked</p>
             <Link to="/console/bonus-management" className="mt-6 text-teal-500 font-bold uppercase text-[10px] tracking-widest hover:text-teal-400 underline underline-offset-8">Launch your first bonus now</Link>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl transition-all hover:border-slate-700 hover:-translate-y-1">
       <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner group-hover:border-slate-700 transition-colors">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{value}</p>
       </div>
    </div>
  );
}
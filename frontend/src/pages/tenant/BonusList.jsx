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
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function BonusList() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBonuses = async () => {
    try {
      // Assumes your backend has a GET endpoint for tenant bonuses
      const res = await api.get('/tenant/bonuses');
      setBonuses(res.data);
    } catch (err) {
      toast.error("Failed to sync promotion registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBonuses(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <TrendingUp className="animate-pulse text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 mt-6 font-bold tracking-[0.2em] text-xs uppercase">Loading Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header & Quick Actions */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 italic uppercase">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <BarChart3 className="text-teal-400 w-8 h-8" />
             </div>
             Promotion <span className="text-teal-400">Registry</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Monitor deployment status and player engagement across all campaigns.</p>
        </div>

        <Link 
          to="/console/bonus-management" 
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-105 transition-all"
        >
          <Plus size={18} /> New Campaign
        </Link>
      </header>

      {/* 2. Global Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem label="Total Campaigns" value={bonuses.length} icon={<Gift size={20} />} />
        <StatItem label="Active Promotions" value={bonuses.filter(b => b.is_active).length} icon={<Zap size={20} className="text-teal-400" />} />
        <StatItem label="Distributed To" value="482 Players" icon={<Users size={20} className="text-indigo-400" />} />
      </div>

      {/* 3. The Promotion List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {bonuses.map((bonus, index) => (
          <div 
            key={bonus.bonus_id} 
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 hover:border-teal-500/30 transition-all duration-500 shadow-2xl"
            style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-teal-400 transition-colors">
                    {bonus.bonus_name}
                 </h3>
                 <span className="text-[10px] font-mono text-slate-600">UUID: {bonus.bonus_id.slice(0, 18)}...</span>
              </div>
              <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${bonus.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                {bonus.is_active ? 'Live' : 'Archived'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Configuration</p>
                  <p className="text-sm font-bold text-slate-200">
                    {bonus.bonus_type === 'DEPOSIT' ? `${bonus.bonus_percentage}% Match` : `$${bonus.bonus_amount} Fixed`}
                  </p>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Wagering Req.</p>
                  <p className="text-sm font-bold text-teal-500">{bonus.wagering_multiplier}x Multiplier</p>
               </div>
            </div>

            {/* Statistics Preview */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
               <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Player Conversion Rate</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">68%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[68%] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
               </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Expires: {new Date(bonus.valid_to).toLocaleDateString()}</span>
               </div>
               <button className="p-2 text-slate-500 hover:text-white transition-colors">
                  <MoreVertical size={20} />
               </button>
            </div>
          </div>
        ))}

        {bonuses.length === 0 && (
          <div className="col-span-full py-32 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] text-center">
             <Gift size={64} className="mx-auto text-slate-800 mb-4" />
             <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">No Active Campaigns Found</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-5 shadow-xl transition-all hover:border-slate-700">
       <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
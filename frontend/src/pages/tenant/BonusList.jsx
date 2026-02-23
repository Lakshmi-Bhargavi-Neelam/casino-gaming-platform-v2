import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Gift, 
  Users, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3, 
  MoreVertical,
  Clock,
  Plus,
  Target,
  AlertCircle,
  Archive,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function BonusList() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBonuses = async () => {
    try {
      const res = await api.get('/tenant/bonuses');
      setBonuses(res.data);
    } catch (err) {
      toast.error("Failed to sync promotion registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBonuses(); }, []);

  const getStatus = (bonus) => {
    const now = new Date();
    const expiry = new Date(bonus.valid_to);
    const start = new Date(bonus.valid_from);

    if (!bonus.is_active) return { label: 'PAUSED', color: 'bg-slate-800 text-slate-500 border-slate-700' };
    if (now > expiry) return { label: 'EXPIRED', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (now < start) return { label: 'SCHEDULED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: 'LIVE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' };
  };

  const liveBonuses = bonuses.filter(b => getStatus(b).label !== 'EXPIRED');
  const expiredBonuses = bonuses.filter(b => getStatus(b).label === 'EXPIRED');

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <TrendingUp className="animate-spin text-teal-500" size={48} />
      <p className="text-slate-500 mt-6 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 italic uppercase">
             <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 shadow-lg">
                <BarChart3 className="text-teal-400 w-8 h-8" />
             </div>
             Promotion <span className="text-teal-400">Hub</span>
          </h1>
        </div>
        <Link to="/console/bonus-management" className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
          <Plus size={18} strokeWidth={3} /> New Campaign
        </Link>
      </header>

      {/* 2. Global Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem label="Active/Scheduled" value={liveBonuses.length} icon={<Zap size={20} className="text-emerald-400" />} />
        <StatItem label="Campaign History" value={expiredBonuses.length} icon={<Archive size={20} className="text-slate-400" />} />
        <StatItem label="Total Players Engaged" value="482" icon={<Users size={20} className="text-indigo-400" />} />
      </div>

      {/* 3. Live & Scheduled Section (Cards) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-teal-500 rounded-full shadow-[0_0_10px_#14b8a6]" />
            <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Active Campaigns</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {liveBonuses.map((bonus, index) => (
                <BonusCard key={bonus.bonus_id} bonus={bonus} index={index} status={getStatus(bonus)} />
            ))}
            {liveBonuses.length === 0 && (
                <div className="col-span-full py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                    No active or scheduled promotions
                </div>
            )}
        </div>
      </section>

      {/* 4. Expired Registry Section (Table) */}
      <section className="space-y-6 pt-10">
        <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
            <h2 className="text-lg font-black text-slate-500 uppercase tracking-widest italic">Historical Registry</h2>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-900/60 border-b border-slate-800">
                            <th className="px-8 py-5">Campaign Name</th>
                            <th className="px-8 py-5">Type</th>
                            <th className="px-8 py-5 text-center">Configuration</th>
                            <th className="px-8 py-5 text-center">Wager</th>
                            <th className="px-8 py-5 text-right">Ended Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {expiredBonuses.map((bonus) => (
                            <tr key={bonus.bonus_id} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-5">
                                    <p className="text-slate-300 font-bold text-sm group-hover:text-white transition-colors">{bonus.bonus_name}</p>
                                    <p className="text-[9px] font-mono text-slate-600 uppercase">REF: {bonus.bonus_id.slice(0,8)}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{bonus.bonus_type}</span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="text-xs font-medium text-slate-400">
                                        {bonus.bonus_type === 'DEPOSIT' ? `${Number(bonus.bonus_percentage).toFixed(0)}% Match` : `$${Number(bonus.bonus_amount).toFixed(2)}`}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="text-xs font-black text-indigo-400/70">{bonus.wagering_multiplier}x</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <p className="text-slate-500 text-xs font-bold">{new Date(bonus.valid_to).toLocaleDateString()}</p>
                                </td>
                            </tr>
                        ))}
                        {expiredBonuses.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-8 py-10 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">No historical records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function BonusCard({ bonus, index, status }) {
    return (
        <div 
          className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 hover:border-teal-500/30 transition-all duration-500 shadow-2xl overflow-hidden"
          style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
        >
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-teal-400 transition-colors leading-tight">
                  {bonus.bonus_name}
               </h3>
               <span className="text-[9px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">
                    ID: {bonus.bonus_id.slice(0, 14)}...
                </span>
            </div>
            <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${status.color}`}>
              {status.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
             <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 shadow-inner group-hover:border-slate-700 transition-colors">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Target size={10} className="text-teal-500" /> Config</p>
                <p className="text-sm font-black text-slate-200">
                  {bonus.bonus_type === 'DEPOSIT' ? `${Number(bonus.bonus_percentage).toFixed(0)}% Match` : `$${Number(bonus.bonus_amount).toFixed(2)} Credit`}
                </p>
             </div>
             <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 shadow-inner group-hover:border-slate-700 transition-colors">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Zap size={10} className="text-amber-500" /> Wager</p>
                <p className="text-sm font-black text-amber-500">{bonus.wagering_multiplier}x Multiplier</p>
             </div>
          </div>

          <div className="mt-8 flex items-center justify-between relative z-10">
             <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                   Ends: {new Date(bonus.valid_to).toLocaleDateString()}
                </span>
             </div>
             <button className="p-2.5 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white rounded-xl transition-all shadow-inner"><MoreVertical size={18} /></button>
          </div>
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
          <p className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">{value}</p>
       </div>
    </div>
  );
}
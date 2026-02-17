import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";

import { 
  BarChart3, Users, Globe, LayoutGrid, ArrowUpRight, 
  Activity, ShieldCheck, Gamepad2, ArrowLeft, User, AlertCircle
} from 'lucide-react';

const SuperAdminHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const fetchIntelligence = async (tenantId = null) => {
    try {
      
      // Ensure this URL matches your actual backend host/port
      const url = tenantId 
        ? `/super-admin/analytics/intelligence?tenant_id=${tenantId}`
        : `/super-admin/analytics/intelligence`;
      
const response = await api.get(url);
      
      // Debugging: Check your console to see what the backend is actually sending
      console.log("Analytics Data Received:", response.data);

      if (response.data && response.data.kpis) {
        setData(response.data);
        setError(null);
      } else {
        throw new Error("Invalid data structure received from server");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Failed to connect to the analytics server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence(selectedTenantId);
    const interval = setInterval(() => fetchIntelligence(selectedTenantId), 30000);
    return () => clearInterval(interval);
  }, [selectedTenantId]);

  if (loading) return (
    <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center text-[#00f2fe]">
      <Activity className="animate-spin mb-4" size={40} />
      <span className="font-mono tracking-widest">INITIALIZING GLOBAL AUDIT...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center text-red-400 p-4 text-center">
      <AlertCircle size={48} className="mb-4" />
      <h2 className="text-xl font-bold mb-2">SYSTEM OFFLINE</h2>
      <p className="text-sm text-slate-500 max-w-md">{error}</p>
      <button 
        onClick={() => { setLoading(true); fetchIntelligence(); }}
        className="mt-6 px-6 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all"
      >
        RETRY CONNECTION
      </button>
    </div>
  );

  // Use Optional Chaining (?.) to prevent crashes if a property is missing
  const kpis = data?.kpis || {};

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-200 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#00f2fe] mb-2">
            <Activity size={18} className="animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">
              {data?.is_tenant_view ? "Tenant Isolated Stream" : "Global Platform Stream"}
            </span>
          </div>
          <div className="flex items-center gap-4">
             {data?.is_tenant_view && (
               <button onClick={() => setSelectedTenantId(null)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                 <ArrowLeft size={20} />
               </button>
             )}
             <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">
              {data?.is_tenant_view ? "Tenant" : "Platform"} <span className="text-[#00f2fe] not-italic">Intelligence</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Top KPI Row with Fallback values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="NET REVENUE (GGR)" value={`$${(kpis.ggr || 0).toLocaleString()}`} subtext="Total Profit" icon={<LayoutGrid size={20} />} trend="+12%"/>
        <StatCard label="TOTAL VOLUME" value={`$${(kpis.volume || 0).toLocaleString()}`} subtext="Total Stakes" icon={<Activity size={20} />} trend="+8%"/>
        <StatCard label="TOTAL DEPOSITS" value={`$${(kpis.deposits || 0).toLocaleString()}`} subtext="Cash Inflow" icon={<Users size={20} />} status="STABLE"/>
        <StatCard label="AVERAGE RTP" value={`${kpis.rtp || 0}%`} subtext="House Edge" icon={<ShieldCheck size={20} />} status="OPTIMIZED"/>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SmallStat icon={<Users size={16}/>} label="Active Players" value={kpis.players || 0} />
        <SmallStat icon={<LayoutGrid size={16}/>} label="Active Tenants" value={kpis.tenants || 0} />
        <SmallStat icon={<Gamepad2 size={16}/>} label="Game Providers" value={kpis.providers || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0b1221]/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase mb-6 text-[#00f2fe]">
            <BarChart3 size={18} /> {data?.is_tenant_view ? "Top Games" : "Top Performing Tenants"}
          </h3>
          <div className="space-y-3">
            {(data?.top_list || []).map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => !data?.is_tenant_view && setSelectedTenantId(item.id)}
                className={`flex items-center justify-between p-4 bg-[#0f172a]/40 border border-transparent rounded-xl transition-all ${!data?.is_tenant_view ? 'hover:border-[#00f2fe]/50 cursor-pointer' : ''}`}
              >
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
                <span className="text-[#00f2fe] font-mono font-bold">${(item.val || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0b1221]/50 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase mb-6"><Globe size={18} className="text-[#00f2fe]" /> Regional GGR</h3>
            <div className="space-y-4">
              {(data?.regions || []).map((r, i) => (
                <RegionBar key={i} country={r.country} amount={`$${(r.revenue || 0).toLocaleString()}`} percent={50} />
              ))}
            </div>
          </div>

          <div className="bg-[#0b1221]/50 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase mb-6"><User size={18} className="text-[#00f2fe]" /> Top Staked Players</h3>
            <div className="space-y-3">
              {(data?.top_players || []).map((p, i) => (
                <div key={i} className="flex justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{p.name}</span>
                  <span className="font-mono text-[#00f2fe]">${(p.staked || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... keep SmallStat, StatCard, and RegionBar components as defined previously ...

// Component helpers
const StatCard = ({ label, value, subtext, icon, status, trend }) => (
  <div className="bg-[#0b1221]/50 border border-slate-800/50 rounded-2xl p-6 hover:border-[#00f2fe]/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800/40 rounded-lg text-[#00f2fe]">{icon}</div>
      {status && <span className="text-[9px] font-black bg-[#00f2fe]/10 text-[#00f2fe] px-2 py-0.5 rounded border border-[#00f2fe]/20">{status}</span>}
      {trend && <span className="text-[10px] font-bold text-[#00f2fe] flex items-center gap-0.5"><ArrowUpRight size={12}/> {trend}</span>}
    </div>
    <p className="text-[10px] font-bold text-slate-500 tracking-widest mb-1 uppercase">{label}</p>
    <p className="text-2xl font-mono font-bold text-white mb-1">{value}</p>
    <p className="text-[10px] text-slate-600 uppercase tracking-tighter">{subtext}</p>
  </div>
);

const SmallStat = ({ icon, label, value }) => (
  <div className="bg-[#0f172a]/40 border border-slate-800/50 rounded-xl p-4 flex items-center gap-4">
    <div className="text-[#00f2fe]">{icon}</div>
    <div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-mono font-bold">{value}</p>
    </div>
  </div>
);

const RegionBar = ({ country, amount, percent }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold uppercase">
      <span>{country}</span>
      <span className="text-slate-400">{amount}</span>
    </div>
    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full bg-[#00f2fe] transition-all duration-1000" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default SuperAdminHome;
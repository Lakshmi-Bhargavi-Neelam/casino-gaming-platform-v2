import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Trophy, Users, Activity, Clock, 
  BarChart3, RefreshCcw, User, 
  CheckCircle2, AlertCircle, Coins 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JackpotRegistry() {
  const [jackpots, setJackpots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistry = async () => {
    try {
      const res = await api.get('/tenant/jackpots');
      setJackpots(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRegistry(); }, []);

  const handleManualDraw = async (id) => {
    if (!window.confirm("Perform random winner selection now?")) return;
    try {
      await api.post(`/tenant/jackpots/${id}/draw-winner`);
      toast.success("Draw successful! Winner has been credited.");
      fetchRegistry();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Draw logic failed");
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center min-h-[400px]">
       <RefreshCcw className="animate-spin text-amber-500" size={40} />
       <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-4">Syncing Prize Ledger...</p>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 📊 SUMMARY HUD */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4 italic uppercase">
             <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <BarChart3 className="text-amber-500 w-8 h-8" />
             </div>
             Prize <span className="text-amber-500">Registry</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium ml-1">Live tracking of global pools and verified distribution history.</p>
        </div>
      </header>

      {/* 🏦 LIVE POOLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {jackpots.filter(j => j.status === 'ACTIVE').map((jp, index) => (
          <div key={jp.jackpot_id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-colors" />
            
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <h3 className="text-xl font-black text-white uppercase italic">{jp.jackpot_name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">REF: {jp.jackpot_id.slice(0, 14)}</p>
               </div>
               <button 
                onClick={() => handleManualDraw(jp.jackpot_id)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95"
               >
                 Draw Winner
               </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 relative z-10">
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Activity size={10} className="text-teal-400" /> Current Pool
                  </p>
                  <p className="text-2xl font-black text-white tracking-tighter">${Number(jp.current_amount).toLocaleString()}</p>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} className="text-amber-400" /> Last Win
                  </p>
                  <p className="text-sm font-bold text-slate-400 mt-1">{jp.last_won_at ? new Date(jp.last_won_at).toLocaleDateString() : 'Never Won'}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🏆 WINNERS LOG */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
               <Trophy className="text-amber-500" size={20} /> Verified Payout Log
            </h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-900/40">
                     <th className="px-8 py-5">Winner Identity</th>
                     <th className="px-8 py-5">Prize Amount</th>
                     <th className="px-8 py-5">Campaign</th>
                     <th className="px-8 py-5 text-right">Ledger Time</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                  {jackpots.some(j => j.status === 'COMPLETED') ? (
                    /* This would normally fetch from a separate jackpot_wins table, 
                       mocking logic based on completed status for now */
                    <tr className="group hover:bg-slate-800/50 transition-colors">
                        <td colSpan="4" className="px-8 py-10 text-center text-slate-600 font-bold uppercase text-[10px]">
                           Integration with jackpot_wins table required for history
                        </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center flex flex-col items-center gap-2 opacity-20">
                         <Coins size={48} className="text-slate-500" />
                         <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No payout records on this tenant ledger</p>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
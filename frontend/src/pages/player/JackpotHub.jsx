import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Trophy, TrendingUp, Users, Clock, Plus, Loader2, Sparkles, Zap, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function JackpotHub() {
  const [jackpots, setJackpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { balance, updateBalance } = useAuth();

  const fetchJackpots = async () => {
    try {
      const res = await api.get('/player/jackpots/active');
      setJackpots(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJackpots(); }, []);

  const handleContribute = async (id, amount) => {
    try {
      const res = await api.post(`/player/jackpots/${id}/contribute`, { amount });
      toast.success("Pool increased! Contribution recorded.");
      fetchJackpots();
      // Sync wallet balance
      const walletRes = await api.get('/gameplay/wallet/dashboard');
      updateBalance(walletRes.data.balance);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Transaction failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="animate-spin text-amber-500" size={48} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Prize Pools...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
             <Trophy className="text-amber-500" size={44} />
             Jackpot <span className="text-amber-500">Arena</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2 tracking-widest uppercase text-xs">Community pools & exclusive tenant prize draws</p>
        </div>
      </header>

      {jackpots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {jackpots.map((jp, index) => (
            <div 
              key={jp.jackpot_id} 
              className="group relative bg-[#0f172a] border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl hover:border-amber-500/30 transition-all duration-500"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
            >
              <div className="absolute top-6 right-8">
                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                   jp.jackpot_type === 'FIXED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                 }`}>
                   {jp.jackpot_type}
                 </span>
              </div>

              <div>
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Zap className={jp.jackpot_type === 'FIXED' ? 'text-indigo-400' : 'text-teal-400 animate-pulse'} size={32} />
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2 leading-none">{jp.jackpot_name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                   <span className="text-teal-500 font-black text-lg">$</span>
                   <h2 className="text-5xl font-black text-white tracking-tighter tabular-nums animate-pulse">
                     {Number(jp.current_amount).toLocaleString()}
                   </h2>
                </div>

                {jp.jackpot_type === 'SPONSORED' && jp.deadline && (
                  <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-8 flex items-center gap-4">
                     <Clock className="text-amber-500 animate-spin-slow" size={20} />
                     <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Draw Closes In</p>
                        <p className="text-sm font-bold text-slate-200">{new Date(jp.deadline).toLocaleDateString()} at {new Date(jp.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </div>
                  </div>
                )}
              </div>

              {jp.jackpot_type === 'SPONSORED' ? (
                <button 
                  onClick={() => {
                    const amt = prompt("Enter contribution amount ($):");
                    if(amt) handleContribute(jp.jackpot_id, parseFloat(amt));
                  }}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all"
                >
                   Contribute to Pool
                </button>
              ) : (
                <div className="py-5 text-center bg-slate-950/50 rounded-2xl border border-slate-800">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Auto-drawing every {jp.reset_cycle.toLowerCase()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center text-center">
           <Trophy size={64} className="text-slate-800 mb-4 opacity-20" />
           <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">No Active Jackpots in this Territory</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
}
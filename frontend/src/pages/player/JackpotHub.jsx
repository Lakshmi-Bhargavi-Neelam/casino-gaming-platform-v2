import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { 
  Trophy, TrendingUp, Users, Clock, Plus, 
  Loader2, Sparkles, Zap, Coins, Star, Activity,
  ChevronRight, X, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import JackpotCard from '../../components/jackpots/JackpotCard';
import ContributeModal from '../../components/jackpots/ContributeModal';

export default function JackpotHub() {
  const [jackpots, setJackpots] = useState([]);
  const [history, setHistory] = useState({ recent_winners: [], my_wins: [] });
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  
  // Modal State
  const [selectedJackpot, setSelectedJackpot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🎯 Get active context from Auth
  const { activeTenantId, updateBalance } = useAuth();

  const fetchData = useCallback(async () => {
    if (!activeTenantId) return;
    
    try {
      // 🎯 Pass tenant_id to isolate prizes to the current casino floor
      const [jackpotRes, historyRes] = await Promise.all([
        api.get(`/player/jackpots/active?tenant_id=${activeTenantId}`),
        api.get(`/player/jackpots/history?tenant_id=${activeTenantId}`)
      ]);
      setJackpots(jackpotRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Vault sync error");
    } finally {
      setLoading(false);
    }
  }, [activeTenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenContribute = (jackpot) => {
    setSelectedJackpot(jackpot);
    setIsModalOpen(true);
  };

  const handleConfirmContribution = async (amount) => {
    setContributing(true);
    try {
      // 🎯 Send contribution with tenant context
      await api.post(`/player/jackpots/${selectedJackpot.jackpot_id}/contribute?tenant_id=${activeTenantId}`, { 
        amount: parseFloat(amount) 
      });
      
      toast.success("Pool boosted! Your contribution is registered.");
      setIsModalOpen(false);
      fetchData(); // Refresh pools and history
      
      // Sync wallet balance
      const walletRes = await api.get(`/gameplay/wallet/dashboard?tenant_id=${activeTenantId}`);
      updateBalance(walletRes.data.balance);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Transaction failed");
    } finally {
      setContributing(false);
    }
  };

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

      {/* --- LIVE JACKPOTS GRID --- */}
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

      {/* --- 🎯 CHAMPIONS GALLERY SECTION (Win History) --- */}
      <section className="mt-20 space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
        <div className="flex items-center gap-4 px-4">
           <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
           <h2 className="text-xl font-black text-slate-500 uppercase tracking-[0.3em] italic">Champions Gallery</h2>
           <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Network Wins Feed */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-md">
            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} className="text-teal-500" /> Recent Network Wins
            </h3>
            <div className="space-y-4">
              {history.recent_winners.length > 0 ? history.recent_winners.map((win, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-teal-500/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-700">W</div>
                    <div>
                       <span className="text-xs font-bold text-slate-300 block leading-none">***{win.user.email.split('@')[0].slice(-3)}</span>
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Claimed {win.jackpot.jackpot_name}</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-black tracking-tighter tabular-nums group-hover:scale-110 transition-transform">${win.win_amount.toLocaleString()}</span>
                </div>
              )) : (
                <p className="text-[10px] text-slate-600 font-black uppercase text-center py-10 tracking-widest">Awaiting the first champion...</p>
              )}
            </div>
          </div>

          {/* 2. Personalized "Your Victories" Section */}
          <div className="bg-gradient-to-br from-teal-500/5 to-indigo-500/5 border border-teal-500/10 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Trophy size={140} className="text-teal-400" /></div>
            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Star size={14} className="text-amber-500 fill-amber-500" /> Your Victories
            </h3>
            <div className="space-y-4 relative z-10">
              {history.my_wins.length > 0 ? history.my_wins.map((win, i) => (
                 <div key={i} className="bg-teal-500 text-slate-950 p-5 rounded-2xl flex items-center justify-between shadow-xl transform hover:-translate-x-1 transition-all duration-300">
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest leading-none text-slate-950/70">Win Authenticated</p>
                      <p className="text-xs font-black mt-1 uppercase tracking-tighter">{new Date(win.won_at).toLocaleDateString(undefined, {month: 'long', day:'numeric'})}</p>
                   </div>
                   <p className="text-2xl font-black italic tracking-tighter tabular-nums">${win.win_amount.toLocaleString()}</p>
                 </div>
              )) : (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                   <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center opacity-30">
                      <Plus size={16} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">The Arena is calling for a hero...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

            {/* 🎯 THE CONTRIBUTION MODAL */}
      <ContributeModal 
        jackpot={selectedJackpot}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmContribution}
        loading={contributing}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
}
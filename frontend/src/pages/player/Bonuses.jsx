import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Gift, Zap, PlusCircle, Wallet, Sparkles, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Bonuses() {
  const [activeTab, setActiveTab] = useState('discover'); 
  const [available, setAvailable] = useState([]); 
  const [instances, setInstances] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, mineRes] = await Promise.all([
        api.get('/player/bonuses/available'), 
        api.get('/player/bonuses/my-active')   
      ]);
      setAvailable(availRes.data);
      setInstances(mineRes.data);
    } catch (err) {
      toast.error("Vault synchronization failed");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClaim = async (bonusId) => {
    try {
      await api.post(`/player/bonuses/available/${bonusId}/claim`);
      toast.success("Bonus Claimed! Check My Rewards.");
      fetchData();
      setActiveTab('my_rewards');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Claim failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-teal-500" size={48} />
      <p className="text-slate-500 mt-4 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-white italic uppercase flex items-center gap-4">
             <Gift className="text-teal-400" size={36} /> Bonus <span className="text-teal-400">Hub</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Manage and discover premium casino rewards</p>
        </div>

        <div className="bg-slate-900 p-1.5 rounded-2xl flex gap-2 border border-slate-800 shadow-2xl shrink-0">
          <TabBtn active={activeTab === 'discover'} label="Discover" count={available.length} onClick={() => setActiveTab('discover')} />
          <TabBtn active={activeTab === 'my_rewards'} label="My Rewards" count={instances.length} onClick={() => setActiveTab('my_rewards')} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeTab === 'discover' ? (
          available.length > 0 ? (
            available.map(promo => (
              <PromotionCard 
                key={promo.bonus_id} 
                promo={promo} 
                onClaim={() => handleClaim(promo.bonus_id)} 
                onDeposit={() => navigate('/player/wallet')} 
              />
            ))
          ) : (
            <EmptyState text="No active campaigns at the moment." />
          )
        ) : (
          instances.length > 0 ? (
            instances.map(inst => (
              <ActiveBonusCard key={inst.bonus_usage_id} inst={inst} onRefresh={fetchData} />
            ))
          ) : (
            <EmptyState text="You have no active wagering targets." />
          )
        )}
      </div>
    </div>
  );
}

// 🎁 PROMOTION CARD: Based on 'bonuses' table
function PromotionCard({ promo, onClaim, onDeposit }) {
  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-500 shadow-xl">
      <div className="absolute top-6 right-8 bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-500/20">
        {promo.bonus_type.replace('_', ' ')}
      </div>
      <div>
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
          <Sparkles className="text-indigo-400" size={28} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight leading-tight">{promo.bonus_name}</h3>
        <p className="text-slate-500 text-sm mt-4 leading-relaxed font-medium">
          {promo.bonus_type === 'DEPOSIT' 
            ? `Earn a ${promo.bonus_percentage}% match on your next deposit up to $${promo.max_bonus_amount}!`
            : `Instantly credit your vault with $${promo.bonus_amount} free play points.`}
        </p>
      </div>
      
      {promo.bonus_type === 'DEPOSIT' ? (
        <button onClick={onDeposit} className="mt-8 w-full bg-slate-800 hover:bg-teal-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-700">
          <Wallet size={18} /> Deposit to Unlock
        </button>
      ) : (
        <button onClick={onClaim} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
          <PlusCircle size={18} /> Claim Now
        </button>
      )}
    </div>
  );
}

// ⚡ ACTIVE BONUS CARD: Based on 'bonus_usage' table
function ActiveBonusCard({ inst, onRefresh }) {
  const progress = (inst.wagering_completed / inst.wagering_required) * 100;
  const isEligible = inst.status === 'eligible';

  const handleConvert = async () => {
    try {
      const res = await api.post(`/player/bonuses/${inst.bonus_usage_id}/convert`);
      toast.success(res.data.message);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Conversion failed");
    }
  };

  return (
    <div className={`bg-slate-900 border p-8 rounded-[2.5rem] transition-all duration-500 ${isEligible ? 'border-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.1)] animate-pulse' : 'border-slate-800'}`}>
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">${inst.bonus_amount} Active</h3>
        <span className="text-[9px] font-black text-teal-400 bg-teal-400/10 px-2 py-1 rounded border border-teal-400/20 uppercase">Wagering</span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
          <span className="text-xs font-mono text-teal-400 font-bold">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
          <div className="h-full bg-teal-500 shadow-[0_0_15px_#14b8a6] transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      {isEligible ? (
        <button onClick={handleConvert} className="mt-10 w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Convert to Cash
        </button>
      ) : (
        <div className="mt-10 flex items-center justify-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-950/50 py-4 rounded-xl border border-slate-900">
           <Lock size={14} className="text-slate-700" /> Locked Credits
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, label, count, onClick }) {
  return (
    <button onClick={onClick} className={`px-6 md:px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-teal-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
      {label} <span className="ml-1 opacity-50">({count})</span>
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="col-span-full py-24 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center text-center">
       <Sparkles size={48} className="text-slate-800 mb-4 opacity-20" />
       <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs italic">{text}</p>
    </div>
  );
}
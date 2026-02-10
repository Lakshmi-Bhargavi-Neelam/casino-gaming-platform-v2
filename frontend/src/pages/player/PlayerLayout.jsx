import { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Receipt } from "lucide-react";
import { Gift } from "lucide-react";


import { 
  Home, 
  History, 
  Wallet, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  TrendingUp,
  Activity,
  Trophy    // 🎯 Add this for the Jackpot Arena

} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/axios";

export default function PlayerLayout() {
  const { user, logout, balance, updateBalance } = useAuth();

  useEffect(() => {
    const fetchInitialBalance = async () => {
      if (balance > 0) return; 
      try {
        const res = await api.get('/gameplay/wallet/dashboard'); 
        if (res.data && res.data.balance !== undefined) {
          updateBalance(res.data.balance);
        }
      } catch (error) {
        console.error("Could not sync header balance", error);
      }
    };
    if (user) fetchInitialBalance();
  }, [user, balance, updateBalance]); 

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      isActive 
        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`;

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden">
      
      {/* 🔵 SIDEBAR: Cinematic Glass */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 relative z-20">
        
        {/* Brand Logo: High Energy */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 transform rotate-3">
              <span className="text-white text-xl font-black italic">X</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-tight tracking-tighter italic uppercase">
                Casino<span className="text-teal-400">X</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Premium Lobby</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> Gaming Zone
          </div>
          
          <NavLink to="/lobby" end className={navItemClass}>
            <Home size={20} className="group-hover:scale-110 transition-transform" /> 
            <span className="font-bold">Lobby</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>

          <NavLink to="/player/history" className={navItemClass}>
            <History size={20} /> 
            <span className="font-bold">My Bets</span>
          </NavLink>
 {/* 🎯 NEW: JACKPOT ARENA LINK */}
 <NavLink to="/player/jackpots" className={navItemClass}>
            <Trophy size={20} className="text-amber-500" /> 
            <span className="font-bold">Jackpot Arena</span>
          </NavLink>
          <div className="px-4 mt-8 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={12} /> Financials
          </div>

          <NavLink to="/player/wallet" className={navItemClass}>
            <Wallet size={20} /> 
            <span className="font-bold">Wallet</span>
          </NavLink>

          <NavLink to="/player/bonuses" className={navItemClass}>
  <Gift size={20} />
  <span className="font-bold">Bonuses</span>
</NavLink>


          <NavLink to="/player/transactions" className={navItemClass}>
  <Receipt size={20} />
  <span className="font-bold">Transactions</span>
</NavLink>

          
          <NavLink to="/player/kyc" className={navItemClass}>
            <ShieldCheck size={20} /> 
            <span className="font-bold">Identity (KYC)</span>
          </NavLink>
        </nav>

       {/* User Quick Info & Logout */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ⚪ MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070b14] relative">
        
        {/* BACKGROUND AMBIENT GLOWS */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        {/* HEADER: The Money Bar */}
        <header className="h-24 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-10 sticky top-0 z-10">
          
          {/* Wallet Section */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Current Credits</span>
              <div className="flex items-center gap-4 bg-slate-950/80 px-5 py-2.5 rounded-2xl border border-slate-700/50 shadow-inner group">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Zap className="text-teal-400 animate-pulse" size={18} />
                </div>
                <span className="font-mono text-2xl font-black text-white tracking-tighter group-hover:text-teal-400 transition-colors">
                  ${Number(balance || 0).toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>

            <NavLink 
              to="/player/wallet" 
              className="group relative px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <span className="relative z-10">Deposit Now</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          </div>

          {/* Player Profile Section */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Player</p>
              <p className="text-sm font-black text-white tracking-tight">{user?.username || 'Player'}</p>
            </div>
            
            <NavLink to="/player/kyc" className="relative group">
              <div className="absolute inset-0 bg-teal-400 blur-md opacity-0 group-hover:opacity-30 transition-opacity rounded-full"></div>
              <div className="relative h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 hover:border-teal-500/50 transition-all flex items-center justify-center font-black text-teal-400 shadow-xl overflow-hidden">
                {user?.username ? user.username[0].toUpperCase() : <User size={22} />}
                {/* Status Indicator */}
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-800 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </NavLink>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
}
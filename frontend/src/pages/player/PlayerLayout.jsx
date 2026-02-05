import { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
// 🆕 Added ShieldCheck for KYC
import { Home, History, Wallet, LogOut, User, ShieldCheck } from "lucide-react"; 
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
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
    }`;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* 🔵 Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 text-xl font-black italic text-indigo-500 border-b border-slate-800">
          🎰 GOLDEN CASINO
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/lobby" end className={navItemClass}>
            <Home size={20} /> Lobby
          </NavLink>
          <NavLink to="/player/history" className={navItemClass}>
            <History size={20} /> My Bets
          </NavLink>
          <NavLink to="/player/wallet" className={navItemClass}>
            <Wallet size={20} /> Wallet
          </NavLink>
          
          {/* 🆕 Identity / KYC Link */}
          <NavLink to="/player/kyc" className={navItemClass}>
            <ShieldCheck size={20} /> Identity (KYC)
          </NavLink>
        </nav>

        {/* 🚪 Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ⚪ Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
              <Wallet className="text-yellow-500" size={18} />
              <span className="font-mono font-bold text-yellow-500">
                ${Number(balance || 0).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
            <NavLink 
              to="/player/wallet" 
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold transition"
            >
              DEPOSIT
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Welcome back,</p>
              <p className="text-sm font-bold">{user?.username || 'Player'}</p>
            </div>
            {/* Avatar links to profile or KYC as well */}
            <NavLink to="/player/kyc" className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/40">
              <User size={20} />
            </NavLink>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
import { NavLink, Outlet } from "react-router-dom";
import { 
  Gamepad2, 
  Layers, 
  LogOut, 
  LayoutDashboard, 
  Users,
  Banknote, 
  ShieldCheck, 
  UserCog,
  ChevronRight,
  Activity
} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

export default function TenantConsoleLayout() {
  const { logout } = useAuth();

  // Updated Nav Styling for the Dark Theme
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">

      {/* 🔵 Sidebar: Glass-morphism Dark Slate */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 relative z-20 shadow-2xl">
        
        {/* Brand/Logo Section */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white text-xl font-black">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight tracking-tight">CasinoX</h1>
              <p className="text-[10px] text-teal-500 font-black uppercase tracking-[0.2em]">Tenant Console</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">General</div>
          
          <NavLink to="/console/dashboard" end className={navItemClass}>
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Dashboard</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>

          <NavLink to="/console/library" className={navItemClass}>
            <Gamepad2 size={20} />
            <span className="font-medium">Game Library</span>
          </NavLink>

          <NavLink to="/console/my-games" className={navItemClass}>
            <Layers size={20} />
            <span className="font-medium">Enabled Games</span>
          </NavLink>

          <div className="px-4 mt-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management</div>

          <NavLink to="/console/players" className={navItemClass}>
            <Users size={20} /> <span className="font-medium">Players</span>
          </NavLink>

          <NavLink to="/console/player-verification" className={navItemClass}>
            <ShieldCheck size={20} />
            <span className="font-medium">Verifications</span>
          </NavLink>

          <NavLink to="/console/withdrawals" className={navItemClass}>
            <Banknote size={20} />
            <span className="font-medium">Withdrawals</span>
          </NavLink>

          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <NavLink to="/console/my-verification" className={navItemClass}>
              <UserCog size={20} />
              <span className="font-medium">Business KYC</span>
            </NavLink>
          </div>
        </nav>

        {/* 🚪 Logout Section: Pushed to bottom */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform text-red-500/70 group-hover:text-red-500" />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ⚪ Main Content Area: Dark Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative">
        
        {/* Top Header: Glass-morphism Fixed Bar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center px-10 justify-between sticky top-0 z-10">
           <div className="flex items-center gap-2">
              <Activity size={16} className="text-teal-500" />
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Live Platform Stream
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Status</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">System Secure</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-teal-400 font-bold shadow-inner">
                A
              </div>
           </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
          
          {/* Animations for page transitions */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
import { NavLink, Outlet } from "react-router-dom";
import { 
  Gamepad2, 
  PlusCircle, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  Cpu,
  Activity
} from "lucide-react"; 
import { useAuth } from "../context/AuthContext";

export default function ProviderLayout() {
  const { logout } = useAuth();

  // Premium Nav Styling matching the Casino Dark Theme
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">

      {/* 🟣 Sidebar: Glass-morphism Dark Slate */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 relative z-20 shadow-2xl">
        
        {/* Brand/Logo Section */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white text-xl font-black">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight tracking-tight">GameStudio</h1>
              <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em]">Provider Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Studio Workspace</div>
          
          <NavLink to="/provider/dashboard" end className={navItemClass}>
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">My Game Library</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>

          <NavLink to="/provider/add-game" className={navItemClass}>
            <PlusCircle size={20} />
            <span className="font-medium">Submit New Game</span>
          </NavLink>

          <div className="px-4 mt-8 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance</div>

          <NavLink to="/provider/kyc" className={navItemClass}>
            <ShieldCheck size={20} />
            <span className="font-medium">Business KYC</span>
          </NavLink>
        </nav>

        {/* 🚪 Logout Section */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform text-red-500/70 group-hover:text-red-500" />
            <span className="font-bold">Sign Out</span>
          </button>
          
          <div className="mt-4 px-4 text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black">
            v2.4.0 Studio Build
          </div>
        </div>
      </aside>

      {/* ⚪ Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative">
        
        {/* Top Header: Glass-morphism Fixed Bar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center px-10 justify-between sticky top-0 z-10">
           <div className="flex items-center gap-3">
              <Cpu size={18} className="text-teal-500" />
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Engine Development Environment
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">API Status</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">Stable Connection</span>
                </div>
              </div>
              
              <div className="h-10 w-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-teal-400 font-black shadow-inner">
                S
              </div>
           </div>
        </header>

        {/* Content Area with Ambient Glow */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
          
          {/* Outlet Content with Slide Animation */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
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
import { NavLink, Outlet } from "react-router-dom";
import { 
  Gamepad2, 
  Layers, 
  LogOut, 
  LayoutDashboard, 
  Users,
  Banknote, // 🎯 New icon for Withdrawals
  ShieldCheck, // 🎯 ADD THIS
  UserCog
} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

export default function TenantConsoleLayout() {
  const { logout } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-indigo-800 text-white" 
        : "hover:bg-indigo-800 text-indigo-100"
    }`;

  return (
    <div className="flex h-screen bg-gray-100">

      {/* 🔵 Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0 shadow-xl">
        <div className="p-6 text-xl font-bold border-b border-indigo-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-inner">
            🎰
          </div>
          <span>Tenant Panel</span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          <NavLink to="/console/dashboard" end className={navItemClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/console/library" className={navItemClass}>
            <Gamepad2 size={18} />
            <span>Game Library</span>
          </NavLink>

          <NavLink to="/console/my-games" className={navItemClass}>
            <Layers size={18} />
            <span>My Enabled Games</span>
          </NavLink>

          {/* 🎯 New Players Link */}
          <NavLink to="/console/players" className={navItemClass}>
            <Users size={18} /> <span>Players</span>
          </NavLink>

          {/* 🎯 New: Player Document Verification Requests */}
          <NavLink to="/console/player-verification" className={navItemClass}>
            <ShieldCheck size={18} />
            <span>Player Verification</span>
          </NavLink>

          {/* 🎯 New: Admin's Own KYC submission (for Super Admin review) */}
          <div className="pt-4 mt-4 border-t border-indigo-800/50">
            <NavLink to="/console/my-verification" className={navItemClass}>
              <UserCog size={18} />
              <span>My Business KYC</span>
            </NavLink>
          </div>

          {/* 🎯 New Withdrawals Link */}
          <NavLink to="/console/withdrawals" className={navItemClass}>
            <Banknote size={18} />
            <div className="flex justify-between items-center w-full">
              <span>Withdrawals</span>
              {/* Optional: Add a subtle notification dot or badge here later */}
            </div>
          </NavLink>

        </nav>

        {/* 🚪 Logout Section - Pushed to bottom */}
        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-indigo-200 hover:text-white hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
          
          <div className="mt-4 px-4 text-[10px] uppercase tracking-widest text-indigo-400 font-black opacity-60">
            Tenant Management Console
          </div>
        </div>
      </aside>

      {/* ⚪ Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 relative">
        {/* Simple header for the main content area */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center px-8 justify-between">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Live Operations
           </div>
           <div className="flex items-center gap-4">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-500">System Online</span>
           </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
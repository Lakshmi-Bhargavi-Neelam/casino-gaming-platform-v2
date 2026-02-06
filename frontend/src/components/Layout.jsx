import { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, LogOut, Building2, Users, UserCog, Gamepad2,
  ChevronDown, ChevronRight, ClipboardList, Library, FileCheck,
  ShieldCheck, Bell, Search
} from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { logout, user } = useAuth(); 
  const location = useLocation();

  const isUserRegActive = location.pathname.includes('/users');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(isUserRegActive);

  // --- STYLING LOGIC ---
  const navItemClass = ({ isActive }) =>
    clsx(
      "flex items-center space-x-3 px-4 py-3 rounded-r-xl transition-all duration-300 w-full mb-1 border-l-4 group relative overflow-hidden",
      isActive 
        ? "border-emerald-500 bg-white/5 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
        : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
    );

  const subItemClass = ({ isActive }) =>
    clsx(
      "flex items-center space-x-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm",
      isActive ? "text-emerald-400 font-medium" : "text-gray-500 hover:text-white"
    );

  return (
    <div className="flex h-screen bg-[#0B0F1A] font-sans text-gray-100 overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0F1422] border-r border-white/5 flex flex-col flex-shrink-0 z-20 relative">
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-lg text-white">C</span>
          </div>
          <div>
            <h2 className="font-bold tracking-tight text-lg text-white">CasinoAdmin</h2>
            <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Tenant Portal'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-0 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          
          <div className="px-6 mb-2 text-xs font-bold text-gray-600 uppercase tracking-widest">Overview</div>
          
          <NavLink 
            to={user?.role === 'SUPER_ADMIN' ? "/dashboard/super-admin-home" : "/dashboard/tenant-overview"} 
            className={navItemClass}
          >
            <LayoutDashboard size={20} className="group-hover:text-emerald-400 transition-colors" />
            <span>Dashboard</span>
          </NavLink>

          {/* SUPER ADMIN ONLY */}
          {user?.role === 'SUPER_ADMIN' && (
            <>
              <div className="px-6 mt-8 mb-2 text-xs font-bold text-gray-600 uppercase tracking-widest">Management</div>
              
              <NavLink to="/dashboard/kyc-requests" className={navItemClass}>
                <FileCheck size={20} className="group-hover:text-emerald-400 transition-colors" />
                <span>Document Requests</span>
              </NavLink>

              <NavLink to="/dashboard/tenant-registration" className={navItemClass}>
                <Building2 size={20} className="group-hover:text-emerald-400 transition-colors" />
                <span>Tenant Registration</span>
              </NavLink>

              <NavLink to="/dashboard/game-requests" className={navItemClass}>
                <ClipboardList size={20} className="group-hover:text-emerald-400 transition-colors" />
                <span>Game Requests</span>
              </NavLink>

              {/* Dropdown */}
              <div className="mt-1">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={clsx(
                    "flex items-center justify-between w-full px-4 py-3 rounded-r-xl transition-colors border-l-4 border-transparent group hover:bg-white/5",
                    isUserRegActive ? "text-white" : "text-gray-400"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Users size={20} className="group-hover:text-emerald-400 transition-colors" />
                    <span>User Registration</span>
                  </div>
                  {isUserMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isUserMenuOpen && (
                  <div className="bg-black/20 py-2 mb-2 border-y border-white/5">
                    <NavLink to="/dashboard/users/tenant-admin" className={subItemClass}>
                      <UserCog size={16} />
                      <span>Tenant Admin</span>
                    </NavLink>
                    <NavLink to="/dashboard/users/game-provider" className={subItemClass}>
                      <Gamepad2 size={16} />
                      <span>Game Provider</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TENANT ADMIN ONLY */}
          {user?.role === 'TENANT_ADMIN' && (
            <>
              <div className="px-6 mt-8 mb-2 text-xs font-bold text-gray-600 uppercase tracking-widest">Operations</div>
              <NavLink to="/dashboard/player-verification" className={navItemClass}>
                <ShieldCheck size={20} className="group-hover:text-emerald-400 transition-colors" />
                <span>Player Verification</span>
              </NavLink>
              <NavLink to="/dashboard/manage-games" className={navItemClass}>
                <Library size={20} className="group-hover:text-emerald-400 transition-colors" />
                <span>Game Library</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-white/5 bg-[#0A0E17]">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-900/50">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                <Link to="/dashboard/my-documents" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">My Profile</Link>
             </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Gradients for the main area */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
        </div>

        {/* Header */}
        <header className="h-20 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 sticky top-0">
          
          {/* Search */}
          <div className="relative w-96 hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131b2c] border border-white/5 focus:border-emerald-500/50 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
             <button className="relative text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
             </button>
             <div className="h-6 w-px bg-white/10"></div>
             <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-300 hidden sm:block">
                  {user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Tenant Manager'}
                </span>
             </div>
          </div>
        </header>

        {/* Outlet Wrapper */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-emerald-600/20">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
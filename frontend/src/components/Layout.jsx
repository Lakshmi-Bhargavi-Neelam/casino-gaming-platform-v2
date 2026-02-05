import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  LogOut,
  Building2,
  Users,
  UserCog,
  Gamepad2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Library,
  FileCheck, // 🎯 New Icon for KYC
  ShieldCheck // 🎯 New Icon for Player Verification
} from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { logout, user } = useAuth(); 
  const location = useLocation();

  const isUserRegActive = location.pathname.includes('/users');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(isUserRegActive);

  const navItemClass = ({ isActive }) =>
    clsx(
      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full",
      isActive ? "bg-indigo-800 text-white" : "text-indigo-100 hover:bg-indigo-800"
    );

  const subItemClass = ({ isActive }) =>
    clsx(
      "flex items-center space-x-3 pl-12 pr-4 py-2 rounded-lg transition-colors text-sm",
      isActive ? "text-white font-medium" : "text-indigo-300 hover:text-white"
    );

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0">
        
        <div className="p-6 border-b border-indigo-800">
          <h2 className="text-xl font-bold tracking-tight">
            {user?.role === 'SUPER_ADMIN' ? 'Casino Admin' : 'Tenant Admin'}
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          <NavLink 
            to={user?.role === 'SUPER_ADMIN' ? "/dashboard/tenant-registration" : "/dashboard/tenant-overview"} 
            end 
            className={navItemClass}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          {/* --- SUPER ADMIN ONLY NAVIGATION --- */}
          {user?.role === 'SUPER_ADMIN' && (
            <>
              {/* 🎯 SUPER ADMIN KYC PATH */}
              <NavLink to="/dashboard/kyc-requests" className={navItemClass}>
                <FileCheck size={20} />
                <span>Document Requests</span>
              </NavLink>

              <NavLink to="/dashboard/tenant-registration" className={navItemClass}>
                <Building2 size={20} />
                <span>Tenant Registration</span>
              </NavLink>

              <NavLink to="/dashboard/game-requests" className={navItemClass}>
                <ClipboardList size={20} />
                <span>Game Requests</span>
              </NavLink>

              {/* ... User Registration Dropdown ... */}
                <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={clsx(
                    "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-indigo-100 hover:bg-indigo-800",
                    isUserRegActive && "bg-indigo-800"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Users size={20} />
                    <span>User Registration</span>
                  </div>
                  {isUserMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {isUserMenuOpen && (
                  <div className="mt-1 space-y-1">
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

          {/* --- TENANT ADMIN ONLY NAVIGATION --- */}
          {user?.role === 'TENANT_ADMIN' && (
            <>
              {/* 🎯 TENANT ADMIN PLAYER KYC PATH */}
              <NavLink to="/dashboard/player-verification" className={navItemClass}>
                <ShieldCheck size={20} />
                <span>Player Verification</span>
              </NavLink>

              <NavLink to="/dashboard/manage-games" className={navItemClass}>
                <Library size={20} />
                <span>Game Library</span>
              </NavLink>
            </>
          )}

          {/* --- SHARED SELF-UPLOAD (For Admin/Provider to upload their own docs) --- */}
          <div className="pt-4 mt-4 border-t border-indigo-800/50">
             <NavLink to="/dashboard/my-documents" className={navItemClass}>
                <Users size={20} />
                <span>My KYC Profile</span>
              </NavLink>
          </div>
        </nav>

        {/* ... Logout Button ... */}
                <div className="p-4 border-t border-indigo-800">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
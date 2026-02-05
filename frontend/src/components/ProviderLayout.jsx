import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 🆕 Added ShieldCheck for KYC
import { LayoutDashboard, LogOut, Gamepad2, PlusCircle, ShieldCheck } from 'lucide-react'; 
import clsx from 'clsx';

export default function ProviderLayout() {
  const { logout } = useAuth();

  const navItemClass = ({ isActive }) =>
    clsx(
      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
      isActive ? "bg-purple-800 text-white" : "text-purple-100 hover:bg-purple-800"
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-purple-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-purple-800">
          <h2 className="text-xl font-bold tracking-tight">Provider Portal</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/provider/dashboard" end className={navItemClass}>
            <LayoutDashboard size={20} />
            <span>My Games</span>
          </NavLink>
          
          <NavLink to="/provider/add-game" className={navItemClass}>
            <PlusCircle size={20} />
            <span>Submit New Game</span>
          </NavLink>

          {/* 🆕 Business KYC Link */}
          <NavLink to="/provider/kyc" className={navItemClass}>
            <ShieldCheck size={20} />
            <span>Business KYC</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-purple-800">
          <button 
            onClick={logout} 
            className="flex items-center space-x-3 px-4 py-3 w-full text-purple-200 hover:bg-purple-800 rounded-lg transition-colors group"
          >
            <LogOut size={20} className="group-hover:text-white" />
            <span className="group-hover:text-white">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {/* Renders MyGames, AddGame, or ProviderKYC */}
        <Outlet />
      </main>
    </div>
  );
}
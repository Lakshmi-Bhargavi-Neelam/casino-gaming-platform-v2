import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Tenant Console
import TenantConsoleLayout from './pages/tenant/TenantConsoleLayout';
import TenantGameLibrary from './pages/tenant/TenantGameLibrary';
import TenantEnabledGames from './pages/tenant/TenantEnabledGames';
import PlayerVerification from './pages/tenant/PlayerVerification';
import MyVerification from './pages/tenant/MyVerification';
import TenantDashboard from './pages/tenant/Dashboard';
import BonusManagement from "./pages/tenant/BonusManagement";
import BonusList from "./pages/tenant/BonusList";

// Jackpot Pages
import JackpotManagement from './pages/tenant/JackpotManagement';
import JackpotRegistry from './pages/tenant/JackpotRegistry';
import JackpotHub from './pages/player/JackpotHub';

// Public
import Login from './pages/Login';
import LandingPage from './pages/public/LandingPage';
import PlayerRegistration from './pages/public/PlayerRegistration';

// Admin Layout
import Layout from './components/Layout';


// Provider Layout
import ProviderLayout from './components/ProviderLayout';


import PlayerLayout from './pages/player/PlayerLayout';
import PlayerLobby from './pages/player/PlayerLobby';
import GamePlay from './pages/player/GamePlay';
// import GamePlayPage from './pages/player/GamePlayPage';
import WalletPage from './pages/player/WalletPage';
import PlayerKYC from './pages/player/PlayerKYC';
import History from './pages/player/History';
import TransactionsPage from './pages/player/TransactionsPage';
import Bonuses from "./pages/player/Bonuses";
import BonusDetails from "./pages/player/BonusDetails";
import TenantSelector from "./pages/player/TenantSelector";
import PlayerAnalytics from './pages/player/PlayerAnalytics'; // 🎯 Add this import




// Admin Pages
import SuperAdminHome from './pages/admin/SuperAdminHome';
import TenantRegistration from './pages/admin/TenantRegistration';
import TenantAdminForm from './pages/admin/TenantAdminForm';
import GameProviderForm from './pages/admin/GameProviderForm';
import GameRequests from './pages/admin/GameRequests';
import TenantWithdrawals from "./pages/tenant/TenantWithdrawals";
import TenantPlayers from "./pages/tenant/TenantPlayers";
import KYCRequests from './pages/admin/KYCRequests';


// Provider Pages
import AddGame from './pages/provider/AddGame';
import MyGames from './pages/provider/MyGames';
import ProviderKYC from './pages/provider/ProviderKYC';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>

          {/* 🌍 PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-player" element={<PlayerRegistration />} />

          {/* 🟥 SUPER ADMIN DASHBOARD */}

          
          <Route path="/dashboard" element={<Layout />}>

  {/* 👇 DEFAULT ROUTE */}
  <Route
    index
    element={<Navigate to="super-admin-home" replace />}
  />

  <Route path="super-admin-home" element={<SuperAdminHome />} />
  <Route path="kyc-requests" element={<KYCRequests />} />
  <Route path="tenant-registration" element={<TenantRegistration />} />
  <Route path="game-requests" element={<GameRequests />} />
  <Route path="users/tenant-admin" element={<TenantAdminForm />} />
  <Route path="users/game-provider" element={<GameProviderForm />} />

</Route>

          {/* 🟦 TENANT CONSOLE */}
          <Route
            path="/console"
            element={
              <ProtectedRoute>
                <TenantConsoleLayout />
              </ProtectedRoute>
            }
          >
 <Route
    index
    element={<Navigate to="dashboard" replace />}
  />
  
  {/* The rest of your routes */}
  <Route path="dashboard" element={<TenantDashboard />} />
  <Route path="bonus-management" element={<BonusManagement />} />
  <Route path="bonuses" element={<BonusList />} />   {/* ✅ ADD THIS */}
  <Route path="jackpot-management" element={<JackpotManagement />} />
<Route path="jackpot-registry" element={<JackpotRegistry />} />
            <Route path="library" element={<TenantGameLibrary />} />
            <Route path="my-games" element={<TenantEnabledGames />} />
            <Route path="players" element={<TenantPlayers />} />
            <Route path="player-verification" element={<PlayerVerification />} /> {/* 🎯 New */}
  <Route path="my-verification" element={<MyVerification />} />
            <Route path="withdrawals" element={<TenantWithdrawals />} />
          </Route>

          {/* 🟩 PROVIDER AREA */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute>
                <ProviderLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<MyGames />} />
            <Route path="add-game" element={<AddGame />} />
            <Route path="kyc" element={<ProviderKYC />} />
          </Route>

{/* 🎯 1. Standalone Marketplace Route (No Sidebar) */}
<Route 
  path="/player/casinos" 
  element={
    <ProtectedRoute>
      <TenantSelector />
    </ProtectedRoute>
  } 
/>
{/* 🎮 PLAYER AREA (New Nested Routes) */}
          <Route
            path="/player"
            element={
              <ProtectedRoute>
                <PlayerLayout />
              </ProtectedRoute>
            }
          >
              <Route path="casinos" element={<TenantSelector />} /> 

            {/* These render inside the <Outlet /> of PlayerLayout */}
            <Route path="lobby" element={<PlayerLobby />} />
                      <Route path="play/:gameId" element={<GamePlay />} /> 
  
<Route path="wallet" element={<WalletPage />} />
  <Route path="analytics" element={<PlayerAnalytics />} />

<Route path="bonuses" element={<Bonuses />} />
<Route path="bonuses/:bonusUsageId" element={<BonusDetails />} />
<Route path="jackpots" element={<JackpotHub />} />
<Route path="kyc" element={<PlayerKYC />} />
<Route path="history" element={<History />} />
  <Route path="transactions" element={<TransactionsPage />} />

          </Route>

          {/* Redirect to lobby if someone just goes to /lobby directly */}
          <Route path="/lobby" element={<Navigate to="/player/lobby" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

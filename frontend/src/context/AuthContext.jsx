import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 
import api from '../lib/axios'; // 🎯 Ensure api is imported

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  
  // 🎯 1. Track the active casino session
  const [activeTenantId, setActiveTenantId] = useState(localStorage.getItem('active_tenant_id'));
  
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      try { return jwtDecode(savedToken); } catch (e) { return null; }
    }
    return null;
  });

  const navigate = useNavigate();

  // 🎯 2. Logic to switch the active Casino context
// In AuthContext.jsx
const selectTenant = (tenantId) => {
    localStorage.setItem('active_tenant_id', tenantId);
    setActiveTenantId(tenantId); // 🎯 This triggers the refresh in Bonuses.jsx
};

  // Helper to update balance (used after bets/wins)
  const updateBalance = (newBalance) => {
    setBalance(newBalance);
  };

  // 🎯 3. Sync balance whenever the User OR the active Casino changes
  useEffect(() => {
    const syncBalance = async () => {
      if (token && activeTenantId && user?.role === 'PLAYER') {
        try {
          // Fetch balance for the SPECIFIC active casino
          const res = await api.get(`/gameplay/wallet/dashboard?tenant_id=${activeTenantId}`);
          setBalance(res.data.balance);
        } catch (err) {
          console.error("Wallet sync failed", err);
          // If 403/404, the player might not have entered this casino properly
        }
      }
    };
    syncBalance();
  }, [token, activeTenantId, user]);

  const login = (accessToken) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    
    try {
      const decoded = jwtDecode(accessToken);
      setUser(decoded);

      if (decoded.role === 'GAME_PROVIDER') navigate('/provider/dashboard');
      else if (decoded.role === 'TENANT_ADMIN') navigate('/console/dashboard');
      else if (decoded.role === 'SUPER_ADMIN') navigate('/dashboard');
      else if (decoded.role === 'PLAYER') navigate('/player/casinos'); 
      else navigate('/'); 
    } catch (e) {
      navigate('/login');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('active_tenant_id'); // 🎯 Clear casino context
    setToken(null);
    setUser(null);
    setActiveTenantId(null);
    setBalance(0);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      balance,
      activeTenantId,   // 🎯 Provide active tenant globally
      selectTenant,     // 🎯 Provide selector globally
      updateBalance,
      isAuthenticated: !!token, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
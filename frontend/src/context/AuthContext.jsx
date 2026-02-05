import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [balance, setBalance] = useState(0); // 💰 Global balance state
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      try {
        return jwtDecode(savedToken);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const navigate = useNavigate();

  // Helper to update balance from any component (like GamePlay)
  const updateBalance = (newBalance) => {
    setBalance(newBalance);
  };

  const login = (accessToken) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    
    try {
      const decoded = jwtDecode(accessToken);
      setUser(decoded);

      const role = decoded.role;
      
      if (role === 'GAME_PROVIDER') {
        navigate('/provider/dashboard');
      } else if (role === 'TENANT_ADMIN') {
          navigate('/console/library');
      } else if (role === 'SUPER_ADMIN') {
        navigate('/dashboard/tenant-registration'); 
      } else if (role === 'PLAYER') {
        navigate('/lobby');
      } else {
        navigate('/'); 
      }
    } catch (e) {
      console.error("Token decode failed", e);
      navigate('/login');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setBalance(0);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      balance,        // 👈 Shared balance
      updateBalance,  // 👈 Shared update function
      isAuthenticated: !!token, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
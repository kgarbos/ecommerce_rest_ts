// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  token: string | null; // Add this line
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  token: null, // Add this line
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null); // Add this line

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken); // Update the token state
    }
  }, []);

  const login = (loginToken: string) => {
    localStorage.setItem('token', loginToken);
    setIsAuthenticated(true);
    setToken(loginToken); // Update the token state
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setToken(null); // Update the token state
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
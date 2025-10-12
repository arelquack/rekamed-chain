'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  role: string | null;
  user: User | null;
  isLoading: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decodedToken = jwtDecode<User & { exp: number }>(storedToken);

        if (!decodedToken || !decodedToken.exp) throw new Error("Invalid token");

        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setRole(decodedToken.role);
          setUser({
            id: decodedToken.id,
            name: decodedToken.name,
            role: decodedToken.role,
          });
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedToken = jwtDecode<User & { exp: number }>(newToken);

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setRole(decodedToken.role);
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        role: decodedToken.role,
      });
    } catch (error) {
      console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const value = { token, role, user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
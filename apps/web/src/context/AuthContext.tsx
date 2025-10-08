// apps/web/src/context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT jwt-decode

// 2. DEFINISIKAN TIPE UNTUK DATA PENGGUNA DARI JWT
interface User {
  id: string;
  name: string;
  role: string;
}

// 3. TAMBAHKAN 'user' KE DALAM TIPE CONTEXT
interface AuthContextType {
  token: string | null;
  role: string | null;
  user: string | null; // <-- TAMBAHKAN INI
  isLoading: boolean;
  login: (token: string, role: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null); // <-- 4. TAMBAHKAN STATE UNTUK USER
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // 5. DECODE TOKEN SAAT APLIKASI DIMUAT
        const decodedToken: any = jwtDecode(storedToken);
        
        // Cek jika token masih valid (belum expired)
        if (decodedToken.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setRole(decodedToken.role);
            // Simpan data user dari token
            setUser(decodedToken.name);
        } else {
            // Jika token sudah expired, hapus dari localStorage
            localStorage.removeItem('token');
        }
      }
    } catch (error) {
        // Jika token tidak valid, hapus
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token');
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
        // 6. DECODE TOKEN SAAT LOGIN
        const decodedToken: any = jwtDecode(newToken);
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setRole(decodedToken.role);
        // Simpan data user dari token
        setUser(decodedToken.name);
    } catch (error) {
        console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    setUser(null); // <-- 7. HAPUS DATA USER SAAT LOGOUT
  };

  // 8. SEDIAKAN 'user' DALAM VALUE PROVIDER
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
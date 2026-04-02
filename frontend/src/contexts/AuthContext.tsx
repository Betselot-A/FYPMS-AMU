import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User } from "@/types";
import authService from "@/api/authService";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, department: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      authService.getProfile()
        .then((res) => setUser(res.data))
        .catch(() => {
          sessionStorage.removeItem("auth_token");
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for 401 events fired by the Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      sessionStorage.removeItem("auth_token");
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authService.login({ email, password });
      sessionStorage.setItem("auth_token", res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed - Network or Credentials Error";
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, department: string) => {
    // In production, users are created by admin or special internal flows
    return { success: false, error: "Registration is restricted to platform administrators." };
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    sessionStorage.removeItem("auth_token");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      setUser(res.data);
    } catch {
      // ignore or handle session expiry
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

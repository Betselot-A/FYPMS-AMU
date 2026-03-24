// ============================================================
// ProjectHub Authentication Context
// Manages user session, login, and registration logic.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User } from "@/types";
import { mockUsers, demoCredentials } from "@/data/mockData";
import authService from "@/api/authService";

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL;

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
    if (!USE_MOCK) {
      const token = sessionStorage.getItem("auth_token");
      if (token) {
        authService.getProfile()
          .then((res) => setUser(res.data))
          .catch(() => sessionStorage.removeItem("auth_token"))
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for 401 events fired by the Axios interceptor — clears state so
  // React Router redirects naturally (no hard window.location reload)
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const cred = demoCredentials.find((c) => c.email === email);
      if (!cred || password !== cred.password) {
        return { success: false, error: "Invalid email or password" };
      }
      const foundUser = mockUsers.find((u) => u.email === email);
      if (!foundUser) return { success: false, error: "User not found" };
      setUser(foundUser);
      return { success: true };
    }

    try {
      const res = await authService.login({ email, password });
      sessionStorage.setItem("auth_token", res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, department: string) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (mockUsers.some((u) => u.email === email)) {
        return { success: false, error: "Email already registered" };
      }
      const newUser: User = {
        id: `s${Date.now()}`,
        name,
        email,
        role: "student",
        department,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      return { success: true };
    }

    // In production, users are created by admin — this is a fallback
    return { success: false, error: "Registration is managed by administrators" };
  }, []);

  const logout = useCallback(() => {
    if (!USE_MOCK) {
      authService.logout().catch(() => {});
      sessionStorage.removeItem("auth_token");
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!USE_MOCK) {
      try {
        const res = await authService.getProfile();
        setUser(res.data);
      } catch {
        // ignore
      }
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

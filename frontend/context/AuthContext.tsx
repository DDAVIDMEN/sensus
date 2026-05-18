"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { saveSession, clearSession, getToken, getStoredUser } from "@/lib/auth";
import { User, AuthTokens } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restaura sesión al montar (refresco de página)
  useEffect(() => {
    const token      = getToken();
    const storedUser = getStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = response.data.access_token;

    const payload = JSON.parse(atob(token.split(".")[1]));

    const loggedUser = {
      id: Number(payload.sub),
      email: payload.email,
    };

    saveSession(token, loggedUser);
    setUser(loggedUser);

    router.push("/songs");
  };

  const logout = useCallback((): void => {
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

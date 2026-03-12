"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "staff" | "student";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("spms_token");
        const savedUser = localStorage.getItem("spms_user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string, role: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem("spms_token", data.data.token);
        localStorage.setItem("spms_user", JSON.stringify(data.data.user));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("spms_token");
        localStorage.removeItem("spms_user");
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}

export function useApi() {
    const { token } = useAuth();

    const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string> || {}),
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(url, { ...options, headers });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    }, [token]);

    return { apiFetch };
}

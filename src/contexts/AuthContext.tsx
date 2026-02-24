import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const Role = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    MANAGEMENT_FINANCE: 'MANAGEMENT_FINANCE',
} as const;

export type RoleType = typeof Role[keyof typeof Role];

interface User {
    id: string;
    email: string;
    role: RoleType;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const response = await invoke<User>('login', { email, passwordPlain: pass });
            setUser(response);
            localStorage.setItem('user', JSON.stringify(response));
        } catch (e) {
            console.error("Login failed", e);
            throw new Error(String(e));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

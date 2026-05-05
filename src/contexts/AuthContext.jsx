import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthUser, getAuthToken, clearAuth } from '../api/authStorage';
import { getMe } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const userData = await getMe();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    clearAuth();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        clearAuth();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
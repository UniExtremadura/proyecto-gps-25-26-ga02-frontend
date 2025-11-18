// hooks/useAuth.js
import { createContext, useState, useEffect, useContext } from 'react';
import { refreshTokens } from '../services/userApi';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verificar autenticación al cargar
        const checkAuth = async () => {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');

            if (!accessToken || !refreshToken) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (tokens) => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    const refreshAuth = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                logout();
                return null;
            }

            const newTokens = await refreshTokens(refreshToken);
            localStorage.setItem('access_token', newTokens.access_token);
            localStorage.setItem('refresh_token', newTokens.refresh_token);
            return newTokens.access_token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return null;
        }
    };

    const value = {
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
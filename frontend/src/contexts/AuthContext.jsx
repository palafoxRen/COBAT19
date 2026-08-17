import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, getPerfil } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(
        () => !!localStorage.getItem('token') && !!localStorage.getItem('user'),
    );

    useEffect(() => {
        let active = true;
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            return;
        }

        getPerfil()
            .then((data) => {
                if (!active) return;
                setUser(data.usuario);
                localStorage.setItem('user', JSON.stringify(data.usuario));
            })
            .catch(() => {
                if (!active) return;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const login = async (correo, contrasena) => {
        try {
            const data = await apiLogin(correo, contrasena);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            setUser(data.usuario);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

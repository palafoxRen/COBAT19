import { useState, useEffect } from 'react';
import { login as apiLogin, getPerfil } from '../api/auth';
import AuthContext from './AuthContextDef';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Loading inicia como true si hay token+user en localStorage.
    // Mientras se revalida la sesión contra /auth/me, se muestra un
    // estado de carga en vez de parpadear al login incorrectamente.
    const [loading, setLoading] = useState(
        () => !!localStorage.getItem('token') && !!localStorage.getItem('user'),
    );

    // Revalida la sesión al montar: si el token almacenado ya expiró,
    // la llamada a /auth/me falla (401/403) y se limpia la sesión.
    useEffect(() => {
        // Flag `active` previene updates de estado si el componente se
        // desmontó antes de que la promise resuelva (cleanup pattern).
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
                message: error.response?.data?.message || 'Error al iniciar sesion'
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

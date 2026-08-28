import axios from 'axios';
import { getStoragePublicUrl } from './storage';

// La URL base viene de .env (VITE_API_URL). Se elimina el sufijo /api
// porque cada interceptor/controlador ya lo incluye en sus paths.
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

export const getImagenUrl = (imagenUrl) => {
    if (!imagenUrl) return null;
    if (imagenUrl.startsWith('http')) return imagenUrl;
    return getStoragePublicUrl(imagenUrl);
};

const api = axios.create({
    baseURL: `${API_BASE}/api`,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: adjunta el JWT automáticamente a cada petición.
// Así ningún componente necesita pasar el token manualmente.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: si el backend responde 401 (token expirado/inválido)
// o 403 (token válido pero sin permisos), limpia la sesión y redirige
// al login. El guard `!window.location.pathname.startsWith('/login')`
// evita un loop infinito de redirects si ya estamos en la página de login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default api;
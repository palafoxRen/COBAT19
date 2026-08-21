import api from './axios';

export const login = async (correo, contrasena) => {
    const response = await api.post('auth/login', { correo, contrasena 
    });
        return response.data;
};

export const getPerfil = async () => {
    const response = await api.get('auth/me');
    return response.data;
};

export const actualizarPerfil = async (data) => {
    const response = await api.put('auth/me', data);
    return response.data;
};

export const cambiarContrasena = async (data) => {
    const response = await api.put('auth/me/password', data);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
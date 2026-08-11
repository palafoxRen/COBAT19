import api from './axios';

export const login = async (correo, contrasena) => {
    const response = await api.post('/auth/login', { correo, contrasena 
    });
        return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
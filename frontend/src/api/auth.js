import api from 'axios';

export const login = async (usuario_nombre, contrasena) => {
    const response = await api.post('auth/login', { usuario_nombre, contrasena 
    });
        return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
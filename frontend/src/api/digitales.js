import api from './axios';

export const getDigitales = async () => {
    const response = await api.get('/digitales');
    return response.data;
};

export const getDigitalPorId = async (id) => {
    const response = await api.get(`/digitales/${id}`);
    return response.data;
};

export const uploadDigital = async (data) => {
    const response = await api.post('/digitales', data);
    return response.data;
};

export const actualizarDigital = async (id, data) => {
    const response = await api.put(`/digitales/${id}`, data);
    return response.data;
};

export const toggleHabilitado = async (id) => {
    const response = await api.patch(`/digitales/${id}/toggle`);
    return response.data;
};

export const eliminarDigital = async (id) => {
    const response = await api.delete(`/digitales/${id}`);
    return response.data;
};

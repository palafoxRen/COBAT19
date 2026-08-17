import api from './axios';

export const getDigitales = async () => {
    const response = await api.get('/digitales');
    return response.data;
};

export const uploadDigital = async (formData) => {
    const response = await api.post('/digitales', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

import api from './axios';

export const getReporteMensual = async (anio, mes) => {
    const response = await api.get('/reportes/mensual', { params: { anio, mes } });
    return response.data;
};

import api from './axios.js';

export const login = (data) => api.post('/auth/login', data).then(r => r.data.data);
export const getMe = () => api.post('/auth/me').then(r => r.data.data);

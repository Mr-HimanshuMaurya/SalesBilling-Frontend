import axios from './axios';

export const markAsLost = (billId, data) => axios.post(`/lost/${billId}/mark`, data).then(r => r.data);
export const getLostClients = (params) => axios.get('/lost', { params }).then(r => r.data);

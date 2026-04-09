import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const getStats = () => api.get('/stats').then(r => r.data);
export const getChain = () => api.get('/chain').then(r => r.data);
export const getDisclosures = (params) => api.get('/disclosures', { params }).then(r => r.data);
export const getDisclosure = (id) => api.get(`/disclosures/${id}`).then(r => r.data);
export const createDisclosure = (data) => api.post('/disclosures', data).then(r => r.data);
export const updateDisclosure = (id, data) => api.put(`/disclosures/${id}`, data).then(r => r.data);
export const verifyBlock = (hash) => api.get(`/verify/${hash}`).then(r => r.data);
export const verifyContent = (content) => api.post('/verify/content', { content }).then(r => r.data);
export const checkHealth = () => api.get('/health').then(r => r.data);

export default api;

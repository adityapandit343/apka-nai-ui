import { api } from './api';
import { endpoints } from './endpoints';

export const register = (data) => api.post(endpoints.auth.register, data);
export const login = (data) => api.post(endpoints.auth.login, data);
export const getCurrentUser = () => api.get(endpoints.auth.me);

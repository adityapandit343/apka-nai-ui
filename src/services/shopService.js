import { api } from './api';
import { endpoints } from './endpoints';

export const getShops = () => api.get(endpoints.shops.list);
export const createShop = (data) => api.post(endpoints.shops.create, data);
export const toggleShop = (id) => api.put(endpoints.shops.toggle(id));
export const deleteShop = (id) => api.delete(endpoints.shops.byId(id));

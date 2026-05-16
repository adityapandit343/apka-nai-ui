import { api } from './api';
import { endpoints } from './endpoints';
import { unwrapArray } from '../utils/apiError';

export const normalizeShop = (shop = {}) => ({
  ...shop,
  id: shop.id,
  name: shop.name || shop.shopName || 'Untitled shop',
  shopName: shop.shopName || shop.name || 'Untitled shop',
  phoneNumber: shop.phoneNumber || shop.phone || '',
  isLive: Boolean(shop.isLive ?? shop.isOpen ?? false),
  isOpen: Boolean(shop.isLive ?? shop.isOpen ?? false),
  activeQueueCount: Number(shop.activeQueueCount ?? shop.waitingCount ?? 0),
  services: unwrapArray(shop.services, ['services']),
});

const toShopPayload = (data) => ({
  shopName: data.shopName || data.name,
  description: data.description || '',
  address: data.address || '',
  latitude: data.latitude === '' ? null : data.latitude,
  longitude: data.longitude === '' ? null : data.longitude,
  salonType: data.salonType || 'Unisex',
  phoneNumber: data.phoneNumber || data.phone || '',
  openingTime: data.openingTime || '09:00:00',
  closingTime: data.closingTime || '21:00:00',
  services: data.services?.length
    ? data.services
    : [{ serviceName: 'Haircut', category: 'Hair', estimatedMinutes: 20, price: 150 }],
});

export const getMyShop = async () => {
  const response = await api.get(endpoints.shop.myShop);
  return { ...response, data: normalizeShop(response.data) };
};

export const getShops = async () => {
  const response = await getMyShop();
  return { ...response, data: response.data?.id ? [response.data] : [] };
};

export const createShop = (data) => api.post(endpoints.shop.create, toShopPayload(data));

export const updateShop = (data) => api.put(endpoints.shop.update, data);

export const goLive = (location) => api.post(endpoints.shop.goLive, location);

export const goOffline = () => api.post(endpoints.shop.goOffline);

export const addShopService = (data) => api.post(endpoints.shop.services, data);

export const removeShopService = (serviceId) => api.delete(endpoints.shop.serviceById(serviceId));

export const toggleShopLiveStatus = (shop) =>
  shop?.isLive || shop?.isOpen
    ? goOffline()
    : goLive({ latitude: shop?.latitude, longitude: shop?.longitude });

export const toggleShop = toggleShopLiveStatus;

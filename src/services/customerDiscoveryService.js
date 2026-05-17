import { api } from './api';
import { endpoints } from './endpoints';
import { unwrapArray } from '../utils/apiError';

export const DEFAULT_SEARCH_RADIUS_KM = 5;
export const SELECTED_SHOP_KEY = 'cutbook_selected_shop';

export const normalizeNearbyShop = (shop) => {
  const queue = shop.queueSummary ?? shop.queue ?? {};
  const services = unwrapArray(shop.services, ['services']);

  return {
    id: shop.id ?? shop.shopId,
    name: shop.name ?? shop.shopName ?? 'Unnamed shop',
    shopName: shop.shopName ?? shop.name ?? 'Unnamed shop',
    address: shop.address ?? shop.fullAddress ?? '',
    salonType: shop.salonType ?? 'Unisex',
    latitude: shop.latitude ?? shop.lat ?? null,
    longitude: shop.longitude ?? shop.lng ?? null,
    isOpen: Boolean(shop.isLive ?? shop.isOpen ?? shop.openNow),
    isLive: Boolean(shop.isLive ?? shop.isOpen ?? shop.openNow),
    distanceKm: Number(shop.distanceKm ?? shop.distance ?? 0),
    avgRating: shop.avgRating ?? shop.rating ?? null,
    waitingCount: Number(queue.waitingCount ?? shop.activeQueueCount ?? shop.waitingCount ?? 0),
    activeQueueCount: Number(shop.activeQueueCount ?? queue.waitingCount ?? shop.waitingCount ?? 0),
    estimatedWait: Number(queue.estimatedWait ?? shop.estimatedWait ?? 0),
    servingToken: queue.servingToken ?? shop.servingToken ?? null,
    openingTime: shop.openingTime,
    closingTime: shop.closingTime,
    services,
  };
};

export const getNearbyShops = async ({
  latitude,
  longitude,
  radiusKm = DEFAULT_SEARCH_RADIUS_KM,
  salonType,
  signal,
}) => {
  const { data } = await api.post(
    endpoints.shop.searchNearby,
    {
      lat: latitude,
      latitude,
      lng: longitude,
      longitude,
      radiusKm,
      salonType,
    },
    { signal }
  );

  return unwrapArray(data).map(normalizeNearbyShop);
};

export const rememberSelectedShop = (shop) => {
  sessionStorage.setItem(SELECTED_SHOP_KEY, JSON.stringify(shop));
};

export const getRememberedShop = (shopId) => {
  const raw = sessionStorage.getItem(SELECTED_SHOP_KEY);
  if (!raw) return null;

  try {
    const shop = JSON.parse(raw);
    return String(shop.id) === String(shopId) ? shop : null;
  } catch (_) {
    sessionStorage.removeItem(SELECTED_SHOP_KEY);
    return null;
  }
};

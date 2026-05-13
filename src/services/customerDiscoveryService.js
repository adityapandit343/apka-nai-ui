import { api } from './api';
import { endpoints } from './endpoints';

export const DEFAULT_SEARCH_RADIUS_KM = 10;

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.shops)) return payload.shops;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const normalizeNearbyShop = (shop) => {
  const queue = shop.queueSummary ?? shop.queue ?? {};

  return {
    id: shop.id ?? shop.shopId,
    name: shop.name ?? shop.shopName ?? 'Unnamed shop',
    address: shop.address ?? shop.fullAddress ?? '',
    isOpen: Boolean(shop.isOpen ?? shop.openNow),
    distanceKm: Number(shop.distanceKm ?? shop.distance ?? 0),
    avgRating: shop.avgRating ?? shop.rating ?? null,
    waitingCount: Number(queue.waitingCount ?? shop.waitingCount ?? 0),
    estimatedWait: Number(queue.estimatedWait ?? shop.estimatedWait ?? 0),
    servingToken: queue.servingToken ?? shop.servingToken ?? null,
  };
};

export const getNearbyShops = async ({
  latitude,
  longitude,
  radiusKm = DEFAULT_SEARCH_RADIUS_KM,
  signal,
}) => {
  const { data } = await api.get(endpoints.shops.nearby, {
    params: {
      lat: latitude,
      lng: longitude,
      radiusKm,
    },
    signal,
  });

  return unwrapList(data).map(normalizeNearbyShop);
};

export const getShopQueueSummary = (shopId) =>
  api.get(endpoints.queue.summary(shopId));

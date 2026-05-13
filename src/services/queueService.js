import { api } from './api';
import { endpoints } from './endpoints';

export const getQueue = (shopId) => api.get(endpoints.queue.list(shopId));
export const joinQueue = (shopId, data) => api.post(endpoints.queue.join(shopId), data);
export const nextCustomer = (shopId) => api.post(endpoints.queue.next(shopId));
export const markServing = (shopId, entryId) => api.put(endpoints.queue.serving(shopId, entryId));
export const markDone = (shopId, entryId) => api.put(endpoints.queue.done(shopId, entryId));
export const markNoShow = (shopId, entryId) => api.put(endpoints.queue.noShow(shopId, entryId));

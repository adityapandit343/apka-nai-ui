import { api } from './api';
import { endpoints } from './endpoints';
import { unwrapArray } from '../utils/apiError';

export const normalizeQueueEntry = (entry = {}) => ({
  ...entry,
  id: entry.id,
  position: entry.position,
  tokenNumber: entry.tokenNumber,
  customerName: entry.customerName || entry.fullName || 'Customer',
  customerPhone: entry.customerPhone || entry.phoneNumber || '',
  status: entry.status,
  services: entry.services || entry.requestedServiceNames || [],
  requestedServiceNames: entry.requestedServiceNames || entry.services || [],
  totalEstimatedMinutes: entry.totalEstimatedMinutes ?? entry.estimatedMinutes ?? 0,
});

export const getPendingRequests = async () => {
  const response = await api.get(endpoints.queue.pending);
  return { ...response, data: unwrapArray(response.data).map(normalizeQueueEntry) };
};

export const getLiveQueue = async () => {
  const response = await api.get(endpoints.queue.liveQueue);
  return { ...response, data: unwrapArray(response.data).map(normalizeQueueEntry) };
};

export const createHaircutRequest = (data) =>
  api.post(endpoints.queue.request, {
    shopId: Number(data.shopId),
    serviceIds: data.serviceIds || [],
    hairStyle: data.hairStyle || '',
    notes: data.notes || '',
  });

export const getMyRequest = () => api.get(endpoints.queue.myRequest);

export const acceptRequest = (requestId) => api.post(endpoints.queue.accept(requestId));

export const rejectRequest = (requestId) => api.post(endpoints.queue.reject(requestId));

export const nextCustomer = () => api.post(endpoints.queue.next);

export const getQueue = getLiveQueue;
export const joinQueue = (shopId, data) =>
  createHaircutRequest({
    shopId,
    serviceIds: data.serviceIds || [],
    hairStyle: data.hairStyle || '',
    notes: data.notes || data.CustomerName || '',
  });

export const markServing = () => Promise.reject(new Error('Manual serving is not available in the current API.'));
export const markDone = nextCustomer;
export const markNoShow = () => Promise.reject(new Error('No-show is not available in the current API.'));

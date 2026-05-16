export const API_ENDPOINTS = {
  auth: {
    registerCustomer: '/api/auth/register/customer',
    registerShopOwner: '/api/auth/register/shopowner',
    login: '/api/auth/login',
  },
  shop: {
    create: '/api/shop',
    update: '/api/shop',
    myShop: '/api/shop/my-shop',
    goLive: '/api/shop/go-live',
    goOffline: '/api/shop/go-offline',
    searchNearby: '/api/shop/search-nearby',
    services: '/api/shop/services',
    serviceById: (serviceId) => `/api/shop/services/${serviceId}`,
  },
  queue: {
    request: '/api/queue/request',
    myRequest: '/api/queue/my-request',
    pending: '/api/queue/pending',
    accept: (requestId) => `/api/queue/accept/${requestId}`,
    reject: (requestId) => `/api/queue/reject/${requestId}`,
    liveQueue: '/api/queue/live-queue',
    next: '/api/queue/next',
  },
};

export const endpoints = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
  },
  shops: {
    list: '/api/shop',
    create: '/api/shop',
    byId: (shopId) => `/api/shop/${shopId}`,
    toggle: (shopId) => `/api/shop/${shopId}/toggle`,
    nearby: '/api/shop/nearby',
  },
  queue: {
    list: (shopId) => `/api/shops/${shopId}/queue`,
    summary: (shopId) => `/api/shops/${shopId}/queue/summary`,
    join: (shopId) => `/api/shops/${shopId}/queue/join`,
    next: (shopId) => `/api/shops/${shopId}/queue/next`,
    serving: (shopId, entryId) => `/api/shops/${shopId}/queue/${entryId}/serving`,
    done: (shopId, entryId) => `/api/shops/${shopId}/queue/${entryId}/done`,
    noShow: (shopId, entryId) => `/api/shops/${shopId}/queue/${entryId}/noshow`,
  },
};

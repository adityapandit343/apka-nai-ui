export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const payload = error?.response?.data;

  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  if (payload?.title) return payload.title;
  if (Array.isArray(payload?.errors)) return payload.errors.join(' ');
  if (payload?.errors && typeof payload.errors === 'object') {
    return Object.values(payload.errors).flat().join(' ');
  }

  return error?.message || fallback;
};

export const unwrapArray = (payload, keys = ['data', 'items', 'results', 'shops', 'queue']) => {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
};

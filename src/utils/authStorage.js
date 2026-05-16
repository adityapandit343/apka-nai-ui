export const TOKEN_KEY = 'access_token';
export const USER_KEY = 'auth_user';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (_) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

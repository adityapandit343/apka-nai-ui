import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginApi,
  registerCustomer,
  registerShopOwner,
} from '../services/authService';
import { clearAuthSession, getStoredUser, saveAuthSession } from '../utils/authStorage';

const AuthContext = createContext();

const normalizeUser = (data, fallbackUser = {}) => ({
  id: data.userId ?? data.id ?? data.user?.id ?? fallbackUser.id,
  userId: data.userId ?? data.id ?? data.user?.id ?? fallbackUser.id,
  role: data.role ?? data.user?.role ?? fallbackUser.role,
  fullName: data.fullName ?? data.name ?? data.user?.fullName ?? data.user?.name ?? fallbackUser.fullName,
  name: data.fullName ?? data.name ?? data.user?.fullName ?? data.user?.name ?? fallbackUser.name,
  email: data.email ?? data.user?.email ?? fallbackUser.email,
  phoneNumber: data.phoneNumber ?? data.phone ?? data.user?.phoneNumber ?? data.user?.phone ?? fallbackUser.phoneNumber,
  phone: data.phoneNumber ?? data.phone ?? data.user?.phoneNumber ?? data.user?.phone ?? fallbackUser.phone,
});

const buildSession = (data, fallbackUser = {}) => {
  if (!data?.token) {
    throw new Error('Invalid response from server');
  }

  const user = normalizeUser(data, fallbackUser);
  saveAuthSession({ token: data.token, user });
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const { data } = await loginApi(credentials);
      setUser(buildSession(data, { email: credentials.email }));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData, role = 'ShopOwner') => {
    try {
      const registerApi = role === 'Customer' ? registerCustomer : registerShopOwner;
      const { data } = await registerApi(userData);
      setUser(buildSession(data, {
        email: userData.email,
        fullName: userData.fullName || userData.name,
        role,
      }));
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);

    const handleUnauthorized = () => setUser(null);
    window.addEventListener('cutbook:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cutbook:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

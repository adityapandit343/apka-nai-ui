import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
} from '../services/authService';

const AuthContext = createContext();
const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

const saveSession = (data, fallbackUser = {}) => {
  if (!data?.token) {
    throw new Error('Invalid response from server');
  }

  const user = data.user || fallbackUser;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const { data } = await loginApi(credentials);
      setUser(saveSession(data, { email: credentials.email }));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await registerApi(userData);
      setUser(saveSession(data, { email: userData.email, name: userData.name }));
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {
        localStorage.removeItem(USER_KEY);
      }
    }

    getCurrentUser()
      .then(({ data }) => {
        const nextUser = data?.user || data;
        if (nextUser) {
          setUser(nextUser);
          localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
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

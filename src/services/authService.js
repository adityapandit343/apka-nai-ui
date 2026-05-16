import { api } from './api';
import { endpoints } from './endpoints';

const toAuthPayload = (data) => ({
  fullName: data.fullName || data.name,
  email: data.email,
  password: data.password,
  phoneNumber: data.phoneNumber || data.phone,
});

export const registerCustomer = (data) =>
  api.post(endpoints.auth.registerCustomer, toAuthPayload(data));

export const registerShopOwner = (data) =>
  api.post(endpoints.auth.registerShopOwner, toAuthPayload(data));

export const register = registerShopOwner;

export const login = (data) =>
  api.post(endpoints.auth.login, {
    email: data.email,
    password: data.password,
  });

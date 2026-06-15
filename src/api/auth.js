import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('userToken');
      // Redirigir al login - lo manejaremos desde el contexto
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    if (response.data.success) {
      await SecureStore.setItemAsync('userToken', response.data.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
      return response.data;
    }
    return null;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/logout');
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const userData = await SecureStore.getItemAsync('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

export const verifyToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return false;
    
    const response = await api.post('/verify-token');
    return response.data.valid;
  } catch (error) {
    return false;
  }
};

export default api;
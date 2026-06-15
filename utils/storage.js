import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Para datos sensibles (tokens, contraseñas)
export const secureStorage = {
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// Para datos no sensibles (preferencias, caché)
export const asyncStorage = {
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  getItem: async (key) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  removeItem: async (key) => {
    await AsyncStorage.removeItem(key);
  },
  clear: async () => {
    await AsyncStorage.clear();
  },
};

// Keys predefinidas
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  USER_SETTINGS: 'userSettings',
  OFFLINE_DATA: 'offlineData',
};
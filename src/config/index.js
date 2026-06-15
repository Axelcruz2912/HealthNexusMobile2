import { API_URL, WEB_URL } from '@env';

export const config = {
  apiUrl: API_URL || 'http://192.168.1.8:8000/api',
  webUrl: WEB_URL || 'http://192.168.1.8:8000',
  appName: 'HealthNexus',
  version: '1.0.0',
};

export default config;
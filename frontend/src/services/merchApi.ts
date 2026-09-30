import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_MERCH_API_URL || 'http://localhost:5010/api';

const merchApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

merchApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default merchApi;

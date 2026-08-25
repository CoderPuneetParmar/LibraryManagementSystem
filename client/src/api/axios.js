import axios from 'axios';

const baseURL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL
});

// Interceptor to attach Authorization JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;

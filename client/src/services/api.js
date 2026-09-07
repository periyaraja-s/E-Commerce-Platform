import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL;
// If VITE_API_URL is unset or has legacy port 5000, use relative /api path
const isLocalhost5000 = !rawUrl || rawUrl.includes('localhost:5000') || rawUrl.includes('127.0.0.1:5000');
const baseURL = isLocalhost5000 ? rawUrl :  '/api';

const api = axios.create({
  baseURL,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;

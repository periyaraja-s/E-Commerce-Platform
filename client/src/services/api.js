import axios from 'axios';

function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;

  // Default to relative '/api' if not set
  if (!envUrl) {
    return '/api';
  }

  // In browser environments, check if the configured URL would fail
  if (typeof window !== 'undefined') {
    // Port 5000 is an outdated boilerplate default; the backend runs on port 3000 (same origin)
    if (envUrl.includes(':5000')) {
      return '/api';
    }
    // If targeting localhost/127.0.0.1 but the current app is accessed via a remote host (e.g. Cloud Run, preview domain)
    if ((envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) && !window.location.origin.includes('localhost')) {
      return '/api';
    }
  }

  return envUrl;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;

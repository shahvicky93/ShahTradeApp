import axios from 'axios';

// Create base Axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Key used to store credentials
const AUTH_KEY = 'kisan_ledger_auth';

/**
 * Saves active credentials into localStorage.
 */
export function setAuthCredentials(username, password, explicitToken) {
  const token = explicitToken || btoa(`${username}:${password}`);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ username, password, token }));
}

/**
 * Returns saved credentials from localStorage or null.
 */
export function getAuthCredentials() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears saved credentials.
 */
export function clearAuthCredentials() {
  localStorage.removeItem(AUTH_KEY);
}

// Request Interceptor: Attach Basic Auth Header if available
apiClient.interceptors.request.use(
  (config) => {
    const auth = getAuthCredentials();
    if (auth?.token) {
      config.headers.Authorization = `Basic ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error message cleanly and handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthCredentials();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data) {
      const data = error.response.data;
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        message = data.messages.join(' | ');
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else if (typeof data === 'string') {
        message = data;
      }
    } else if (error.message) {
      message = error.message;
    }
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;

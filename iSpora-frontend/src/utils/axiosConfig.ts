import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const devKey = localStorage.getItem('devKey');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (devKey) {
      config.headers['X-Dev-Key'] = devKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login or refresh page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

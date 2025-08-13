import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    // console.log('🔍 Axios request config:', {
    //   method: config.method,
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   headers: config.headers,
    //   data: config.data
    // });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // console.error('🚨 Axios request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // console.log('✅ Axios response:', {
    //   status: response.status,
    //   statusText: response.statusText,
    //   headers: response.headers,
    //   data: response.data
    // });
    return response;
  },
  (error) => {
    // console.error('🚨 Axios response error:', {
    //   message: error.message,
    //   code: error.code,
    //   config: error.config,
    //   response: error.response
    // });
    return Promise.reject(error);
  }
);

export default api;
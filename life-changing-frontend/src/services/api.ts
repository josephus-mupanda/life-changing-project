import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// Create Axios instance with base URL
const api = axios.create({
    // Using 127.0.0.1 instead of localhost for better CORS stability on Windows
    baseURL: 'http://127.0.0.1:3000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Request interceptor: Attach Token and Cache Busting
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Only attach token if it's not the login request
        if (!config.url?.includes('/auth/login')) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Cache busting for GET requests to prevent stale CORS/data responses
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Global Error Handling
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<any>) => {
        // Handle 429 Rate Limited
        if (error.response?.status === 429) {
            console.warn('Rate limited. Waiting before retry...');
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            if (!window.location.hash.includes('#/login')) {
                const returnUrl = encodeURIComponent(window.location.hash.substring(1) || '/');
                window.location.href = `/#/login?returnUrl=${returnUrl}`;
            }
        }
        return Promise.reject(error);
    }
);

export default api;

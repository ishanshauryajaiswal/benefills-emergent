import axios from 'axios';
import { products } from '../mockData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('benefills_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productsAPI = {
  getAll: (params) => {
    console.log('Using mock products data');
    return Promise.resolve({ data: products });
  },
  getById: (id) => {
    const product = products.find(p => p.id === id);
    return Promise.resolve({ data: product });
  },
  create: (data) => apiClient.post('/products/', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (data) => apiClient.post('/orders/', data),
  getAll: (userId) => apiClient.get('/orders/', { params: { user_id: userId } }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
};

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  adminLogin: (data) => apiClient.post('/auth/admin/login', data),
};

export default apiClient;

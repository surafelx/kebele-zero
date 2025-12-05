import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-domain.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/updatedetails', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/updatepassword', data),
};

export const productsAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id: string, data: FormData) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list'),
  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }),
};

export const eventsAPI = {
  getEvents: (params?: any) => api.get('/events', { params }),
  getEvent: (id: string) => api.get(`/events/${id}`),
  createEvent: (data: FormData) => api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateEvent: (id: string, data: FormData) => api.put(`/events/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  getCategories: () => api.get('/events/categories/list'),
  getFeatured: (limit?: number) => api.get('/events/featured', { params: { limit } }),
  getUpcoming: (limit?: number) => api.get('/events/upcoming', { params: { limit } }),
};

export const videosAPI = {
  getVideos: (params?: any) => api.get('/videos', { params }),
  getVideo: (id: string) => api.get(`/videos/${id}`),
  createVideo: (data: FormData) => api.post('/videos', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateVideo: (id: string, data: FormData) => api.put(`/videos/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteVideo: (id: string) => api.delete(`/videos/${id}`),
  getCategories: () => api.get('/videos/categories/list'),
  getFeatured: (limit?: number) => api.get('/videos/featured', { params: { limit } }),
  updateStatistics: (id: string, stats: any) => api.put(`/videos/${id}/statistics`, stats),
};

export const aboutAPI = {
  getAbout: () => api.get('/about'),
  createAbout: (data: FormData) => api.post('/about', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAbout: (id: string, data: FormData) => api.put(`/about/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAbout: (id: string) => api.delete(`/about/${id}`),
  getAllAbouts: (params?: any) => api.get('/about/all', { params }),
  setActive: (id: string) => api.put(`/about/${id}/set-active`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getContent: () => api.get('/admin/content'),
};

export const paymentsAPI = {
  createPaymentIntent: (data: { amount: number; currency?: string; metadata?: any }) =>
    api.post('/payments/create-payment-intent', data),
  createPayPalPayment: (data: any) => api.post('/payments/create-paypal-payment', data),
  executePayPalPayment: (data: { paymentId: string; payerId: string }) =>
    api.post('/payments/execute-paypal-payment', data),
  createEventPaymentIntent: (data: any) => api.post('/payments/create-event-payment-intent', data),
  getPaymentMethods: () => api.get('/payments/methods'),
};
import axios from 'axios';
import CONFIG from '../app/config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Add token if needed
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 🔌 ACCOUNTS API - Connect your backend here
export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (accountData) => api.post('/accounts', accountData),
  update: (id, accountData) => api.put(`/accounts/${id}`, accountData),
  delete: (id) => api.delete(`/accounts/${id}`),
  getFiltered: (filters) => api.get('/accounts', { params: filters }),
};

// 🔌 PAYMENTS API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getByAccountId: (accountId) => api.get(`/payments/account/${accountId}`),
  create: (paymentData) => api.post('/payments', paymentData),
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  getHistory: (accountId) => api.get(`/payments/history/${accountId}`),
  getOverdue: () => api.get('/payments/overdue'),
};

// 🔌 REMINDERS API
export const remindersAPI = {
  getAll: () => api.get('/reminders'),
  getUpcoming: () => api.get('/reminders/upcoming'),
  send: (reminderId) => api.post(`/reminders/${reminderId}/send`),
  delete: (id) => api.delete(`/reminders/${id}`),
  getDueToday: () => api.get('/reminders/due-today'),
};

// 🔌 USERS API (Linked Users)
export const usersAPI = {
  getByAccountId: (accountId) => api.get(`/users/account/${accountId}`),
  linkToAccount: (accountId, userData) => api.post(`/users/link/${accountId}`, userData),
  unlinkFromAccount: (accountId, userId) => api.delete(`/users/unlink/${accountId}/${userId}`),
};

export default api;
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
  getAll: () => api.get('/api/accounts'),
  getById: (id) => api.get(`/api/accounts/${id}`),
  create: (accountData) => api.post('/api/accounts', accountData),
  update: (id, accountData) => api.put(`/api/accounts/${id}`, accountData),
  delete: (id) => api.delete(`/api/accounts/${id}`),
  getFiltered: (filters) => api.get('/api/accounts', { params: filters }),
};

// 🔌 PAYMENTS API
export const paymentsAPI = {
  getAll: () => api.get('/api/payments'),
  getByAccountId: (accountId) => api.get(`/api/payments/account/${accountId}`),
  create: (paymentData) => api.post('/api/payments', paymentData),
  update: (id, paymentData) => api.put(`/api/payments/${id}`, paymentData),
  getHistory: (accountId) => api.get(`/api/payments/history/${accountId}`),
  getOverdue: () => api.get('/api/payments/overdue'),
};

// 🔌 REMINDERS API
export const remindersAPI = {
  getAll: () => api.get('/api/reminders'),
  getUpcoming: () => api.get('/api/reminders/upcoming'),
  sendEmail: (accountNumber) => api.post(`/api/services/send-reminder/${accountNumber}`),
  sendSMS: (accountNumber) => api.post(`/api/services/send-sms-reminder/${accountNumber}`),
  delete: (id) => api.delete(`/api/reminders/${id}`),
  getDueToday: () => api.get('/api/reminders/due-today'),
};

// 🔌 USERS API (Linked Users)
export const usersAPI = {
  getByAccountId: (accountId) => api.get(`/api/users/account/${accountId}`),
  linkToAccount: (accountId, userData) => api.post(`/api/users/link/${accountId}`, userData),
  unlinkFromAccount: (accountId, userId) => api.delete(`/api/users/unlink/${accountId}/${userId}`),
};

export default api;
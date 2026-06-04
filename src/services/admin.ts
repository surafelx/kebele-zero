import api from './api';

export const adminAPI = {
  getStats: async () => {
    const r = await api.get('/admin/stats');
    return r.data;
  },
  getUsers: async (params?: any) => {
    const r = await api.get('/admin/users', { params });
    return r.data;
  },
  updateUserRole: async (id: string, role: 'user' | 'moderator' | 'admin') => {
    const r = await api.put(`/admin/users/${id}/role`, { role });
    return r.data;
  },
  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },
};

export const settingsAPI = {
  getSettings: async () => {
    const r = await api.get('/settings');
    return r.data;
  },
  saveSettings: async (data: any) => {
    const r = await api.put('/settings', data);
    return r.data;
  },
};

export const socialLinksAPI = {
  getLinks: async () => {
    const r = await api.get('/social-links');
    return r.data;
  },
  createLink: async (data: any) => {
    const r = await api.post('/social-links', data);
    return r.data;
  },
  updateLink: async (id: string, data: any) => {
    const r = await api.put(`/social-links/${id}`, data);
    return r.data;
  },
  deleteLink: async (id: string) => {
    await api.delete(`/social-links/${id}`);
  },
};

export const paymentRequestsAPI = {
  getRequests: async (params?: any) => {
    const r = await api.get('/payment-requests', { params });
    return r.data;
  },
  createRequest: async (data: any) => {
    const r = await api.post('/payment-requests', data);
    return r.data;
  },
  updateStatus: async (id: string, status: string, adminNotes?: string) => {
    const r = await api.put(`/payment-requests/${id}/status`, { status, adminNotes });
    return r.data;
  },
};

export const teamMembersAPI = {
  getAll: async () => {
    const r = await api.get('/team-members');
    return r.data;
  },
  create: async (data: any) => {
    const r = await api.post('/team-members', data);
    return r.data;
  },
  update: async (id: string, data: any) => {
    const r = await api.put(`/team-members/${id}`, data);
    return r.data;
  },
  delete: async (id: string) => {
    await api.delete(`/team-members/${id}`);
  },
};

export const transactionsAPI = {
  getAll: async () => {
    const r = await api.get('/transactions');
    return r.data;
  },
  create: async (data: any) => {
    const r = await api.post('/transactions', data);
    return r.data;
  },
  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`);
  },
};

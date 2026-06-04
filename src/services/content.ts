import api from './api';

// ── Events ────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getEvents: async (params?: { category?: string; active?: boolean }) => {
    const r = await api.get('/events', { params });
    return r.data;
  },
  getEvent: async (id: string) => {
    const r = await api.get(`/events/${id}`);
    return r.data;
  },
  createEvent: async (data: any) => {
    const r = await api.post('/events', data);
    return r.data;
  },
  updateEvent: async (id: string, data: any) => {
    const r = await api.put(`/events/${id}`, data);
    return r.data;
  },
  deleteEvent: async (id: string) => {
    await api.delete(`/events/${id}`);
  },
  getCategories: async () => {
    // derive categories from events list
    const r = await api.get('/events');
    const cats = [...new Set((r.data as any[]).map((e: any) => e.category).filter(Boolean))];
    return cats;
  },
};

// ── Products ──────────────────────────────────────────────────────────────
export const productsAPI = {
  getProducts: async (params?: { category?: string; inStock?: boolean }) => {
    const r = await api.get('/products', { params });
    return r.data;
  },
  getProduct: async (id: string) => {
    const r = await api.get(`/products/${id}`);
    return r.data;
  },
  createProduct: async (data: any) => {
    const r = await api.post('/products', data);
    return r.data;
  },
  updateProduct: async (id: string, data: any) => {
    const r = await api.put(`/products/${id}`, data);
    return r.data;
  },
  deleteProduct: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
  getCategories: async () => {
    const r = await api.get('/products');
    const cats = [...new Set((r.data as any[]).map((p: any) => p.category).filter(Boolean))];
    return cats;
  },
};

// ── Media ─────────────────────────────────────────────────────────────────
export const mediaAPI = {
  getMedia: async (params?: { type?: string; category?: string }) => {
    const r = await api.get('/media', { params });
    return r.data;
  },
  uploadMedia: async (data: any) => {
    const r = await api.post('/media', data);
    return r.data;
  },
  deleteMedia: async (id: string) => {
    await api.delete(`/media/${id}`);
  },
};

// ── Radio ─────────────────────────────────────────────────────────────────
export const radioAPI = {
  getStations: async (params?: { active?: boolean }) => {
    const r = await api.get('/radio', { params });
    return r.data;
  },
  createStation: async (data: any) => {
    const r = await api.post('/radio', data);
    return r.data;
  },
  updateStation: async (id: string, data: any) => {
    const r = await api.put(`/radio/${id}`, data);
    return r.data;
  },
  deleteStation: async (id: string) => {
    await api.delete(`/radio/${id}`);
  },
};

// ── About ─────────────────────────────────────────────────────────────────
export const aboutAPI = {
  getAbout: async () => {
    const r = await api.get('/about');
    return r.data;
  },
  upsertSection: async (section: string, data: any) => {
    const r = await api.put(`/about/${section}`, data);
    return r.data;
  },
};

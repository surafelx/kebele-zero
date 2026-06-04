import axios from 'axios';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Normalize snake_case body keys to camelCase before sending
  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    config.data = normalizeRequest(config.data);
  }
  return config;
});

// Convert camelCase → snake_case
function toSnake(key: string) {
  return key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
}

// Convert snake_case → camelCase
function toCamel(key: string) {
  return key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

// Normalize outgoing request body: convert all snake_case keys to camelCase
// so the Express backend (which uses camelCase models) understands them.
function normalizeRequest(obj: any): any {
  if (Array.isArray(obj)) return obj.map(normalizeRequest);
  if (obj && typeof obj === 'object' && !(obj instanceof FormData) && !(obj instanceof Date)) {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      out[toCamel(key)] = normalizeRequest(obj[key]);
    }
    return out;
  }
  return obj;
}

// Normalize all API responses:
//  • _id  → also set id (MongoDB ObjectId as string)
//  • camelCase keys → also add snake_case aliases (isActive → is_active, etc.)
// This lets existing UI code that expects Supabase snake_case work with the
// Express/MongoDB backend without changing every component.
function normalizeIds(obj: any): any {
  if (Array.isArray(obj)) return obj.map(normalizeIds);
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      const val = normalizeIds(obj[key]);
      out[key] = val;
      const snake = toSnake(key);
      if (snake !== key) out[snake] = val;   // add snake_case alias
    }
    if (out._id !== undefined && out.id === undefined) {
      out.id = String(out._id);
    }
    // Bridge Express camelCase userId → Supabase-style created_by
    // userId may be a raw ObjectId string OR a populated user object {_id, username, email}
    if (out.userId !== undefined && out.created_by === undefined) {
      const uid = out.userId;
      if (uid && typeof uid === 'object') {
        // Populated user document — extract the ID string and expose the username
        out.created_by = String(uid._id || uid.id || '');
        if (!out.created_by_username) {
          out.created_by_username = uid.username || uid.email?.split('@')[0] || '';
        }
      } else {
        out.created_by = String(uid);
      }
    }
    return out;
  }
  return obj;
}

api.interceptors.response.use(
  (r) => {
    if (r.data !== undefined) r.data = normalizeIds(r.data);
    return r;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kz_token');
    }
    return Promise.reject(err);
  }
);

export default api;

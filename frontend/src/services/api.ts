import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import type { Book, Borrowal, Fine, Reservation, Review, Notification, ReadingListItem, Announcement, Genre, Profile, BookFilters, PaginatedResponse, DashboardStats, LibrarySettings } from '../types';

const nodeBaseURL = import.meta.env.VITE_NODE_API_URL || '/api/node';
const pyBaseURL = import.meta.env.VITE_PY_API_URL || '/api/py';

const nodeApi = axios.create({
  baseURL: nodeBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

const pyApi = axios.create({
  baseURL: pyBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Add auth token to requests
nodeApi.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

pyApi.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ==================== BOOK API ====================
export const bookApi = {
  getAll: async (filters?: BookFilters): Promise<PaginatedResponse<Book>> => {
    const { data } = await nodeApi.get('/books', { params: filters });
    return data;
  },
  getById: async (id: string): Promise<Book> => {
    const { data } = await nodeApi.get(`/books/${id}`);
    return data;
  },
  create: async (book: Partial<Book>): Promise<Book> => {
    const { data } = await nodeApi.post('/books', book);
    return data;
  },
  update: async (id: string, book: Partial<Book>): Promise<Book> => {
    const { data } = await nodeApi.put(`/books/${id}`, book);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await nodeApi.delete(`/books/${id}`);
  },
  uploadCover: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('cover', file);
    const { data } = await nodeApi.post(`/books/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },
  bulkImport: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await pyApi.post('/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

// ==================== GENRE API ====================
export const genreApi = {
  getAll: async (): Promise<Genre[]> => {
    const { data } = await nodeApi.get('/genres');
    return data;
  },
  create: async (genre: Partial<Genre>): Promise<Genre> => {
    const { data } = await nodeApi.post('/genres', genre);
    return data;
  },
  update: async (id: string, genre: Partial<Genre>): Promise<Genre> => {
    const { data } = await nodeApi.put(`/genres/${id}`, genre);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await nodeApi.delete(`/genres/${id}`);
  },
};

// ==================== BORROWAL API ====================
export const borrowalApi = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResponse<Borrowal>> => {
    const { data } = await nodeApi.get('/borrowals', { params });
    return data;
  },
  getMyBorrowals: async (): Promise<Borrowal[]> => {
    const { data } = await nodeApi.get('/borrowals/me');
    return data;
  },
  request: async (bookId: string): Promise<Borrowal> => {
    if (!UUID_PATTERN.test(bookId)) {
      throw new Error('This item is demo data and cannot be borrowed.');
    }
    const { data } = await nodeApi.post('/borrowals/request', { book_id: bookId });
    return data;
  },
  approve: async (id: string): Promise<Borrowal> => {
    const { data } = await nodeApi.put(`/borrowals/${id}/approve`);
    return data;
  },
  reject: async (id: string, reason?: string): Promise<Borrowal> => {
    const { data } = await nodeApi.put(`/borrowals/${id}/reject`, { reason });
    return data;
  },
  return: async (id: string, condition: string): Promise<Borrowal> => {
    const { data } = await nodeApi.put(`/borrowals/${id}/return`, { condition });
    return data;
  },
  renew: async (id: string): Promise<Borrowal> => {
    const { data } = await nodeApi.put(`/borrowals/${id}/renew`);
    return data;
  },
};

// ==================== RESERVATION API ====================
export const reservationApi = {
  getAll: async (): Promise<Reservation[]> => {
    const { data } = await nodeApi.get('/reservations');
    return data?.data || data;
  },
  getMyReservations: async (): Promise<Reservation[]> => {
    const { data } = await nodeApi.get('/reservations/mine');
    return data;
  },
  create: async (bookId: string): Promise<Reservation> => {
    const { data } = await nodeApi.post('/reservations', { book_id: bookId });
    return data;
  },
  cancel: async (id: string): Promise<void> => {
    await nodeApi.delete(`/reservations/${id}`);
  },
  fulfill: async (id: string): Promise<Reservation> => {
    const { data } = await nodeApi.put(`/reservations/${id}/fulfill`);
    return data;
  },
  expire: async (id: string): Promise<Reservation> => {
    const { data } = await nodeApi.put(`/reservations/${id}/expire`);
    return data;
  },
};

// ==================== FINE API ====================
export const fineApi = {
  getAll: async (): Promise<Fine[]> => {
    const { data } = await nodeApi.get('/fines');
    return data?.data || data;
  },
  getMyFines: async (): Promise<Fine[]> => {
    const { data } = await nodeApi.get('/fines/mine');
    return data;
  },
  pay: async (id: string): Promise<Fine> => {
    const { data } = await nodeApi.put(`/fines/${id}/pay`);
    return data;
  },
  waive: async (id: string, reason: string): Promise<Fine> => {
    const { data } = await nodeApi.put(`/fines/${id}/waive`, { reason });
    return data;
  },
};

// ==================== REVIEW API ====================
export const reviewApi = {
  getByBook: async (bookId: string): Promise<Review[]> => {
    const { data } = await nodeApi.get(`/books/${bookId}/reviews`);
    return data;
  },
  create: async (review: Partial<Review>): Promise<Review> => {
    const { data } = await nodeApi.post('/reviews', review);
    return data;
  },
  update: async (id: string, review: Partial<Review>): Promise<Review> => {
    const { data } = await nodeApi.put(`/reviews/${id}`, review);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await nodeApi.delete(`/reviews/${id}`);
  },
  toggleHelpful: async (id: string): Promise<void> => {
    await nodeApi.post(`/reviews/${id}/helpful`);
  },
};

// ==================== NOTIFICATION API ====================
export const notificationApi = {
  getMine: async (): Promise<Notification[]> => {
    const { data } = await nodeApi.get('/notifications');
    return data;
  },
  markRead: async (id: string): Promise<void> => {
    await nodeApi.put(`/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await nodeApi.put('/notifications/read-all');
  },
  delete: async (id: string): Promise<void> => {
    await nodeApi.delete(`/notifications/${id}`);
  },
};

// ==================== READING LIST API ====================
export const readingListApi = {
  getMine: async (): Promise<ReadingListItem[]> => {
    const { data } = await nodeApi.get('/reading-list');
    return data;
  },
  add: async (bookId: string): Promise<ReadingListItem> => {
    const { data } = await nodeApi.post('/reading-list', { book_id: bookId });
    return data;
  },
  updateStatus: async (id: string, status: string): Promise<ReadingListItem> => {
    const { data } = await nodeApi.put(`/reading-list/${id}`, { status });
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await nodeApi.delete(`/reading-list/${id}`);
  },
};

// ==================== ANNOUNCEMENT API ====================
export const announcementApi = {
  getAll: async (): Promise<Announcement[]> => {
    const { data } = await nodeApi.get('/announcements');
    return data;
  },
  getActive: async (): Promise<Announcement[]> => {
    const { data } = await nodeApi.get('/announcements/active');
    return data;
  },
  create: async (announcement: Partial<Announcement>): Promise<Announcement> => {
    const { data } = await nodeApi.post('/announcements', announcement);
    return data;
  },
  update: async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
    const { data } = await nodeApi.put(`/announcements/${id}`, announcement);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await nodeApi.delete(`/announcements/${id}`);
  },
};

// ==================== MEMBER API ====================
export const memberApi = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedResponse<Profile>> => {
    const { data } = await nodeApi.get('/members', { params });
    return data;
  },
  getById: async (id: string): Promise<Profile> => {
    const { data } = await nodeApi.get(`/members/${id}`);
    return data;
  },
  updateRole: async (id: string, role: string): Promise<void> => {
    await nodeApi.put(`/members/${id}/role`, { role });
  },
  toggleActive: async (id: string): Promise<void> => {
    await nodeApi.put(`/members/${id}/toggle-active`);
  },
  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const res = await nodeApi.put('/members/profile', data);
    return res.data;
  },
};

// ==================== ADMIN API ====================
export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await nodeApi.get('/admin/dashboard-stats');
    return data;
  },
  getSettings: async (): Promise<LibrarySettings> => {
    const { data } = await nodeApi.get('/admin/settings');
    return data;
  },
  updateSettings: async (settings: Partial<LibrarySettings>): Promise<LibrarySettings> => {
    const { data } = await nodeApi.put('/admin/settings', settings);
    return data;
  },
  exportReport: async (type: string, params: Record<string, string>): Promise<Blob> => {
    const { data } = await nodeApi.get(`/admin/reports/${type}`, {
      params,
      responseType: 'blob',
    });
    return data;
  },
};

// ==================== PYTHON MICROSERVICE API ====================
export const pyApi_endpoints = {
  getRecommendations: async (userId: string): Promise<Book[]> => {
    const { data } = await pyApi.post('/recommendations', { user_id: userId });
    return data;
  },
  lookupISBN: async (isbn: string): Promise<Partial<Book>> => {
    const { data } = await pyApi.get(`/isbn/${isbn}`);
    return data;
  },
  fuzzySearch: async (query: string): Promise<Book[]> => {
    const { data } = await pyApi.post('/search', { query });
    return data;
  },
  calculateFine: async (borrowalId: string): Promise<{ amount: number; days: number }> => {
    const { data } = await pyApi.get(`/fine-calculate/${borrowalId}`);
    return data;
  },
};

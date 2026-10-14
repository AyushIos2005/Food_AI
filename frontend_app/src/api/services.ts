import { apiRequest, AI_TIMEOUT } from './client';
import type {
  AuthUser, CatalogFood, FoodListResponse, HistoryItem, HistoryListResponse, LoginResponse,
  NotificationItem, Profile, ProteinHistoryItem, RecreateHistoryItem,
} from '@/src/types/api';

/* ---------- Auth (/api/auth) ---------- */
export const authApi = {
  register: (p: { username: string; name: string; email: string; password: string }) =>
    apiRequest<{ message: string; user: AuthUser }>('/auth/register', { method: 'POST', body: p, anonymous: true }),
  verifyOtp: (p: { email: string; otp: string }) =>
    // NOTE: the backend route is spelled "vefiyOtp" — do not "fix" it.
    apiRequest<{ message: string }>('/auth/vefiyOtp', { method: 'POST', body: p, anonymous: true }),
  login: (p: { username?: string; email?: string; password: string }) =>
    apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: p, anonymous: true }),
  logout: () => apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forget-password', { method: 'POST', body: { email }, anonymous: true }),
  resetPassword: (p: { email: string; otp: string; newPassword: string; confirmNewPassword: string }) =>
    apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: p, anonymous: true }),
};

/* ---------- Recipe catalog (/api/food) ---------- */
export const foodApi = {
  list: async (params: { page: number; limit: number; search?: string }) => {
    const res = await apiRequest<FoodListResponse>('/food/get-all', { query: params });
    return res.foods;
  },
};

/* ---------- AI generation (/api/ai-service) ---------- */
export interface GenerateProteinInput {
  ingredient: string[];
  numberofperson: number;
  anyMedical?: string;
}
export interface RecreateInput {
  existingFoodname: string;
  AddOnIngredient: string[];
}

export const aiApi = {
  generate: async (input: GenerateProteinInput): Promise<ProteinHistoryItem> => {
    const res = await apiRequest<{ success: boolean; data: ProteinHistoryItem }>('/ai-service/amzingFood', {
      method: 'POST', body: input, timeoutMs: AI_TIMEOUT,
    });
    return res.data;
  },
  recreate: async (input: RecreateInput): Promise<RecreateHistoryItem> => {
    const res = await apiRequest<{ success: boolean; data: RecreateHistoryItem }>('/ai-service/amzeFood/recreate', {
      method: 'POST', body: input, timeoutMs: AI_TIMEOUT,
    });
    return res.data;
  },
  history: async (): Promise<HistoryItem[]> => {
    const res = await apiRequest<HistoryListResponse>('/ai-service/amzeFood/history');
    return res.data;
  },
  historyById: async (id: string): Promise<HistoryItem> => {
    const res = await apiRequest<{ success: boolean; data: HistoryItem }>(`/ai-service/amzeFood/history/${id}`);
    return res.data;
  },
  deleteOne: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/ai-service/amze/history/${id}`, { method: 'DELETE' }),
  deleteAll: () =>
    apiRequest<{ success: boolean; deletedCount: number }>('/ai-service/amze/history', { method: 'DELETE' }),
  undo: (id: string) =>
    apiRequest<{ success: boolean; data: HistoryItem }>(`/ai-service/amze/history/${id}/undo`, { method: 'PATCH' }),
};

/* ---------- Profile (/api/profile) ---------- */
export const profileApi = {
  get: async (): Promise<Profile | null> => {
    try {
      const res = await apiRequest<{ message: string; profile: Profile }>('/profile/get_detail');
      return res.profile;
    } catch (err) {
      // 404 means "no profile yet" — not an error for this screen.
      if ((err as { kind?: string }).kind === 'not_found') return null;
      throw err;
    }
  },
  create: (body: Partial<Omit<Profile, '_id'>>) =>
    apiRequest<{ message: string; profile: Profile }>('/profile/create-profile', { method: 'POST', body }),
  update: (id: string, body: Partial<Omit<Profile, '_id'>>) =>
    apiRequest<{ message: string; profile: Profile }>(`/profile/upadate_profile/${id}`, { method: 'PATCH', body }),
};

/* ---------- Notifications (/api/notifications) ---------- */
export const notificationApi = {
  // Also used as the lightweight authenticated call that validates a restored session.
  list: (limit = 5) =>
    apiRequest<{ data: NotificationItem[]; unreadCount: number }>('/notifications', { query: { page: 1, limit } }),
};

export type { CatalogFood };

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
  userId: number | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (userId: number, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  isLoading: true,

  setAuth: async (userId: number, token: string) => {
    try {
      await AsyncStorage.setItem('userId', userId.toString());
      await AsyncStorage.setItem('authToken', token);
      set({ userId, token });
    } catch (error) {
      console.error('保存认证信息失败:', error);
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('authToken');
      set({ userId: null, token: null });
    } catch (error) {
      console.error('清除认证信息失败:', error);
    }
  },

  loadAuth: async () => {
    try {
      const [userId, token] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('authToken'),
      ]);

      set({
        userId: userId ? Number(userId) : null,
        token: token || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('加载认证信息失败:', error);
      set({ isLoading: false });
    }
  },
}));


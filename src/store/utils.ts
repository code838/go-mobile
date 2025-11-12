import { LANGUAGE_KEY } from '@/constants/keys';
import { authApi, financeApi, systemApi } from '@/services/api';
import { Store, UtilsSlice } from '@/store/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const createUtilsSlice: StateCreator<
  Store,
  [],
  [['zustand/immer', never], never],
  UtilsSlice
> = immer(set => ({
  coins: [],
  thirdLoginInfo: [],
  areaInfo: [],
  hasHydrated: false,
  showHelpFriendsModal: false,
  setShowHelpFriendsModal: (show: boolean) => {
    set(state => {
      state.showHelpFriendsModal = show;
    });
  },
  setHasHydrated: (hasHydrated: boolean) => {
    set(state => {
      state.hasHydrated = hasHydrated;
    });
  },
  socialLoginLoading: false,
  setSocialLoginLoading: (loading: boolean) => {
    set(state => {
      state.socialLoginLoading = loading;
    });
  },
  language: 'zh',
  setLanguage: async (language: string) => {
    await i18next.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    set(state => {
      state.language = language;
    });
  },

  /**
   * 从本地存储获取语言
   */
  getLanguageFromStorage: async () => {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (language) {
        set(state => {
          state.language = language;
        });
      }
      return language;
    } catch (error) {
      console.error('Failed to get language from storage:', error);
      return 'zh';
    }
  },

  /**
   * 获取币种信息列表
   */
  getCoinsMessage: async () => {
    const response = await financeApi.getCoins();
    if (response.data.code === 0) {
      set(state => {
        state.coins = response.data.data;
      });
    }
  },


  /**
   * 获取第三方登录信息
   */
  getThirdLoginInfo: async () => {
    const { data } = await authApi.getThirdLoginInfo();
    if (data.code === 0 && data.data) {
      set(state => {
        state.thirdLoginInfo = data.data;
      });
    }
  },

  /**
   * 获取地区信息（手机号前缀和国旗）
   */
  getAreaInfo: async () => {
    const { data } = await systemApi.getArea();
    if (data.code === 0 && data.data) {
      set(state => {
        state.areaInfo = data.data;
      });
    }
  }
}));

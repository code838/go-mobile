import { LANGUAGE_KEY } from '@/constants/keys';
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
  hasHydrated: false,
  setHasHydrated: (hasHydrated: boolean) => {
    set(state => {
      state.hasHydrated = hasHydrated;
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
}));

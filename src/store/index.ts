import { createUserSlice } from '@/store/account';
import { createUtilsSlice } from '@/store/utils';
import { useStore } from 'zustand';
import { persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { createStorage } from './createStorage';
import { Store } from './types';


export const vanillaStore = createStore<Store>()(
  persist(
    (set, get, store) => ({
      ...createUserSlice(set, get, store),
      ...createUtilsSlice(set, get, store),
    }),
    {
      name: 'go-store',
      // 配置哪些状态需要持久化
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        coins: state.coins,
        rechargeAddresses: state.rechargeAddresses,
        language: state.language,
        memoizedAccount: state.memoizedAccount,
        thirdLoginInfo: state.thirdLoginInfo,
        areaInfo: state.areaInfo,
        languageList: state.languageList
      }),
      version: 1,
      storage: createStorage() as any,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Store重新水化失败 - 发生错误:', error);
          return;
        }
        if (state) {
          state.setHasHydrated(true);
        } else {
          console.warn('Store重新水化失败 - state为空');
        }
      },
    }
  )
);

export const { getState, setState, subscribe } = vanillaStore;

// __DEV__ && subscribe(console.log);

export const useBoundStore = <T>(selector: (state: Store) => T) =>
  useStore(vanillaStore, selector);

import { Store, UtilsSlice } from '@/store/types';
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
}));

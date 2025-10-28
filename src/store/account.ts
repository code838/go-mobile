import { AccountSlice, Store } from '@/store/types';
import { StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const createUserSlice: StateCreator<
  Store,
  [],
  [['zustand/immer', never], never],
  AccountSlice
> = immer(set => ({
  user: null,
  setUser: (user: any) => {
    set(state => {
      state.user = user;
    });
  },
}));

export type AccountSlice = {
  user: any;
}

export type UtilsSlice = {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export type Store = AccountSlice & UtilsSlice;
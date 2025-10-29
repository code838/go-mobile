export type AccountSlice = {
  user: any;
  setUser: (user: any) => void;
}

export type UtilsSlice = {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  language: string;
  setLanguage: (language: string) => void;
  getLanguageFromStorage: () => Promise<string | null>;
}

export type Store = AccountSlice & UtilsSlice;
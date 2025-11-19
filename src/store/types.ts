import { AreaInfo } from "@/model/AreaInfo";
import { CoinMessage } from "@/model/CoinMessage";
import { RechargeAddress } from "@/model/RechargeAddress";
import { ThirdLoginInfo } from "@/model/ThirdLoginInfo";
import { UserModel } from "@/model/User";

export interface WithdrawFee {
  coinId: number;
  fee: string;
  minAmount?: string;
}

export interface WithdrawFeeType {
  type: number;
  fees: WithdrawFee[];
}

export type AccountSlice = {
  user: UserModel | null;
  setUser: (user: UserModel | null) => void;
  getBalanceByCurrency: (currency: string) => number;
  refreshUserInfo: () => Promise<void>;
  logout: () => Promise<any>;
  deleteAccount: () => Promise<any>;
  token: string | null;
  setToken: (token: string | null) => void;
  memoizedAccount: string | null;
  setMemoizedAccount: (account: string | null) => void;
  rechargeAddresses: RechargeAddress[];
  getAllRechargeAddresses: () => Promise<void>;
  getRechargeAddressByCoinAndNetwork: (coinName: string, network: string) => RechargeAddress | undefined;
  withdrawFees: WithdrawFeeType[];
  getWithdrawFees: () => Promise<void>;
  getWithdrawFeeByCoinId: (coinId: number) => string;
  getMinWithdrawAmountByCoinId: (coinId: number) => string;
}

export type UtilsSlice = {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  language: string;
  setLanguage: (language: string) => void;
  getLanguageFromStorage: () => Promise<string | null>;
  coins: CoinMessage[];
  getCoinsMessage: () => Promise<void>;
  thirdLoginInfo: ThirdLoginInfo[];
  getThirdLoginInfo: () => Promise<void>;
  areaInfo: AreaInfo[];
  getAreaInfo: () => Promise<void>;
  socialLoginLoading: boolean;
  setSocialLoginLoading: (loading: boolean) => void;
  showHelpFriendsModal: boolean;
  setShowHelpFriendsModal: (show: boolean) => void;
  languageList: Language[];
  getLanguageList: () => Promise<void>;
}

export interface Language {
  langname: string;
  langflag: string;
}

export type Store = AccountSlice & UtilsSlice;
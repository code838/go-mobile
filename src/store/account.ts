import { OS_TYPE } from '@/constants/keys';
import { authApi, financeApi, userApi } from '@/services/api';
import { AccountSlice, Store } from '@/store/types';
import { StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const createUserSlice: StateCreator<
  Store,
  [],
  [['zustand/immer', never], never],
  AccountSlice
> = immer((set, get) => ({
  user: null,
  token: null,
  memoizedAccount: null,
  rechargeAddresses: [],
  withdrawFees: [],
  setMemoizedAccount: (account: string | null) => {
    console.log('setMemoizedAccount', account);
    set(state => {
      state.memoizedAccount = account;
    });
  },
  setToken: (token) => {
    set(state => {
      state.token = token;
    });
  },
  setUser: (user) => {
    set(state => {
      state.user = user;
    });
  },
  getBalanceByCurrency: (currency: string) => {
    return +(get().user?.coinsBalance.find(balance => balance.coinName === currency)?.balance || 0);
  },
  refreshUserInfo: async () => {
    const token = get().token;
    if (!token) return;
    const { data } = await userApi.getUserInfo();
    console.log('refreshUserInfo', data);
    if (data.code === 0) {
      set(state => {
        state.user = data.data;
      });
    }
  },
  logout: async () => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user to logout');
    }
    
    const { data } = await authApi.logout({
      userId: currentUser.userId,
      osType: OS_TYPE
    });
    
    if (data.code === 0) {
      set(state => {
        state.user = null;
        state.token = null;
        state.rechargeAddresses = [];
      });
    }
    
    return data;
  },

  deleteAccount: async () => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user to delete');
    }
    
    const { data } = await userApi.deleteAccount({
      userId: currentUser.userId
    });
    
    if (data.code === 0) {
      set(state => {
        state.user = null;
        state.token = null;
        state.memoizedAccount = null;
        state.rechargeAddresses = [];
      });
    }
    
    return data;
  },

  /**
   * 获取所有充值地址
   */
  getAllRechargeAddresses: async () => {
    const user = get().user;
    if (!user?.userId) {
      console.warn('无法获取充值地址：用户未登录');
      return;
    }

    try {
      const { data } = await financeApi.getAllRechargeAddresses({ userId: user.userId });
      if (data.code === 0 && data.data) {
        set(state => {
          state.rechargeAddresses = data.data;
        });
      }
    } catch (error) {
      console.error('获取充值地址失败:', error);
    }
  },

  /**
   * 根据币种和网络获取充值地址
   */
  getRechargeAddressByCoinAndNetwork: (coinName: string, network: string) => {
    const rechargeAddresses = get().rechargeAddresses;
    return rechargeAddresses.find(
      addr => addr.coinName === coinName && addr.network === network
    );
  },

  /**
   * 获取提现手续费
   */
  getWithdrawFees: async () => {
    try {
      const { data } = await financeApi.getWithdrawFees();
      if (data.code === 0 && data.data) {
        set(state => {
          state.withdrawFees = data.data;
        });
      }
    } catch (error) {
      console.error('获取提现手续费失败:', error);
    }
  },

  /**
   * 根据币种ID和类型获取提现手续费
   */
  getWithdrawFeeByCoinId: (coinId: number) => {
    const withdrawFees = get().withdrawFees;
    const feeType = withdrawFees.find(item => item.type === 1);
    if (feeType) {
      const fee = feeType.fees.find(f => f.coinId === coinId);
      return fee?.fee || '0';
    }
    return '0';
  },

  /**
   * 根据币种ID和类型获取最小提现金额
   */
  getMinWithdrawAmountByCoinId: (coinId: number) => {
    const withdrawFees = get().withdrawFees;
    const feeType = withdrawFees.find(item => item.type === 1);
    if (feeType) {
      const fee = feeType.fees.find(f => f.coinId === coinId);
      return fee?.minAmount || '0';
    }
    return '0';
  },
}));

import { addressBookApi, authApi, financeApi, lotteryApi, systemApi, userApi } from '@/services/api';
import { useCallback, useState } from 'react';

// 通用API Hook
export const useApi = <T = any>(apiFunc: (...args: any[]) => Promise<any>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...args);
      setData(response.data.data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

// 认证相关Hook
export const useLogin = () => {
  return useApi(authApi.login);
};

export const useRegister = () => {
  return useApi(authApi.register);
};

export const useLogout = () => {
  return useApi(authApi.logout);
};

export const useResetPassword = () => {
  return useApi(authApi.resetPassword);

};

export const useSendCaptcha = () => {
  return useApi(authApi.sendCaptcha);
};

export const useGetThirdLoginInfo = () => {
  return useApi(authApi.getThirdLoginInfo);
};

export const useThirdLogin = () => {
  return useApi(authApi.thirdLogin);
};

// 用户相关Hook
export const useUserInfo = () => {
  return useApi(userApi.getUserInfo);
};

export const useUpdateNickname = () => {
  return useApi(userApi.updateNickname);
};

export const useUpdateEmailOrPhone = () => {
  return useApi(userApi.updateEmailOrPhone);
};

export const useDeleteAccount = () => {
  return useApi(userApi.deleteAccount);
};

// 财务相关Hook
export const useWithdraw = () => {
  return useApi(financeApi.withdraw);
};

export const useCoins = () => {
  return useApi(financeApi.getCoins);
};

export const useExchangeConfig = () => {
  return useApi(financeApi.getExchangeConfig);
};

export const useExchange = () => {
  return useApi(financeApi.exchange);
};

// 系统信息相关Hook
export const useProtocol = () => {
  return useApi(systemApi.getProtocol);
};

export const useArea = () => {
  return useApi(systemApi.getArea);
};

export const useBasicInfo = () => {
  return useApi(systemApi.getBasicInfo);
};

export const useServiceInfo = () => {
  return useApi(systemApi.getServiceInfo);
};

// 地址簿相关Hook
export const useAddressBookList = () => {
  return useApi(addressBookApi.getAddressBookList);
};

export const useManageAddressBook = () => {
  return useApi(addressBookApi.manageAddressBook);
};

export const useWithdrawFee = () => {
  return useApi(financeApi.getWithdrawFees);
};

export const useOrderList = () => {
  return useApi(financeApi.getOrderList);
};

export const useOrderDetail = () => {
  return useApi(financeApi.getOrderDetail);
};

// 抽奖相关Hook
export const useLotteryInit = () => {
  return useApi(lotteryApi.init);
};

export const useLotteryDraw = () => {
  return useApi(lotteryApi.draw);
};

export const useLotteryRecord = () => {
  return useApi(lotteryApi.getRecord);
};

export const useLotteryAssistRecord = () => {
  return useApi(lotteryApi.getAssistRecord);
};
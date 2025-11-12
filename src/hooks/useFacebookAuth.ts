import { REDIRECT_URI } from '@/constants/keys';
import { useBoundStore } from '@/store';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useEffect } from 'react';

interface UseFacebookAuthProps {
  onSuccess?: (accessToken: string) => void;
  onError?: (error: any) => void;
}

export function useFacebookAuth({ onSuccess, onError }: UseFacebookAuthProps = {}) {
  const thirdLoginInfo = useBoundStore(state => state.thirdLoginInfo);
  
  // 获取Facebook登录配置
  const facebookInfo = thirdLoginInfo.find(info => info.type === 2);
  
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: facebookInfo?.clientId,
    scopes: facebookInfo?.scope ? facebookInfo.scope.split(' ') : ['public_profile', 'email'],
    redirectUri: REDIRECT_URI,
  });

  useEffect(() => {
    console.log('facebook response', response);
    
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('Facebook Access Token:', access_token);
      onSuccess?.(access_token);
    } else if (response?.type === 'error') {
      console.error('Facebook auth error:', response);
      onError?.(response);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      // 用户取消登录
      console.log('Facebook auth cancelled');
      onError?.({ message: 'User cancelled authentication' });
    }
  }, [response, onSuccess, onError]);

  const login = () => {
    if (request) {
      promptAsync();
    }
  };

  return {
    login,
    request,
    response,
    isLoading: !request,
  };
}
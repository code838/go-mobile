import { REDIRECT_URI } from '@/constants/keys';
import { useBoundStore } from '@/store';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';

interface UseGoogleAuthProps {
  onSuccess?: (idToken: string) => void;
  onError?: (error: any) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthProps = {}) {
  const thirdLoginInfo = useBoundStore(state => state.thirdLoginInfo);
  
  // 获取Google登录配置
  const googleInfo = thirdLoginInfo.find(info => info.type === 1);
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: googleInfo?.clientId,
    scopes: googleInfo?.scope ? googleInfo.scope.split(' ') : ['openid', 'profile', 'email'],
    redirectUri: REDIRECT_URI,
  });

  useEffect(() => {
    console.log('google response', response);
    
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('Google ID Token:', access_token);
      onSuccess?.(access_token);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response);
      onError?.(response);
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
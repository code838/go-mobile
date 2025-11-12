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
    androidClientId: '1030552561232-34icg80itt2eimpgk44cjquu3sd0jh2q.apps.googleusercontent.com',
    scopes: googleInfo?.scope ? googleInfo.scope.split(' ') : ['openid', 'profile', 'email'],
    redirectUri: 'com.oneu.vip:/',
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
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      // 用户取消登录
      console.log('Google auth cancelled');
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
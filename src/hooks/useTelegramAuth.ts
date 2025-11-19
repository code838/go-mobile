import { REDIRECT_URI } from '@/constants/keys';
import { useBoundStore } from '@/store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

interface UseTelegramAuthProps {
  onSuccess?: (accessToken: string) => void;
  onError?: (error: any) => void;
}

export function useTelegramAuth({ onSuccess, onError }: UseTelegramAuthProps = {}) {
  const thirdLoginInfo = useBoundStore(state => state.thirdLoginInfo);

  // 获取Telegram登录配置
  const telegramInfo = thirdLoginInfo.find(info => info.type === 3);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: telegramInfo?.clientId || '8511838219',
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        bot_id: telegramInfo?.clientId || '8511838219',
        origin: 'ugo.liberty7788.top',
        request_access: 'write',
        return_to: 'ugo.liberty7788.top',
      },
    },
    {
      authorizationEndpoint: 'https://oauth.telegram.org/auth'
    }
  );

  useEffect(() => {
    console.log('telegram response', response);

    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('Telegram Access Token:', access_token);
      onSuccess?.(access_token);
    } else if (response?.type === 'error') {
      console.error('Telegram auth error:', response);
      onError?.(response);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      // 用户取消登录
      console.log('Telegram auth cancelled');
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


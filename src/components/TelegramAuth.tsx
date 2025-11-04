import { REDIRECT_URI } from '@/constants/keys';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();


export default function TelegramLoginButton() {

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '8421744377',
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Token,
      extraParams: {
        bot_id: '8421744377',
        origin: 'https://liberty7788.top',
        embed: '1',
        request_access: 'write',
        return_to: REDIRECT_URI,
      },
    },
    { 
      authorizationEndpoint: 'https://oauth.telegram.org/auth' 
    }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('Telegram 登录成功:', response.params);
      

    } else if (response?.type === 'error') {
      console.log('Telegram 登录错误:', response.error);
    } else if (response) {
      console.log('Telegram 响应:', response);
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="使用 Telegram 登录"
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
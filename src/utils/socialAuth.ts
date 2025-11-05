import { authApi } from '@/services/api';
import { toast } from '@/utils/toast';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

export interface SocialLoginResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  token?: string;
}

/**
 * 谷歌登录
 */
export async function googleLogin(): Promise<SocialLoginResult> {
  try {
    // 配置 Google 登录
    GoogleSignin.configure({
      iosClientId: '77297535141-5hjkl8ojsrl8708rh98htbt12i3pfbse.apps.googleusercontent.com',
      webClientId: '77297535141-ua6uioj9stni8ptnifl936ib1vji184p.apps.googleusercontent.com'
    });

    // 检查是否有 Google Play 服务
    await GoogleSignin.hasPlayServices();
    
    // 先登出以确保干净的登录状态
    await GoogleSignin.signOut();
    
    // 执行登录
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') {
      return {
        success: false,
        cancelled: true
      };
    }
    const token = await GoogleSignin.getTokens();
    
    console.log('Google login response:', response);
    console.log('Google token:', token);
    
    return {
      success: true,
      token: token.accessToken
    };
  } catch (error: any) {
    console.error('Google login error:', error);
    
    // 如果用户取消登录
    if (error.code === 'SIGN_IN_CANCELLED') {
      return {
        success: false,
        cancelled: true
      };
    }
    
    return {
      success: false,
      error: error.message || 'Google登录失败'
    };
  }
}

/**
 * Facebook 登录
 */
export async function facebookLogin(): Promise<SocialLoginResult> {
  try {
    // 先登出以确保干净的登录状态
    await LoginManager.logOut();
    
    // 执行登录
    const result = await LoginManager.logInWithPermissions(
      ['public_profile', 'email']
    );
    
    if (result.isCancelled) {
      return {
        success: false,
        cancelled: true
      };
    }
    
    // 获取访问令牌
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      return {
        success: false,
        error: '获取访问令牌失败'
      };
    }
    
    console.log('Facebook login token:', data);
    
    return {
      success: true,
      token: data.accessToken
    };
  } catch (error: any) {
    console.error('Facebook login error:', error);
    return {
      success: false,
      error: error.message || 'Facebook登录失败'
    };
  }
}

/**
 * 处理第三方登录逻辑
 */
export async function handleThirdPartyLogin(
  type: number,
  token: string,
  onSuccess: (data: any) => void,
  onError?: (error: string) => void
) {
  try {
    const { data } = await authApi.thirdLogin({
      type,
      token
    });
    
    if (data.code === 0) {
      onSuccess(data.data);
    } else {
      const errorMessage = data.msg;
      onError?.(errorMessage);
      toast.error(errorMessage);
    }
  } catch (error: any) {
    const errorMessage = error.message;
    onError?.(errorMessage);
    toast.error(errorMessage);
  }
}
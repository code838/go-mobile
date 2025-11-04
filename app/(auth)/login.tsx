import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import TelegramLoginButton from '@/components/TelegramAuth';
import { Colors } from '@/constants/colors';
import { useLogin } from '@/hooks/useApi';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { authApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { generateLoginSign, generateNonce, hashPassword } from '@/utils/crypto';
import { toast } from '@/utils/toast';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useImmer } from 'use-immer';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const setUser = useBoundStore(state => state.setUser);
  const setToken = useBoundStore(state => state.setToken);
  const memoizedAccount = useBoundStore(state => state.memoizedAccount);
  const setMemoizedAccount = useBoundStore(state => state.setMemoizedAccount);
  const getAllRechargeAddresses = useBoundStore(state => state.getAllRechargeAddresses);
  const getThirdLoginInfo = useBoundStore(state => state.getThirdLoginInfo);
  const { execute: login, loading: isLoginLoading } = useLogin();
  const [state, setState] = useImmer({
    username: memoizedAccount || '',
    password: '',
    rememberMe: false,
  });
  
  // 初始化时获取第三方登录配置
  useEffect(() => {
    getThirdLoginInfo();
  }, [getThirdLoginInfo]);
  
  // 社交登录hooks
  const googleAuth = useGoogleAuth({
    onSuccess: async (accessToken) => {
      handleThirdLogin(1, accessToken);
    }
  });
  
  const facebookAuth = useFacebookAuth({
    onSuccess: async (accessToken) => {
      handleThirdLogin(2, accessToken);
    }
  });

  const setRememberMe = (rememberMe: boolean) => {
    setState(state => {
      state.rememberMe = rememberMe;
    });
  };

  const setPassword = (password: string) => {
    setState(state => {
      state.password = password;
    });
  };

  const setUsername = (username: string) => {
    setState(state => {
      state.username = username;
    });
  };

  const handleThirdLogin = async (type: number, token: string) => {
    try {
      const {data} = await authApi.thirdLogin({
        type,
        token
      });
      if (data.code === 0) {
        setUser(data.data);
        setToken(data.data.token);
        getAllRechargeAddresses();
        toast.success(t('login.success'));
        router.back();
      }
    } catch (error) {
    }
  }

  async function handleLogin() {
    if (!state.username || !state.password) {
      toast.error(t('login.fillAllFields'));
      return;
    }

    try {
      // 判断是邮箱还是手机号
      const isEmail = state.username.includes('@');
      const type = isEmail ? 1 : 2; // 1: email, 2: phone
      
      // 处理手机号，前面拼接+86
      const content = isEmail ? state.username : `+86${state.username}`;
      
      // 生成时间戳和随机数
      const timestamp = Date.now();
      const nonce = generateNonce();
      
      // 生成签名 sign = md5(content + nonce + md5(明文密码) + timestamp)
      const sign = await generateLoginSign(content, nonce, state.password, timestamp);
      
      // 加密密码
      const hashedPassword = await hashPassword(state.password);
      
      // 构建登录参数
      const loginData = {
        type,
        timestamp,
        nonce,
        sign,
        content,
        password: hashedPassword,
        osType: 1,
      };
      
      console.log('登录参数:', loginData);
      
      // 调用登录API
      const response = await login(loginData);
      console.log('登录响应:', response);
      
      if (response.code === 0) {
        // 登录成功，保存用户信息到store
        setUser(response.data);
        setToken(response.data.token);
        getAllRechargeAddresses();
        if (state.rememberMe) {
          setMemoizedAccount(state.username);
        } else {
          setMemoizedAccount(null);
        }
        toast.success(t('login.success'));
        // 跳转到tab首页
        router.back();
      } else {
        toast.error(response.msg || t('login.loginFailed'));
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      toast.error(error.message || t('login.loginFailed'));
    }
  }

  function handleForgotPassword() {
    router.push('/forget-password' as any);
  }

  function handleRegister() {
    router.push('/register' as any);
  }

  function handleSocialLogin(provider: 'google' | 'facebook' | 'telegram') {
    switch (provider) {
      case 'google':
        googleAuth.login();
        break;
      case 'facebook':
        facebookAuth.login();
        break;
      case 'telegram':
        // TODO: 实现Telegram登录逻辑
        console.log('Telegram登录暂未实现');
        break;
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <LinearGradient
        colors={[Colors.brand, '#67e8f2']}
        style={styles.logo}
      />

      {/* 输入框区域 */}
      <View style={styles.inputContainer}>
        {/* 用户名输入框 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('login.usernamePlaceholder')}
            placeholderTextColor="#6e6e70"
            value={state.username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* 密码输入框 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor="#6e6e70"
            value={state.password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* 记住账户和忘记密码 */}
        <View style={styles.optionsRow}>
          <CheckBox checked={state.rememberMe} onChange={setRememberMe}>
            <Text style={styles.rememberMeText}>{t('login.rememberMe')}</Text>
          </CheckBox>

          <Pressable onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
          </Pressable>
        </View>
      </View>

      {/* 登录按钮 */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('login.loginButton')}
          onPress={handleLogin}
          disabled={!state.username || !state.password}
          loading={isLoginLoading}
          style={styles.button}
        />
      </View>

      {/* 分隔线 */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('login.orContinueWith')}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* 社交登录 */}
      <View style={styles.socialContainer}>
        <Pressable onPress={() => handleSocialLogin('google')}>
          <Image
            source={require('@/assets/images/google.png')}
            style={styles.socialIcon}
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => handleSocialLogin('facebook')}>
          <Image
            source={require('@/assets/images/facebook.png')}
            style={styles.socialIcon}
            contentFit="contain"
          />
        </Pressable>
        <Pressable onPress={() => handleSocialLogin('telegram')}>
          <Image
            source={require('@/assets/images/telegram.png')}
            style={styles.socialIcon}
            contentFit="contain"
          />
        </Pressable>
      </View>

      {/* 注册链接 */}
      <Pressable onPress={handleRegister}>
        <Text style={styles.registerText}>
          {t('login.noAccount')}
          <Text style={styles.registerLink}>{t('login.register')}</Text>
        </Text>
      </Pressable>

      <TelegramLoginButton />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 128,
    paddingBottom: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    gap: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 99,
  },
  inputContainer: {
    width: '100%',
    gap: 12,
  },
  inputWrapper: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    padding: 0,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e6e70',
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e6e70',
  },
  buttonContainer: {
    width: '100%',
    paddingVertical: 24,
    gap: 10,
  },
  button: {
    alignSelf: 'stretch',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1d1d1d',
  },
  dividerText: {
    fontSize: 10,
    color: '#6e6e70',
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e6e70',
  },
  registerLink: {
    color: Colors.brand,
  },
});
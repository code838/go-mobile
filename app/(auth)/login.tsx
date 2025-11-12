import AreaCodePicker from '@/components/AreaCodePicker';
import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import LoginTypeSwitch, { LoginType } from '@/components/LoginTypeSwitch';
import SocialLoginLoading from '@/components/SocialLoginLoading';
import { Colors } from '@/constants/colors';
import { useLogin } from '@/hooks/useApi';
import { useBoundStore } from '@/store';
import { generateLoginSign, generateNonce, hashPassword } from '@/utils/crypto';
import { facebookLogin, googleLogin, handleThirdPartyLogin } from '@/utils/socialAuth';
import { toast } from '@/utils/toast';
import { isValidEmail, isValidPhone } from '@/utils/validation';
import { Image } from 'expo-image';
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
  const setSocialLoginLoading = useBoundStore(state => state.setSocialLoginLoading);
  const { execute: login, loading: isLoginLoading } = useLogin();
  const [state, setState] = useImmer({
    loginType: 'phone' as LoginType,
    areaCode: '+86',
    username: memoizedAccount || '',
    password: '',
    rememberMe: false,
  });
  
  // 初始化时获取第三方登录配置
  useEffect(() => {
    getThirdLoginInfo();
  }, [getThirdLoginInfo]);
  
  function setLoginType(loginType: LoginType) {
    setState(draft => {
      draft.loginType = loginType;
    });
  }

  function setAreaCode(areaCode: string) {
    setState(draft => {
      draft.areaCode = areaCode;
    });
  }

  function setRememberMe(rememberMe: boolean) {
    setState(draft => {
      draft.rememberMe = rememberMe;
    });
  }

  function setPassword(password: string) {
    setState(draft => {
      draft.password = password;
    });
  }

  function setUsername(username: string) {
    setState(draft => {
      draft.username = username;
    });
  }


  async function handleLogin() {
    if (!state.username || !state.password) {
      toast.error(t('login.fillAllFields'));
      return;
    }

    // 验证输入格式是否匹配登录方式
    const isEmail = state.loginType === 'email';
    if (isEmail) {
      if (!isValidEmail(state.username)) {
        toast.error(t('login.invalidEmail'));
        return;
      }
    } else {
      if (!isValidPhone(state.username)) {
        toast.error(t('login.invalidPhone'));
        return;
      }
    }

    try {
      // 根据选择的类型判断
      const type = isEmail ? 1 : 2; // 1: email, 2: phone
      
      // 处理手机号，前面拼接区号
      const content = isEmail ? state.username : `${state.areaCode}${state.username}`;
      
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

  async function handleSocialLogin(provider: 'google' | 'facebook' | 'telegram') {
    if (provider === 'telegram') {
      console.log('Telegram登录暂未实现');
      return;
    }

    setSocialLoginLoading(true);

    try {
      let result;
      let loginType;

      switch (provider) {
        case 'google':
          result = await googleLogin();
          loginType = 1;
          break;
        case 'facebook':
          result = await facebookLogin();
          loginType = 2;
          break;
        default:
          return;
      }

      if (result.cancelled) {
        return;
      }

      if (!result.success) {
        if (result.error) {
          toast.error(result.error);
        }
        return;
      }

      if (result.token) {
        await handleThirdPartyLogin(
          loginType,
          result.token,
          (userData) => {
            setUser(userData);
            setToken(userData.token);
            getAllRechargeAddresses();
            toast.success(t('login.success'));
            router.back();
          },
          (error) => {
            toast.error(error);
          }
        );
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      toast.error(error.message || t('login.loginFailed'));
    } finally {
      setSocialLoginLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('@/assets/images/go-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />

      {/* 登录类型切换 */}
      <LoginTypeSwitch value={state.loginType} onChange={setLoginType} />

      {/* 输入框区域 */}
      <View style={styles.inputContainer}>
        {/* 用户名输入框 */}
        {state.loginType === 'phone' ? (
          <View style={styles.phoneInputRow}>
            {/* 地区选择器 */}
            <View style={styles.areaCodeContainer}>
              <AreaCodePicker value={state.areaCode} onChange={setAreaCode} />
            </View>
            {/* 手机号输入框 */}
            <View style={styles.phoneInputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('login.phonePlaceholder')}
                placeholderTextColor="#6e6e70"
                value={state.username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor="#6e6e70"
              value={state.username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        )}

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

      {/* <TelegramLoginButton /> */}

      <SocialLoginLoading />
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
  },
  inputContainer: {
    width: '100%',
    gap: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  areaCodeContainer: {
    width: 120,
  },
  phoneInputWrapper: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
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
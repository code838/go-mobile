import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import { Colors } from '@/constants/colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
  const [state, setState] = useImmer({
    username: '',
    password: '',
    rememberMe: false,
    isLoading: false,
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

  async function handleLogin() {
    setState(draft => {
      draft.isLoading = true;
    });
    try {
      // TODO: 实现登录逻辑
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setState(draft => {
        draft.isLoading = false;
      });
    }
  }

  function handleForgotPassword() {
    router.push('/forget-password' as any);
  }

  function handleRegister() {
    router.push('/register' as any);
  }

  function handleSocialLogin(provider: 'google' | 'facebook' | 'telegram') {
    // TODO: 实现社交登录逻辑
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
          loading={state.isLoading}
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
    color: '#6e6e70',
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
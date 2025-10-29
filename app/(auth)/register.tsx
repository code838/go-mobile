import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import VerifyCodeButton from '@/components/VerifyCodeButton';
import { Colors } from '@/constants/colors';
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

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [state, setState] = useImmer({
    phone: '',
    verifyCode: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    agreedToTerms: false,
    isLoading: false,
  });

  function setPhone(phone: string) {
    setState(draft => {
      draft.phone = phone;
    });
  }

  function setVerifyCode(verifyCode: string) {
    setState(draft => {
      draft.verifyCode = verifyCode;
    });
  }

  function setPassword(password: string) {
    setState(draft => {
      draft.password = password;
    });
  }

  function setConfirmPassword(confirmPassword: string) {
    setState(draft => {
      draft.confirmPassword = confirmPassword;
    });
  }

  function setInviteCode(inviteCode: string) {
    setState(draft => {
      draft.inviteCode = inviteCode;
    });
  }

  function setAgreedToTerms(agreedToTerms: boolean) {
    setState(draft => {
      draft.agreedToTerms = agreedToTerms;
    });
  }

  async function handleSendCode() {
    if (!state.phone) {
      // TODO: 显示错误提示
      return;
    }
    // TODO: 实现发送验证码逻辑
    console.log('发送验证码到:', state.phone);
  }

  async function handleRegister() {
    if (!state.agreedToTerms) {
      // TODO: 显示错误提示
      return;
    }
    if (state.password !== state.confirmPassword) {
      // TODO: 显示错误提示
      return;
    }
    setState(draft => {
      draft.isLoading = true;
    });
    try {
      // TODO: 实现注册逻辑
      console.log('注册信息:', state);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setState(draft => {
        draft.isLoading = false;
      });
    }
  }

  function handleLogin() {
    router.push('/login' as any);
  }

  function handleUserAgreement() {
    // TODO: 跳转到用户协议页面
    console.log('打开用户协议');
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
        {/* 手机号/邮箱输入框 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('register.phonePlaceholder')}
            placeholderTextColor="#6e6e70"
            value={state.phone}
            onChangeText={setPhone}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* 验证码输入框和发送按钮 */}
        <View style={styles.verifyCodeRow}>
          <View style={styles.verifyCodeInputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t('register.verifyCodePlaceholder')}
              placeholderTextColor="#6e6e70"
              value={state.verifyCode}
              onChangeText={setVerifyCode}
              keyboardType="number-pad"
            />
          </View>
          <VerifyCodeButton
            onSendCode={handleSendCode}
            disabled={!state.phone}
          />
        </View>

        {/* 密码输入框 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('register.passwordPlaceholder')}
            placeholderTextColor="#6e6e70"
            value={state.password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* 密码确认输入框 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('register.confirmPasswordPlaceholder')}
            placeholderTextColor="#6e6e70"
            value={state.confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* 邀请码输入框 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('register.inviteCodePlaceholder')}
            placeholderTextColor="#6e6e70"
            value={state.inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* 用户协议 */}
      <View style={styles.termsContainer}>
        <CheckBox checked={state.agreedToTerms} onChange={setAgreedToTerms}>
          <View style={styles.termTextRow}>
            <Text style={styles.termsText}>
              {t('register.agreeTerms')}
            </Text>
            <Pressable onPress={handleUserAgreement}>
              <Text style={styles.termsLink}>{t('register.userAgreement')}</Text>
            </Pressable>
          </View>
        </CheckBox>
      </View>

      {/* 注册按钮 */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('register.registerButton')}
          onPress={handleRegister}
          disabled={
            !state.phone ||
            !state.verifyCode ||
            !state.password ||
            !state.confirmPassword ||
            !state.agreedToTerms
          }
          loading={state.isLoading}
          style={styles.button}
        />
      </View>

      {/* 登录链接 */}
      <Pressable onPress={handleLogin}>
        <Text style={styles.loginText}>
          {t('register.hasAccount')}
          <Text style={styles.loginLink}>{t('register.login')}</Text>
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
    gap: 16,
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
    color: 'white',
    fontWeight: '500',
    padding: 0,
  },
  verifyCodeRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  verifyCodeInputWrapper: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  termsContainer: {
    width: '100%',
  },
  termsText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  termsLink: {
    color: Colors.brand,
  },
  buttonContainer: {
    width: '100%',
    paddingVertical: 24,
    gap: 10,
  },
  button: {
    alignSelf: 'stretch',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6e6e70',
  },
  loginLink: {
    color: Colors.brand,
  },
  termTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});


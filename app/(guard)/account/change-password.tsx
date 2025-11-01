import Button from '@/components/Button';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { useResetPassword } from '@/hooks/useApi';
import { useBoundStore } from '@/store';
import { hashPassword } from '@/utils/crypto';
import { toast } from '@/utils/toast';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useImmer } from 'use-immer';

export default function ChangePassword() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useBoundStore(state => state.user);
  const { execute: resetPassword, loading: isResetPasswordLoading } = useResetPassword();
  const [state, setState] = useImmer({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  function setOldPassword(oldPassword: string) {
    setState(draft => {
      draft.oldPassword = oldPassword;
    });
  }

  function setNewPassword(newPassword: string) {
    setState(draft => {
      draft.newPassword = newPassword;
    });
  }

  function setConfirmPassword(confirmPassword: string) {
    setState(draft => {
      draft.confirmPassword = confirmPassword;
    });
  }

  function handleCancel() {
    router.back();
  }

  async function handleConfirm() {
    if (!state.oldPassword || !state.newPassword || !state.confirmPassword) {
      toast.error(t('register.fillAllFields'));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      toast.error(t('register.passwordMismatch'));
      return;
    }

    if (!user?.userId) {
      toast.error(t('common.pleaseLogin'));
      return;
    }

    try {
      // 加密密码
      const hashedOldPassword = await hashPassword(state.oldPassword);
      const hashedNewPassword = await hashPassword(state.newPassword);

      // 构建修改密码参数
      const resetData = {
        userId: parseInt(user.userId, 10), // 转换为number类型
        password: hashedNewPassword,
        type: 2 as const, // 修改密码类型
        originalPwd: hashedOldPassword,
      };

      const response = await resetPassword(resetData);
      if (response.code === 0) {
        toast.success('密码修改成功');
        router.back();
      } else {
        toast.error(response.msg || '密码修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      toast.error(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <PageDecoration />
      
      <NavigationBar title={t('changePassword.title')} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* 表单区域 */}
          <View style={styles.formContainer}>
            {/* 旧密码 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('changePassword.oldPassword')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={state.oldPassword}
                  onChangeText={setOldPassword}
                  placeholder={t('changePassword.placeholder')}
                  placeholderTextColor={Colors.secondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* 新密码 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('changePassword.newPassword')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={state.newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t('changePassword.placeholder')}
                  placeholderTextColor={Colors.secondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* 确认密码 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t('changePassword.confirmPassword')}
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={state.confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('changePassword.placeholder')}
                  placeholderTextColor={Colors.secondary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 底部按钮 */}
        <View
          style={[
            styles.buttonContainer,
            { paddingBottom: insets.bottom + 16 },
          ]}>
          <Button
            title={t('changePassword.cancel')}
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isResetPasswordLoading}
          />
          <Button
            title={t('changePassword.confirm')}
            onPress={handleConfirm}
            style={styles.confirmButton}
            disabled={
              !state.oldPassword ||
              !state.newPassword ||
              !state.confirmPassword
            }
            loading={isResetPasswordLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    gap: 24,
  },
  fieldContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    padding: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  confirmButton: {
    flex: 1,
  },
});


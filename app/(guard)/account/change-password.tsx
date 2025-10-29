import Button from '@/components/Button';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function ChangePassword() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleCancel() {
    router.back();
  }

  function handleConfirm() {
    // TODO: 实现修改密码逻辑
    console.log('修改密码', { oldPassword, newPassword, confirmPassword });
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
                  value={oldPassword}
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
                  value={newPassword}
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
                  value={confirmPassword}
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
          />
          <Button
            title={t('changePassword.confirm')}
            onPress={handleConfirm}
            style={styles.confirmButton}
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


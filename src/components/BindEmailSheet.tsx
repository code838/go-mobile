import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import BottomSheet from './BottomSheet';
import Button from './Button';
import VerifyCodeButton from './VerifyCodeButton';

import { Colors } from '@/constants/colors';

interface BindEmailSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (email: string, code: string) => void;
}

/**
 * 绑定邮箱底部弹窗
 */
export default function BindEmailSheet({ visible, onClose, onConfirm }: BindEmailSheetProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  /**
   * 发送验证码
   */
  async function handleSendCode() {
    // TODO: 调用发送验证码 API
    console.log('发送验证码到邮箱:', email);
    return Promise.resolve();
  }

  /**
   * 确认绑定
   */
  function handleConfirm() {
    if (email.trim().length === 0 || code.trim().length === 0) {
      return;
    }
    onConfirm(email.trim(), code.trim());
  }

  /**
   * 验证邮箱格式
   */
  function isValidEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  return (
    <BottomSheet visible={visible} title={t('bindEmail.title')} onClose={onClose}>
      {/* 邮箱输入框 + 获取验证码按钮 */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('bindEmail.emailPlaceholder')}
            placeholderTextColor={Colors.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <VerifyCodeButton
          onSendCode={handleSendCode}
          disabled={!isValidEmail()}
        />
      </View>

      {/* 验证码输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder={t('bindEmail.codePlaceholder')}
          placeholderTextColor={Colors.secondary}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      {/* 确认按钮 */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('bindEmail.confirm')}
          onPress={handleConfirm}
          disabled={!isValidEmail() || code.trim().length === 0}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    padding: 0,
  },
  codeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  buttonContainer: {
    paddingTop: 24,
  },
});


import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import BottomSheet from './BottomSheet';
import Button from './Button';
import VerifyCodeButton from './VerifyCodeButton';

import { Colors } from '@/constants/colors';
import { useSendCaptcha } from '@/hooks/useApi';
import { toast } from '@/utils/toast';

interface BindPhoneSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (phone: string, code: string) => void;
}

/**
 * 绑定手机号底部弹窗
 */
export default function BindPhoneSheet({ visible, onClose, onConfirm }: BindPhoneSheetProps) {
  const { t } = useTranslation();
  const { execute: sendCaptcha, loading: isSendCaptchaLoading } = useSendCaptcha();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!visible) {
      setPhone('');
      setCode('');
    }
  }, [visible]);


  /**
   * 发送验证码
   */
  async function handleSendCode() {
    if (!phone.trim() || !isValidPhone()) {
      toast.error(t('bindPhone.invalidPhone'));
      return;
    }

    try {
      // 发送手机验证码，添加+86前缀
      await sendCaptcha({ content: `+86${phone.trim()}`, type: 2 }); // type: 2 表示手机号
      toast.success(t('captcha.sendSuccess'));
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      toast.error(error.message);
    }
  }

  /**
   * 确认绑定
   */
  function handleConfirm() {
    if (phone.trim().length === 0 || code.trim().length === 0) {
      return;
    }
    onConfirm(phone.trim(), code.trim());
  }

  /**
   * 验证手机号格式
   */
  function isValidPhone() {
    // 简单验证：至少8位数字
    const phoneRegex = /^\+?\d{6,}$/;
    return phoneRegex.test(phone.trim());
  }

  return (
    <BottomSheet visible={visible} title={t('bindPhone.title')} onClose={onClose}>
      {/* 手机号输入框 + 获取验证码按钮 */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('bindPhone.phonePlaceholder')}
            placeholderTextColor={Colors.secondary}
            keyboardType="phone-pad"
          />
        </View>
        <VerifyCodeButton
          onSendCode={handleSendCode}
          disabled={!isValidPhone() || isSendCaptchaLoading}
        />
      </View>

      {/* 验证码输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder={t('bindPhone.codePlaceholder')}
          placeholderTextColor={Colors.secondary}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      {/* 确认按钮 */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('bindPhone.confirm')}
          onPress={handleConfirm}
          disabled={!isValidPhone() || code.trim().length === 0}
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


import { Colors } from '@/constants/colors';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useImmer } from 'use-immer';

interface VerifyCodeButtonProps {
  onSendCode: () => void | Promise<void>;
  disabled?: boolean;
  countdown?: number;
}

/**
 * 验证码倒计时按钮组件
 * 
 * @param onSendCode - 发送验证码的回调函数
 * @param disabled - 是否禁用按钮
 * @param countdown - 倒计时秒数，默认60秒
 * 
 * @example
 * ```tsx
 * <VerifyCodeButton 
 *   onSendCode={async () => {
 *     await sendVerificationCode(phone);
 *   }}
 *   countdown={60}
 * />
 * ```
 */
export default function VerifyCodeButton({
  onSendCode,
  disabled = false,
  countdown = 60,
}: VerifyCodeButtonProps) {
  const { t } = useTranslation();
  const [state, setState] = useImmer({
    isCounting: false,
    remainingTime: countdown,
  });

  useEffect(() => {
    if (!state.isCounting) return;

    if (state.remainingTime <= 0) {
      setState(draft => {
        draft.isCounting = false;
        draft.remainingTime = countdown;
      });
      return;
    }

    const timer = setTimeout(() => {
      setState(draft => {
        const newTime = draft.remainingTime - 1;
        if (newTime <= 0) {
          // 倒计时结束，重置状态
          draft.isCounting = false;
          draft.remainingTime = countdown;
        } else {
          draft.remainingTime = newTime;
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.isCounting, state.remainingTime, countdown, setState]);

  async function handlePress() {
    if (disabled || state.isCounting) return;

    setState(draft => {
      draft.isCounting = true;
      draft.remainingTime = countdown;
    });

    try {
      await onSendCode();
    } catch (error) {
      // 如果发送失败，重置倒计时状态
      setState(draft => {
        draft.isCounting = false;
        draft.remainingTime = countdown;
      });
      throw error;
    }
  }

  const isDisabled = disabled || state.isCounting;
  const buttonText = state.isCounting
    ? `${state.remainingTime}s`
    : t('register.sendCode');

  return (
    <Pressable
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <Text style={styles.buttonText}>{buttonText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.brand,
    borderRadius: 8,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1d1d1d',
  },
  buttonDisabled: {
    backgroundColor: Colors.secondary,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});


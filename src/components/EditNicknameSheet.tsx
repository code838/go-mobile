import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import BottomSheet from './BottomSheet';
import Button from './Button';

import { Colors } from '@/constants/colors';

interface EditNicknameSheetProps {
  visible: boolean;
  currentNickname: string;
  onClose: () => void;
  onConfirm: (nickname: string) => void;
}

/**
 * 修改昵称底部弹窗
 */
export default function EditNicknameSheet({
  visible,
  currentNickname,
  onClose,
  onConfirm,
}: EditNicknameSheetProps) {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState(currentNickname);

  /**
   * 清除输入
   */
  function handleClear() {
    setNickname('');
  }

  /**
   * 确认保存
   */
  function handleConfirm() {
    if (nickname.trim().length === 0) {
      return;
    }
    onConfirm(nickname.trim());
  }

  return (
    <BottomSheet visible={visible} title={t('editNickname.title')} onClose={onClose}>
      {/* 昵称输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder={t('editNickname.placeholder')}
          placeholderTextColor={Colors.secondary}
          maxLength={20}
        />
        {nickname.length > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClear} hitSlop={8}>
            <View style={styles.clearIcon}>
              <View style={[styles.clearLine, styles.clearLine1]} />
              <View style={[styles.clearLine, styles.clearLine2]} />
            </View>
          </Pressable>
        )}
      </View>

      {/* 提示文字 */}
      <Text style={styles.hint}>{t('editNickname.hint')}</Text>

      {/* 保存按钮 */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('editNickname.save')}
          onPress={handleConfirm}
          disabled={nickname.trim().length === 0}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    padding: 0,
  },
  clearButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  clearIcon: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLine: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    backgroundColor: Colors.title,
    borderRadius: 1,
  },
  clearLine1: {
    transform: [{ rotate: '45deg' }],
  },
  clearLine2: {
    transform: [{ rotate: '-45deg' }],
  },
  hint: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  buttonContainer: {
    paddingTop: 24,
  },
});


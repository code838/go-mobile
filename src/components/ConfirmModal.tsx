import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface ConfirmModalProps {
  /**
   * 是否显示弹窗
   */
  visible: boolean;
  /**
   * 弹窗标题
   */
  title: string;
  /**
   * 弹窗内容
   */
  content: string;
  /**
   * 左侧按钮文字
   */
  leftButtonText?: string;
  /**
   * 左侧按钮文字颜色
   * @default Colors.title (白色)
   */
  leftButtonColor?: string;
  /**
   * 右侧按钮文字
   */
  rightButtonText?: string;
  /**
   * 右侧按钮文字颜色
   * @default Colors.alert (红色)
   */
  rightButtonColor?: string;
  /**
   * 左侧按钮点击事件
   */
  onLeftPress?: () => void;
  /**
   * 右侧按钮点击事件
   */
  onRightPress?: () => void;
  /**
   * 点击遮罩层关闭
   * @default true
   */
  closeOnBackdropPress?: boolean;
}

/**
 * 通用确认弹窗组件
 * 
 * 使用示例:
 * ```tsx
 * <ConfirmModal
 *   visible={visible}
 *   title="确认删除"
 *   content="删除您的账户数据将清除，是否确认？"
 *   onLeftPress={() => setVisible(false)}
 *   onRightPress={() => handleDelete()}
 * />
 * 
 * // 自定义按钮文字和颜色
 * <ConfirmModal
 *   visible={visible}
 *   title="确认操作"
 *   content="您确定要执行此操作吗？"
 *   leftButtonText="我再想想"
 *   leftButtonColor="#999999"
 *   rightButtonText="立即执行"
 *   rightButtonColor="#00FF00"
 *   onLeftPress={() => setVisible(false)}
 *   onRightPress={() => handleAction()}
 * />
 * ```
 */
export default function ConfirmModal({
  visible,
  title,
  content,
  leftButtonText,
  leftButtonColor = Colors.title,
  rightButtonText,
  rightButtonColor = Colors.alert,
  onLeftPress,
  onRightPress,
  closeOnBackdropPress = true,
}: ConfirmModalProps) {
  function handleBackdropPress() {
    if (closeOnBackdropPress && onLeftPress) {
      onLeftPress();
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* 标题 */}
          <Text style={styles.title}>{title}</Text>

          {/* 内容 */}
          <Text style={styles.content}>{content}</Text>

          {/* 按钮组 */}
          <View style={styles.buttonGroup}>
            {/* 左侧按钮 */}
            <Pressable
              style={styles.button}
              onPress={onLeftPress}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <Text style={[styles.buttonText, { color: leftButtonColor }]}>
                {leftButtonText}
              </Text>
            </Pressable>

            {/* 右侧按钮 */}
            <Pressable
              style={styles.button}
              onPress={onRightPress}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <Text style={[styles.buttonText, { color: rightButtonColor }]}>
                {rightButtonText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 1)',
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.title,
    textAlign: 'center',
  },
  content: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.subtitle,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});


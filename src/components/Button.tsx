import { Colors } from '@/constants/colors';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * 按钮文本
   */
  title: string;
  /**
   * 是否禁用按钮
   * @default false
   */
  disabled?: boolean;
  /**
   * 是否显示加载状态
   * @default false
   */
  loading?: boolean;
  /**
   * 按钮容器样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * 按钮文本样式
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * 加载指示器颜色
   * @default 'white'
   */
  loadingColor?: string;
}

/**
 * 通用按钮组件
 * 
 * 使用示例:
 * ```tsx
 * // 单独使用（全宽）
 * <Button
 *   title="登录"
 *   onPress={handleLogin}
 *   disabled={!username || !password}
 *   loading={isLoading}
 *   style={{ alignSelf: 'stretch' }}
 * />
 * 
 * // 两个按钮并列
 * <View style={{ flexDirection: 'row', gap: 10 }}>
 *   <Button title="取消" onPress={handleCancel} style={{ flex: 1 }} />
 *   <Button title="确认" onPress={handleConfirm} style={{ flex: 1 }} />
 * </View>
 * 
 * // 自适应内容宽度
 * <Button title="提交" onPress={handleSubmit} />
 * ```
 */
export default function Button({
  title,
  disabled = false,
  loading = false,
  style,
  textStyle,
  loadingColor = 'white',
  onPress,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  function handlePress(event: any) {
    if (isDisabled) return;
    onPress?.(event);
  }

  return (
    <Pressable
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    // 不设置固定宽度，让调用方通过 style 属性控制
    // 如需全宽：style={{ alignSelf: 'stretch' }} 或 style={{ flex: 1 }}
  },
  buttonDisabled: {
    backgroundColor: Colors.secondary,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});


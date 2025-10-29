import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';

interface NavigationBarProps {
  /**
   * 导航栏标题
   */
  title: string;
  /**
   * 是否显示返回按钮
   * @default true
   */
  showBack?: boolean;
  /**
   * 自定义返回事件
   * 如果不提供，默认使用 router.back()
   */
  onBack?: () => void;
  /**
   * 右侧自定义内容
   */
  rightContent?: React.ReactNode;
}

/**
 * 通用导航栏组件
 * 
 * 使用示例:
 * ```tsx
 * <NavigationBar title="我的资料" />
 * 
 * <NavigationBar 
 *   title="设置" 
 *   onBack={() => console.log('返回')}
 *   rightContent={<Button title="保存" />}
 * />
 * ```
 */
export default function NavigationBar({
  title,
  showBack = true,
  onBack,
  rightContent,
}: NavigationBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* 左侧返回按钮 */}
        {showBack && (
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={styles.backIconContainer}>
              <Image
                source={require('@/assets/images/chevron-right.png')}
                style={styles.backIcon}
                contentFit="contain"
              />
            </View>
          </Pressable>
        )}

        {/* 标题 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* 右侧内容或占位 */}
        <View style={styles.rightContainer}>
          {rightContent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    position: 'relative',
  },
  titleContainer: {
    position: 'absolute',
    left: 60,
    right: 60,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 4,
    alignItems: 'center',
  },
  backIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.title,
  },
  rightContainer: {
    minWidth: 28,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});


import { AnimatePresence, MotiView } from 'moti';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  contentStyle?: ViewStyle;
}

/**
 * 通用底部弹窗组件
 * 使用 moti 实现流畅的动画效果：
 * - 背景遮罩使用 fade 效果
 * - 底部内容使用 slideUp/slideDown 效果
 * - 关闭时先 slideDown，然后 fade out
 *
 * @example
 * ```tsx
 * <BottomSheet
 *   visible={visible}
 *   title="修改昵称"
 *   onClose={() => setVisible(false)}
 * >
 *   <View>弹窗内容</View>
 * </BottomSheet>
 * ```
 */
export default function BottomSheet({
  visible,
  title,
  onClose,
  children,
  contentStyle,
}: BottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  /**
   * 处理关闭动画
   */
  function handleClose() {
    setIsClosing(true);
    onClose();
  }

  // 重置关闭状态
  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* 背景遮罩 - fade 效果 */}
        <AnimatePresence>
          {visible && !isClosing && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 200 }}
              style={StyleSheet.absoluteFill}>
              <Pressable style={styles.backdrop} onPress={handleClose} />
            </MotiView>
          )}
        </AnimatePresence>

        {/* 底部内容卡片 - slideUp/slideDown 效果 */}
        <MotiView
          from={{ translateY: 500 }}
          animate={{ translateY: isClosing ? 500 : 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={[styles.container, contentStyle]}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={8}>
              <View style={styles.closeIcon}>
                <View style={[styles.closeLine, styles.closeLine1]} />
                <View style={[styles.closeLine, styles.closeLine2]} />
              </View>
            </Pressable>
          </View>

          {/* 内容区域 */}
          <View style={styles.content}>{children}</View>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#1D1D1D',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.subtitle,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: Colors.subtitle,
    borderRadius: 1,
  },
  closeLine1: {
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    transform: [{ rotate: '-45deg' }],
  },
  content: {
    gap: 24,
  },
});


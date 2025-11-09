import { Image } from 'expo-image';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/constants/colors';

interface LotteryResultModalProps {
  /**
   * 是否显示弹窗
   */
  visible: boolean;
  /**
   * 中奖金额
   */
  amount: string;
  /**
   * 关闭回调
   */
  onClose: () => void;
  /**
   * 收下奖励回调
   */
  onConfirm: () => void;
}

/**
 * 抽奖结果弹窗组件
 * 
 * 使用示例:
 * ```tsx
 * <LotteryResultModal
 *   visible={visible}
 *   amount="100U"
 *   onClose={() => setVisible(false)}
 *   onConfirm={() => handleConfirm()}
 * />
 * ```
 */
export default function LotteryResultModal({
  visible,
  amount,
  onClose,
  onConfirm,
}: LotteryResultModalProps) {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  /**
   * 处理关闭动画
   */
  function handleClose() {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }

  /**
   * 处理确认
   */
  function handleConfirm() {
    onConfirm();
    handleClose();
  }

  // 重置关闭状态
  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
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

        {/* 弹窗内容 - scale 效果 */}
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: isClosing ? 0.5 : 1, opacity: isClosing ? 0 : 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.container}>
          {/* 顶部装饰花朵 */}
          <Image
            source={require('@/assets/images/result-flower1.png')}
            style={styles.flowerTop}
            contentFit="contain"
          />

          {/* 主背景 */}
          <Image
            source={require('@/assets/images/result-bg.png')}
            style={styles.backgroundImage}
            contentFit="contain"
          />

          {/* 标题背景和文字 */}
          <View style={styles.titleContainer}>
            <Image
              source={require('@/assets/images/result-title.png')}
              style={styles.titleBackground}
              contentFit="contain"
            />
            <Text style={styles.titleText}>{t('lottery.congratulations')}</Text>
          </View>

          {/* 中奖金额区域 */}
          <View style={styles.amountContainer}>
            {/* 内层显示金额的背景 */}
            <Image
              source={require('@/assets/images/result-letter.png')}
              style={styles.letterInner}
              contentFit="contain"
            />

            {/* 金额文字 */}
            <Text style={styles.amountText}>{amount}</Text>
          </View>
          {/* 外层盖住的背景 */}
          <Image
            source={require('@/assets/images/result-letter-out.png')}
            style={styles.letterOuter}
            contentFit="cover"
          />
          <View style={styles.buttonContainer}>
            {/* 收下奖励按钮 */}
            <Pressable
              style={styles.confirmButton}
              onPress={handleConfirm}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
              <Text style={styles.confirmButtonText}>{t('lottery.claimReward')}</Text>
            </Pressable>

            {/* 底部说明文字 */}
            <View style={styles.bottomTextContainer}>
              <View style={styles.line} />
              <Text style={styles.bottomText}>{t('lottery.depositToCashAccount')}</Text>
              <View style={styles.line} />
            </View>
          </View>

          {/* 底部装饰花朵 */}
          <Image
            source={require('@/assets/images/result-flower2.png')}
            style={styles.flowerBottom}
            contentFit="contain"
          />

          {/* 关闭按钮 */}
          <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={8}>
            <View style={styles.closeIcon}>
              <View style={[styles.closeLine, styles.closeLine1]} />
              <View style={[styles.closeLine, styles.closeLine2]} />
            </View>
          </Pressable>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: 265,
    height: 293,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: 265,
    height: 293,
  },
  flowerTop: {
    position: 'absolute',
    width: 264,
    height: 126,
    top: 52,
    transform: [{ scaleY: -1 }],
  },
  flowerBottom: {
    position: 'absolute',
    width: 340,
    height: 103,
    bottom: 0,
  },
  titleContainer: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBackground: {
    width: 189,
    height: 79,
    position: 'absolute',
  },
  titleText: {
    fontSize: 20,
    position: 'absolute',
    top: -32,
    fontWeight: '600',
    color: Colors.title,
    textAlign: 'center',
    zIndex: 1,
  },
  amountContainer: {
    position: 'absolute',
    top: 70,
    width: 229,
    height: 164,
  },
  letterInner: {
    position: 'absolute',
    width: 237,
    height: 177,
  },
  letterOuter: {
    position: 'absolute',
    height: 128,
    left: -10,
    right: -10,
    bottom: 0,
    zIndex: 1,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#310842',
    textAlign: 'center',
    zIndex: 2,
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    bottom: 0,
    left: 0,
    right: 0,
    gap: 20,
    paddingBottom: 30
  },
  confirmButton: {
    width: 186,
    height: 60,
    borderRadius: 38,
    backgroundColor: '#E344C3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9685DB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  confirmButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.title,
    textAlign: 'center',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bottomText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#471D98',
    textAlign: 'center',
  },
  line: {
    width: 41,
    borderWidth: 0.5,
    borderColor: '#471D98',
    borderStyle: 'dotted',
  },
  closeButton: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 20,
  },
  closeIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: Colors.title,
    borderRadius: 1,
  },
  closeLine1: {
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    transform: [{ rotate: '-45deg' }],
  },
});


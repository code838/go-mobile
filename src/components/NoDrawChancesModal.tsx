import { LinearGradient } from 'expo-linear-gradient';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface NoDrawChancesModalProps {
  /**
   * 是否显示弹窗
   */
  visible: boolean;
  /**
   * 关闭回调
   */
  onClose: () => void;
  /**
   * 邀请好友回调
   */
  onInvite: () => void;
}

/**
 * 无抽奖次数弹窗组件
 * 
 * 使用示例:
 * ```tsx
 * <NoDrawChancesModal
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   onInvite={() => handleInvite()}
 * />
 * ```
 */
export default function NoDrawChancesModal({
  visible,
  onClose,
  onInvite,
}: NoDrawChancesModalProps) {
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
   * 处理邀请按钮点击
   */
  function handleInvite() {
    onInvite();
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
          {/* 主背景 - 渐变 */}
          <LinearGradient
            colors={['#B1A1F6', '#F7F6FE', '#FFFFFF']}
            locations={[0, 0.899, 1]}
            style={styles.gradientBackground}
          />

          {/* 标题 */}
          <Text style={styles.title}>{t('lottery.noChancesTitle')}</Text>

          {/* 白色内容卡片 */}
          <View style={styles.contentCard}>
            {/* 三角形指示器 */}
            <View style={styles.triangleContainer}>
              <View style={styles.triangle} />
            </View>

            {/* 提示文字 */}
            <View style={styles.textContainer}>
              <Text style={styles.inviteText}>
                {t('lottery.anyInvite')}{' '}
                <Text style={styles.highlightText}>1 {t('lottery.person')}</Text>
              </Text>
              <Text style={styles.inviteText}>
                {t('lottery.getMoreChances.prefix')}
                <Text style={styles.highlightText}>{t('lottery.getMoreChances.highlight')}</Text>
              </Text>
            </View>

            {/* 邀请图标 */}
            <View style={styles.inviteIconContainer}>
              <View style={styles.inviteIcon}>
                <View style={styles.plusIcon}>
                  <View style={styles.plusHorizontal} />
                  <View style={styles.plusVertical} />
                </View>
              </View>
              <View style={styles.inviteBadge}>
                <Text style={styles.inviteBadgeText}>{t('lottery.toBeInvited')}</Text>
              </View>
            </View>
          </View>

          {/* 邀请按钮 */}
          <Pressable
            style={styles.inviteButtonContainer}
            onPress={handleInvite}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
            <LinearGradient
              colors={['#E344C3', '#9372FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>{t('lottery.inviteNow')}</Text>
            </LinearGradient>
          </Pressable>

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
    width: 300,
    height: 361,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    width: 300,
    height: 361,
    borderRadius: 40,
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#310842',
    textAlign: 'center',
    marginTop: 21,
    marginBottom: 27,
  },
  triangleContainer: {
    position: 'absolute',
    top: -10,
    left: 123,
    // transform: [{ translateX: -7.5 }],
    zIndex: 1,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7.5,
    borderRightWidth: 7.5,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    transform: [{ rotate: '180deg' }],
  },
  contentCard: {
    width: 260,
    height: 174,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 23,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    alignItems: 'center',
    gap: 5,
    marginBottom: 25,
  },
  inviteText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#804E96',
    textAlign: 'center',
  },
  highlightText: {
    color: '#DE47C7',
  },
  inviteIconContainer: {
    alignItems: 'center',
    gap: 8,
  },
  inviteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand,
  },
  plusIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 16,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  plusVertical: {
    position: 'absolute',
    width: 3,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  inviteBadge: {
    height: 20,
    paddingHorizontal: 8,
    backgroundColor: '#F3F0FF',
    borderColor: '#6741FF',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    transform: [{ translateY: -15 }],
    justifyContent: 'center',
  },
  inviteBadgeText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6741FF',
  },
  inviteButtonContainer: {
    width: 230,
    height: 60,
    borderRadius: 38.462,
    marginTop: 28,
    overflow: 'hidden',
  },
  inviteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9685DB',
    shadowOffset: { width: 0, height: 7.692 },
    shadowOpacity: 0.38,
    shadowRadius: 15.385,
    elevation: 8,
  },
  inviteButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.title,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
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


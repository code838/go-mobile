import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';

export default function HelpFriends() {
  const { t } = useTranslation();
  const visible = useBoundStore(state => state.showHelpFriendsModal);
  const setShowHelpFriendsModal = useBoundStore(state => state.setShowHelpFriendsModal);
  const [isClosing, setIsClosing] = useState(false);
  
  const onClose = () => {
    setShowHelpFriendsModal(false);
  }

  const onHelp = () => {
    onClose();
    toast.success(t('helpFriends.assistSuccess'));
  }

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
   * 处理帮忙助力按钮点击
   */
  function handleHelp() {
    onHelp();
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

          {/* 顶部爱心图片 */}
          <Image
            source={require('@/assets/images/help-heart.png')}
            style={styles.heartImage}
            contentFit="contain"
          />

          {/* 白色金额卡片 */}
          <View style={styles.amountCard}>
            {/* 三角形指示器 */}
            <View style={styles.triangleContainer}>
              <View style={styles.triangle} />
            </View>

            {/* 金额文字 */}
            <Text style={styles.amountText}>100U</Text>

            {/* 待提取标签 */}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{t('helpFriends.pending')}</Text>
            </View>
          </View>

          {/* 提示文字 */}
          <View style={styles.textContainer}>
            <Text style={styles.text1}>{t('helpFriends.almostSuccess')}</Text>
            <Text style={styles.text2}>{t('helpFriends.pleaseHelp')}</Text>
          </View>

          {/* 帮忙助力按钮 */}
          <Pressable
            style={styles.helpButtonContainer}
            onPress={handleHelp}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
            <LinearGradient
              colors={['#E344C3', '#9372FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.helpButton}>
              <Text style={styles.helpButtonText}>{t('helpFriends.goToApp')}</Text>
            </LinearGradient>
          </Pressable>

          {/* 底部手指图片 */}
          <Image
            source={require('@/assets/images/help-hand.png')}
            style={styles.handImage}
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
  heartImage: {
    position: 'absolute',
    width: 144,
    height: 144,
    top: -3,
    left: 78,
  },
  amountCard: {
    width: 260,
    height: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 78,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  triangleContainer: {
    position: 'absolute',
    top: -10,
    left: 119,
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
  amountText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#804E96',
    textAlign: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 23,
    right: 23,
    height: 20,
    paddingHorizontal: 8,
    backgroundColor: '#DE47C7',
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.title,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
    gap: 5,
  },
  text1: {
    fontSize: 20,
    fontWeight: '600',
    color: '#611182',
    textAlign: 'center',
  },
  text2: {
    fontSize: 26,
    fontWeight: '600',
    color: '#611182',
    textAlign: 'center',
  },
  helpButtonContainer: {
    width: 230,
    height: 60,
    borderRadius: 38,
    marginTop: 25,
    overflow: 'hidden',
  },
  helpButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9685DB',
    shadowOffset: { width: 0, height: 7.692 },
    shadowOpacity: 0.38,
    shadowRadius: 15.385,
    elevation: 8,
  },
  helpButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.title,
    textAlign: 'center',
  },
  handImage: {
    position: 'absolute',
    width: 120,
    height: 120,
    bottom: 11,
    right: 21,
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


import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CountdownTimer from '@/components/CountdownTimer';
import LotteryRecords, { type LotteryRecordsRef } from '@/components/LotteryRecords';
import LotteryResultModal from '@/components/LotteryResultModal';
import NavigationBar from '@/components/NavigationBar';
import NoDrawChancesModal from '@/components/NoDrawChancesModal';
import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { useLotteryDraw, useLotteryInit } from '@/hooks/useApi';
import { toast } from '@/utils/toast';
import * as Clipboard from 'expo-clipboard';

// 抽奖初始化数据类型
interface LotteryInitData {
  count: number; // 剩余抽奖次数
  expireTime: number; // 本次活动过期时间
  inviteLink: string; // 邀请链接
  amount: string; // 奖金总额
  recvAmount: string; // 已累计抽中金额
  drawAmount: string[]; // 转盘格子金额
}

// 抽奖结果数据类型
interface LotteryDrawResult {
  amount: string; // 本次抽中金额，返回0代表谢谢参与
  recvAmount: string; // 已累计抽中金额
  finished: boolean; // 累计金额是否达到目标金额
}

export default function LotteryPage() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [lotteryData, setLotteryData] = useState<LotteryInitData | null>(null);
  const [prizes, setPrizes] = useState<{ angle: number; label: string }[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawResult, setDrawResult] = useState<LotteryDrawResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showNoChancesModal, setShowNoChancesModal] = useState(false);
  
  // 抽奖记录组件引用
  const lotteryRecordsRef = useRef<LotteryRecordsRef>(null);
  
  // 使用抽奖初始化API
  const { loading: initLoading, execute: initLottery } = useLotteryInit();
  
  // 使用抽奖API
  const { loading: drawLoading, execute: drawLottery } = useLotteryDraw();

  // 初始化抽奖数据
  useEffect(() => {
    const loadLotteryData = async () => {
      try {
        const response = await initLottery();
        const data: LotteryInitData = response.data;
        setLotteryData(data);
        
        // 生成转盘奖项，添加"谢谢参与"
        const prizeLabels = [...data.drawAmount.map(amount => `${amount}U`), t('lottery.thankYou')];
        const angleStep = 360 / prizeLabels.length;
        const generatedPrizes = prizeLabels.map((label, index) => ({
          // 每个扇形的起始角度，从顶部0度开始
          angle: index * angleStep,
          label,
        }));
        setPrizes(generatedPrizes);
        
      } catch (error) {
        console.error('加载抽奖数据失败:', error);
      }
    };

    loadLotteryData();
  }, [initLottery]);


  /**
   * 抽奖功能
   */
  async function handleDraw() {
    // 防重复点击：检查是否正在抽奖中
    if (!lotteryData || prizes.length === 0 || drawLoading || isSpinning) return;
    
    try {
      setIsSpinning(true);
      
      // 调用抽奖API
      const response = await drawLottery();
      const result: LotteryDrawResult = response.data;
      setDrawResult(result);
      
      // 根据中奖金额确定目标奖项
      const winAmount = parseFloat(result.amount);
      let targetPrizeIndex = 0;
      
      if (winAmount === 0) {
        // 谢谢参与
        targetPrizeIndex = prizes.findIndex(prize => prize.label === t('lottery.thankYou'));
      } else {
        // 找到对应金额的奖项
        const amountLabel = `${result.amount}U`;
        targetPrizeIndex = prizes.findIndex(prize => prize.label === amountLabel);
      }
      
      // 如果没找到对应奖项，默认第一个
      if (targetPrizeIndex === -1) targetPrizeIndex = 0;
      
      // 计算每个格子的角度范围
      const angleStep = 360 / prizes.length;
      
      // 目标奖项的索引对应的扇形中心角度(原始位置)
      const targetCenterAngle = targetPrizeIndex * angleStep + angleStep / 2;
      
      // 计算当前转盘的实际角度位置(去除整圈数，只保留0-360度内的角度)
      const currentAngle = rotation % 360;
      
      // 计算从当前位置到目标位置需要转动的角度
      // 目标是让目标扇形中心对准指针(0度位置)
      let rotateToTarget = -targetCenterAngle - currentAngle;
      
      // 确保转盘总是正向旋转(顺时针)，如果计算出的角度是负数，加360度
      if (rotateToTarget > 0) {
        rotateToTarget -= 360;
      }
      
      // 转5圈加上到目标位置的角度
      const finalAngle = rotation + 360 * 5 + rotateToTarget;
      
      setRotation(finalAngle);
      
      // 动画完成回调在MotiView的onDidAnimate中处理
      
    } catch (error: any) {
      // console.error('抽奖失败:', error);
      setIsSpinning(false);
      setShowNoChancesModal(true);
      // 检查是否是无可用抽奖次数的错误
      // if (error?.response?.data?.code === 30) {
      //   Toast.show({
      //     type: 'error',
      //     text1: t('lottery.noDrawChances'),
      //   });
      // } else {
      //   // 其他错误的通用提示
      //   Toast.show({
      //     type: 'error',
      //     text1: error?.response?.data?.msg || error?.message || '抽奖失败',
      //   });
      // }
    }
  }

  /**
   * 动画完成回调 - 显示结果弹窗和刷新记录
   */
  function handleAnimationComplete() {
    setIsSpinning(false);
    setShowResultModal(true);
    
    // 更新累计抽中金额
    if (drawResult && lotteryData) {
      setLotteryData(prev => prev ? {
        ...prev,
        recvAmount: drawResult.recvAmount
      } : null);
    }
    
    // 刷新抽奖记录
    lotteryRecordsRef.current?.refresh();
  }

  /**
   * 关闭结果弹窗
   */
  function handleCloseModal() {
    setShowResultModal(false);
    setDrawResult(null);
  }

  /**
   * 确认收下奖励
   */
  function handleConfirmReward() {
    setShowResultModal(false);
    setDrawResult(null);
    // 这里可以添加其他确认逻辑，比如刷新用户信息等
  }

  /**
   * 关闭无抽奖次数弹窗
   */
  function handleCloseNoChancesModal() {
    setShowNoChancesModal(false);
  }

  /**
   * 点击邀请好友按钮
   */
  function handleInviteFriends() {
    setShowNoChancesModal(false);
    // 复制邀请链接
    if (!lotteryData?.inviteLink) return;
    Clipboard.setStringAsync(getImageUrl(lotteryData.inviteLink));
    toast.success(t('lottery.copySuccess'));
  }



  // 显示loading状态
  if (initLoading || !lotteryData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.brand} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 背景图 - 绝对定位 */}
        <View style={styles.backgroundContainer}>
          <ImageBackground
            source={require('@/assets/images/lottery-page.png')}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
            resizeMode="cover"
          />
        </View>
        
        {/* 导航栏 */}
        <View style={styles.navigationBarWrapper}>
          <NavigationBar title={t('profile.freeReceiveCoin')} />
        </View>
        {/* 转盘区域 */}
        <View style={styles.wheelContainer}>
          {/* 转盘底盘 */}
          <View style={styles.wheelBase}>
            <Image
              source={require('@/assets/images/lottery-bg.png')}
              style={styles.wheelBaseImage}
              contentFit="contain"
            />
            <Text style={styles.wheelTitle}>{t('lottery.luckyWheel')}</Text>
          </View>

          {/* 转动盘 */}
          <MotiView 
            style={styles.wheelCircle}
            animate={{ 
              rotate: `${rotation}deg` 
            }}
            transition={{
              type: 'timing',
              duration: isSpinning ? 4000 : 0,
              easing: isSpinning 
                ? Easing.out(Easing.cubic) // 先快后慢，平滑减速到终点
                : Easing.linear
            }}
            onDidAnimate={(key, finished) => {
              // 只有在旋转动画完成且正在抽奖中时才触发
              if (key === 'rotate' && finished && isSpinning) {
                handleAnimationComplete();
              }
            }}>
            <Image
              source={require('@/assets/images/lottery-circle.png')}
              style={styles.wheelCircleImage}
              contentFit="contain"
            />
            {/* 奖项文字 - 随转盘旋转 */}
            {prizes.map((prize, index) => {
              // 计算每个扇形的角度范围
              const angleStep = 360 / prizes.length;
              // 文字位置在扇形中心
              const textAngle = prize.angle + angleStep / 2;
              
              // 将角度转换为弧度 (转换为标准数学坐标系，顶部0度对应数学90度)
              const angleInRadians = ((textAngle - 90) * Math.PI) / 180;
              const radius = 85;
              const centerX = 140.502;
              const centerY = 140.502;
              const x = centerX + radius * Math.cos(angleInRadians);
              const y = centerY + radius * Math.sin(angleInRadians);
              
              // 根据文字长度调整容器宽度
              const isLongText = prize.label.length > 2;
              const containerWidth = isLongText ? 80 : 54;
              const offsetX = containerWidth / 2;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.prizeLabel,
                    {
                      left: x - offsetX,
                      top: y - 15,
                      width: containerWidth,
                      transform: [{ rotate: `${textAngle}deg` }]
                    }
                  ]}>
                  <Text style={[
                    styles.prizeLabelText, 
                    isLongText && styles.prizeLabelTextSmall
                  ]}>
                    {prize.label}
                  </Text>
                </View>
              );
            })}
          </MotiView>

          {/* 中心抽奖按钮 */}
          <Pressable style={styles.drawCenter} onPress={handleDraw}>
            <Image
              source={require('@/assets/images/lottery-button.png')}
              style={styles.drawCenterImage}
              contentFit="contain"
            />
            <Text style={styles.drawCenterText}>{t('lottery.drawText')}</Text>
          </Pressable>
        </View>

        {/* 已累计金额和进度 */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            {/* 累计金额标签 - 根据进度动态定位 */}
            <View style={[
              styles.drawnBadgeContainer,
              {
                left: `${Math.max(Math.min(parseFloat(lotteryData.recvAmount) / parseFloat(lotteryData.amount) * 100, 92), 8)}%`
              }
            ]}>
              <View style={styles.drawnBadge}>
                <Text style={styles.drawnBadgeText}>{t('lottery.accumulated')} {lotteryData.recvAmount} U</Text>
              </View>
              <View style={styles.drawnBadgeArrow} />
            </View>

            <View style={styles.progressBar}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#C555D8', '#6741FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.min(parseFloat(lotteryData.recvAmount) / parseFloat(lotteryData.amount) * 100, 100)}%` }]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0 U</Text>
                <Text style={styles.progressLabel}>{lotteryData.amount} U</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 点击抽奖按钮 */}
        <Pressable onPress={handleDraw}>
          <LinearGradient
            colors={['#C555D8', '#6741FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.drawButton}>
            <Text style={styles.drawButtonText}>{t('lottery.drawButton')}</Text>
          </LinearGradient>
        </Pressable>

        {/* 倒计时 */}
        <View style={styles.countdownContainer}>
          <CountdownTimer endTime={lotteryData.expireTime} />
        </View>

        {/* 记录区域 */}
        <LotteryRecords ref={lotteryRecordsRef} />
      </ScrollView>
      
      {/* 抽奖结果弹窗 */}
      <LotteryResultModal
        visible={showResultModal}
        amount={drawResult?.amount === '0' ? t('lottery.thankYou') : drawResult?.finished ? drawResult.recvAmount : `${drawResult?.amount || '0'}U`}
        onClose={handleCloseModal}
        onConfirm={handleConfirmReward}
      />
      
      {/* 无抽奖次数弹窗 */}
      <NoDrawChancesModal
        visible={showNoChancesModal}
        onClose={handleCloseNoChancesModal}
        onInvite={handleInviteFriends}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 743,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: -296,
    width: 983,
    height: 743,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  navigationBarWrapper: {
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  wheelContainer: {
    width: 326.25,
    height: 380.546,
    alignSelf: 'center',
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  wheelBase: {
    width: 326.25,
    height: 380.546,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  wheelBaseImage: {
    width: '100%',
    height: '100%',
  },
  wheelTitle: {
    position: 'absolute',
    bottom: 19,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18.125,
    fontWeight: '500',
    letterSpacing: 3.625,
  },
  wheelCircle: {
    position: 'absolute',
    width: 281.004,
    height: 281.004,
    top: 21.05,
    left: 20.91,
  },
  wheelCircleImage: {
    width: '100%',
    height: '100%',
  },
  prizeLabel: {
    position: 'absolute',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prizeLabelText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#581774',
    textAlign: 'center',
  },
  prizeLabelTextSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: '#581774',
    textAlign: 'center',
  },
  drawCenter: {
    position: 'absolute',
    width: 88.588,
    height: 111.449,
    top: 95,
    left: 118,
  },
  drawCenterImage: {
    width: '100%',
    height: '100%',
  },
  drawCenterText: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 29 : 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 36.25,
    fontWeight: '400',
    color: '#6D460E',
  },
  progressSection: {
    marginHorizontal: 20,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    position: 'relative',
  },
  drawnBadgeContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: '-50%' }],
    zIndex: 1,
  },
  drawnBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  drawnBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#581774',
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  drawnBadgeArrow: {
    marginTop: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  progressBar: {
    width: '100%',
    gap: 4,
    marginTop: 40,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#1F183F',
    borderRadius: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6741FF',
    borderRadius: 24,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    color: '#5D4CA7',
  },
  drawButton: {
    height: 48,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  drawButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1.8 },
    textShadowRadius: 3.6,
  },
  countdownContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.brand,
  },
});


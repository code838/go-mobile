import type { WinnerInfo } from '@/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

interface WinnerAnnouncementProps {
  winners: WinnerInfo[];
}

export default function WinnerAnnouncement({ winners }: WinnerAnnouncementProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(winners.length > 1 ? 1 : 0);
  const scrollAnim = new Animated.Value(0);

  // 向上滚动显示中奖信息
  useEffect(() => {
    if (winners.length <= 1) return;

    const interval = setInterval(() => {
      // 准备下一个索引
      const next = (currentIndex + 1) % winners.length;
      setNextIndex(next);
      
      // 向上滚动动画
      Animated.timing(scrollAnim, {
        toValue: -1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // 动画完成后，更新当前索引并重置动画值
        setCurrentIndex(next);
        setNextIndex((next + 1) % winners.length);
        scrollAnim.setValue(0);
      });
    }, 3000); // 每3秒切换一次

    return () => clearInterval(interval);
  }, [currentIndex, winners.length]);

  // 如果没有数据，显示默认文案
  if (winners.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>📢</Text>
        <View style={styles.textContainer}>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            {t('winnerAnnouncementPrefix', { defaultValue: '恭喜' })}{' '}
            <Text style={styles.userName}>
              {t('announcementUser', { defaultValue: '用户' })}
            </Text>{' '}
            {t('winnerAnnouncementMiddle', { defaultValue: '获得' })}{' '}
            <Text style={styles.value}>
              ${t('announcementValue', { defaultValue: '100' })}
            </Text>{' '}
            {t('winnerAnnouncementSuffix', { defaultValue: '商品' })}
          </Text>
        </View>
      </View>
    );
  }

  const currentWinner = winners[currentIndex];
  const upcomingWinner = winners[nextIndex];

  // 渲染单个中奖信息
  const renderWinnerText = (winner: WinnerInfo) => (
    <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
      <Text style={styles.prefix}>
        {t('winnerAnnouncementPrefix', { defaultValue: '恭喜' })}
      </Text>{' '}
      <Text style={styles.userName}>{winner.nickName}</Text>{' '}
      <Text style={styles.prefix}>
        {t('winnerAnnouncementMiddle', { defaultValue: '获得' })}
      </Text>{' '}
      <Text style={styles.value}>${winner.productValue}</Text>{' '}
      <Text style={styles.prefix}>
        {t('winnerAnnouncementSuffix', { defaultValue: '商品' })}
      </Text>
    </Text>
  );

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/icon-announcement.png')} style={styles.icon} />
      <View style={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.scrollContent,
            {
              transform: [
                {
                  translateY: scrollAnim.interpolate({
                    inputRange: [-1, 0],
                    outputRange: [-20, 0], // 向上滚动20像素（itemContainer的高度）
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.itemContainer}>
            {renderWinnerText(currentWinner)}
          </View>
          <View style={styles.itemContainer}>
            {renderWinnerText(upcomingWinner)}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF55',
    flexShrink: 0,
  },
  scrollContainer: {
    flex: 1,
    height: 20, // 固定高度，只显示一行
    overflow: 'hidden',
  },
  scrollContent: {
    flexDirection: 'column',
  },
  itemContainer: {
    height: 20, // 与 scrollContainer 高度一致
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  prefix: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  userName: {
    color: '#4A9EFF',
    fontWeight: '500',
  },
  value: {
    color: '#FFB800',
  },
});


import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface CountdownProps {
  endTime: number; // 结束时间戳（毫秒）
  showSeconds?: boolean; // 是否显示秒数，默认true
  showLabels?: boolean; // 是否显示文字标签（小时、分钟等），默认true
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ 
  endTime, 
  showSeconds = true, 
  showLabels = true 
}: CountdownProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = Date.now();
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
      }

      return { hours: 0, minutes: 0, seconds: 0 };
    };

    // 立即计算一次
    setTimeLeft(calculateTimeLeft());

    // 设置定时器，每秒更新一次
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <View style={styles.timeBlock}>
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>{formatNumber(timeLeft.hours)}</Text>
          </View>
          {showLabels && (
            <Text style={styles.label}>{t('hours') || 'HOURS'}</Text>
          )}
        </View>

        <View style={styles.timeBlock}>
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>{formatNumber(timeLeft.minutes)}</Text>
          </View>
          {showLabels && (
            <Text style={styles.label}>{t('minutes') || 'MINUTES'}</Text>
          )}
        </View>

        {showSeconds && (
          <View style={styles.timeBlock}>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>{formatNumber(timeLeft.seconds)}</Text>
            </View>
            {showLabels && (
              <Text style={styles.label}>{t('seconds') || 'SECONDS'}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeBox: {
    width: 64,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
    lineHeight: 24,
  },
  label: {
    color: '#6E6E70',
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 4,
    fontFamily: 'System',
  },
});


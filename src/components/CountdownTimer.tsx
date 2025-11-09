import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  endTime?: number;
  textColor?: string;
  backgroundColor?: string;
  suffixText?: string;
}

/**
 * 倒计时组件
 * 
 * @param endTime - 结束时间戳（毫秒）
 * @param textColor - 数字文字颜色，默认为 '#FFFFFF'
 * @param backgroundColor - 数字背景色，默认为 '#1F183F'
 * @param suffixText - 后缀文字，如果不传入则使用翻译文件中的 'lottery.drawCountdownEnd'
 */
export default function CountdownTimer({ 
  endTime, 
  textColor = '#FFFFFF',
  backgroundColor = '#1F183F',
  suffixText 
}: CountdownTimerProps) {
  const { t } = useTranslation();
  const countdown = useCountdown(endTime);

  return (
    <View style={styles.countdown}>
      <View style={[styles.countdownItem, { backgroundColor }]}>
        <Text style={[styles.countdownNumber, { color: textColor }]}>
          {countdown.hours.toString().padStart(2, '0')}
        </Text>
      </View>
      <Text style={styles.countdownColon}>:</Text>
      <View style={[styles.countdownItem, { backgroundColor }]}>
        <Text style={[styles.countdownNumber, { color: textColor }]}>
          {countdown.minutes.toString().padStart(2, '0')}
        </Text>
      </View>
      <Text style={styles.countdownColon}>:</Text>
      <View style={[styles.countdownItem, { backgroundColor }]}>
        <Text style={[styles.countdownNumber, { color: textColor }]}>
          {countdown.seconds.toString().padStart(2, '0')}
        </Text>
      </View>
      <Text style={styles.countdownSuffix}>
        {suffixText || t('lottery.drawCountdownEnd')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  countdownItem: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  countdownColon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4CA7',
  },
  countdownSuffix: {
    fontSize: 14,
    color: '#5D4CA7',
    marginLeft: 4,
  },
});
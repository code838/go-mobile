import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import Button from '@/components/Button';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';

/**
 * 提现成功页面
 */
export default function WithdrawSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  // 从路由参数中获取订单信息
  const orderId = params.orderId as string;
  const amount = params.amount as string;
  const recvAmount = params.recvAmount as string;
  const coinName = params.coinName as string;
  const network = params.network as string;
  const fee = params.fee as string;

  /**
   * 查看订单
   */
  function handleViewOrder() {
    // TODO: 导航到订单列表页面
    router.push(`/account/record/${orderId}?type=3`);
    console.log('查看订单');
  }

  /**
   * 返回
   */
  function handleBack() {
    // 返回到我的页面或首页
    router.replace('/profile');
  }

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('withdraw.successTitle')} />

      {/* 主体内容 */}
      <View style={styles.content}>
        <View style={styles.topSection}>
          {/* 成功图标和状态 */}
          <View style={styles.statusSection}>
            <View style={styles.iconRow}>
              {/* 成功图标 */}
              <View style={styles.iconContainer}>
                <Svg width="40" height="40" viewBox="0 0 40 40">
                  {/* 紫色背景圆 */}
                  <Circle cx="20" cy="20" r="20" fill={Colors.brand} />
                  {/* 白色勾号 */}
                  <Path
                    d="M12 20L17 25L28 14"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </View>

              {/* 已提交文字 */}
              <Text style={styles.statusText}>{t('withdraw.submitted')}</Text>
            </View>
          </View>


          {/* 提示信息 */}
          <View style={styles.tipSection}>
            <Text style={styles.tipText}>{t('withdraw.successTip')}</Text>
            <Pressable onPress={handleViewOrder} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.viewOrderText}>{t('withdraw.viewOrder')}</Text>
            </Pressable>
          </View>

        {/* 返回按钮 */}
        <Button title={t('withdraw.back')} onPress={handleBack} style={styles.button} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    gap: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  statusSection: {
    alignItems: 'flex-start',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.title,
  },
  tipSection: {
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.subtitle,
    textAlign: 'center',
  },
  viewOrderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
  },
});

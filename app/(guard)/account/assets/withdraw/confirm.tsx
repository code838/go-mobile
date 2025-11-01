import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { CoinMessage, Network } from '@/model/CoinMessage';
import { financeApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';

export default function WithdrawConfirmPage() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = useBoundStore(state => state.user);
  const refreshUserInfo = useBoundStore(state => state.refreshUserInfo);

  // 从路由参数中获取数据
  const coin: CoinMessage = JSON.parse((params.coin as string) || '{}');
  const network: Network = JSON.parse((params.network as string) || '{}');
  const withdrawAddress = params.address as string;
  const withdrawAmount = params.amount as string;
  const fee = params.fee as string;

  /**
   * 确认提现
   */
  async function handleConfirm() {
    if (!user?.userId) {
      toast.error(t('common.pleaseLogin'));
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { data } = await financeApi.withdraw({
        userId: user.userId,
        amount: withdrawAmount,
        coinId: coin.coinId,
        networkId: network.networkId,
        address: withdrawAddress,
      });

      if (data.code === 0) {
        // 刷新用户信息（更新余额）
        await refreshUserInfo();
        
        toast.success(t('withdraw.submitSuccess'));
        
        // 跳转到成功页面，并传递订单信息（保存数据但不显示）
        router.replace({
          pathname: '/account/assets/withdraw/success',
          params: {
            orderId: data.data.orderId,
            amount: data.data.amount,
            recvAmount: data.data.recvAmount,
            coinName: data.data.coinName,
            network: data.data.network,
            fee: data.data.fee,
          },
        });
      } else {
        toast.error(data.msg || t('withdraw.submitFailed'));
      }
    } catch (error: any) {
      console.error('提现提交失败:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('withdraw.confirmTitle')} />

      <View style={styles.content}>
        {/* 提现币种 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.coin')}</Text>
          <View style={styles.displayBox}>
            <View style={styles.coinRow}>
              <Text style={styles.coinSymbol}>{coin.coinName}</Text>
            </View>
          </View>
        </View>

        {/* 提现地址 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.withdrawAddress')}</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{withdrawAddress}</Text>
          </View>
          <View style={styles.networkBox}>
            <Text style={styles.networkSymbol}>{network.network}</Text>
          </View>
        </View>

        {/* 提现金额 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.withdrawAmount')}</Text>
          <View style={styles.displayBox}>
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>
                {withdrawAmount} {coin.coinName}
              </Text>
            </View>
          </View>
        </View>

        {/* 手续费 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.fee')}</Text>
          <View style={styles.displayBox}>
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>
                {fee} {coin.coinName}
              </Text>
            </View>
          </View>
        </View>

        {/* 确认按钮 */}
        <Button 
          title={isSubmitting ? t('withdraw.submitting') : t('withdraw.confirm')} 
          onPress={handleConfirm} 
          style={styles.button}
          disabled={isSubmitting}
        />
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
    gap: 24,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.secondary,
  },
  displayBox: {
    backgroundColor: '#303030',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.title,
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.title,
  },
  addressBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  networkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#303030',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  networkSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  networkFullName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinLogoSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinLogoSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.title,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
  },
  button: {
    marginTop: 24,
  },
});


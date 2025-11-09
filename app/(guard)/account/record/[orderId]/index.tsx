import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { useCancelOrder, useOrderDetail, usePayOrder } from '@/hooks/useApi';
import { OrderItem, OrderStatus, OrderType } from '@/model/Order';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string; type: string}>();
  const { orderId, type } = params;

  const user = useBoundStore((state) => state.user);
  const { data, loading, execute } = useOrderDetail();
  const { execute: executePay, loading: payLoading } = usePayOrder();
  const { execute: executeCancel, loading: cancelLoading } = useCancelOrder();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (orderId && user?.userId) {
      execute({
        userId: user.userId,
        orderId,
        isOwner: type === '0' ? true : false,
      });
    }
  }, [orderId, user?.userId]);

  const orderDetail = data as OrderItem | null;

  /**
   * 复制文本到剪贴板
   */
  async function handleCopy(text: string) {
    await Clipboard.setStringAsync(text);
    toast.success(t('orderDetail.copySuccess'));
  }

  /**
   * 取消订单
   */
  async function handleCancelOrder() {
    if (!user?.userId || !orderId) return;
    
    try {
      setIsProcessing(true);
      await executeCancel({
        userId: user.userId,
        orderId,
      });
      toast.success(t('orderDetail.cancelSuccess'));
      // 刷新订单详情
      await execute({
        userId: user.userId,
        orderId,
        isOwner: type === '0' ? true : false,
      });
    } catch (error) {
      toast.error(t('orderDetail.cancelFailed'));
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * 去支付
   */
  async function handleGoToPay() {
    if (!user?.userId || !orderId) return;
    
    try {
      setIsProcessing(true);
      await executePay({
        userId: user.userId,
        orderId,
      });
      toast.success(t('orderDetail.paymentSuccess'));
      // 刷新订单详情
      await execute({
        userId: user.userId,
        orderId,
        isOwner: type === '0' ? true : false,
      });
      // 跳转到支付成功页面
      router.push({
        pathname: '/(guard)/payment-result',
        params: { orderId },
      });
    } catch (error) {
      toast.error(t('orderDetail.paymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  }

  /**
   * 格式化时间戳
   */
  function formatTimestamp(timestamp?: number) {
    if (!timestamp) return '-';
    return format(new Date(timestamp), 'yyyy/MM/dd HH:mm:ss');
  }

  /**
   * 截断地址或hash
   */
  function truncateAddress(address?: string) {
    if (!address) return '-';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * 获取订单状态图标
   */
  function getStatusIcon() {
    if (!orderDetail) return null;

    // 根据订单状态返回不同图标
    if (orderDetail.status === OrderStatus.PAID) {
      return require('@/assets/images/record-type0.png'); // 使用完成图标
    }
    return null;
  }

  /**
   * 获取订单状态文本
   */
  function getStatusText() {
    if (!orderDetail) return '';

    switch (orderDetail.status) {
      case OrderStatus.PENDING:
        return t('record.status.pending');
      case OrderStatus.PAID:
        return t('record.status.completed');
      case OrderStatus.CANCELLED:
        return t('record.status.cancelled');
      default:
        return '';
    }
  }

  /**
   * 获取金额颜色
   */
  function getAmountColor() {
    if (!orderDetail) return Colors.gold;

    // 中奖订单使用特殊颜色
    if (orderDetail.type === OrderType.LOTTERY) {
      return '#1af578'; // 绿色
    }
    return Colors.gold;
  }

  /**
   * 渲染详情项
   */
  function renderDetailItem(
    label: string,
    value: string,
    isHighlight = false,
    canCopy = false,
    copyValue?: string
  ) {
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={styles.detailValueContainer}>
          <Text
            style={[
              styles.detailValue,
              isHighlight && { color: Colors.gold },
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
          {canCopy && (
            <Pressable onPress={() => handleCopy(copyValue || value)}>
              <Image
                source={require('@/assets/images/copy.png')}
                style={styles.copyIcon}
                contentFit="contain"
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  /**
   * 渲染提现订单详情
   */
  function renderWithdrawDetails() {
    if (!orderDetail) return null;

    return (
      <>
        {renderDetailItem(t('orderDetail.type'), t('record.withdraw'))}
        {renderDetailItem(
          t('orderDetail.orderId'),
          `#${orderDetail.orderId}`,
          false,
          true,
          orderDetail.orderId
        )}
        {renderDetailItem(t('orderDetail.withdrawCoin'), orderDetail.coinName || '-')}
        {renderDetailItem(
          t('orderDetail.withdrawAmount'),
          `${orderDetail.amount} ${orderDetail.coinName || ''}`,
          true
        )}
        {renderDetailItem(
          t('orderDetail.fee'),
          `${orderDetail.fee || '0'} ${orderDetail.coinName || ''}`,
          true
        )}
        {renderDetailItem(
          t('orderDetail.receiveAmount'),
          `${orderDetail.recvAmount || '0'} ${orderDetail.coinName || ''}`,
          true
        )}
        {renderDetailItem(t('orderDetail.network'), orderDetail.network || '-')}
        {orderDetail.hash &&
          renderDetailItem(
            t('orderDetail.hash'),
            truncateAddress(orderDetail.hash),
            false,
            true,
            orderDetail.hash
          )}
        {renderDetailItem(
          t('orderDetail.address'),
          truncateAddress(orderDetail.toAddress),
          false,
          true,
          orderDetail.toAddress
        )}
        {renderDetailItem(t('orderDetail.applyTime'), formatTimestamp(orderDetail.createTime))}
        {orderDetail.finishTime &&
          renderDetailItem(
            t('orderDetail.completedTime'),
            formatTimestamp(orderDetail.finishTime)
          )}
      </>
    );
  }

  /**
   * 渲染充值订单详情
   */
  function renderRechargeDetails() {
    if (!orderDetail) return null;

    return (
      <>
        {renderDetailItem(t('orderDetail.type'), t('record.recharge'))}
        {renderDetailItem(
          t('orderDetail.orderId'),
          `#${orderDetail.orderId}`,
          false,
          true,
          orderDetail.orderId
        )}
        {renderDetailItem(t('orderDetail.rechargeCoin'), orderDetail.coinName || '-')}
        {renderDetailItem(
          t('orderDetail.rechargeAmount'),
          `${orderDetail.amount} ${orderDetail.coinName || ''}`,
          true
        )}
        {renderDetailItem(t('orderDetail.network'), orderDetail.network || '-')}
        {orderDetail.hash &&
          renderDetailItem(
            t('orderDetail.hash'),
            truncateAddress(orderDetail.hash),
            false,
            true,
            orderDetail.hash
          )}
        {renderDetailItem(
          t('orderDetail.address'),
          truncateAddress(orderDetail.toAddress),
          false,
          true,
          orderDetail.toAddress
        )}
        {renderDetailItem(t('orderDetail.time'), formatTimestamp(orderDetail.createTime))}
      </>
    );
  }

  /**
   * 渲染闪兑订单详情
   */
  function renderExchangeDetails() {
    if (!orderDetail) return null;

    return (
      <>
        {renderDetailItem(t('orderDetail.type'), t('record.exchange'))}
        {renderDetailItem(
          t('orderDetail.orderId'),
          `#${orderDetail.orderId}`,
          false,
          true,
          orderDetail.orderId
        )}
        {renderDetailItem(t('orderDetail.fromCoin'), orderDetail.coinName || '-')}
        {renderDetailItem(t('orderDetail.toCoin'), orderDetail.toAssert || '-')}
        {renderDetailItem(
          t('orderDetail.fromAmount'),
          `${orderDetail.num || '0'} ${orderDetail.coinName || ''}`
        )}
        {renderDetailItem(
          t('orderDetail.exchangeAmount'),
          `${orderDetail.recvAmount || '0'} ${orderDetail.toAssert || ''}`,
          true
        )}
        {renderDetailItem(t('orderDetail.time'), formatTimestamp(orderDetail.createTime))}
      </>
    );
  }

  /**
   * 渲染云购订单详情
   */
  function renderUbuyDetails() {
    if (!orderDetail) return null;

    return (
      <>
        {renderDetailItem(t('orderDetail.type'), t('record.ubuy'))}
        {renderDetailItem(
          t('orderDetail.orderId'),
          `#${orderDetail.orderId}`,
          false,
          true,
          orderDetail.orderId
        )}
        {orderDetail.products?.length === 1 && (
          <>
            {renderDetailItem(t('orderDetail.productName'), orderDetail.products?.[0]?.productName || '-')}
            {renderDetailItem(t('orderDetail.productPrice'), `${orderDetail.products?.[0]?.price}`)}
            {renderDetailItem(t('orderDetail.quantity'), `x ${orderDetail.products?.[0]?.productNum || '0'}`)}
          </>
        )}

        {renderDetailItem(
          t('orderDetail.total'),
          `${orderDetail.amount} USDT`,
          true
        )}
        {renderDetailItem(t('orderDetail.time'), formatTimestamp(orderDetail.createTime))}
      </>
    );
  }

  /**
   * 渲染中奖订单详情
   */
  function renderLotteryDetails() {
    if (!orderDetail) return null;

    return (
      <>
        {renderDetailItem(t('orderDetail.type'), t('record.lottery'))}
        {renderDetailItem(
          t('orderDetail.orderId'),
          `#${orderDetail.orderId}`,
          false,
          true,
          orderDetail.orderId
        )}
        {renderDetailItem(t('orderDetail.productName'), orderDetail.productName || '-')}
        {renderDetailItem(
          t('orderDetail.productPrice'),
          `${orderDetail.price || '0'}`
        )}
        {renderDetailItem(t('orderDetail.quantity'), `x ${orderDetail.num || '0'}`)}
        {orderDetail.productValue &&
          renderDetailItem(
            t('orderDetail.productValue'),
            orderDetail.productValue
          )}
        {orderDetail.coding && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('orderDetail.lotteryCode')}</Text>
            <View style={styles.detailValueContainer}>
              <Text
                style={[
                  styles.detailValue,
                  { color: '#67e8f2' }, // 蓝色
                ]}
                numberOfLines={1}
              >
                {String(orderDetail.coding)}
              </Text>
            </View>
          </View>
        )}
        {renderDetailItem(t('orderDetail.time'), formatTimestamp(orderDetail.createTime))}
      </>
    );
  }

  /**
   * 渲染订单详情内容
   */
  function renderOrderDetails() {
    if (!orderDetail) return null;

    switch (orderDetail.type) {
      case OrderType.WITHDRAW:
        return renderWithdrawDetails();
      case OrderType.RECHARGE:
        return renderRechargeDetails();
      case OrderType.EXCHANGE:
        return renderExchangeDetails();
      case OrderType.UBUY:
        return renderUbuyDetails();
      case OrderType.LOTTERY:
        return renderLotteryDetails();
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <PageDecoration />
        <NavigationBar title={t('orderDetail.title')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      </View>
    );
  }

  if (!orderDetail) {
    return (
      <View style={styles.container}>
        <PageDecoration />
        <NavigationBar title={t('orderDetail.title')} />
        <Text selectable style={{ color: 'white' }}>{orderId}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('record.empty')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageDecoration />
      <NavigationBar title={t('orderDetail.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 订单金额和状态 */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>{t('orderDetail.amount')}</Text>
          {orderDetail.type === OrderType.LOTTERY ? (
            <Text style={[styles.amountValue, { color: '#1af578' }]}>{orderDetail.productValue}</Text>
          ) : (
            <Text style={[styles.amountValue, { color: getAmountColor() }]}>
              {orderDetail.type === OrderType.EXCHANGE ? `${orderDetail.recvAmount} ${orderDetail.toAssert}` : `${orderDetail.amount} ${orderDetail.coinName || 'USDT'}`}
            </Text>
          )}
          <View style={styles.statusContainer}>
            {getStatusIcon() && (
              <Image
                source={getStatusIcon()}
                style={styles.statusIcon}
                contentFit="contain"
              />
            )}
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.goodsContainer}>
          {/* 订单详情 */}
          <View style={styles.detailsCard}>
            {renderOrderDetails()}
          </View>
          {(orderDetail.type === OrderType.UBUY && orderDetail.products?.length && orderDetail.products?.length > 1) && orderDetail.products?.map((product, index) => {
            return (
              <View key={`product-${index}`} style={styles.detailsCard}>
                {renderDetailItem(t('orderDetail.productName'), product.productName)}
                {renderDetailItem(t('orderDetail.productPrice'), `${product.price}`)}
                {renderDetailItem(t('orderDetail.quantity'), `x ${product.productNum}`)}
                {renderDetailItem(t('orderDetail.total'), `${product.productAmount} USDT`, true)}
              </View>
            )
          })}
        </View>

        {/* 待支付状态下的按钮 */}
        {orderDetail.status === OrderStatus.PENDING && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelOrder}
              disabled={isProcessing || cancelLoading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {t('orderDetail.cancelOrder')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.payButton]}
              onPress={handleGoToPay}
              disabled={isProcessing || payLoading}
            >
              <Text style={[styles.buttonText, styles.payButtonText]}>
                {t('orderDetail.goToPay')}
              </Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 32,
  },
  goodsContainer: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
  },
  amountSection: {
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.secondary,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    width: 24,
    height: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.subtitle,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subtitle,
    textAlign: 'right',
  },
  copyIcon: {
    width: 20,
    height: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 24,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  payButton: {
    backgroundColor: Colors.gold,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: Colors.gold,
  },
  payButtonText: {
    color: '#000',
  },
});


import NavigationBar from '@/components/NavigationBar';
import { IMG_BASE_URL } from '@/constants/api';
import { financeApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// SVG Icons
const PlusIcon = () => (
  <View style={styles.iconContainer}>
    <View style={[styles.iconLine, styles.iconLineHorizontal]} />
    <View style={[styles.iconLine, styles.iconLineVertical]} />
  </View>
);

const MinusIcon = () => (
  <View style={styles.iconContainer}>
    <View style={[styles.iconLine, styles.iconLineHorizontal]} />
  </View>
);

const HelpIcon = () => (
  <View style={styles.helpIcon}>
    <Text style={styles.helpIconText}>?</Text>
  </View>
);

interface Product {
  productId: number;
  productName: string;
  logo: string;
  price: number;
  productValue: string;
  productAmount: number;
  serialNumber: number;
}

interface OrderDetail {
  orderId: string;
  userId: number;
  amount: number;
  status: number; // 1: 待支付, 2: 已支付, 3: 已取消
  lastPayTime?: number;
  products: Product[];
  createTime: number;
}

export default function ConfirmOrderPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const user = useBoundStore(state => state.user);

  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isPayingSubmitting, setIsPayingSubmitting] = useState(false);
  const [isCancelingSubmitting, setIsCancelingSubmitting] = useState(false);

  // 获取订单详情
  useEffect(() => {
    console.log('确认订单页面参数 - user:', user, 'orderId:', orderId);
    
    if (!user) {
      console.error('用户未登录');
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: t('confirmOrder.loginRequired'),
      });
      return;
    }
    
    if (!orderId) {
      console.error('订单ID缺失');
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: t('confirmOrder.orderIdMissing'),
      });
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        console.log('开始获取订单详情 - userId:', user.userId, 'orderId:', orderId);
        
        const response = await financeApi.getOrderDetail({
          userId: Number(user.userId),
          orderId,
          isOwner: false,
        });

        console.log('订单详情响应:', response?.data);

        if (response.data.code === 0 || response.data.code === 200) {
          setOrderDetail(response.data.data);
        } else {
          console.error('获取订单详情失败 - code:', response.data.code, 'msg:', response.data.msg);
          Toast.show({
            type: 'error',
            text1: response.data.msg || t('confirmOrder.loadFailed'),
          });
        }
      } catch (error: any) {
        console.error('获取订单详情异常:', error);
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.msg || t('confirmOrder.loadFailed'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [user, orderId, t]);

  // 计算剩余时间
  useEffect(() => {
    if (!orderDetail?.lastPayTime) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, orderDetail.lastPayTime! - now);
      setRemainingTime(remaining);

      if (remaining === 0) {
        Toast.show({
          type: 'error',
          text1: t('confirmOrder.orderTimeout'),
        });
      }
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [orderDetail?.lastPayTime, t]);

  // 格式化剩余时间
  const formatRemainingTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // 获取订单状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t('confirmOrder.statusPending');
      case 2:
        return t('confirmOrder.statusPaid');
      case 3:
        return t('confirmOrder.statusCancelled');
      default:
        return t('confirmOrder.statusUnknown');
    }
  };

  // 处理支付
  const handlePay = async () => {
    if (!user || !orderId || isPayingSubmitting) return;

    try {
      setIsPayingSubmitting(true);
      const response = await financeApi.payOrder({
        userId: Number(user.userId),
        orderId,
      });

      const code = response.data.code;

      if (code === 0 || code === 200) {
        Toast.show({
          type: 'success',
          text1: t('confirmOrder.paymentSuccess'),
        });
        // 跳转到支付成功页面
        router.replace(`/(guard)/payment-result?orderId=${orderId}`);
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.msg || t('confirmOrder.paymentFailed'),
        });
      }
    } catch (error: any) {
      console.error('支付失败:', error);
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.msg ||
          error?.message ||
          t('confirmOrder.paymentFailedRetry'),
      });
    } finally {
      setIsPayingSubmitting(false);
    }
  };

  // 处理取消订单
  const handleCancel = async () => {
    if (!user || !orderId || isCancelingSubmitting) return;

    try {
      setIsCancelingSubmitting(true);
      const response = await financeApi.cancelOrder({
        userId: Number(user.userId),
        orderId,
      });

      const code = response.data.code;

      if (code === 0 || code === 200) {
        Toast.show({
          type: 'success',
          text1: t('confirmOrder.cancelSuccess'),
        });
        router.back();
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.msg || t('confirmOrder.cancelFailed'),
        });
      }
    } catch (error: any) {
      console.error('取消订单失败:', error);
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.msg ||
          error?.message ||
          t('confirmOrder.cancelFailedRetry'),
      });
    } finally {
      setIsCancelingSubmitting(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <View style={styles.container}>
        <NavigationBar title={t('confirmOrder.title')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6741FF" />
          <Text style={styles.loadingText}>{t('confirmOrder.loading')}</Text>
        </View>
      </View>
    );
  }

  // 错误状态
  if (!orderDetail) {
    return (
      <View style={styles.container}>
        <NavigationBar title={t('confirmOrder.title')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('confirmOrder.loadFailed')}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t('confirmOrder.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const products = orderDetail.products || [];

  return (
    <View style={styles.container}>
      <NavigationBar title={t('confirmOrder.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 商品列表 */}
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            {/* 商品图片 */}
            <View style={styles.productImageContainer}>
              <Image
                source={{
                  uri: product.logo
                    ? `${IMG_BASE_URL}${product.logo}`
                    : 'https://via.placeholder.com/40',
                }}
                style={styles.productImage}
              />
            </View>

            {/* 商品信息 */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.productName}
              </Text>
              <View style={styles.productDetails}>
                <Text style={styles.productDetailText}>
                  {t('confirmOrder.price')}：{product.price}U
                </Text>
                <Text style={styles.productDetailText}>
                  {t('confirmOrder.productValue')}：{product.productValue}
                </Text>
              </View>
            </View>

            {/* 状态和数量 */}
            <View style={styles.productRight}>
              <Text style={styles.statusText}>
                {getStatusText(orderDetail.status)}
              </Text>
              <Text style={styles.quantityText}>x {product.productAmount}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 倒计时通知 - 固定在底部操作栏上方 */}
      {orderDetail.status === 1 && remainingTime !== null && (
        <View
          style={[
            styles.countdownNotice,
            { bottom: insets.bottom + 90 },
          ]}
        >
          <View style={styles.countdownContent}>
            <View style={styles.countdownHeader}>
              <Text style={styles.countdownTime}>
                {formatRemainingTime(remainingTime)}
              </Text>
              <HelpIcon />
            </View>
            <Text style={styles.countdownText}>
              {t('confirmOrder.timeoutNotice')}
            </Text>
          </View>
        </View>
      )}

      {/* 底部操作栏 - 适配 iOS 安全距离 */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom || 20,
          },
        ]}
      >
        <View style={styles.bottomContent}>
          {/* 总价 */}
          <Text style={styles.totalPrice}>
            {orderDetail.amount || '0'} USDT
          </Text>

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            {orderDetail.status === 1 && (
              <>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isCancelingSubmitting && styles.disabledButton,
                  ]}
                  onPress={handleCancel}
                  disabled={isCancelingSubmitting}
                >
                  <Text style={styles.cancelButtonText}>
                    {isCancelingSubmitting
                      ? t('confirmOrder.processing')
                      : t('confirmOrder.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    isPayingSubmitting && styles.disabledButton,
                  ]}
                  onPress={handlePay}
                  disabled={isPayingSubmitting}
                >
                  <Text style={styles.payButtonText}>
                    {isPayingSubmitting
                      ? t('confirmOrder.processing')
                      : t('confirmOrder.confirmPayment')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {orderDetail.status === 2 && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => router.replace('/(guard)/account/record/shopping')}
              >
                <Text style={styles.payButtonText}>
                  {t('confirmOrder.viewOrder')}
                </Text>
              </TouchableOpacity>
            )}
            {orderDetail.status === 3 && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>
                  {t('confirmOrder.back')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#6E6E70',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: '#6741FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(138, 138, 138, 0.3)',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productDetailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  productRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    color: '#6E6E70',
    fontSize: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 20,
    height: 20,
    opacity: 0.5,
  },
  quantityBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLine: {
    backgroundColor: '#FFFFFF',
  },
  iconLineHorizontal: {
    width: 10,
    height: 1.5,
  },
  iconLineVertical: {
    width: 1.5,
    height: 10,
    position: 'absolute',
  },
  helpIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#6E6E70',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIconText: {
    color: '#6E6E70',
    fontSize: 10,
    fontWeight: '600',
  },
  countdownNotice: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  countdownContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  countdownText: {
    color: '#6E6E70',
    fontSize: 10,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  totalPrice: {
    color: '#E5AD54',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#303030',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#6741FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});


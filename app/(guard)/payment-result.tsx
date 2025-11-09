import NavigationBar from '@/components/NavigationBar';
import { financeApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface Product {
  productId: number;
  productName: string;
  logo: string;
  price: number;
  productValue: string;
  productAmount: number;
  serialNumber: number;
  coding?: string; // 幸运号码
}

interface OrderDetail {
  orderId: string;
  userId: number;
  amount: number;
  status: number;
  lastPayTime?: number;
  products: Product[];
  createTime: number;
}

export default function PaymentResultPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

  // 获取订单详情
  useEffect(() => {
    if (!user?.userId || !orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await financeApi.getOrderDetail({
          userId: Number(user.userId),
          orderId,
          isOwner: false,
        });

        if (response.data.code === 0 || response.data.code === 200) {
          setOrderDetail(response.data.data);
        } else {
          Toast.show({
            type: 'error',
            text1: response.data.msg || t('paymentResult.noOrderData'),
          });
        }
      } catch (error: any) {
        console.error('获取订单详情失败:', error);
        Toast.show({
          type: 'error',
          text1: error?.response?.data?.msg || t('paymentResult.noOrderData'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [user?.userId, orderId, t]);

  // 订单号中间省略显示
  const truncateOrderId = (id: string) => {
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-6)}`;
  };

  // 加载状态
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationBar title={t('paymentResult.title')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6741FF" />
          <Text style={styles.loadingText}>{t('paymentResult.loading')}</Text>
        </View>
      </View>
    );
  }

  // 错误状态
  if (!orderDetail) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NavigationBar title={t('paymentResult.title')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('paymentResult.noOrderData')}</Text>
        </View>
      </View>
    );
  }

  const products = orderDetail.products || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationBar title={t('paymentResult.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 支付成功图标和消息 */}
        <View style={styles.successSection}>
          <View style={styles.successIconContainer}>
            <Image
              source={require('@/assets/images/pay-success.png')}
              style={styles.successIcon}
              contentFit="contain"
            />
          </View>
          <Text style={styles.successTitle}>{t('paymentResult.successTitle')}</Text>
        </View>

        {/* 分隔线 */}
        <View style={styles.divider} />

        {/* 订单列表 */}
        <View style={styles.ordersSection}>
          {products.length > 0 ? (
            products.map((product, idx) => (
              <View key={idx}>
                <View style={styles.orderRow}>
                  {/* 订单号 */}
                  <View style={styles.orderColumn}>
                    <Text style={styles.orderLabel}>
                      {t('paymentResult.orderId')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        // 可以添加复制订单号功能
                      }}
                    >
                      <Text style={styles.orderValue} numberOfLines={1}>
                        {truncateOrderId(orderDetail.orderId)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 商品 */}
                  <View style={styles.orderColumn}>
                    <Text style={styles.orderLabel}>
                      {t('paymentResult.product')}
                    </Text>
                    <Text style={styles.orderValue} numberOfLines={2}>
                      {product.productName} x{product.productAmount}
                    </Text>
                  </View>

                  {/* 金额 */}
                  <View style={styles.orderColumn}>
                    <Text style={styles.orderLabel}>
                      {t('paymentResult.amount')}
                    </Text>
                    <Text style={[styles.orderValue, styles.amountValue]}>
                      {product.price}
                    </Text>
                  </View>

                  {/* 幸运号码 */}
                  <View style={styles.orderColumn}>
                    <Text style={styles.orderLabel}>
                      {t('paymentResult.luckyNumber')}
                    </Text>
                    <Text style={styles.orderValue}>
                      {product.coding || '-'}
                    </Text>
                  </View>
                </View>
                {idx < products.length - 1 && <View style={styles.productDivider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('paymentResult.noProducts')}</Text>
            </View>
          )}
        </View>

        {/* 分隔线 */}
        <View style={styles.divider} />
      </ScrollView>

      {/* 底部操作栏 - 适配 iOS 安全距离 */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom || 20,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.actionButtonText}>
            {t('paymentResult.backToHome')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => router.replace('/(guard)/account/record/shopping')}
        >
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
            {t('paymentResult.viewRecords')}
          </Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  errorText: {
    color: '#6E6E70',
    fontSize: 14,
    textAlign: 'center',
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 24,
  },
  successIconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: '100%',
    height: '100%',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 24,
  },
  ordersSection: {
    gap: 24,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  orderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  orderValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  amountValue: {
    color: '#E5AD54',
  },
  productDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 24,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6E6E70',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#303030',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6741FF',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});


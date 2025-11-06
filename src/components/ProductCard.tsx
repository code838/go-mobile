import { IMG_BASE_URL } from '@/constants/api';
import { manageCart, orderBuy } from '@/services/home';
import { useBoundStore } from '@/store';
import type { Product } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Countdown from './Countdown';

interface ProductCardProps {
  product: Product;
  showCountdownLabels?: boolean;
  onRefresh?: () => void;
}

export default function ProductCard({
  product,
  showCountdownLabels = true,
  onRefresh,
}: ProductCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useBoundStore(state => state.user);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInCart, setIsInCart] = useState(product.cart || false);
  const [isCountdownExpired, setIsCountdownExpired] = useState(false);

  // 当 product.cart 变化时更新本地状态
  useEffect(() => {
    setIsInCart(product.cart || false);
  }, [product.cart]);

  // 监听倒计时是否结束
  useEffect(() => {
    const checkCountdownStatus = () => {
      const now = Date.now();
      const isExpired = product.endTime <= now;
      setIsCountdownExpired(isExpired);
    };

    // 立即检查一次
    checkCountdownStatus();

    // 每秒检查一次
    const timer = setInterval(checkCountdownStatus, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [product.endTime]);

  const progress = ((product.joinPerson / product.totalPerson) * 100).toFixed(0) + '%';
  const progressValue = (product.joinPerson / product.totalPerson) * 100;
  const isProgressComplete = progressValue >= 100;
  const remainingSlots = product.totalPerson - product.joinPerson;

  const handleJoinNow = async () => {
    // 检查是否登录 - 参考 (guard)/_layout.tsx 的处理方式
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    // 防止重复提交
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 调用下单接口
      const response = await orderBuy({
        userId: Number(user.userId),
        data: [
          {
            productId: product.productId,
            num: quantity,
          },
        ],
      });

      if (response?.data?.code === 0) {
        // 导航到确认订单页面
        router.push({
          pathname: '/confirm-order',
          params: { orderId: response.data.data?.orderId },
        } as any);
      } else {
        Toast.show({
          type: 'error',
          text1: response?.data?.msg || t('orderFailed', { defaultValue: '下单失败' }),
        });
      }
    } catch (error: any) {
      console.error('下单失败:', error);
      Toast.show({
        type: 'error',
        text1: error?.message || t('orderFailed', { defaultValue: '下单失败' }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCart = async () => {
    // 检查是否登录 - 参考 (guard)/_layout.tsx 的处理方式
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    try {
      const newCartState = !isInCart;

      // 调用购物车管理接口
      // type: 1-添加, 2-删除
      await manageCart({
        userId: Number(user.userId),
        productId: product.productId,
        type: newCartState ? 1 : 2,
        num: quantity,
      });

      // 立即更新本地状态
      setIsInCart(newCartState);

      // 触发刷新
      if (onRefresh) {
        onRefresh();
      }

      // 显示提示
      if (newCartState) {
        Toast.show({
          type: 'success',
          text1: t('addedToWishlist', { defaultValue: '已添加到心愿单' }),
        });
      } else {
        Toast.show({
          type: 'info',
          text1: t('removedFromWishlist', { defaultValue: '已从心愿单移除' }),
        });
      }
    } catch (error: any) {
      console.error('操作失败:', error);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.msg || t('operationFailed', { defaultValue: '操作失败' }),
      });
    }
  };

  const handleCardPress = () => {
    const params: any = {
      id: product.productId.toString(),
      serialNumber: product.serialNumber.toString(),
    };
    if (isProgressComplete && isCountdownExpired) {
      params.winner = 'true';
    }
    router.push({
      pathname: `/product/${product.productId}`,
      params,
    } as any);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.8}
    >
      {/* 产品图片 - 绝对定位在顶部 */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: product?.logo
              ? `${IMG_BASE_URL}${product?.logo}`
              : 'https://via.placeholder.com/40',
          }}
          style={styles.productImage}
        />
      </View>

      {/* 标题 */}
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {product.title}
      </Text>

      {/* 信息网格 - 只显示两列 */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.priceText}>{product.price} USDT</Text>
          <Text style={styles.infoLabel}>
            {t('productPrice', { defaultValue: '价格' })}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.valueText}>{product.productValue}</Text>
          <Text style={styles.infoLabel}>
            {t('productValue', { defaultValue: '价值' })}
          </Text>
        </View>
      </View>

      <View style={styles.spacer} />

      {/* 进度条或倒计时 */}
      {isProgressComplete && !isCountdownExpired ? (
        <Countdown
          endTime={product.endTime}
          showSeconds={false}
          showLabels={showCountdownLabels}
        />
      ) : (
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>{product.joinPerson}</Text>
            <Text style={styles.progressLabel}>{product.totalPerson}</Text>
          </View>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressValue}%` }]} />
            </View>
            <Text style={[styles.progressText, { left: `${progressValue}%` }]}>
              {progress}
            </Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressSubLabel}>
              {t('participants', { defaultValue: '参与人次' })}
            </Text>
            <Text style={styles.progressSubLabel}>
              {t('maxParticipants', { defaultValue: '最大人次' })}
            </Text>
          </View>
        </View>
      )}

      {/* 操作按钮区 */}
      <View style={styles.buttonContainer}>
        {isProgressComplete ? (
          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleCardPress}
          >
            <Text style={styles.buttonText}>
              {t('view', { defaultValue: '查看' })}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleJoinNow}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {t('joinNow', { defaultValue: '立即参与' })}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={handleToggleCart}
          style={styles.heartButton}
        >
          <Image
            source={
              isInCart
                ? require('@/assets/images/icon-heart-filled.png')
                : require('@/assets/images/icon-heart.png')
            }
            style={styles.heartIcon}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    paddingTop: 28,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
    top: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8A8A8A',
    overflow: 'hidden',
    zIndex: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  infoGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginTop: 8,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceText: {
    color: '#FFB800',
    fontSize: 12,
    fontWeight: '500',
  },
  valueText: {
    color: '#1AF578',
    fontSize: 12,
    fontWeight: '500',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  progressContainer: {
    width: '100%',
    marginTop: -8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  progressBarWrapper: {
    marginTop: 4,
    width: '100%',
    position: 'relative',
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6741FF',
    borderRadius: 4,
  },
  progressText: {
    position: 'absolute',
    top: -2,
    fontSize: 8,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 1,
  },
  progressSubLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    paddingTop: 4,
  },
  viewButton: {
    backgroundColor: '#6741FF',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 64,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#6741FF',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 64,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  heartButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});


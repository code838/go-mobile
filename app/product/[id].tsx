import Countdown from '@/components/Countdown';
import { IMG_BASE_URL } from '@/constants/api';
import { urls } from '@/constants/urls';
import { request } from '@/utils/request';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// 类型定义
interface ProductDetail {
  productId: number;
  title: string;
  subTitle?: string;
  logo: string;
  price: number;
  productValue: string;
  totalPerson: number;
  joinPerson: number;
  serialNumber: number;
  endTime: number;
  cart: boolean;
  owner?: string;
  ownerCoding?: string;
  coinId: number;
}

interface BuyUser {
  time: number;
  nickName: string;
  image?: string;
  num: number;
}

interface HistoryDraw {
  productId: number;
  serialNumber: number;
  title: string;
  coinName: string;
  productValue: string;
  ownerCoding: string;
  owner: string;
  ownerImage?: string;
  endTime: number;
}

interface CalcResultItem {
  buyTime: number;
  timeStamp: string;
  productName: string;
  productImage?: string;
  nickName: string;
  userImage?: string;
}

interface CalcResult {
  sumTime: string;
  totalPerson: number;
  remainder: number;
  result: string;
}

interface CalcResultData {
  buyList: CalcResultItem[];
  calcResult: CalcResult;
}

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const productId = Number(params.id);
  const serialNumber = Number(params.serialNumber) || 1;
  const isWinnerView = params.winner === 'true';
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  
  // 列表数据
  const [buyUsers, setBuyUsers] = useState<BuyUser[]>([]);
  const [historyDraws, setHistoryDraws] = useState<HistoryDraw[]>([]);
  const [calcResultData, setCalcResultData] = useState<CalcResultData | null>(null);
  
  // 分页
  const [buyUsersPage, setBuyUsersPage] = useState(1);
  const [historyDrawsPage, setHistoryDrawsPage] = useState(1);
  const [hasMoreBuyUsers, setHasMoreBuyUsers] = useState(true);
  const [hasMoreHistoryDraws, setHasMoreHistoryDraws] = useState(true);
  const pageSize = 10;

  // Tab配置
  const tabs = isWinnerView 
    ? [t('productDetail.participantRecords'), t('productDetail.calculationResult')] 
    : [t('productDetail.participantRecords'), t('productDetail.recentDraws')];

  // 获取商品详情
  useEffect(() => {
    fetchProductDetail();
  }, [productId, serialNumber]);

  // 获取参与记录
  useEffect(() => {
    if (activeTab === 0) {
      fetchBuyUsers();
    }
  }, [activeTab, buyUsersPage]);

  // 获取近期开奖
  useEffect(() => {
    if (activeTab === 1 && !isWinnerView) {
      fetchHistoryDraws();
    }
  }, [activeTab, historyDrawsPage, isWinnerView]);

  // 获取计算结果
  useEffect(() => {
    if (activeTab === 1 && isWinnerView) {
      fetchCalcResult();
    }
  }, [activeTab, isWinnerView]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const apiUrl = (urls as any).productDetail || `${urls.home.replace('/home', '/product/detail')}`;
      const response = await request.post(apiUrl, {
        productId,
        serialNumber,
        userId: userId ? Number(userId) : undefined,
      });
      
      if (response?.data?.code === 0) {
        const data = response.data.data;
        setProductDetail(data);
        setIsInCart(data.cart || false);
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      Toast.show({
        type: 'error',
        text1: t('productDetail.fetchFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyUsers = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const apiUrl = (urls as any).productBuyUsers || `${urls.home.replace('/home', '/product/buyUsers')}`;
      const response = await request.post(apiUrl, {
        productId,
        pageNo: buyUsersPage,
        pageSize,
        userId: userId ? Number(userId) : undefined,
      });
      
      if (response?.data?.code === 0) {
        const newData = response.data.data || [];
        setBuyUsers(prev => buyUsersPage === 1 ? newData : [...prev, ...newData]);
        setHasMoreBuyUsers(newData.length === pageSize);
      }
    } catch (error) {
      console.error('获取参与记录失败:', error);
    }
  };

  const fetchHistoryDraws = async () => {
    try {
      const apiUrl = (urls as any).productHistoryDraws || `${urls.home.replace('/home', '/product/historyDraws')}`;
      const response = await request.post(apiUrl, {
        productId,
        pageNo: historyDrawsPage,
        pageSize,
      });
      
      if (response?.data?.code === 0) {
        const newData = response.data.data || [];
        setHistoryDraws(prev => historyDrawsPage === 1 ? newData : [...prev, ...newData]);
        setHasMoreHistoryDraws(newData.length === pageSize);
      }
    } catch (error) {
      console.error('获取近期开奖失败:', error);
    }
  };

  const fetchCalcResult = async () => {
    try {
      const apiUrl = (urls as any).productCalcResult || `${urls.home.replace('/home', '/product/calcResult')}`;
      const response = await request.post(apiUrl, {
        productId,
        serialNumber,
      });
      
      if (response?.data?.code === 0) {
        setCalcResultData(response.data.data);
      }
    } catch (error) {
      console.error('获取计算结果失败:', error);
    }
  };

  const handleToggleCart = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      router.push('/(auth)/login');
      return;
    }

    try {
      const newCartState = !isInCart;
      await request.post(urls.cartManage, {
        userId: Number(userId),
        productId,
        type: newCartState ? 1 : 2,
        num: quantity,
      });
      
      setIsInCart(newCartState);
      Toast.show({
        type: 'success',
        text1: newCartState ? t('productCard.addedToWishlist') : t('productCard.removedFromWishlist'),
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.msg || t('productCard.operationFailed'),
      });
    }
  };

  const handleJoinNow = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      router.push('/(auth)/login');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await request.post(urls.orderBuy, {
        userId: Number(userId),
        data: [{ productId, num: quantity }],
      });
      
      if (response?.data?.code === 0) {
        router.push({
          pathname: '/confirm-order',
          params: { orderId: response.data.data?.orderId },
        } as any);
      } else {
        Toast.show({
          type: 'error',
          text1: response?.data?.msg || t('productCard.orderFailed'),
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.msg || t('productCard.orderFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    const remainingSlots = productDetail ? productDetail.totalPerson - productDetail.joinPerson : 0;
    if (quantity < remainingSlots) {
      setQuantity(quantity + 1);
    } else {
      Toast.show({
        type: 'warning',
        text1: t('productCard.maxParticipantLimit', { count: remainingSlots }),
      });
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return t('productDetail.secondsAgo', { count: seconds });
    if (minutes < 60) return t('productDetail.minutesAgo', { count: minutes });
    if (hours < 24) return t('productDetail.hoursAgo', { count: hours });
    if (days === 1) return t('productDetail.daysHoursAgo', { days: 1, hours: hours % 24 });
    return t('productDetail.daysAgo', { count: days });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6741FF" />
        <Text style={styles.loadingText}>{t('productDetail.loading')}</Text>
      </View>
    );
  }

  if (!productDetail) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noDataText}>{t('productDetail.noData')}</Text>
      </View>
    );
  }

  const progress = ((productDetail.joinPerson / productDetail.totalPerson) * 100).toFixed(0) + '%';
  const progressValue = (productDetail.joinPerson / productDetail.totalPerson) * 100;
  const isProgressComplete = progressValue >= 100;
  const remainingSlots = productDetail.totalPerson - productDetail.joinPerson;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top }
        ]}
      >
        {/* 标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('productDetail.title')}</Text>
          {!isWinnerView ? (
            <TouchableOpacity onPress={handleToggleCart} style={styles.headerAction}>
              <Image
                source={
                  isInCart
                    ? require('@/assets/images/icon-heart-filled.png')
                    : require('@/assets/images/icon-heart.png')
                }
                style={styles.heartIcon}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerAction} />
          )}
        </View>

        {/* 商品信息卡片 */}
        <View style={styles.productCard}>
          {/* 商品图片 */}
          <View style={styles.productImageWrapper}>
            <Image
              source={{
                uri: productDetail.logo
                  ? `${IMG_BASE_URL}${productDetail.logo}`
                  : 'https://via.placeholder.com/96',
              }}
              style={styles.productImage}
            />
            {/* 中奖者头像 */}
            {isWinnerView && productDetail.owner && (
              <View style={styles.winnerAvatarWrapper}>
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${productDetail.owner}`,
                  }}
                  style={styles.winnerAvatar}
                />
              </View>
            )}
          </View>

          {/* 标题 */}
          <Text style={styles.productTitle}>
            {t('productDetail.productTitleWithPeriod', {
              name: productDetail.title,
              period: productDetail.serialNumber,
            })}
          </Text>

          {/* 统计信息 */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{productDetail.totalPerson}</Text>
              <Text style={styles.statLabel}>{t('productDetail.maxParticipants')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#E5AD54' }]}>{productDetail.price}U</Text>
              <Text style={styles.statLabel}>{t('productDetail.productPrice')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#1AF578' }]}>{productDetail.productValue}</Text>
              <Text style={styles.statLabel}>{t('productDetail.productValue')}</Text>
            </View>
          </View>

          {/* 中奖信息 */}
          {isWinnerView && (
            <View style={styles.winnerInfo}>
              <Text style={styles.revealTime}>
                {new Date(productDetail.endTime).toLocaleString()}
              </Text>
              <View style={styles.winnerBox}>
                <Text style={styles.winnerText}>
                  🎉 {t('productDetail.congratulations')}{' '}
                  <Text style={{ color: '#6741FF' }}>{productDetail.owner || ''}</Text>{' '}
                  {t('productDetail.wonProduct')}
                </Text>
                <Text style={styles.winnerText}>
                  {t('productDetail.luckyCode')}：
                  <Text style={{ color: '#67E8F2' }}>{productDetail.ownerCoding || ''}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* 进度条和倒计时 */}
          {!isWinnerView && (
            <View style={styles.progressSection}>
              {/* 进度条 */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{t('productDetail.progress')}</Text>
                  <Text style={styles.progressPercent}>{progress}</Text>
                </View>
                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressValue}%` }]} />
                  </View>
                </View>
              </View>

              {/* 倒计时 */}
              {isProgressComplete && (
                <Countdown endTime={productDetail.endTime} showLabels={true} />
              )}
            </View>
          )}
        </View>

        {/* Tab切换 */}
        <View style={styles.tabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTab(index)}
              style={styles.tab}
            >
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab内容 */}
        {activeTab === 0 && (
          <View style={styles.tabContent}>
            {/* 参与记录表头 */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>{t('productDetail.purchaseTime')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.buyer')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.purchaseCount')}</Text>
            </View>

            {/* 参与记录列表 */}
            {buyUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('productDetail.noData')}</Text>
              </View>
            ) : (
              <>
                {buyUsers.map((user, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{formatTimeAgo(user.time)}</Text>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: user.image
                            ? `${IMG_BASE_URL}${user.image}`
                            : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.nickName}`,
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {user.nickName}
                      </Text>
                    </View>
                    <Text style={styles.tableCell}>x{user.num}</Text>
                  </View>
                ))}

                {/* 只有当有数据且还有更多数据时才显示加载更多按钮 */}
                {hasMoreBuyUsers && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => setBuyUsersPage(prev => prev + 1)}
                  >
                    <Text style={styles.loadMoreText}>{t('productDetail.loadMore')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* 近期开奖 */}
        {activeTab === 1 && !isWinnerView && (
          <View style={styles.tabContent}>
            {/* 表头 */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>{t('productDetail.period')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.luckyNumber')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.winnerShort')}</Text>
            </View>

            {/* 列表 */}
            {historyDraws.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('productDetail.noData')}</Text>
              </View>
            ) : (
              <>
                {historyDraws.map((draw, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {t('productDetail.periodNumber', { number: draw.serialNumber })}
                    </Text>
                    <Text style={[styles.tableCell, { color: '#67E8F2' }]}>
                      {draw.ownerCoding}
                    </Text>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${draw.owner}`,
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {draw.owner}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* 只有当有数据且还有更多数据时才显示加载更多按钮 */}
                {hasMoreHistoryDraws && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => setHistoryDrawsPage(prev => prev + 1)}
                  >
                    <Text style={styles.loadMoreText}>{t('productDetail.loadMore')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* 计算结果 */}
        {activeTab === 1 && isWinnerView && calcResultData && (
          <View style={styles.tabContent}>
            {/* 计算规则 */}
            <View style={styles.ruleBox}>
              <Text style={styles.ruleTitle}>{t('productDetail.calculationRule')}</Text>
              <Text style={styles.ruleText}>{t('productDetail.calculationRuleText')}</Text>
            </View>

            {/* 购买记录 */}
            {calcResultData.buyList && calcResultData.buyList.length > 0 && (
              <View style={styles.calcSection}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>{t('productDetail.purchaseTime')}</Text>
                  <Text style={styles.tableHeaderText}>{t('productDetail.purchasedProduct')}</Text>
                  <Text style={styles.tableHeaderText}>{t('productDetail.buyer')}</Text>
                </View>

                {calcResultData.buyList.map((item, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <View style={styles.calcTimeCell}>
                      <Text style={styles.calcTimeText}>
                        {new Date(item.buyTime).toLocaleString()}
                      </Text>
                      <Text style={styles.calcTimestamp}>（{item.timeStamp}）</Text>
                    </View>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: item.productImage
                            ? `${IMG_BASE_URL}${item.productImage}`
                            : 'https://via.placeholder.com/16',
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {item.productName}
                      </Text>
                    </View>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: item.userImage
                            ? `${IMG_BASE_URL}${item.userImage}`
                            : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.nickName}`,
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.tableCell} numberOfLines={1}>
                        {item.nickName}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 计算结果 */}
            {calcResultData.calcResult && (
              <View style={styles.resultBox}>
                <View style={styles.resultBlur} />
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>{t('productDetail.calculationResultTitle')}</Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.sum', { value: calcResultData.calcResult.sumTime })}
                  </Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.remainder', {
                      sum: calcResultData.calcResult.sumTime,
                      total: calcResultData.calcResult.totalPerson,
                      remainder: calcResultData.calcResult.remainder,
                    })}
                  </Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.calculation', {
                      remainder: calcResultData.calcResult.remainder,
                      result: calcResultData.calcResult.result,
                    })}
                  </Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.finalResult', { code: '' })}{' '}
                    <Text style={{ color: '#67E8F2' }}>{calcResultData.calcResult.result}</Text>
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      {!isWinnerView && !isProgressComplete && (
        <View style={[
          styles.bottomBar,
          { bottom: insets.bottom > 0 ? insets.bottom : 0 }
        ]}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>{t('productDetail.total')}</Text>
            <Text style={styles.totalPrice}>
              {(productDetail.price * quantity).toFixed(2)}U
            </Text>
          </View>

          <View style={styles.actionSection}>
            {/* 数量选择器 */}
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={handleDecrement}
                disabled={quantity <= 1}
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}</Text>
              </View>

              <TouchableOpacity
                onPress={handleIncrement}
                disabled={quantity >= remainingSlots}
                style={[
                  styles.quantityButton,
                  quantity >= remainingSlots && styles.quantityButtonDisabled,
                ]}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* 立即参与按钮 */}
            <TouchableOpacity
              style={[styles.joinButton, isSubmitting && styles.joinButtonDisabled]}
              onPress={handleJoinNow}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>{t('productCard.joinNowShort')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0E10',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#6741FF',
    textAlign: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 48,
    paddingTop: 64,
    paddingBottom: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  productImageWrapper: {
    position: 'absolute',
    top: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8A8A8A',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  winnerAvatarWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  winnerAvatar: {
    width: '100%',
    height: '100%',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#6E6E70',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  winnerInfo: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  revealTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  winnerBox: {
    width: 220,
    gap: 10,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6E6E70',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E70',
  },
  progressBarWrapper: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    height: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6741FF',
    borderRadius: 6,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E70',
  },
  tabTextActive: {
    color: '#6741FF',
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E70',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  userCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ruleBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  ruleTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ruleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6E6E70',
    lineHeight: 18,
  },
  calcSection: {
    marginTop: 12,
  },
  calcTimeCell: {
    flex: 1,
    alignItems: 'center',
  },
  calcTimeText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calcTimestamp: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6E6E70',
  },
  resultBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  resultBlur: {
    position: 'absolute',
    right: 60,
    bottom: 20,
    width: 95,
    height: 101,
    borderRadius: 999,
    backgroundColor: '#67E8F2',
    opacity: 0.3,
  },
  resultContent: {
    gap: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5AD54',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantityDisplay: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinButton: {
    backgroundColor: '#6741FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 96,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


import NavigationBar from '@/components/NavigationBar';
import { IMG_BASE_URL } from '@/constants/api';
import { getHistoryProducts } from '@/services/home';
import { useBoundStore } from '@/store';
import type { ProductHistory } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function LatestPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useBoundStore(state => state.user);
  const [pageNo, setPageNo] = useState(1);
  const [historyProducts, setHistoryProducts] = useState<ProductHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  // 格式化时间
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };

  // 获取最新揭晓产品列表
  const fetchProducts = async (page: number, isRefresh = false) => {
    if (loading && !isRefresh) return;

    setLoading(true);
    try {
      const userId = user?.userId ? Number(user.userId) : undefined;
      console.log('最新揭晓 fetchProducts - user:', user);
      console.log('最新揭晓 fetchProducts - userId:', userId, '类型:', typeof userId);
      
      const requestParams = {
        pageNo: page,
        pageSize,
        userId,
      };
      console.log('最新揭晓 fetchProducts - 请求参数:', JSON.stringify(requestParams));
      
      const res = await getHistoryProducts(requestParams);
      const newProducts = res?.data?.data || [];

      if (page === 1) {
        setHistoryProducts(newProducts);
      } else {
        setHistoryProducts((prev) => [...prev, ...newProducts]);
      }

      // 如果返回的数据少于 pageSize，说明没有更多数据了
      if (newProducts.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Failed to fetch history products:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchProducts(1);
  }, [user]);

  // 每次页面聚焦时重新加载数据
  useFocusEffect(
    useCallback(() => {
      setPageNo(1);
      setHasMore(true);
      fetchProducts(1);
    }, [user])
  );

  // 加载更多
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      fetchProducts(nextPage);
    }
  };

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPageNo(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, []);

  // 处理商品点击
  const handleProductPress = (product: ProductHistory) => {
    router.push({
      pathname: `/product/${product.productId}`,
      params: {
        id: product.productId.toString(),
        serialNumber: product.serialNumber.toString(),
        winner: 'true',
      },
    } as any);
  };

  // 初始加载时显示加载状态
  if (initialLoading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6741FF" />
        </View>
      </View>
    );
  }

  // 获取最新的一条数据用于顶部展示
  const latestProduct = historyProducts?.[0];
  const remainingProducts = historyProducts?.slice(1) || [];

  return (
    <View style={styles.safeArea}>
      <NavigationBar title={t('latest.title')} showBack={false} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* 最新揭晓商品 - 顶部特殊展示 */}
        {latestProduct && (
          <TouchableOpacity
            style={styles.latestCard}
            onPress={() => handleProductPress(latestProduct)}
            activeOpacity={0.8}
          >
            {/* 商品图片 - 绝对定位在顶部居中 */}
            <View style={styles.latestImageWrapper}>
              <View style={styles.latestImageGradient}>
                <Image
                  source={{
                    uri: latestProduct?.logo
                      ? `${IMG_BASE_URL}${latestProduct?.logo}`
                      : 'https://via.placeholder.com/40',
                  }}
                  style={styles.latestImage}
                />
              </View>
            </View>

            {/* 商品标题 */}
            <View style={styles.latestTitleContainer}>
              <Text style={styles.latestTitle} numberOfLines={1}>
                （第 {latestProduct.serialNumber} 期）{latestProduct.title}
              </Text>
            </View>

            {/* 统计信息 */}
            <View style={styles.latestStatsContainer}>
              <View style={styles.latestStatItem}>
                <Text style={styles.latestStatValue}>
                  {latestProduct.joinPerson}
                </Text>
                <Text style={styles.latestStatLabel}>
                  {t('latest.participants')}
                </Text>
              </View>
              <View style={styles.latestStatItem}>
                <Text style={styles.latestStatValue}>
                  {latestProduct.totalPerson}
                </Text>
                <Text style={styles.latestStatLabel}>
                  {t('latest.maxParticipants')}
                </Text>
              </View>
              <View style={styles.latestStatItem}>
                <Text style={[styles.latestStatValue, styles.valueGreen]}>
                  {latestProduct.productValue}
                </Text>
                <Text style={styles.latestStatLabel}>
                  {t('latest.productValue')}
                </Text>
              </View>
            </View>

            {/* 获奖信息 */}
            <View style={styles.latestWinnerContainer}>
              <Text style={styles.latestWinnerText}>
                {t('latest.congratulations')}{' '}
                <Text style={styles.latestWinnerName}>
                  {latestProduct.owner}
                </Text>{' '}
                {t('latest.wonProduct')}
              </Text>
              <Text style={styles.latestWinnerText}>
                {t('latest.luckyCodeLabel')}
                <Text style={styles.latestLuckyCode}>
                  {latestProduct.ownerCoding}
                </Text>
              </Text>
              <Text style={styles.latestRevealTime}>
                {t('latest.revealTimeLabel')}
                {formatDate(latestProduct.endTime)}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 历史商品列表 */}
        <View style={styles.historySection}>
          {remainingProducts && remainingProducts.length > 0 ? (
            <>
              {remainingProducts.map((product, index) => (
                <TouchableOpacity
                  key={`${product.productId}-${product.serialNumber}-${index}`}
                  style={styles.historyCard}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.8}
                >
                  {/* 商品标题和时间 */}
                  <View style={styles.historyHeader}>
                    <Text
                      style={styles.historyTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      (第 {product.serialNumber} 期) {product.title}
                    </Text>
                    <Text style={styles.historyTime}>
                      {formatDate(product.endTime)}
                    </Text>
                  </View>

                  {/* 商品信息行 */}
                  <View style={styles.historyContent}>
                    {/* 商品图片和价格信息 */}
                    <View style={styles.historyLeftSection}>
                      <View style={styles.historyImageWrapper}>
                        <Image
                          source={{
                            uri: product?.logo
                              ? `${IMG_BASE_URL}${product?.logo}`
                              : 'https://via.placeholder.com/40',
                          }}
                          style={styles.historyImage}
                        />
                      </View>

                      {/* 价格和价值信息 */}
                      <View style={styles.historyPriceInfo}>
                        <Text style={styles.historyInfoText}>
                          {t('latest.priceLabel')}
                          <Text style={styles.priceGold}>{product.price}U</Text>
                        </Text>
                        <Text style={styles.historyInfoText}>
                          {t('latest.valueLabel')}
                          <Text style={styles.valueGreen}>
                            {product.productValue}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* 获奖人信息 */}
                    <View style={styles.historyWinnerSection}>
                      <Text style={styles.historyLabel}>
                        {t('latest.winnerLabel')}
                      </Text>
                      <View style={styles.historyWinnerContent}>
                        <View style={styles.historyAvatarWrapper}>
                          {product.ownerImage ? (
                            <Image
                              source={{
                                uri: `${IMG_BASE_URL}${product.ownerImage}`,
                              }}
                              style={styles.historyAvatar}
                            />
                          ) : (
                            <View style={styles.historyAvatarPlaceholder} />
                          )}
                        </View>
                        <Text
                          style={styles.historyWinnerName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {product.owner}
                        </Text>
                      </View>
                    </View>

                    {/* 幸运编码 */}
                    <View style={styles.historyCodeSection}>
                      <Text style={styles.historyLabel}>
                        {t('latest.luckyCode')}
                      </Text>
                      <Text
                        style={styles.historyCode}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {product.ownerCoding}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            !latestProduct && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('latest.noRecords')}</Text>
              </View>
            )
          )}
        </View>

        {/* 加载更多按钮 */}
        {hasMore && historyProducts.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity
              style={[styles.loadMoreButton, loading && styles.loadMoreButtonDisabled]}
              onPress={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
              ) : (
                <Text style={styles.loadMoreText}>{t('latest.loadMore')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 加载中指示器 */}
        {loading && historyProducts.length > 0 && !hasMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#6741FF" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // 最新揭晓商品卡片样式
  latestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 28,
    paddingTop: 36,
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
    marginTop: 15
  },
  latestImageWrapper: {
    position: 'absolute',
    top: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 10,
  },
  latestImageGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#8A8A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  latestImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  latestTitleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  latestTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  latestStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  latestStatItem: {
    alignItems: 'center',
  },
  latestStatValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  latestStatLabel: {
    color: '#6E6E70',
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  valueGreen: {
    color: '#1AF578',
  },
  latestWinnerContainer: {
    alignItems: 'center',
    paddingTop: 12,
    gap: 8,
  },
  latestWinnerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  latestWinnerName: {
    color: '#6741FF',
  },
  latestLuckyCode: {
    color: '#67E8F2',
  },
  latestRevealTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  // 历史商品列表样式
  historySection: {
    gap: 8,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  historyTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  historyTime: {
    color: '#6E6E70',
    fontSize: 12,
    flexShrink: 0,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  historyLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  historyImageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8A8A8A',
    overflow: 'hidden',
    flexShrink: 0,
  },
  historyImage: {
    width: '100%',
    height: '100%',
  },
  historyPriceInfo: {
    flex: 1,
    minWidth: 0,
  },
  historyInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  priceGold: {
    color: '#FFB800',
  },
  historyWinnerSection: {
    alignItems: 'center',
    width: 80,
    flexShrink: 0,
  },
  historyLabel: {
    color: '#6E6E70',
    fontSize: 10,
    marginBottom: 4,
  },
  historyWinnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    maxWidth: '100%',
  },
  historyAvatarWrapper: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8A8A8A',
    overflow: 'hidden',
    flexShrink: 0,
  },
  historyAvatar: {
    width: '100%',
    height: '100%',
  },
  historyAvatarPlaceholder: {
    width: '100%',
    height: '100%',
  },
  historyWinnerName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
  },
  historyCodeSection: {
    alignItems: 'center',
    width: 70,
    flexShrink: 0,
  },
  historyCode: {
    color: '#67E8F2',
    fontSize: 12,
    fontWeight: '500',
  },
  // 加载更多样式
  loadMoreContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  loadMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  loadMoreButtonDisabled: {
    opacity: 0.5,
  },
  loadMoreText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  loadingMoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  // 空状态样式
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});

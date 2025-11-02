import ProductCard from '@/components/ProductCard';
import WinnerAnnouncement from '@/components/WinnerAnnouncement';
import { financeApi } from '@/services/api';
import { getHomeBuys, getWillProducts, getZoneProducts, getZones } from '@/services/home';
import type { BuyerInfo, Product, Zone } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Coin {
  coinId: number;
  coinName: string;
}

export default function UbuyPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [zones, setZones] = useState<Zone[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(undefined);
  const [selectedCoin, setSelectedCoin] = useState<string>('全部');
  const [selectedCoinId, setSelectedCoinId] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'1' | '2'>('1');
  const [products, setProducts] = useState<Product[]>([]);
  const [buys, setBuys] = useState<BuyerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCoinDropdownOpen, setIsCoinDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // 构建币种选项列表
  const coinOptions = useMemo(() => {
    const allOption = { coinId: 0, coinName: '全部' };
    return [allOption, ...coins];
  }, [coins]);

  // 排序选项
  const sortOptions = useMemo(
    () => [
      { value: '1' as const, label: t('zone.sortLatest') },
      { value: '2' as const, label: t('zone.sortRemaining') },
    ],
    [t]
  );

  // 确保在客户端挂载后再获取数据
  useEffect(() => {
    setMounted(true);
    loadUserId();
  }, []);

  // 加载用户ID
  const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(Number(storedUserId));
      }
    } catch (error) {
      console.error('加载用户ID失败:', error);
    }
  };

  // 加载初始数据
  const loadInitialData = async () => {
    try {
      const [zonesRes, coinsRes, buysRes] = await Promise.all([
        getZones(),
        financeApi.getCoins(),
        getHomeBuys(),
      ]);

      const zonesData = zonesRes?.data?.data || [];
      const coinsData = coinsRes?.data?.data || [];
      const buysData = buysRes?.data?.data?.buys || [];

      setZones(zonesData);
      setCoins(coinsData);
      setBuys(buysData);

      // 设置默认选中第一个专区
      if (zonesData.length > 0) {
        setSelectedTab(zonesData[0].zoneTitle);
        setSelectedZoneId(zonesData[0].zoneId);
      }
    } catch (error) {
      console.error('加载初始数据失败:', error);
    }
  };

  // 加载商品数据
  const loadProducts = async () => {
    try {
      setLoading(true);

      const isComing = selectedTab === t('zone.comingSoon');
      const params = {
        pageNo: 1,
        pageSize: 50,
        coinId: selectedCoinId,
        orderBy: sortBy === '1' ? 1 : 2,
      };

      let productsRes;
      if (isComing) {
        productsRes = await getWillProducts(params);
      } else if (selectedZoneId) {
        productsRes = await getZoneProducts({
          ...params,
          zoneId: selectedZoneId,
          userId: userId,
        });
      }

      const productsData = productsRes?.data?.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('加载商品数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 当mounted变化时加载初始数据
  useEffect(() => {
    if (mounted) {
      loadInitialData();
    }
  }, [mounted]);

  // 当选中的tab、币种、排序方式变化时加载商品数据
  useEffect(() => {
    if (mounted && selectedTab) {
      loadProducts();
    }
  }, [mounted, selectedTab, selectedZoneId, selectedCoinId, sortBy, userId]);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [selectedTab, selectedZoneId, selectedCoinId, sortBy, userId]);

  // 生成标签数据
  const tabsData = useMemo(() => {
    const tabs: Array<{ key: string; label: string; zoneId?: number }> = [];

    // 添加动态专区
    zones.forEach((zone) => {
      tabs.push({
        key: zone.zoneTitle,
        label: zone.zoneTitle,
        zoneId: zone.zoneId,
      });
    });

    // 添加即将揭晓
    tabs.push({
      key: t('zone.comingSoon'),
      label: t('zone.comingSoon'),
    });

    return tabs;
  }, [zones, t]);

  // 处理标签切换
  const handleTabChange = (tab: { key: string; label: string; zoneId?: number }) => {
    setSelectedTab(tab.key);
    setSelectedZoneId(tab.zoneId);
  };

  // 处理币种选择
  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin.coinName);
    setSelectedCoinId(coin.coinId === 0 ? undefined : coin.coinId);
    setIsCoinDropdownOpen(false);
  };

  // 处理排序选择
  const handleSortSelect = (sort: '1' | '2') => {
    setSortBy(sort);
    setIsSortDropdownOpen(false);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6741FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 标签切换栏 */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabsData.map((tab) => {
              const isActive = selectedTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleTabChange(tab)}
                  style={styles.tabButton}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 筛选器部分 */}
        <View style={styles.filterContainer}>
          {/* 币种选择器 */}
          <View style={styles.filterItem}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setIsCoinDropdownOpen(true)}
            >
              <Text style={styles.filterButtonText}>{selectedCoin}</Text>
              <Image
                source={require('@/assets/images/chevron-down.png')}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>

          {/* 排序选择器 */}
          <View style={styles.filterItem}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setIsSortDropdownOpen(true)}
            >
              <Text style={styles.filterButtonText} numberOfLines={1}>
                {t('zone.sortBy')}: {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </Text>
              <Image
                source={require('@/assets/images/chevron-down.png')}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 滚动公告栏 */}
        <View style={styles.announcementSection}>
          <WinnerAnnouncement winners={buys.map((buy) => ({
            nickName: buy.nickName,
            productValue: buy.productName,
            time: Date.now(),
          }))} />
        </View>

        {/* 商品网格 */}
        <View style={styles.productsSection}>
          {products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map((product) => (
                <View key={product.productId} style={styles.productCardWrapper}>
                  <ProductCard
                    product={product}
                    showCountdownLabels={false}
                    onRefresh={loadProducts}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('zone.noProducts')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 币种选择器Modal */}
      <Modal
        visible={isCoinDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCoinDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCoinDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              {coinOptions.map((coin) => (
                <TouchableOpacity
                  key={coin.coinId}
                  style={[
                    styles.modalItem,
                    selectedCoin === coin.coinName && styles.modalItemActive,
                  ]}
                  onPress={() => handleCoinSelect(coin)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedCoin === coin.coinName && styles.modalItemTextActive,
                    ]}
                  >
                    {coin.coinName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 排序选择器Modal */}
      <Modal
        visible={isSortDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalItem,
                  sortBy === option.value && styles.modalItemActive,
                ]}
                onPress={() => handleSortSelect(option.value)}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    sortBy === option.value && styles.modalItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
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
  // 标签切换栏样式
  tabsContainer: {
    marginBottom: 12,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  tabButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#6741FF',
  },
  tabTextInactive: {
    color: '#6E6E70',
  },
  // 筛选器样式
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  chevronIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginLeft: 8,
  },
  // 公告栏样式
  announcementSection: {
    marginBottom: 12,
  },
  // 商品区域样式
  productsSection: {
    marginTop: 24,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  // Modal样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1D1D1D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalItemActive: {
    backgroundColor: 'rgba(103, 65, 255, 0.1)',
  },
  modalItemText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalItemTextActive: {
    color: '#6741FF',
    fontWeight: '600',
  },
});

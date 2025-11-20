import Carousel from '@/components/Carousel';
import ProductCard from '@/components/ProductCard';
import WinnerAnnouncement from '@/components/WinnerAnnouncement';
import { getCarousel, getHome, getHomeBuys } from '@/services/home';
import { useBoundStore } from '@/store';
import type { Carousel as CarouselType, Home, HomeBuys } from '@/types';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useBoundStore(state => state.user);
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const [homeData, setHomeData] = useState<Home | undefined>(undefined);
  const [homeBuysData, setHomeBuysData] = useState<HomeBuys | undefined>(undefined);
  const [carouselData, setCarouselData] = useState<CarouselType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const helpTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 确保在客户端挂载后再获取数据
  useEffect(() => {
    setMounted(true);
  }, []);

  // 加载首页数据
  const loadHomeData = async () => {
    try {
      const userId = user?.userId ? Number(user.userId) : undefined;
      console.log('首页 loadHomeData - user:', user);
      console.log('首页 loadHomeData - userId:', userId, '类型:', typeof userId);

      const [homeRes, homeBuysRes, carouselRes] = await Promise.all([
        getHome(userId ? { userId } : undefined),
        getHomeBuys(),
        getCarousel(),
      ]);
      
      setHomeData(homeRes?.data?.data);
      setHomeBuysData(homeBuysRes?.data?.data);
      setCarouselData(carouselRes?.data?.data || []);
    } catch (error) {
      console.error('加载首页数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 当mounted或user变化时加载数据
  useEffect(() => {
    if (mounted) {
      loadHomeData();
    }
  }, [mounted, user]);

  // 每次页面聚焦时重新加载数据
  useFocusEffect(
    useCallback(() => {
      if (mounted) {
        loadHomeData();
      }
    }, [mounted, user])
  );

  useEffect(() => {
    return () => {
      if (helpTooltipTimerRef.current) {
        clearTimeout(helpTooltipTimerRef.current);
      }
    };
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  // 获取轮播图
  const carouselImages = carouselData.find(item => item.type === 1)?.images || [];

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6741FF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      {/* 固定顶部导航 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.appName}>1U.VIP</Text>
        </View>
        <View style={styles.headerRight}>
          {/* <LanguageSwitcher /> */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications' as any)}
          >
            <Image 
              source={require('@/assets/images/icon-notification.png')} 
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

      {/* Hero 横幅 */}
      <View style={styles.carouselSection}>
        <Carousel type={1} images={carouselImages} height={160} />
      </View>

      {/* 100%公平公正声明 */}
      <View style={styles.fairSection}>
        <Image 
          source={require('@/assets/images/icon-open.png')} 
          style={styles.fairIcon}
        />
        <Text style={styles.fairText}>100%{t('home.fairAndJust')}</Text>
        <View style={styles.helpWrapper}>
          {showHelpTooltip && (
            <View style={styles.helpTooltip}>
              <Text style={styles.helpTooltipText}>{t('home.fairAndJustTooltip')}</Text>
             
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              setShowHelpTooltip(prev => {
                const next = !prev;
                if (helpTooltipTimerRef.current) {
                  clearTimeout(helpTooltipTimerRef.current);
                  helpTooltipTimerRef.current = null;
                }
                if (next) {
                  helpTooltipTimerRef.current = setTimeout(() => {
                    setShowHelpTooltip(false);
                    helpTooltipTimerRef.current = null;
                  }, 3000);
                }
                return next;
              });
            }}
          >
            <Image 
              source={require('@/assets/images/icon-help.png')} 
              style={styles.helpIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 滚动公告 - 中奖通知 */}
      <View style={styles.announcementSection}>
        <WinnerAnnouncement winners={homeBuysData?.owners || []} />
      </View>

      {/* 热门商品 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Image 
              source={require('@/assets/images/icon-hot.png')} 
              style={styles.sectionIconImage}
            />
            <Text style={styles.sectionTitle}>{t('home.hotProducts')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/ubuy')}
          >
            <Image 
              source={require('@/assets/images/icon-chevron-right.png')} 
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {homeData?.hot.slice(0, 4).map((item) => (
            <View key={item.productId} style={styles.productCardWrapper}>
              <ProductCard
                product={item}
                showCountdownLabels={false}
                onRefresh={loadHomeData}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 即将揭晓 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Image 
              source={require('@/assets/images/icon-timer.png')} 
              style={styles.sectionIconImage}
            />
            <Text style={styles.sectionTitle}>{t('home.comingSoon')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/(tabs)/ubuy',
              params: { initialTab: 'coming' },
            } as any)}
          >
            <Image 
              source={require('@/assets/images/icon-chevron-right.png')} 
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {homeData?.will.slice(0, 4).map((item) => (
            <View key={item.productId} style={styles.productCardWrapper}>
              <ProductCard
                product={item}
                showCountdownLabels={false}
                onRefresh={loadHomeData}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 最新上架 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Image 
              source={require('@/assets/images/icon-star.png')} 
              style={styles.sectionIconImage}
            />
            <Text style={styles.sectionTitle}>{t('home.newArrivals')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/ubuy')}
          >
            <Image 
              source={require('@/assets/images/icon-chevron-right.png')} 
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {homeData?.new.slice(0, 4).map((item) => (
            <View key={item.productId} style={styles.productCardWrapper}>
              <ProductCard
                product={item}
                showCountdownLabels={false}
                onRefresh={loadHomeData}
              />
            </View>
          ))}
        </View>
      </View>
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
  // 固定顶部导航样式
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0E0E10',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    tintColor: '#FFFFFF',
  },
  // 滚动视图样式
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // 轮播图样式
  carouselSection: {
    marginBottom: 12,
  },
  // 公平公正声明样式
  fairSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fairIcon: {
    width: 20,
    height: 20,
    tintColor: 'rgba(255, 255, 255, 0.8)',
  },
  fairText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  helpIcon: {
    width: 20,
    height: 20,
    tintColor: '#6E6E70',
  },
  helpWrapper: {
    position: 'relative',
  },
  helpTooltip: {
    position: 'absolute',
    bottom: 28,
    right: -70,
    minWidth: 160,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    zIndex: 1,
  },
  helpTooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  // 公告样式
  announcementSection: {
    marginBottom: 12,
  },
  // 商品区块样式
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionIconImage: {
    width: 20,
    height: 20,
    tintColor: '#6741FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6741FF',
  },
  chevronIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
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
});

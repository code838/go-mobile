import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useImmer } from 'use-immer';

import { Colors } from '@/constants/colors';
import { OrderItem, OrderSection, OrderStatus, OrderType } from '@/model/Order';
import { financeApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { getAmountDisplay, getOrderTitle, groupDataByMonth, ORDER_TYPE_IMAGES } from '@/utils/recordUtils';

// 订单状态映射
const ORDER_STATUS_MAP = {
  [OrderStatus.PENDING]: 'record.status.pending',
  [OrderStatus.PAID]: 'record.status.paid',
  [OrderStatus.CANCELLED]: 'record.status.cancelled',
};

const PAGE_SIZE = 10;

interface RecordListState {
  data: OrderSection[];
  pageNo: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
}

interface RecordListComponentProps {
  /** 订单类型 */
  type?: OrderType | null;
}

export default function RecordListComponent({ type }: RecordListComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useBoundStore(state => state.user);

  const [state, setState] = useImmer<RecordListState>({
    data: [],
    pageNo: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    loadingMore: false,
  });
  
  const stateRef = useRef(state);
  stateRef.current = state;
  
  // 防抖控制
  const lastLoadMoreTime = useRef(0);
  const LOAD_MORE_DEBOUNCE = 1000; // 1秒防抖

  // 加载订单数据
  const loadOrderData = useCallback(
    async (pageNo: number = 1, isRefresh: boolean = false) => {
      
      if (!user?.userId) return;

      setState((draft) => {
        if (isRefresh) {
          draft.refreshing = true;
        } else if (pageNo === 1) {
          draft.loading = true;
        } else {
          draft.loadingMore = true;
        }
      });

      try {
        let newData: OrderItem[] = [];

        const { data } = await financeApi.getOrderList({
          userId: user.userId,
          pageNo,
          pageSize: PAGE_SIZE,
          type,
        });

        if (data.code === 0 && data.data) {
          newData = data.data;
        }

        setState((draft) => {
          if (pageNo === 1 || isRefresh) {
            // 首次加载或刷新，替换数据
            draft.data = groupDataByMonth(newData);
            draft.pageNo = 1;
          } else {
            // 加载更多，合并数据
            const existingOrders = draft.data.flatMap(section => section.data);
            const allOrders = [...(existingOrders || []), ...(newData || [])];
            draft.data = groupDataByMonth(allOrders);
          }

          draft.hasMore = newData.length === PAGE_SIZE;
          draft.pageNo = pageNo;
          draft.loading = false;
          draft.refreshing = false;
          draft.loadingMore = false;
        });
      } catch (error) {
        console.error('Load order data error:', error);
        setState((draft) => {
          draft.loading = false;
          draft.refreshing = false;
          draft.loadingMore = false;
        });
      }
    },
    []
  );

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    loadOrderData(1, true);
  }, [loadOrderData]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    const now = Date.now();
    const currentState = stateRef.current;
    
    // 防抖检查
    if (now - lastLoadMoreTime.current < LOAD_MORE_DEBOUNCE) {
      return;
    }
    
    if (currentState.hasMore && !currentState.loadingMore && !currentState.loading && !currentState.refreshing) {
      lastLoadMoreTime.current = now;
      loadOrderData(currentState.pageNo + 1);
    }
  }, [loadOrderData]);

  // 渲染订单项
  function renderRecordItem({ item }: { item: OrderItem }) {
    const { amount, isPositive } = getAmountDisplay(item);
    const title = getOrderTitle(item, t);
    const time = format(new Date(item.createTime), 'MM/dd HH:mm:ss');
    const status = t(ORDER_STATUS_MAP[item.status]);

    return (
      <Pressable
        style={styles.recordItem}
        onPress={() => item.type !== OrderType.FREE_RECIVE && item.type !== OrderType.COMMISSION && router.push(`/account/record/${item.orderId}?type=${item.type}`)}
      >
        <Image
          source={ORDER_TYPE_IMAGES[item.type]}
          style={styles.iconContainer}
          contentFit="contain"
        />
        <View style={styles.recordContent}>
          <View style={styles.recordLeft}>
            <Text style={styles.recordTitle}>{title}</Text>
            <Text style={styles.recordTime}>{time}</Text>
          </View>
          <View style={styles.recordRight}>
            {item.type === OrderType.EXCHANGE && (
              <Text style={styles.recordAmount}>
                -{item.num} {item.coinName}
              </Text>
            )}
            {item.type === OrderType.RECHARGE && (
              <Text style={styles.recordAmount}>
                +{item.amount} {item.coinName}
              </Text>
            )}
            {item.type === OrderType.WITHDRAW && (
              <Text style={styles.recordAmount}>
                -{item.amount} {item.coinName}
              </Text>
            )}
            {item.type === OrderType.UBUY && (
              <Text style={styles.recordAmount}>
                {amount} USDT
              </Text>
            )}
            {item.type === OrderType.LOTTERY && (
              <Text style={styles.recordAmount}>
                {item.productValue}
              </Text>
            )}
            {item.type === OrderType.FREE_RECIVE && (
              <Text style={styles.recordAmount}>
                {item.amount} USDT
              </Text>
            )}
            <Text style={styles.recordStatus}>{status}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // 渲染章节头部
  function renderSectionHeader({ section }: { section: OrderSection }) {
    return (
      <Text style={styles.sectionHeader}>{section.title}</Text>
    );
  }

  // 当用户ID或type变化时重置并重新加载数据
  useEffect(() => {
    setState((draft) => {
      draft.data = [];
      draft.pageNo = 1;
      draft.hasMore = true;
      draft.loading = false;
      draft.refreshing = false;
      draft.loadingMore = false;
    });
    
    if (user?.userId) {
      loadOrderData(1);
    }
  }, [user?.userId, type, loadOrderData]);

  if (state.loading && state.data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  return (
    <SectionList
      sections={state.data}
      renderItem={renderRecordItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.orderId}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={state.refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.brand}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      stickySectionHeadersEnabled={false}
      ListFooterComponent={
        state.loadingMore ? (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={Colors.brand} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        !state.loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('record.empty')}</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.title,
    paddingBottom: 12,
    paddingTop: 16,
  },
  recordItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
  },
  recordContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordLeft: {
    flex: 1,
    gap: 2,
  },
  recordTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.title,
  },
  recordTime: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.secondary,
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  recordAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  recordStatus: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.brand,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.secondary,
  },
});
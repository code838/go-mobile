import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useCallback, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useImmer } from 'use-immer';

import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { InviteRecordItem } from '@/model/User';
import { userApi } from '@/services/api';


interface InviteRecordState {
  data: InviteRecordItem[];
  refreshing: boolean;
}

export default function InviteRecord() {
  const [state, setState] = useImmer<InviteRecordState>({
    data: [],
    refreshing: false,
  });

  const loadInviteData = useCallback(
    async (isRefresh: boolean = false) => {
      setState((draft) => {
        if (isRefresh) {
          draft.refreshing = true;
        }
      });

      try {
        const { data } = await userApi.getInviteRecord();
        console.log('invite data', data);
        let allData: InviteRecordItem[] = [];
        if (data.code === 0 && data.data) {
          allData = data.data;
        }
        setState((draft) => {
          draft.data = data.data;
          draft.refreshing = false;
        });
      } catch (error) {
        console.error('Load invite data error:', error);
        setState((draft) => {
          draft.refreshing = false;
        });
      }
    },
    []
  );

  const handleRefresh = useCallback(() => {
    loadInviteData();
  }, []);

  useEffect(() => {
    handleRefresh();
  }, []);

  function renderInviteItem({ item }: { item: InviteRecordItem }) {
    const time = format(new Date(item.time), 'yyyy/MM/dd HH:mm:ss');

    return (
      <View style={styles.recordItem}>
        <Image
          source={getImageUrl(item.photo || '')}
          style={styles.iconContainer}
          contentFit="contain"
        />
        <View style={styles.recordContent}>
          <View style={styles.recordLeft}>
            <Text style={styles.recordTitle}>{item.nickName}</Text>
            <Text style={styles.recordTime}>{time}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={state.data}
      renderItem={renderInviteItem}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={state.refreshing}
          onRefresh={handleRefresh}
          colors={[Colors.title]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
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
    borderRadius: 16,
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
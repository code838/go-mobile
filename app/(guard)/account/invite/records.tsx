import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import InviteRecord from '@/components/InviteRecord';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import ReturnMoney from '@/components/ReturnMoney';
import { Colors } from '@/constants/colors';

// 模拟数据
const MOCK_INVITE_RECORDS = [
  {
    id: '1',
    avatar: 'https://i.pravatar.cc/150?img=1',
    name: 'Darken',
    time: '2025/12/30 12:31:12',
    points: 1,
  },
  {
    id: '2',
    avatar: 'https://i.pravatar.cc/150?img=2',
    name: 'Darken',
    time: '2025/12/30 12:31:12',
    points: 1,
  },
];

const MOCK_COMMISSION_RECORDS = [
  {
    id: '1',
    avatar: 'https://i.pravatar.cc/150?img=3',
    name: '云购',
    time: '2025/12/30 12:31:12',
    points: 1,
  },
  {
    id: '2',
    avatar: 'https://i.pravatar.cc/150?img=4',
    name: '充值',
    time: '2025/12/30 12:31:12',
    points: 1,
  },
];

type TabType = 'invite' | 'commission';

interface RecordItem {
  id: string;
  avatar: string;
  name: string;
  time: string;
  points: number;
}

export default function RecordsPage() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(params.tab as TabType || 'invite');
  const [tabLayouts, setTabLayouts] = useState<{
    invite: { x: number; width: number } | null;
    commission: { x: number; width: number } | null;
  }>({
    invite: null,
    commission: null,
  });

  const currentRecords = activeTab === 'invite' ? MOCK_INVITE_RECORDS : MOCK_COMMISSION_RECORDS;

  function handleGoBack() {
    router.back();
  }

  function handleTabLayout(tab: TabType, event: LayoutChangeEvent) {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({
      ...prev,
      [tab]: { x, width },
    }));
  }

  // 计算下划线的位置和宽度
  const indicatorStyle = {
    left: activeTab === 'invite' ? tabLayouts.invite?.x ?? 0 : tabLayouts.commission?.x ?? 0,
    width: activeTab === 'invite' ? tabLayouts.invite?.width ?? 64 : tabLayouts.commission?.width ?? 64,
  };

  function renderRecordItem({ item }: { item: RecordItem }) {
    return (
      <View style={styles.recordItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
        <View style={styles.recordContent}>
          <View style={styles.recordLeft}>
            <Text style={styles.recordName}>{item.name}</Text>
            <Text style={styles.recordTime}>{item.time}</Text>
          </View>
          <View style={styles.recordRight}>
            <Text style={styles.recordPoints}>+{item.points} {t('invite.points')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 渐变背景 */}
      <PageDecoration />
      {/* 导航栏 */}
      <NavigationBar title={t('invite.inviteRecord')} />
      {/* 内容区域 */}
      <View style={styles.content}>


        {/* 标签切换 */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('invite')}
              onLayout={(e) => handleTabLayout('invite', e)}>
              <Text style={[styles.tabText, activeTab === 'invite' && styles.tabTextActive]}>
                {t('invite.inviteRecord')}
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('commission')}
              onLayout={(e) => handleTabLayout('commission', e)}>
              <Text
                style={[styles.tabText, activeTab === 'commission' && styles.tabTextActive]}>
                {t('invite.commissionRecord')}
              </Text>
            </Pressable>
          </View>

          {/* 下划线动画 */}
          {tabLayouts.invite && tabLayouts.commission && (
            <MotiView
              style={styles.indicator}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: 'timing',
                duration: 250,
              }}
            />
          )}
        </View>

        {activeTab === 'invite' ? <InviteRecord /> : <ReturnMoney />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    backgroundColor: Colors.card,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: '180deg' }],
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  tabWrapper: {
    flexDirection: 'row',
    gap: 10,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  tabTextActive: {
    fontWeight: '700',
    color: Colors.subtitle,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 1,
    backgroundColor: Colors.title,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  recordItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
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
  recordName: {
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
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  recordPoints: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
});


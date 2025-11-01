import { MotiView } from 'moti';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';

import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import RecordListComponent from '@/components/RecordListComponent';
import { Colors } from '@/constants/colors';
import { OrderType } from '@/model/Order';


const TABS = [
  { key: 'all', label: 'record.all', type: null },
  { key: 'lottery', label: 'record.lottery', type: OrderType.LOTTERY },
  { key: 'ubuy', label: 'record.ubuy', type: OrderType.UBUY },
  { key: 'recharge', label: 'record.recharge', type: OrderType.RECHARGE },
  { key: 'withdraw', label: 'record.withdraw', type: OrderType.WITHDRAW },
  { key: 'exchange', label: 'record.exchange', type: OrderType.EXCHANGE },
];


export default function RecordsPage() {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<({ x: number; width: number } | null)[]>(
    new Array(TABS.length).fill(null)
  );
  const pagerRef = useRef<PagerView>(null);


  function handleTabLayout(index: number, event: LayoutChangeEvent) {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  }

  function handleTabPress(index: number) {
    setActiveTabIndex(index);
    pagerRef.current?.setPage(index);
  }

  function handlePageSelected(e: any) {
    const index = e.nativeEvent.position;
    setActiveTabIndex(index);
  }

  // 计算下划线的位置和宽度
  const indicatorStyle = useMemo(() => ({
    left: tabLayouts[activeTabIndex]?.x ?? 0,
    width: tabLayouts[activeTabIndex]?.width ?? 0,
  }), [tabLayouts, activeTabIndex]);


  return (
    <View style={styles.container}>
      <PageDecoration />
      <NavigationBar title={t('record.title')} />
      <View style={styles.content}>
        {/* Tab 切换 */}
        <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            {TABS.map((tab, index) => (
              <Pressable
                key={tab.key}
                style={styles.tabItem}
                onPress={() => handleTabPress(index)}
                onLayout={(e) => handleTabLayout(index, e)}>
                <Text style={[styles.tabText, activeTabIndex === index && styles.tabTextActive]}>
                  {t(tab.label)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 下划线动画 */}
          {tabLayouts.every((layout) => layout !== null) && (
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

        {/* PagerView */}
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}>
          {TABS.map((tab, index) => (
            <View key={tab.key} style={styles.page}>
              <RecordListComponent type={tab.type} />
            </View>
          ))}
        </PagerView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  tabWrapper: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
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
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
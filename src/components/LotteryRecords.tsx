import { format } from 'date-fns';
import { Image } from 'expo-image';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { useLotteryAssistRecord, useLotteryRecord } from '@/hooks/useApi';

// 记录类型
type RecordType = 'lottery' | 'assist';

// 抽奖记录项的原始数据结构
interface LotteryRecordDataItem {
  amount: string;
  count: number;
  createTime: number;
}

// 助力记录项的原始数据结构
interface AssistRecordDataItem {
  nickName: string;
  image: string;
  createTime: number;
}

// 抽奖记录项
export interface LotteryRecordItem {
  id: number;
  amount: string;
  time: string;
}

// 助力记录项
export interface AssistRecordItem {
  id: string;
  avatar: string;
  name: string;
  time: string;
  count: number;
}

// 组件对外暴露的方法
export interface LotteryRecordsRef {
  refresh: () => void;
}

interface LotteryRecordsProps {
  /**
   * 默认选中的tab
   * @default 'lottery'
   */
  defaultTab?: RecordType;
  /**
   * 获取助力成功的回调函数
   */
  onAssistSuccess?: () => void;
}

/**
 * 抽奖记录组件
 * 包含抽奖记录和助力记录两个tab
 */
const LotteryRecords = forwardRef<LotteryRecordsRef, LotteryRecordsProps>(function LotteryRecords({
  defaultTab = 'lottery',
  onAssistSuccess,
}, ref) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RecordType>(defaultTab);
  const [lotteryRecords, setLotteryRecords] = useState<LotteryRecordItem[]>([]);
  const [assistRecords, setAssistRecords] = useState<AssistRecordItem[]>([]);
  
  // 使用抽奖记录API
  const { execute: getLotteryRecord } = useLotteryRecord();
  // 使用助力记录API
  const { execute: getAssistRecord } = useLotteryAssistRecord();
  
  // 格式化时间 - 使用date-fns
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy/MM/dd HH:mm:ss');
  };
  
  // 加载抽奖记录
  const loadLotteryRecords = async () => {
    try {
      const response = await getLotteryRecord();
      const recordData: LotteryRecordDataItem[] = response.data;
      
      // 检查数据是否为空或null
      if (!recordData || !Array.isArray(recordData)) {
        console.warn('抽奖记录数据为空或格式不正确:', recordData);
        setLotteryRecords([]);
        return;
      }
      
      // 转换数据格式
      const formattedRecords: LotteryRecordItem[] = recordData.map((item) => ({
        id: item.count,
        amount: `${item.amount} U`,
        time: formatTime(item.createTime),
      }));
      
      setLotteryRecords(formattedRecords);
    } catch (error) {
      console.error('加载抽奖记录失败:', error);
      setLotteryRecords([]); // 出错时设置为空数组
    }
  };

  // 加载助力记录
  const loadAssistRecords = async () => {
    try {
      const response = await getAssistRecord();
      const recordData: AssistRecordDataItem[] = response.data || [];
      
      // 检查数据是否为空或null
      if (!recordData || !Array.isArray(recordData)) {
        console.warn('助力记录数据为空或格式不正确:', recordData);
        setAssistRecords([]);
        return;
      }
      
      // 转换数据格式
      const formattedRecords: AssistRecordItem[] = recordData.map((item, index) => ({
        id: `assist_${index}_${item.createTime}`,
        avatar: item.image,
        name: item.nickName,
        time: formatTime(item.createTime),
        count: 1, // 固定增加一次抽奖机会
      }));
      
      setAssistRecords(formattedRecords);
      
      // 如果有助力记录，触发回调增加抽奖机会
      if (formattedRecords.length > 0 && onAssistSuccess) {
        onAssistSuccess();
      }
    } catch (error) {
      console.error('加载助力记录失败:', error);
      setAssistRecords([]); // 出错时设置为空数组
    }
  };
  
  // 刷新所有记录
  const refreshRecords = async () => {
    await Promise.all([loadLotteryRecords(), loadAssistRecords()]);
  };

  // 对外暴露刷新方法
  useImperativeHandle(ref, () => ({
    refresh: refreshRecords,
  }));
  
  // 初始化加载记录
  useEffect(() => {
    refreshRecords();
  }, []);

  return (
    <View style={styles.recordSection}>
      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'lottery' && styles.tabActiveLottery
          ]}
          onPress={() => setActiveTab('lottery')}>
          <Image
            source={require('@/assets/images/lottery-record.png')}
            style={styles.tabIcon}
            contentFit="contain"
          />
          <Text style={[styles.tabText, activeTab === 'lottery' && styles.tabTextActive]}>
            {t('lottery.lotteryRecord')}
          </Text>
          {activeTab === 'lottery' && (
            <View style={styles.tabActiveLeft}>
              <View style={styles.tabActiveLeftInner} />
            </View>
          )}
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'assist' && styles.tabActiveAssist
          ]}
          onPress={() => setActiveTab('assist')}>
          <Image
            source={require('@/assets/images/help-record.png')}
            style={styles.tabIcon}
            contentFit="contain"
          />
          <Text style={[styles.tabText, activeTab === 'assist' && styles.tabTextActive]}>
            {t('lottery.assistRecord')}
          </Text>
          {activeTab === 'assist' && (
            <View style={styles.tabActiveRight}>
              <View style={styles.tabActiveRightInner} />
            </View>
          )}
        </Pressable>
      </View>

      {/* 记录列表 */}
      <View style={[
        styles.recordList,
        activeTab === 'lottery' ? styles.recordListLottery : styles.recordListAssist
      ]}>
        {activeTab === 'lottery' ? (
          // 抽奖记录
          lotteryRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('lottery.noRecords')}</Text>
            </View>
          ) : (
          lotteryRecords.map((item, index) => (
            <View key={item.id} style={styles.lotteryRecordItem}>
              <View style={styles.lotteryRecordRow}>
                <View style={styles.lotteryRecordNumber}>
                  <Text style={styles.lotteryRecordNumberText}>{item.id}</Text>
                </View>
                <View style={styles.lotteryRecordInfo}>
                  <View style={styles.lotteryRecordLeft}>
                    <Text style={styles.lotteryRecordDesc}>{t('lottery.drawReward')}</Text>
                    <Text style={styles.lotteryRecordAmount}>{item.amount.replace('.00000000', '')}</Text>
                  </View>
                  <Text style={styles.lotteryRecordTime}>{item.time}</Text>
                </View>
              </View>
              {index !== lotteryRecords.length - 1 && <View style={styles.recordDivider} />}
            </View>
          ))
          )
        ) : (
          // 助力记录
          assistRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('lottery.noRecords')}</Text>
            </View>
          ) : (
          assistRecords.map((item) => (
            <View key={item.id} style={styles.assistRecordItem}>
              <View style={styles.assistRecordRow}>
                <Image
                  source={{ uri: getImageUrl(item.avatar) }}
                  style={styles.assistAvatar}
                  contentFit="cover"
                />
                <View style={styles.assistRecordInfo}>
                  <View style={styles.assistRecordLeft}>
                    <Text style={styles.assistName}>{item.name}</Text>
                    <Text style={styles.assistTime}>{item.time}</Text>
                  </View>
                  <View style={styles.assistRecordRight}>
                    <Text style={styles.assistText}>{t('lottery.assistSuccess')}</Text>
                    <Text style={styles.assistCount}>{item.count}{t('lottery.times')}</Text>
                  </View>
                </View>
              </View>
              {item.id !== assistRecords[assistRecords.length - 1].id && (
                <View style={styles.recordDivider} />
              )}
            </View>
          ))
          )
        )}
      </View>
    </View>
  );
});

export default LotteryRecords;

const styles = StyleSheet.create({
  recordSection: {
    backgroundColor: '#0E0A1D',
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 48,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    position: 'relative',
  },
  tabActiveLeft: {
    position: 'absolute',
    right: -48,
    bottom: 0,
    width: 48,
    height: 48,
    backgroundColor: '#1F183F',
  },
  tabActiveLeftInner: {
    width: 48,
    height: 48,
    borderBottomLeftRadius: 24,
    backgroundColor: '#0E0A1D',
  },
  tabActiveLottery: {
    backgroundColor: '#1F183F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabActiveAssist: {
    backgroundColor: '#1F183F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabActiveRight: {
    position: 'absolute',
    left: -48,
    width: 48,
    height: 48,
    backgroundColor: '#1F183F',
  },
  tabActiveRightInner: {
    width: 48,
    height: 48,
    borderBottomRightRadius: 24,
    backgroundColor: '#0E0A1D',
  },
  tabIcon: {
    width: 20,
    height: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#453782',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  recordList: {
    backgroundColor: '#1F183F',
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 10,
  },
  recordListLottery: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopRightRadius: 24,
  },
  recordListAssist: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  lotteryRecordItem: {
    gap: 12,
  },
  lotteryRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  lotteryRecordNumber: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#2B2154',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lotteryRecordNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lotteryRecordInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lotteryRecordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lotteryRecordDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.title,
  },
  lotteryRecordAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C555D8',
  },
  lotteryRecordTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6958B1',
  },
  recordDivider: {
    height: 1,
    backgroundColor: 'rgba(105, 88, 177, 0.2)',
  },
  assistRecordItem: {
    gap: 12,
  },
  assistRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  assistAvatar: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: '#2B2154',
  },
  assistRecordInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assistRecordLeft: {
    gap: 4,
  },
  assistName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  assistTime: {
    fontSize: 12,
    color: '#6958B1',
  },
  assistRecordRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assistText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  assistCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C555D8',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6958B1',
  },
});


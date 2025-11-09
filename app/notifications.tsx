import NavigationBar from '@/components/NavigationBar';
import { getMessage } from '@/services/home';
import { useBoundStore } from '@/store';
import type { Message, Notification } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useBoundStore(state => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取消息数据
  useEffect(() => {
    loadMessages();
  }, [user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const userId = user?.userId ? Number(user.userId) : undefined;
      const response = await getMessage(userId ? { userId } : undefined);
      
      if (response?.data?.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 将 Message 数据转换为 Notification 格式
  const notifications: Notification[] = useMemo(() => {
    return messages.map(msg => ({
      id: String(msg.id || Date.now()),
      title: msg.title,
      content: msg.content,
      time: msg.createtime,
      read: false, // 后端没有提供已读状态，默认未读
      type: 'system' as const // 后端没有提供类型，默认系统消息
    }));
  }, [messages]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1小时显示分钟
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes <= 0 ? t('notifications.justNow') : t('notifications.minutesAgo', { minutes });
    }
    
    // 小于24小时显示小时
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return t('notifications.hoursAgo', { hours });
    }
    
    // 超过24小时显示具体日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  // 获取通知类型的显示文本
  const getNotificationTypeText = (type: Notification['type']) => {
    switch (type) {
      case 'system': return t('notifications.typeSystem');
      case 'order': return t('notifications.typeOrder');
      case 'promotion': return t('notifications.typePromotion');
      case 'security': return t('notifications.typeSecurity');
      default: return t('notifications.typeSystem');
    }
  };

  return (
    <View style={styles.safeArea}>
      <NavigationBar 
        title={t('notifications.title')}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.container}>
        {loading ? (
          // 加载状态
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6741FF" />
            <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
          </View>
        ) : notifications.length === 0 ? (
          // 空状态
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconContainer}>
              <Image 
                source={require('@/assets/images/icon-notification.png')} 
                style={styles.emptyIcon}
              />
            </View>
            <Text style={styles.emptyTitle}>{t('notifications.noNotifications')}</Text>
          </View>
        ) : (
          // 通知列表
          <View style={styles.listContainer}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationType}>
                      {getNotificationTypeText(notification.type)}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text style={styles.notificationContent}>
                  {notification.content.replace(/<[^>]*>/g, '')}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTime(notification.time)}
                </Text>
              </View>
            ))}
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    tintColor: 'rgba(255, 255, 255, 0.4)',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#303030',
    padding: 16,
  },
  unreadCard: {
    backgroundColor: 'rgba(103, 65, 255, 0.05)',
    borderColor: 'rgba(103, 65, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    color: '#6741FF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6741FF',
    marginLeft: 8,
    marginTop: 4,
  },
  notificationContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});


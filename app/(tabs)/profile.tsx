import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { useBoundStore } from '@/store';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, RadialGradient as SvgRadialGradient } from 'react-native-svg';

interface QuickActionItem {
  icon: any;
  label: string;
  onPress: () => void;
}

interface MenuItem {
  icon: any;
  label: string;
  onPress: () => void;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);
  const user = useBoundStore(state => state.user);
  const token = useBoundStore(state => state.token);
  const refreshUserInfo = useBoundStore(state => state.refreshUserInfo);
  const getBalanceByCurrency = useBoundStore(state => state.getBalanceByCurrency);

  useFocusEffect(
    useCallback(() => {
      token && refreshUserInfo();
    }, [token, refreshUserInfo])
  )

  const getBalance = (currency: string) => {
    if (!user) return 0;
    return getBalanceByCurrency(currency);
  }

  /**
   * 切换资产展开/收起状态
   * 只有登录状态才允许展开
   */
  function toggleAssetsExpanded() {
    if (!user) return;
    setIsAssetsExpanded(!isAssetsExpanded);
  }

  /**
   * 快捷操作列表
   */
  const quickActions: QuickActionItem[] = [
    {
      icon: require('@/assets/images/recharge.png'),
      label: t('profile.recharge'),
      onPress: () => router.push('/account/assets/recharge'),
    },
    {
      icon: require('@/assets/images/withdraw.png'),
      label: t('profile.withdraw'),
      onPress: () => router.push('/account/assets/withdraw'),
    },
    {
      icon: require('@/assets/images/flash-exchange.png'),
      label: t('profile.flashExchange'),
      onPress: () => router.push('/account/assets/exchange'),
    },
    {
      icon: require('@/assets/images/record.png'),
      label: t('profile.record'),
      onPress: () => router.push('/account/record'),
    },
  ];

  /**
   * 设置菜单列表
   */
  const menuItems: MenuItem[] = [
    {
      icon: require('@/assets/images/account-security.png'),
      label: t('profile.accountSecurity'),
      onPress: () => router.push('/account/account-security'),
    },
    {
      icon: require('@/assets/images/language.png'),
      label: t('profile.language'),
      onPress: () => router.push('/setting/language'),
    },
    {
      icon: require('@/assets/images/service-center.png'),
      label: t('profile.serviceCenter'),
      onPress: () => router.push('/setting/services'),
    },
    {
      icon: require('@/assets/images/about-us.png'),
      label: t('profile.aboutUs'),
      onPress: () => router.push('/setting/about-us'),
    },
  ];

  const renderDecoration = () => {
    return (
      <Svg
        width="300"
        height="300"
        style={[styles.bgDecoration1, { position: 'absolute' }]}>
        <Defs>
          <SvgRadialGradient id="gradient1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#2F226D" stopOpacity="1" />
            <Stop offset="40%" stopColor="#2C1E62" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0E0E10" stopOpacity="1" />
          </SvgRadialGradient>
        </Defs>
        <Circle cx="150" cy="150" r="150" fill="url(#gradient1)" />
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      {renderDecoration()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 36 }]}
        showsVerticalScrollIndicator={false}>
        {/* 用户信息卡片 */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user
                  ? { uri: getImageUrl(user.photo) }
                  : require('@/assets/images/inactive-tab5.png')
              }
              style={styles.avatar}
              contentFit="cover"
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {user ? user.nickName : t('profile.guestName')}
            </Text>
            <Text style={styles.userId}>
              {user ? `#${user.userId}` : t('profile.pleaseLogin')}
            </Text>
          </View>

          {user ? (
            <Pressable onPress={() => router.push('/account/lottery')} style={styles.freeReceiveButtonBorder}>
              <LinearGradient
                colors={['#E445C3', '#9074FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.freeReceiveButton}>
                <Image
                  source={require('@/assets/images/free-receive-coin.png')}
                  style={styles.freeReceiveIcon}
                  contentFit="contain"
                />
                <Text style={styles.freeReceiveText}>{t('profile.freeReceiveCoin')}</Text>
              </LinearGradient>

            </Pressable>
          ) : (
            <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
              <Text style={styles.loginButtonText}>{t('profile.loginButton')}</Text>
            </Pressable>
          )}

          <Pressable style={styles.chevronRight} onPress={() => router.push('/account/user-info')}>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevronRightIcon}
              contentFit="contain"
            />
          </Pressable>
        </View>

        {/* 资产卡片 */}
        <Pressable
          style={styles.assetsCard}
          onPress={toggleAssetsExpanded}
          disabled={!user}>
          <View style={styles.assetsContent}>
            <View style={styles.assetsRow}>
              <Text style={[styles.assetsText, { color: user ? Colors.title : Colors.subtitle }]}>
                {t('profile.balance')}：{getBalance('USDT')} USDT
              </Text>
              <Text style={[styles.assetsText, { color: user ? Colors.title : Colors.subtitle }]}>
                {t('profile.points')}：{user ? user.points : 0} POINTS
              </Text>
            </View>

            {isAssetsExpanded && user && (
              <View style={styles.assetsRow}>
                <Text style={[styles.assetsText, { color: Colors.title }]}>
                  ETH：{getBalance('ETH')}
                </Text>
                <Text style={[styles.assetsText, { color: Colors.title }]}>
                  BTC：{getBalance('BTC')}
                </Text>
              </View>
            )}
          </View>

          {user && (
            <MotiView
              animate={{
                rotate: isAssetsExpanded ? '180deg' : '0deg',
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={styles.expandIconContainer}>
              <Image
                source={require('@/assets/images/chevron-down.png')}
                style={styles.expandIcon}
                contentFit="contain"
              />
            </MotiView>
          )}
        </Pressable>

        {/* 快捷操作 */}
        <View style={styles.quickActionsCard}>
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              style={styles.quickActionItem}
              onPress={action.onPress}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <View style={styles.quickActionIconContainer}>
                <Image source={action.icon} style={styles.quickActionIcon} contentFit="contain" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* 邀请有奖 */}
        <Pressable
          style={styles.inviteCard}
          onPress={() => router.push('/account/invite')}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
          <View style={styles.inviteContent}>
            <Image
              source={require('@/assets/images/invite-friends.png')}
              style={styles.inviteIcon}
              contentFit="contain"
            />
            <Text style={styles.inviteText}>{t('profile.inviteFriends')}</Text>
          </View>
          <Image
            source={require('@/assets/images/chevron-right.png')}
            style={styles.menuChevron}
            contentFit="contain"
          />
        </Pressable>

        {/* 设置菜单 */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <Image source={item.icon} style={styles.menuIcon} contentFit="contain" />
              <Text style={styles.menuText}>{item.label}</Text>
              <Image
                source={require('@/assets/images/chevron-right.png')}
                style={styles.menuChevron}
                contentFit="contain"
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgDecoration1: {
    top: 0,
    left: 150,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 36,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.card,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
  },
  userId: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  freeReceiveButtonBorder: {
    backgroundColor: 'rgba(82, 63, 148, 0.3)',
    padding: 4,
    borderRadius: 8,
  },
  freeReceiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  freeReceiveIcon: {
    width: 16,
    height: 16,
  },
  freeReceiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.title,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(103, 65, 255, 0.8)',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.title,
  },
  chevronRight: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronRightIcon: {
    width: 24,
    height: 24,
  },
  assetsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  assetsContent: {
    gap: 4,
    alignSelf: 'stretch',
    flexDirection: 'column',
  },
  assetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetsText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  expandIconContainer: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  expandIcon: {
    width: 20,
    height: 20,
  },
  quickActionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 4,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  inviteCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  inviteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteIcon: {
    width: 24,
    height: 24,
  },
  inviteText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  menuChevron: {
    width: 24,
    height: 24,
  },
});

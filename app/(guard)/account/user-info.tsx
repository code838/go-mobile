import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import EditNicknameSheet from '@/components/EditNicknameSheet';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';

// 模拟用户数据，实际应该从 store 获取
const MOCK_USER = {
  nickname: 'Sandy.eth',
  email: '12312@qq.com',
  phone: '',
  avatar: 'https://picsum.photos/200',
};

interface UserInfoItem {
  label: string;
  value: string;
  onPress?: () => void;
  showArrow?: boolean;
}

export default function UserInfoPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showEditNickname, setShowEditNickname] = useState(false);

  /**
   * 打开修改昵称弹窗
   */
  function handleEditNickname() {
    setShowEditNickname(true);
  }

  /**
   * 确认修改昵称
   */
  function handleConfirmNickname(nickname: string) {
    console.log('新昵称:', nickname);
    // TODO: 调用更新昵称 API
    // 更新成功后关闭弹窗
    setShowEditNickname(false);
  }

  /**
   * 用户信息项列表
   */
  const userInfoItems: UserInfoItem[] = [
    {
      label: t('userInfo.nickname'),
      value: MOCK_USER.nickname,
      onPress: handleEditNickname,
      showArrow: true,
    },
    {
      label: t('userInfo.email'),
      value: MOCK_USER.email,
      showArrow: false,
    },
    {
      label: t('userInfo.phone'),
      value: MOCK_USER.phone || '-',
      showArrow: false,
    },
  ];

  /**
   * 退出账户
   */
  function handleLogout() {
    console.log('退出账户');
    // 实际应该：
    // 1. 清除用户登录状态
    // 2. 跳转到登录页
    // router.replace('/login');
  }

  /**
   * 地址管理
   */
  function handleAddressManagement() {
    router.push('/(guard)/account/address-book');
  }

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('userInfo.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 头像 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: MOCK_USER.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
        </View>

        {/* 用户信息卡片 */}
        <View style={styles.infoCard}>
          {userInfoItems.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.infoItem,
                index !== userInfoItems.length - 1 && styles.infoItemBorder,
              ]}
              onPress={item.onPress}
              disabled={!item.onPress}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{item.value}</Text>
                {item.showArrow && (
                  <Image
                    source={require('@/assets/images/chevron-right.png')}
                    style={styles.chevron}
                    contentFit="contain"
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* 地址管理 */}
        <Pressable
          style={styles.addressCard}
          onPress={handleAddressManagement}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
          <Text style={styles.addressText}>{t('userInfo.addressManagement')}</Text>
          <Image
            source={require('@/assets/images/chevron-right.png')}
            style={styles.chevron}
            contentFit="contain"
          />
        </Pressable>

        {/* 退出账户按钮 */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          android_ripple={{ color: 'rgba(247, 83, 83, 0.1)' }}>
          <Text style={styles.logoutText}>{t('userInfo.logout')}</Text>
        </Pressable>
      </ScrollView>

      {/* 修改昵称弹窗 */}
      <EditNicknameSheet
        visible={showEditNickname}
        currentNickname={MOCK_USER.nickname}
        onClose={() => setShowEditNickname(false)}
        onConfirm={handleConfirmNickname}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.card,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  chevron: {
    width: 24,
    height: 24,
  },
  addressCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: Colors.alert,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.alert,
  },
});


import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ConfirmModal from '@/components/ConfirmModal';
import EditNicknameSheet from '@/components/EditNicknameSheet';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { useUpdateNickname } from '@/hooks/useApi';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';


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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useBoundStore(state => state.user);
  const logout = useBoundStore(state => state.logout);
  const refreshUserInfo = useBoundStore(state => state.refreshUserInfo);
  const { execute: updateNickname, loading: updateLoading } = useUpdateNickname();

  /**
   * 打开修改昵称弹窗
   */
  function handleEditNickname() {
    setShowEditNickname(true);
  }

  /**
   * 确认修改昵称
   */
  async function handleConfirmNickname(nickname: string) {
    if (!user?.userId) {
      toast.error(t('errors.unknownError'));
      return;
    }

    try {
      const response = await updateNickname({
        userId: user.userId,
        nickName: nickname
      });

      if (response.code === 0) {
        toast.success(t('editNickname.updateSuccess'));
        setShowEditNickname(false);
        // 刷新用户信息
        await refreshUserInfo();
      } else {
        toast.error(response.msg || t('editNickname.updateFailed'));
      }
    } catch (error: any) {
      console.error('更新昵称失败:', error);
      toast.error(error.message);
    }
  }

  /**
   * 用户信息项列表
   */
  const userInfoItems: UserInfoItem[] = [
    {
      label: t('userInfo.nickname'),
      value: user?.nickName || '-',
      onPress: handleEditNickname,
      showArrow: true,
    },
    {
      label: t('userInfo.email'),
      value: user?.email || '-',
      showArrow: false,
    },
    {
      label: t('userInfo.phone'),
      value: user?.mobile || '-',
      showArrow: false,
    },
  ];

  /**
   * 退出账户
   */
  function handleLogout() {
    setShowLogoutModal(true);
  }

  /**
   * 确认退出账户
   */
  async function handleConfirmLogout() {
    setShowLogoutModal(false);
    try {
      router.back();
      await logout();
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error(error.message);
    }
  }

  /**
   * 地址管理
   */
  function handleAddressManagement() {
    router.push('/account/address-book');
  }

  if (!user) return null;

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
              source={{ uri: getImageUrl(user!.photo) }}
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

      {/* 退出账户确认弹窗 */}
      <ConfirmModal
        visible={showLogoutModal}
        title={t('userInfo.logoutConfirmTitle')}
        content={t('userInfo.logoutConfirmMessage')}
        leftButtonText={t('accountSecurity.cancel')}
        rightButtonText={t('accountSecurity.confirm')}
        onLeftPress={() => setShowLogoutModal(false)}
        onRightPress={handleConfirmLogout}
      />

      {/* 修改昵称弹窗 */}
      <EditNicknameSheet
        visible={showEditNickname}
        currentNickname={user?.nickName || ''}
        onClose={() => setShowEditNickname(false)}
        onConfirm={handleConfirmNickname}
        loading={updateLoading}
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


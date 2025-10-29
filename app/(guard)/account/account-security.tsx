import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BindEmailSheet from '@/components/BindEmailSheet';
import BindPhoneSheet from '@/components/BindPhoneSheet';
import ConfirmModal from '@/components/ConfirmModal';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';

// 模拟用户数据，实际应该从 store 获取
const MOCK_USER = {
  email: '12312@qq.com',
  phone: '',
};

interface SecurityItem {
  label: string;
  value: string;
  onPress?: () => void;
  showArrow?: boolean;
}

export default function AccountSecurityPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBindEmail, setShowBindEmail] = useState(false);
  const [showBindPhone, setShowBindPhone] = useState(false);

  /**
   * 打开绑定邮箱弹窗
   */
  function handleBindEmail() {
    setShowBindEmail(true);
  }

  /**
   * 确认绑定邮箱
   */
  function handleConfirmEmail(email: string, code: string) {
    console.log('绑定邮箱:', email, '验证码:', code);
    // TODO: 调用绑定邮箱 API
    // 绑定成功后关闭弹窗
    setShowBindEmail(false);
  }

  /**
   * 打开绑定手机号弹窗
   */
  function handleBindPhone() {
    setShowBindPhone(true);
  }

  /**
   * 确认绑定手机号
   */
  function handleConfirmPhone(phone: string, code: string) {
    console.log('绑定手机号:', phone, '验证码:', code);
    // TODO: 调用绑定手机号 API
    // 绑定成功后关闭弹窗
    setShowBindPhone(false);
  }

  /**
   * 安全设置项列表
   */
  const securityItems: SecurityItem[] = [
    {
      label: t('accountSecurity.email'),
      value: MOCK_USER.email,
      onPress: handleBindEmail,
      showArrow: true,
    },
    {
      label: t('accountSecurity.phone'),
      value: MOCK_USER.phone || '',
      onPress: handleBindPhone,
      showArrow: true,
    },
    {
      label: t('accountSecurity.changePassword'),
      value: '',
      onPress: () => router.push('/account/change-password'),
      showArrow: true,
    },
  ];

  /**
   * 删除账户
   */
  function handleDeleteAccount() {
    setShowDeleteModal(true);
  }

  /**
   * 确认删除账户
   */
  function handleConfirmDelete() {
    console.log('确认删除账户');
    setShowDeleteModal(false);
    // 实际应该：
    // 1. 调用删除账户 API
    // 2. 清除用户数据
    // 3. 跳转到登录页
    // router.replace('/login');
  }

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('accountSecurity.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 安全设置卡片 */}
        <View style={styles.securityCard}>
          {securityItems.map((item, index) => (
            <Pressable
              key={index}
              style={[
                styles.securityItem,
                index !== securityItems.length - 1 && styles.securityItemBorder,
              ]}
              onPress={item.onPress}
              disabled={!item.onPress}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <Text style={styles.securityLabel}>{item.label}</Text>
              <View style={styles.securityRight}>
                {item.value && <Text style={styles.securityValue}>{item.value}</Text>}
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

        {/* 删除账户按钮 */}
        <Pressable
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          android_ripple={{ color: 'rgba(247, 83, 83, 0.1)' }}>
          <Text style={styles.deleteText}>{t('accountSecurity.deleteAccount')}</Text>
        </Pressable>
      </ScrollView>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        visible={showDeleteModal}
        title={t('accountSecurity.deleteConfirmTitle')}
        content={t('accountSecurity.deleteConfirmContent')}
        leftButtonText={t('accountSecurity.cancel')}
        rightButtonText={t('accountSecurity.confirm')}
        onLeftPress={() => setShowDeleteModal(false)}
        onRightPress={handleConfirmDelete}
      />

      {/* 绑定邮箱弹窗 */}
      <BindEmailSheet
        visible={showBindEmail}
        onClose={() => setShowBindEmail(false)}
        onConfirm={handleConfirmEmail}
      />

      {/* 绑定手机号弹窗 */}
      <BindPhoneSheet
        visible={showBindPhone}
        onClose={() => setShowBindPhone(false)}
        onConfirm={handleConfirmPhone}
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
  securityCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  securityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  securityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  securityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  chevron: {
    width: 24,
    height: 24,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: Colors.alert,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.alert,
  },
});


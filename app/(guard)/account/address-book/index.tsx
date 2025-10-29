import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import ConfirmModal from '@/components/ConfirmModal';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';

interface AddressItem {
  id: string;
  coin: string;
  network: string;
  remark: string;
  address: string;
}

export default function AddressBookPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // 模拟地址数据
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: '1',
      coin: 'USDT',
      network: 'Solana',
      remark: '我的地址 1',
      address: 'meth6XLfTKT28Vq3JPqzva1ePBazo7...',
    },
  ]);

  /**
   * 跳转到添加地址页面
   */
  function handleAddAddress() {
    router.push('/(guard)/account/address-book/add');
  }

  /**
   * 编辑地址
   */
  function handleEdit(addressId: string) {
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      router.push({
        pathname: '/(guard)/account/address-book/add',
        params: {
          id: address.id,
          coin: address.coin,
          network: address.network,
          address: address.address,
          remark: address.remark,
        },
      });
    }
  }

  /**
   * 删除地址 - 显示确认弹窗
   */
  function handleDeletePress(addressId: string) {
    setSelectedAddressId(addressId);
    setShowDeleteConfirm(true);
  }

  /**
   * 确认删除地址
   */
  function handleConfirmDelete() {
    if (selectedAddressId) {
      setAddresses(addresses.filter((addr) => addr.id !== selectedAddressId));
      Toast.show({
        type: 'success',
        text1: '删除成功',
      });
    }
    setShowDeleteConfirm(false);
    setSelectedAddressId(null);
  }

  /**
   * 复制地址
   */
  async function handleCopy(address: string) {
    await Clipboard.setStringAsync(address);
    Toast.show({
      type: 'success',
      text1: t('addressBook.copySuccess'),
    });
  }

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('addressBook.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 地址列表 */}
        <View style={styles.addressList}>
          {addresses.map((address) => (
            <View key={address.id} style={styles.addressGroup}>
              {/* 标题行：币种-网络，编辑、删除按钮 */}
              <View style={styles.addressHeader}>
                <Text style={styles.addressTitle}>
                  {address.network} - {address.coin}
                </Text>
                <View style={styles.actionButtons}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleEdit(address.id)}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
                    <Text style={styles.editButtonText}>{t('addressBook.edit')}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeletePress(address.id)}
                    android_ripple={{ color: 'rgba(247, 83, 83, 0.1)' }}>
                    <Text style={styles.deleteButtonText}>{t('addressBook.delete')}</Text>
                  </Pressable>
                </View>
              </View>

              {/* 地址卡片 */}
              <View style={styles.addressCard}>
                <Text style={styles.remarkText}>{address.remark}</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                    {address.address}
                  </Text>
                  <Pressable
                    onPress={() => handleCopy(address.address)}
                    hitSlop={8}
                    android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', radius: 16 }}>
                    <View style={styles.copyIcon}>
                      <View style={styles.copyIconRect1} />
                      <View style={styles.copyIconRect2} />
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          {/* 添加地址按钮 */}
          <Pressable
            style={styles.addButton}
            onPress={handleAddAddress}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            <Text style={styles.addButtonText}>{t('addressBook.addAddress')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title={t('addressBook.deleteConfirmTitle')}
        content={t('addressBook.deleteConfirmContent')}
        leftButtonText={t('addressBook.cancel')}
        rightButtonText={t('addressBook.confirm')}
        onLeftPress={() => setShowDeleteConfirm(false)}
        onRightPress={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  addressList: {
    gap: 16,
  },
  addressGroup: {
    gap: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.title,
  },
  deleteButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.alert,
  },
  addressCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  remarkText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  copyIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  copyIconRect1: {
    position: 'absolute',
    top: 0,
    left: 4,
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: Colors.subtitle,
    borderRadius: 2,
  },
  copyIconRect2: {
    position: 'absolute',
    top: 6,
    left: 0,
    width: 12,
    height: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.subtitle,
    borderRadius: 2,
  },
  addButton: {
    backgroundColor: Colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
  },
});


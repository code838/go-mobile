import ConfirmModal from '@/components/ConfirmModal';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { AddressBookItem } from '@/model/AddressBook';
import { addressBookApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AddressBookPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const coins = useBoundStore(state => state.coins);
  const user = useBoundStore(state => state.user);

  // 地址列表数据
  const [addresses, setAddresses] = useState<AddressBookItem[]>([]);

  /**
   * 获取地址本列表
   */
  const fetchAddressList = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await addressBookApi.getAddressBookList({ userId: user.userId });
      if (response.data.code === 0 && response.data.data) {
        setAddresses(response.data.data);
      }
    } catch (error: any) {
      console.error('获取地址本列表失败:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 根据networkId获取network名称
   */
  function getNetworkNameById(networkId: number): string {
    for (const coin of coins) {
      const network = coin.networks.find(n => n.networkId === networkId);
      if (network) {
        return network.network;
      }
    }
    return 'Unknown';
  }

  // 页面聚焦时获取地址列表
  useFocusEffect(
    useCallback(() => {
      fetchAddressList();
    }, [])
  );

  /**
   * 跳转到添加地址页面
   */
  function handleAddAddress() {
    router.push('/account/address-book/add');
  }

  /**
   * 编辑地址
   */
  function handleEdit(addressItem: AddressBookItem) {
    router.push({
      pathname: '/account/address-book/add',
      params: {
        id: addressItem.id.toString(),
        coinId: addressItem.coinId.toString(),
        coinName: addressItem.coinName,
        networkId: addressItem.networkId.toString(),
        network: addressItem.network,
        address: addressItem.address,
        remark: addressItem.remark,
      },
    });
  }

  /**
   * 删除地址 - 显示确认弹窗
   */
  function handleDeletePress(addressId: number) {
    setSelectedAddressId(addressId);
    setShowDeleteConfirm(true);
  }

  /**
   * 确认删除地址
   */
  async function handleConfirmDelete() {
    if (selectedAddressId && user) {
      try {
        const addressItem = addresses.find(addr => addr.id === selectedAddressId);
        if (addressItem) {
          await addressBookApi.manageAddressBook({
            userId: user.userId,
            id: addressItem.id,
            operate: 2, // 2:删除
          });

          toast.success(t('addressBook.deleteSuccess'));

          // 重新获取列表
          fetchAddressList();
        }
      } catch (error: any) {
        console.error('删除地址失败:', error);
        toast.error(error.message);
      }
    }
    setShowDeleteConfirm(false);
    setSelectedAddressId(null);
  }

  /**
   * 复制地址
   */
  async function handleCopy(address: string) {
    await Clipboard.setStringAsync(address);
    toast.success(t('addressBook.copySuccess'));
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
          {addresses.map((address) => {
            const networkName = getNetworkNameById(address.networkId);
            return (
              <View key={address.id} style={styles.addressGroup}>
                {/* 标题行：币种-网络，编辑、删除按钮 */}
                <View style={styles.addressHeader}>
                  <Text style={styles.addressTitle}>
                    {networkName} - {address.coinName}
                  </Text>
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => handleEdit(address)}
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
                  {!!address.remark && <Text style={styles.remarkText}>{address.remark}</Text>}
                  <View style={styles.addressRow}>
                    <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                      {address.address}
                    </Text>
                    <Pressable
                      onPress={() => handleCopy(address.address)}
                      hitSlop={8}
                      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', radius: 16 }}>
                      <Image source={require('@/assets/images/copy.png')} style={styles.copyIcon} contentFit="contain" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

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
    height: 26,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.title,
  },
  deleteButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  addButton: {
    backgroundColor: Colors.card,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
  },
});


import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomSheet from './BottomSheet';

import { Colors } from '@/constants/colors';
import { AddressBookItem } from '@/model/AddressBook';
import { addressBookApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';

interface AddressBookSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
  coinId?: number;
  networkId?: number;
}

/**
 * 地址本选择弹窗
 * 用于在提现页面选择已保存的地址
 */
export default function AddressBookSelectSheet({
  visible,
  onClose,
  onSelect,
  coinId,
  networkId,
}: AddressBookSelectSheetProps) {
  const { t } = useTranslation();
  const user = useBoundStore(state => state.user);
  const coins = useBoundStore(state => state.coins);

  const [addresses, setAddresses] = useState<AddressBookItem[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 获取地址本列表
   */
  const fetchAddressList = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await addressBookApi.getAddressBookList({ userId: user.userId });
      if (response.data.code === 0 && response.data.data) {
        let list = response.data.data;
        
        // 如果指定了币种,只显示该币种的地址
        if (coinId !== undefined) {
          list = list.filter(addr => addr.coinId === coinId);
        }
        
        // 如果指定了网络,只显示该网络的地址
        if (networkId !== undefined) {
          list = list.filter(addr => addr.networkId === networkId);
        }
        
        setAddresses(list);
      }
    } catch (error: any) {
      console.error('获取地址本列表失败:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, coinId, networkId]);

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

  /**
   * 选择地址
   */
  function handleSelect(address: string) {
    onSelect(address);
    onClose();
  }

  // 当弹窗显示时获取地址列表
  useEffect(() => {
    if (visible) {
      fetchAddressList();
    }
  }, [visible, fetchAddressList]);

  return (
    <BottomSheet visible={visible} title={t('withdraw.selectFromAddressBook')} onClose={onClose}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('withdraw.noAddressInBook')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {addresses.map((address) => {
            const networkName = getNetworkNameById(address.networkId);
            return (
              <Pressable
                key={address.id}
                style={styles.addressItem}
                onPress={() => handleSelect(address.address)}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
                <View style={styles.addressInfo}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.networkName}>
                      {networkName} - {address.coinName}
                    </Text>
                    {!!address.remark && (
                      <Text style={styles.remarkText}>{address.remark}</Text>
                    )}
                  </View>
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                    {address.address}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 400,
  },
  content: {
    gap: 12,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.secondary,
  },
  addressItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addressInfo: {
    gap: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  remarkText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.secondary,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
});


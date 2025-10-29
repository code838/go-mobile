import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomSheet from './BottomSheet';

import { Colors } from '@/constants/colors';

interface Network {
  id: string;
  symbol: string;
  name: string;
  fullName: string;
  color: string; // 用于首字母背景色
}

interface NetworkSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (network: Network) => void;
  selectedNetworkId?: string;
  coinSymbol?: string; // 当前选择的币种
}

/**
 * 选择网络弹窗
 * 显示网络列表，每个网络用首字母+背景色表示logo
 *
 * @example
 * ```tsx
 * <NetworkSelectSheet
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   onSelect={(network) => console.log(network)}
 *   selectedNetworkId={selectedNetwork?.id}
 *   coinSymbol="USDT"
 * />
 * ```
 */
export default function NetworkSelectSheet({
  visible,
  onClose,
  onSelect,
  selectedNetworkId,
}: NetworkSelectSheetProps) {
  // 模拟网络数据
  const networks: Network[] = [
    {
      id: '1',
      symbol: 'ETH',
      name: 'Ethereum',
      fullName: 'Ethereum (ERC-20)',
      color: '#627eea',
    },
    {
      id: '2',
      symbol: 'TRX',
      name: 'Tron',
      fullName: 'Tron (TRC-20)',
      color: '#eb0029',
    },
    {
      id: '3',
      symbol: 'BSC',
      name: 'BNB Chain',
      fullName: 'BNB Chain (BEP-20)',
      color: '#f3ba2f',
    },
    {
      id: '4',
      symbol: 'SOL',
      name: 'Solana',
      fullName: 'Solana',
      color: '#14f195',
    },
  ];

  /**
   * 选择网络
   */
  function handleSelect(network: Network) {
    onSelect(network);
    onClose();
  }

  return (
    <BottomSheet visible={visible} title="选择网络" onClose={onClose}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {networks.map((network) => (
          <Pressable
            key={network.id}
            style={styles.networkItem}
            onPress={() => handleSelect(network)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            {/* 网络logo（首字母） */}
            <View style={[styles.networkLogo, { backgroundColor: network.color }]}>
              <Text style={styles.networkLogoText}>{network.symbol[0]}</Text>
            </View>

            {/* 网络信息 */}
            <View style={styles.networkInfo}>
              <Text style={styles.networkName}>
                <Text style={styles.networkSymbol}>{network.symbol}</Text>
                {'  '}
                <Text style={styles.networkFullName}>{network.fullName}</Text>
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 400,
  },
  content: {
    gap: 4,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  networkLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.title,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 14,
    fontWeight: '500',
  },
  networkSymbol: {
    color: Colors.title,
  },
  networkFullName: {
    color: Colors.secondary,
  },
});


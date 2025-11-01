import { Colors } from '@/constants/colors';
import { Network } from '@/model/CoinMessage';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';

interface NetworkSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (network: Network) => void;
  selectedNetworkId?: number;
  coinSymbol?: string; // 当前选择的币种
  networks: Network[];
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
  networks
}: NetworkSelectSheetProps) {

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
        {networks.map((network) => {
          const isSelected = network.networkId === selectedNetworkId;
          return (
            <Pressable
              key={network.networkId}
              style={[styles.networkItem, isSelected && styles.networkItemSelected]}
              onPress={() => handleSelect(network)}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              {/* 网络logo（首字母） */}
              {/* <Image source={{uri: getImageUrl(network)}} style={styles.networkLogo} contentFit="contain"></Image> */}

              {/* 网络信息 */}
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>
                  <Text style={[styles.networkSymbol, isSelected && styles.networkSymbolSelected]}>
                    {network.network}
                  </Text>
                </Text>
              </View>

              {/* 选中标记 */}
              {isSelected && (
                <View style={styles.checkMark}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  networkItemSelected: {
    borderColor: Colors.brand,
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
  networkSymbolSelected: {
    color: Colors.brand,
  },
  networkFullName: {
    color: Colors.secondary,
  },
  checkMark: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.title,
  },
});


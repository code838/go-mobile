import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomSheet from './BottomSheet';

import { Colors } from '@/constants/colors';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  color: string; // 用于首字母背景色
}

interface CoinSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coin: Coin) => void;
  selectedCoinId?: string;
}

/**
 * 选择币种弹窗
 * 显示币种列表，每个币种用首字母+背景色表示logo
 *
 * @example
 * ```tsx
 * <CoinSelectSheet
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   onSelect={(coin) => console.log(coin)}
 *   selectedCoinId={selectedCoin?.id}
 * />
 * ```
 */
export default function CoinSelectSheet({
  visible,
  onClose,
  onSelect,
  selectedCoinId,
}: CoinSelectSheetProps) {
  // 模拟币种数据
  const coins: Coin[] = [
    { id: '1', symbol: 'USDT', name: 'USDT', balance: '112.21', color: '#26a17b' },
    { id: '2', symbol: 'BTC', name: 'Bitcoin', balance: '0.05', color: '#f7931a' },
    { id: '3', symbol: 'ETH', name: 'Ethereum', balance: '1.23', color: '#627eea' },
    { id: '4', symbol: 'BNB', name: 'BNB', balance: '5.67', color: '#f3ba2f' },
  ];

  /**
   * 选择币种
   */
  function handleSelect(coin: Coin) {
    onSelect(coin);
    onClose();
  }

  return (
    <BottomSheet visible={visible} title="选择币种" onClose={onClose}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {coins.map((coin) => (
          <Pressable
            key={coin.id}
            style={styles.coinItem}
            onPress={() => handleSelect(coin)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            {/* 币种logo（首字母） */}
            <View style={[styles.coinLogo, { backgroundColor: coin.color }]}>
              <Text style={styles.coinLogoText}>{coin.symbol[0]}</Text>
            </View>

            {/* 币种信息 */}
            <View style={styles.coinInfo}>
              <Text style={styles.coinName}>{coin.symbol}</Text>
            </View>

            {/* 余额 */}
            <Text style={styles.coinBalance}>{coin.balance}</Text>
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
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  coinLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinLogoText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.title,
  },
  coinInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    width: '100%',
  },
  coinBalance: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
  },
});


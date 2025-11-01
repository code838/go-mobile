import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomSheet from './BottomSheet';

import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { CoinMessage } from '@/model/CoinMessage';
import { Image } from 'expo-image';

interface CoinSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coin: CoinMessage) => void;
  selectedCoinId?: number;
  coins: CoinMessage[];
}

export default function CoinSelectSheet({
  visible,
  onClose,
  onSelect,
  selectedCoinId,
  coins
}: CoinSelectSheetProps) {

  /**
   * 选择币种
   */
  function handleSelect(coin: CoinMessage) {
    onSelect(coin);
    onClose();
  }

  return (
    <BottomSheet visible={visible} title="选择币种" onClose={onClose}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {coins.map((coin) => {
          const isSelected = coin.coinId === selectedCoinId;
          return (
            <Pressable
              key={coin.coinId}
              style={[styles.coinItem, isSelected && styles.coinItemSelected]}
              onPress={() => handleSelect(coin)}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              {/* 币种logo（首字母） */}
              <Image source={{uri: getImageUrl(coin.logo)}} style={styles.coinLogo} contentFit="contain"></Image>

              {/* 币种信息 */}
              <View style={styles.coinInfo}>
                <Text style={[styles.coinName, isSelected && styles.coinNameSelected]}>
                  {coin.coinName}
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
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  coinItemSelected: {
    borderColor: Colors.brand,
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
  coinNameSelected: {
    color: Colors.brand,
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


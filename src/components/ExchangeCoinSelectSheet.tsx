import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomSheet from './BottomSheet';

import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { CoinMessage } from '@/model/CoinMessage';
import { Image } from 'expo-image';

interface ExchangeCoinSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coinId: number) => void;
  selectedCoinId?: number;
  coins: CoinMessage[];
}

export default function ExchangeCoinSelectSheet({
  visible,
  onClose,
  onSelect,
  selectedCoinId,
  coins
}: ExchangeCoinSelectSheetProps) {
  const { t } = useTranslation();

  // 手动添加积分选项并过滤掉USDT的币种
  const pointsOption = {
    coinId: 0,
    coinName: 'POINTS',
    logo: '@assets/images/POINTS.png',
    networks: []
  };
  
  const filteredCoins = [pointsOption, ...coins.filter(coin => coin.coinName !== 'USDT')];

  /**
   * 获取币种显示名称
   */
  function getCoinDisplayName(coin: CoinMessage) {
    if (coin.coinName === 'POINTS') {
      return t('exchange.points');
    }
    return coin.coinName;
  }

  /**
   * 选择币种
   */
  function handleSelect(coin: CoinMessage) {
    onSelect(coin.coinId);
    onClose();
  }

  return (
    <BottomSheet visible={visible} title={t('exchange.selectCoin')} onClose={onClose}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {filteredCoins.map((coin) => {
          const isSelected = coin.coinId === selectedCoinId;
          const displayName = getCoinDisplayName(coin);
          
          return (
            <Pressable
              key={coin.coinId}
              style={[styles.coinItem, isSelected && styles.coinItemSelected]}
              onPress={() => handleSelect(coin)}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              {coin.coinName === 'POINTS' ? (
                <Image 
                  source={require('@/assets/images/POINTS.png')} 
                  style={styles.coinLogo2} 
                  contentFit="contain"
                />
              ) : (
                <Image 
                  source={{uri: getImageUrl(coin.logo)}} 
                  style={styles.coinLogo} 
                  contentFit="contain"
                />
              )}

              {/* 币种信息 */}
              <View style={styles.coinInfo}>
                <Text style={[styles.coinName, isSelected && styles.coinNameSelected]}>
                  {displayName}
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
    gap: 8,
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
  },
  coinLogo2: {
    width: 24,
    height: 24,
  },
  pointIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointIconText: {
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
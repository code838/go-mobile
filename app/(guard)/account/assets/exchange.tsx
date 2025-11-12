import { Image } from 'expo-image';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useImmer } from 'use-immer';

import Button from '@/components/Button';
import ExchangeCoinSelectSheet from '@/components/ExchangeCoinSelectSheet';
import NavigationBar from '@/components/NavigationBar';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { useExchange, useExchangeConfig } from '@/hooks/useApi';
import { CoinMessage } from '@/model/CoinMessage';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';

interface FlashExchangeState {
  selectedCoinId: number;
  fromAmount: string;
  toAmount: string;
  exchangeRate: string;
  exchangeFee: string;
  minNum: string;
  availableBalance: number;
  showCoinSelect: boolean;
}

export default function FlashExchangePage() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const user = useBoundStore((state) => state.user);
  const coins = useBoundStore((state) => state.coins);
  const refreshUserInfo = useBoundStore((state) => state.refreshUserInfo);
  const getBalanceByCurrency = useBoundStore((state) => state.getBalanceByCurrency);

  const { execute: executeExchange, loading: exchangeLoading } = useExchange();
  const { execute: executeGetConfig, loading: configLoading } = useExchangeConfig();

  const [state, setState] = useImmer<FlashExchangeState>({
    selectedCoinId: 0,
    fromAmount: '',
    toAmount: '',
    exchangeRate: '0',
    exchangeFee: '--',
    minNum: '--',
    availableBalance: 0,
    showCoinSelect: false,
  });

  // 加载初始数据
  useEffect(() => {
    loadExchangeConfig(state.selectedCoinId);
    loadBalance(state.selectedCoinId);
  }, [user]);

  /**
   * 根据coinId获取币种信息
   */
  function getCoinById(coinId: number): CoinMessage | null {
    if (coinId === 0) {
      return {
        coinId: 0,
        coinName: 'POINTS',
        logo: '@assets/images/POINTS.png',
        networks: []
      };
    }
    return coins.find(coin => coin.coinId === coinId) || null;
  }

  /**
   * 加载兑换配置
   */
  async function loadExchangeConfig(fromCoinId: number) {
    try {
      const response = await executeGetConfig({ fromCoinId });
      if (response?.code === 0 && response?.data) {
        setState((draft) => {
          draft.exchangeRate = response.data.exchangeRate;
          draft.exchangeFee = response.data.exchangeFee;
          draft.minNum = response.data.minNum;
        });
      }
    } catch (error) {
      setState((draft) => {
        draft.exchangeRate = '0';
        draft.exchangeFee = '--';
        draft.minNum = '--';
      });
      console.error('加载兑换配置失败:', error);
    }
  }

  /**
   * 加载余额
   */
  function loadBalance(coinId: number) {
    let balance = 0;
    if (coinId === 0) {
      // 积分余额
      balance = user?.points || 0;
    } else {
      // 其他币种余额
      const coin = getCoinById(coinId);
      if (coin) {
        balance = getBalanceByCurrency(coin.coinName);
      }
    }
    setState((draft) => {
      draft.availableBalance = balance;
    });
  }

  /**
   * 获取币种显示名称
   */
  function getCoinDisplayName(coinId: number) {
    if (coinId === 0) {
      return t('exchange.points');
    }
    const coin = getCoinById(coinId);
    return coin?.coinName || '';
  }

  /**
   * 处理选择币种
   */
  function handleSelectCoin(coinId: number) {
    setState((draft) => {
      draft.selectedCoinId = coinId;
      draft.fromAmount = '';
      draft.toAmount = '';
      draft.showCoinSelect = false;
    });
    loadExchangeConfig(coinId);
    loadBalance(coinId);
  }

  /**
   * 处理付出金额变化
   */
  function handleFromAmountChange(value: string) {
    // 只允许数字和小数点
    if (value && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setState((draft) => {
      draft.fromAmount = value;
      // 计算收到的金额
      if (value) {
        const amount = parseFloat(value);
        if (!isNaN(amount)) {
          const rate = parseFloat(draft.exchangeRate);
          draft.toAmount = (amount * rate).toFixed(6);
        } else {
          draft.toAmount = '';
        }
      } else {
        draft.toAmount = '';
      }
    });
  }

  /**
   * 点击全部按钮
   */
  function handleAllClick() {
    handleFromAmountChange(state.availableBalance.toString());
  }

  /**
   * 验证输入
   */
  function validateInput(): boolean {
    if (!state.fromAmount || parseFloat(state.fromAmount) <= 0) {
      toast.error(t('exchange.inputAmount'));
      return false;
    }

    const amount = parseFloat(state.fromAmount);
    const minAmount = parseFloat(state.minNum);

    if (amount < minAmount) {
      toast.error(t('exchange.amountTooSmall'));
      return false;
    }

    if (amount > state.availableBalance) {
      toast.error(t('exchange.insufficientBalance'));
      return false;
    }

    return true;
  }

  /**
   * 处理闪兑
   */
  async function handleExchange() {
    if (!validateInput() || !user) {
      return;
    }

    try {
      const response = await executeExchange({
        userId: user.userId,
        coinId: state.selectedCoinId,
        num: state.fromAmount,
      });

      if (response?.code === 0) {
        toast.success(t('exchange.exchangeSuccess'));
        // 刷新用户信息
        await refreshUserInfo();
        // 清空输入框
        setState((draft) => {
          draft.fromAmount = '';
          draft.toAmount = '';
        });
      } else {
        toast.error(response?.msg || t('exchange.exchangeFailed'));
      }
    } catch (error: any) {
      toast.error(error.message || t('exchange.exchangeFailed'));
    }
  }

  const loading = configLoading || exchangeLoading;

  return (
    <View style={styles.container}>
      <PageDecoration />
      <NavigationBar title={t('exchange.title')} />

      <View style={styles.content}>
        {/* 付出部分 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>{t('exchange.payOut')}</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>
                {t('exchange.available')} <Text style={styles.balanceAmount}>{state.availableBalance}</Text>
              </Text>
              <Pressable onPress={handleAllClick}>
                <Text style={styles.allButton}>{t('exchange.all')}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Pressable
              style={styles.coinSelector}
              onPress={() => setState(draft => { draft.showCoinSelect = true; })}
            >
              <View style={styles.coinRow}>
                {state.selectedCoinId === 0 ? (
                  <>
                    <Image source={require('@/assets/images/POINTS.png')} style={styles.coinIcon} contentFit="contain" />
                    <Text style={styles.coinIconText}>{getCoinDisplayName(state.selectedCoinId)}</Text>
                  </>
                ) : (
                  <>
                    <Image source={{ uri: getImageUrl(getCoinById(state.selectedCoinId)?.logo || '') }} style={styles.coinIcon} contentFit="contain" />
                    <Text style={styles.coinIconText}>{getCoinDisplayName(state.selectedCoinId)}</Text>
                  </>
                )}
              </View>
              <Image
                source={require('@/assets/images/chevron-down.png')}
                style={styles.chevronIcon}
                contentFit="contain"
              />
            </Pressable>

            <TextInput
              style={styles.amountInput}
              value={state.fromAmount}
              onChangeText={handleFromAmountChange}
              placeholder="0.00"
              placeholderTextColor={Colors.secondary}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* 转换图标 */}
        <View style={styles.exchangeIconContainer}>
          <Image
            source={require('@/assets/images/exchange-arrow.png')}
            style={styles.exchangeIcon}
            contentFit="contain"
          />
        </View>

        {/* 收到部分 */}
        <View style={[styles.card, styles.receiveCard]}>
          <View style={styles.cardContent}>
            <View style={styles.coinSelector}>
              <Image source={{ uri: getImageUrl(coins.find(coin => coin.coinName === 'USDT')!.logo) }} style={styles.coinIcon} contentFit="contain" />
              <Text style={styles.coinName}>USDT</Text>
            </View>

            <Text style={[styles.receiveAmount, {color: +state.toAmount > 0 ? Colors.title : Colors.secondary}]}>{state.toAmount || '0'}</Text>
          </View>
        </View>

        {/* 费用信息 */}
        <View style={styles.feeContainer}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('exchange.fee')}</Text>
            <Text style={styles.feeValue}>
              {state.fromAmount && parseFloat(state.fromAmount) > 0
                ? (parseFloat(state.fromAmount) * parseFloat(state.exchangeRate) / 100).toFixed(4)
                : '0'} USDT
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('exchange.minExchangeAmount')}</Text>
            <Text style={styles.feeValue}>{state.minNum} {getCoinDisplayName(state.selectedCoinId)}</Text>
          </View>
        </View>
      </View>

      {/* 闪兑按钮 */}
      <View style={[styles.buttonContainer, { paddingBottom: 16 + insets.bottom }]}>
        <Button
          title={t('exchange.exchangeButton')}
          onPress={handleExchange}
          loading={loading}
          disabled={loading || !state.fromAmount || parseFloat(state.fromAmount) <= 0}
          style={styles.exchangeButton}
        />
      </View>

      {/* 选择币种弹窗 */}
      <ExchangeCoinSelectSheet
        visible={state.showCoinSelect}
        onClose={() => setState(draft => { draft.showCoinSelect = false; })}
        onSelect={handleSelectCoin}
        selectedCoinId={state.selectedCoinId}
        coins={coins}
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  receiveCard: {
    gap: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceText: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '500',
  },
  balanceAmount: {
    color: Colors.title,
  },
  allButton: {
    fontSize: 10,
    color: Colors.brand,
    fontWeight: '700',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  coinIconText: {
    fontSize: 12,
    color: Colors.title,
  },
  usdtIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#26A17B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usdtIconText: {
    fontSize: 12,
    color: Colors.title,
    fontWeight: '700',
  },
  coinName: {
    fontSize: 14,
    color: Colors.title,
    fontWeight: '500',
  },
  chevronIcon: {
    width: 12,
    height: 12,
  },
  amountInput: {
    fontSize: 16,
    color: Colors.title,
    textAlign: 'right',
    minWidth: 100,
    padding: 0,
  },
  receiveAmount: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '500',
  },
  exchangeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  exchangeIcon: {
    width: 32,
    height: 32,
  },
  feeContainer: {
    gap: 4,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  exchangeButton: {
    width: '100%',
  },
});
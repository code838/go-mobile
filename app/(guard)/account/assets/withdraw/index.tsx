import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AddressBookSelectSheet from '@/components/AddressBookSelectSheet';
import Button from '@/components/Button';
import CoinSelectSheet from '@/components/CoinSelectSheet';
import NavigationBar from '@/components/NavigationBar';
import NetworkSelectSheet from '@/components/NetworkSelectSheet';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { CoinMessage, Network } from '@/model/CoinMessage';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';
import { useImmer } from 'use-immer';

export default function WithdrawPage() {
  const { t } = useTranslation();

  const coins = useBoundStore(state => state.coins);
  const getBalanceByCurrency = useBoundStore(state => state.getBalanceByCurrency);
  const getWithdrawFees = useBoundStore(state => state.getWithdrawFees);
  const getWithdrawFeeByCoinId = useBoundStore(state => state.getWithdrawFeeByCoinId);
  const getMinWithdrawAmountByCoinId = useBoundStore(state => state.getMinWithdrawAmountByCoinId);

  const [state, setState] = useImmer<{
    selectedCoin: CoinMessage | null;
    selectedNetwork: Network | null;
    withdrawAddress: string;
    withdrawAmount: string;
    showCoinSelect: boolean;
    showNetworkSelect: boolean;
    showAddressBookSelect: boolean;
  }>({
    selectedCoin: null,
    selectedNetwork: null,
    withdrawAddress: '',
    withdrawAmount: '',
    showCoinSelect: false,
    showNetworkSelect: false,
    showAddressBookSelect: false,
  });

  // 每次进入页面时获取提现手续费
  useFocusEffect(
    useCallback(() => {
      getWithdrawFees();
    }, [getWithdrawFees])
  );

  // 获取当前选中币种和网络的手续费
  const currentFee = state.selectedCoin && state.selectedNetwork 
    ? parseFloat(getWithdrawFeeByCoinId(state.selectedCoin.coinId))
    : 0;

  // 获取当前选中币种和网络的最小提现金额
  const minimumWithdraw = state.selectedCoin && state.selectedNetwork 
    ? parseFloat(getMinWithdrawAmountByCoinId(state.selectedCoin.coinId))
    : 0;
  
  // 计算实际到账金额
  const receiveAmount = state.withdrawAmount && parseFloat(state.withdrawAmount) > 0
    ? Math.max(parseFloat(state.withdrawAmount) - currentFee, 0)
    : 0;

  // 检查是否应该显示网络选择
  const shouldShowNetworkSelect = state.selectedCoin && state.selectedCoin.networks.length > 0;

  /**
   * 选择币种
   */
  function handleSelectCoin(coin: CoinMessage) {
    setState(draft => {
      draft.selectedCoin = coin;
      // 重置网络选择，如果币种有网络则选择第一个
      if (coin.networks.length > 0) {
        draft.selectedNetwork = coin.networks[0];
      } else {
        draft.selectedNetwork = null;
      }
      draft.showCoinSelect = false;
    });
  }

  /**
   * 选择网络
   */
  function handleSelectNetwork(network: Network) {
    setState(draft => {
      draft.selectedNetwork = network;
      draft.showNetworkSelect = false;
    });
  }

  /**
   * 点击MAX按钮
   */
  function handleMaxAmount() {
    if (!state.selectedCoin) return;
    const balance = getBalanceByCurrency(state.selectedCoin.coinName);
    setState(draft => {
      draft.withdrawAmount = balance.toString();
    });
  }

  /**
   * 从地址本选择地址
   */
  function handleSelectAddress(address: string) {
    setState(draft => {
      draft.withdrawAddress = address;
    });
  }

  /**
   * 提现
   */
  function handleWithdraw() {
    // 表单验证
    if (!state.selectedCoin) {
      toast.error(t('withdraw.errorNoCoin'));
      return;
    }

    if (!state.selectedNetwork) {
      toast.error(t('withdraw.errorNoNetwork'));
      return;
    }

    if (!state.withdrawAddress || state.withdrawAddress.trim() === '') {
      toast.error(t('withdraw.errorNoAddress'));
      return;
    }

    if (!state.withdrawAmount || state.withdrawAmount.trim() === '') {
      toast.error(t('withdraw.errorNoAmount'));
      return;
    }

    const amount = parseFloat(state.withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('withdraw.errorNoAmount'));
      return;
    }

    if (amount < minimumWithdraw) {
      toast.error(t('withdraw.errorMinAmount'));
      return;
    }

    // 检查余额是否足够
    const balance = getBalanceByCurrency(state.selectedCoin.coinName);
    if (amount > balance) {
      toast.error(t('withdraw.errorInsufficientBalance'));
      return;
    }

    // 跳转到确认页面，传递数据
    router.push({
      pathname: '/account/assets/withdraw/confirm',
      params: {
        coin: JSON.stringify(state.selectedCoin),
        network: JSON.stringify(state.selectedNetwork),
        address: state.withdrawAddress,
        amount: state.withdrawAmount,
        fee: currentFee.toString(),
      },
    });
  }

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('withdraw.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 币种选择 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.coin')}</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setState(draft => { draft.showCoinSelect = true; })}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            <View style={styles.selectorLeft}>
              {state.selectedCoin ? (
                <>
                  <Image source={{ uri: getImageUrl(state.selectedCoin.logo) }} style={styles.coinLogo} contentFit="contain" />
                  <Text style={styles.selectorText}>{state.selectedCoin.coinName}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>{t('withdraw.selectCoin')}</Text>
              )}
            </View>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevron}
              contentFit="contain"
            />
          </Pressable>
        </View>

        {/* 网络选择 - 只在选择币种有网络时显示 */}
        {shouldShowNetworkSelect && (
          <View style={styles.field}>
            <Text style={styles.label}>{t('withdraw.network')}</Text>
            <Pressable
              style={styles.selector}
              onPress={() => setState(draft => { draft.showNetworkSelect = true; })}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <View style={styles.selectorLeft}>
                {state.selectedNetwork ? (
                  <Text style={styles.networkSymbol}>{state.selectedNetwork.network}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>{t('withdraw.selectNetwork')}</Text>
                )}
              </View>
              <Image
                source={require('@/assets/images/chevron-right.png')}
                style={styles.chevron}
                contentFit="contain"
              />
            </Pressable>
          </View>
        )}

        {/* 提现地址 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.withdrawAddress')}</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInputField}
              placeholder={t('withdraw.addressPlaceholder')}
              placeholderTextColor={Colors.secondary}
              value={state.withdrawAddress}
              onChangeText={(text) => setState(draft => { draft.withdrawAddress = text; })}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.addressBookButton}
              onPress={() => setState(draft => { draft.showAddressBookSelect = true; })}
              hitSlop={8}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', radius: 20 }}>
              <Ionicons name="book-outline" size={20} color={Colors.brand} />
            </Pressable>
          </View>
        </View>

        {/* 提现金额 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('withdraw.withdrawAmount')}</Text>
          <View style={styles.amountContainer}>
            <View style={styles.amountInput}>
              <View style={styles.amountInputRow}>
                <TextInput
                  style={styles.amountInputField}
                  placeholder="0"
                  placeholderTextColor={Colors.secondary}
                  value={state.withdrawAmount}
                  onChangeText={(text) => setState(draft => { draft.withdrawAmount = text; })}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.amountUnit}>{state.selectedCoin?.coinName || ''}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceText}>
                  {t('withdraw.balance')}: {state.selectedCoin ? getBalanceByCurrency(state.selectedCoin.coinName).toString() : '0'}
                </Text>
                <Pressable onPress={handleMaxAmount} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.maxButton}>{t('withdraw.max')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* 费用信息 */}
        <View style={styles.feeSection}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('withdraw.minimumWithdrawAmount')}</Text>
            <Text style={styles.feeValue}>
              {minimumWithdraw || 0} {state.selectedCoin?.coinName || ''}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('withdraw.youWillReceive')}</Text>
            <Text style={styles.feeValue}>
              {+receiveAmount} {state.selectedCoin?.coinName || ''}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{t('withdraw.fee')}</Text>
            <Text style={styles.feeValue}>
              {+currentFee} {state.selectedCoin?.coinName || ''}
            </Text>
          </View>
        </View>

        {/* 提现按钮 */}
        <Button title={t('withdraw.withdrawButton')} onPress={handleWithdraw} style={styles.button} />
      </ScrollView>

      {/* 选择币种弹窗 */}
      <CoinSelectSheet
        visible={state.showCoinSelect}
        onClose={() => setState(draft => { draft.showCoinSelect = false; })}
        onSelect={handleSelectCoin}
        selectedCoinId={state.selectedCoin?.coinId}
        coins={coins}
      />

      {/* 选择网络弹窗 */}
      {shouldShowNetworkSelect && (
        <NetworkSelectSheet
          visible={state.showNetworkSelect}
          onClose={() => setState(draft => { draft.showNetworkSelect = false; })}
          onSelect={handleSelectNetwork}
          selectedNetworkId={state.selectedNetwork?.networkId}
          networks={state.selectedCoin?.networks || []}
        />
      )}

      {/* 地址本选择弹窗 */}
      <AddressBookSelectSheet
        visible={state.showAddressBookSelect}
        onClose={() => setState(draft => { draft.showAddressBookSelect = false; })}
        onSelect={handleSelectAddress}
        coinId={state.selectedCoin?.coinId}
        networkId={state.selectedNetwork?.networkId}
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
    gap: 24,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.secondary,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#303030',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
  },
  selectorPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
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
  networkSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.title,
  },
  networkFullName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  chevron: {
    width: 20,
    height: 20,
    transform: [{ rotate: '90deg' }],
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputField: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    padding: 0,
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    gap: 8,
  },
  addressInputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    padding: 0,
  },
  addressBookButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountContainer: {
    gap: 4,
  },
  amountInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
    padding: 0,
  },
  amountUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.title,
    marginLeft: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  balanceText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.secondary,
  },
  maxButton: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.brand,
  },
  feeSection: {
    gap: 0,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  feeValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  button: {
    alignSelf: 'stretch',
  },
});


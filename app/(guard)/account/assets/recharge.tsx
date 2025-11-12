import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import CoinSelectSheet from '@/components/CoinSelectSheet';
import NavigationBar from '@/components/NavigationBar';
import NetworkSelectSheet from '@/components/NetworkSelectSheet';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { CoinMessage, Network } from '@/model/CoinMessage';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';
import { useImmer } from 'use-immer';


export default function RechargePage() {
  const { t } = useTranslation();

  const coins = useBoundStore(state => state.coins);
  const getAllRechargeAddresses = useBoundStore(state => state.getAllRechargeAddresses);
  const getRechargeAddressByCoinAndNetwork = useBoundStore(state => state.getRechargeAddressByCoinAndNetwork);

  const [state, setState] = useImmer<{
    selectedCoin: CoinMessage | null;
    selectedNetwork: Network | null;
    showCoinSelect: boolean;
    showNetworkSelect: boolean;
  }>({
    selectedCoin: coins.find(coin => coin.coinName === 'USDT') || null,
    selectedNetwork: coins.find(coin => coin.coinName === 'USDT')?.networks[0] || null,
    showCoinSelect: false,
    showNetworkSelect: false,
  });

  // 获取当前选中币种和网络对应的充值地址
  const currentRechargeAddress = state.selectedCoin && state.selectedNetwork
    ? getRechargeAddressByCoinAndNetwork(state.selectedCoin.coinName, state.selectedNetwork.network)
    : null;

  // 每次进入页面时获取充值地址
  useFocusEffect(
    useCallback(() => {
      getAllRechargeAddresses();
    }, [getAllRechargeAddresses])
  );

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
   * 复制地址
   */
  async function handleCopyAddress() {
    if (!currentRechargeAddress?.address) {
      return;
    }

    try {
      await Clipboard.setStringAsync(currentRechargeAddress.address);
      toast.success(t('recharge.copySuccess'));
    } catch (error) {
      console.error('复制失败:', error);
    }
  }

  // 检查是否应该显示网络选择（如果选择的币种有网络可选）
  const shouldShowNetworkSelect = state.selectedCoin && state.selectedCoin.networks.length > 0;

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={t('recharge.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 币种选择 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('recharge.coin')}</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setState(draft => { draft.showCoinSelect = true; })}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            <View style={styles.selectorLeft}>
              {state.selectedCoin ? (
                <>
                  <Text style={styles.selectorText}>{state.selectedCoin.coinName}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>{t('recharge.selectCoin')}</Text>
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
            <Text style={styles.label}>{t('recharge.network')}</Text>
            <Pressable
              style={styles.selector}
              onPress={() => setState(draft => { draft.showNetworkSelect = true; })}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <View style={styles.selectorLeft}>
                {state.selectedNetwork ? (
                  <>
                    <Text style={styles.selectorText}>{state.selectedNetwork.network}</Text>
                  </>
                ) : (
                  <Text style={styles.selectorPlaceholder}>{t('recharge.selectNetwork')}</Text>
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

        {/* 充值地址区域 */}
        <View style={styles.addressSection}>
          <Text style={styles.label}>{t('recharge.rechargeAddress')}</Text>

          {/* 二维码 */}
          {currentRechargeAddress?.address && (
            <View style={styles.qrCodeContainer}>
              <View style={styles.qrCode}>
                <QRCode
                  value={currentRechargeAddress.address}
                  size={112}
                  backgroundColor="white"
                  color="black"
                />
              </View>
              <Text style={styles.qrCodeHint}>
                {t('recharge.onlyDeposit', { coin: state.selectedCoin?.coinName || '' })}
              </Text>
            </View>
          )}

          {/* 地址卡片 */}
          {currentRechargeAddress?.address && (
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>{t('recharge.address')}</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressText}>
                  {currentRechargeAddress?.address}
                </Text>
                <Pressable
                  style={styles.copyButton}
                  onPress={handleCopyAddress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Image
                    source={require('@/assets/images/copy.png')}
                    style={styles.copyIcon}
                    contentFit="contain"
                  />
                </Pressable>
              </View>
            </View>
          )}

        </View>

        {/* 充值说明 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>
            {t('recharge.minimumAmount', { amount: '1', coin: state.selectedCoin?.coinName || '' })}
          </Text>
          <Text style={styles.noticeText}>{t('recharge.notice1', { coin: state.selectedCoin?.coinName || '' })}</Text>
          <Text style={styles.noticeText}>
            {t('recharge.notice2', { amount: '1', coin: state.selectedCoin?.coinName || '' })}
          </Text>
          <Text style={styles.noticeText}>{t('recharge.notice3')}</Text>
        </View>
      </ScrollView>

      {/* 选择币种弹窗 */}
      <CoinSelectSheet
        visible={state.showCoinSelect}
        onClose={() => setState(draft => { draft.showCoinSelect = false; })}
        onSelect={handleSelectCoin}
        selectedCoinId={state.selectedCoin?.coinId}
        coins={coins.filter(coin => coin.coinName === 'USDT')}
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
    fontWeight: '500',
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
  addressSection: {
    gap: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  qrCode: {
    width: 128,
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 8,
    backgroundColor: Colors.title,
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
  },
  qrCodePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  qrCodePlaceholderText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  qrCodeHint: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#1D1D1D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.title,
  },
  copyButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIcon: {
    width: 20,
    height: 20,
  },
  noticeSection: {
    gap: 4,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.subtitle,
    lineHeight: 18,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
    lineHeight: 18,
  },
});
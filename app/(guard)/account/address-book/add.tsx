import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

import Button from '@/components/Button';
import CoinSelectSheet from '@/components/CoinSelectSheet';
import NavigationBar from '@/components/NavigationBar';
import NetworkSelectSheet from '@/components/NetworkSelectSheet';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  color: string;
}

interface Network {
  id: string;
  symbol: string;
  name: string;
  fullName: string;
  color: string;
}

export default function AddAddressPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    coin?: string;
    network?: string;
    address?: string;
    remark?: string;
  }>();

  // 判断是编辑模式还是新增模式
  const isEditMode = !!params.id;

  const [showCoinSelect, setShowCoinSelect] = useState(false);
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | undefined>();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | undefined>();
  const [address, setAddress] = useState('');
  const [remark, setRemark] = useState('');

  /**
   * 初始化表单数据（编辑模式）
   */
  useEffect(() => {
    if (isEditMode && params.coin && params.network && params.address) {
      // 根据币种名称匹配币种数据
      const coinData = getCoinBySymbol(params.coin);
      if (coinData) {
        setSelectedCoin(coinData);
      }

      // 根据网络名称匹配网络数据
      const networkData = getNetworkByName(params.network);
      if (networkData) {
        setSelectedNetwork(networkData);
      }

      setAddress(params.address);
      setRemark(params.remark || '');
    }
  }, [isEditMode, params]);

  /**
   * 根据币种符号获取币种数据
   */
  function getCoinBySymbol(symbol: string): Coin | undefined {
    const coins: Coin[] = [
      { id: '1', symbol: 'USDT', name: 'USDT', balance: '112.21', color: '#26a17b' },
      { id: '2', symbol: 'BTC', name: 'Bitcoin', balance: '0.05', color: '#f7931a' },
      { id: '3', symbol: 'ETH', name: 'Ethereum', balance: '1.23', color: '#627eea' },
      { id: '4', symbol: 'BNB', name: 'BNB', balance: '5.67', color: '#f3ba2f' },
    ];
    return coins.find((coin) => coin.symbol === symbol);
  }

  /**
   * 根据网络名称获取网络数据
   */
  function getNetworkByName(name: string): Network | undefined {
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
    return networks.find((network) => network.name === name);
  }

  /**
   * 选择币种
   */
  function handleSelectCoin(coin: Coin) {
    setSelectedCoin(coin);
  }

  /**
   * 选择网络
   */
  function handleSelectNetwork(network: Network) {
    setSelectedNetwork(network);
  }

  /**
   * 保存地址
   */
  function handleSave() {
    if (!selectedCoin || !selectedNetwork || !address.trim()) {
      return;
    }

    if (isEditMode) {
      // TODO: 调用编辑地址 API
      console.log('编辑地址:', {
        id: params.id,
        coin: selectedCoin,
        network: selectedNetwork,
        address: address.trim(),
        remark: remark.trim(),
      });

      Toast.show({
        type: 'success',
        text1: '修改成功',
      });
    } else {
      // TODO: 调用新增地址 API
      console.log('添加地址:', {
        coin: selectedCoin,
        network: selectedNetwork,
        address: address.trim(),
        remark: remark.trim(),
      });

      Toast.show({
        type: 'success',
        text1: '添加成功',
      });
    }

    // 返回上一页
    router.back();
  }

  const isSaveDisabled = !selectedCoin || !selectedNetwork || !address.trim();

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <PageDecoration />

      {/* 导航栏 */}
      <NavigationBar title={isEditMode ? t('addAddress.editTitle') : t('addAddress.title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 币种选择 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('addAddress.coin')}</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setShowCoinSelect(true)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            <View style={styles.selectorLeft}>
              {selectedCoin ? (
                <>
                  <View style={[styles.coinLogo, { backgroundColor: selectedCoin.color }]}>
                    <Text style={styles.coinLogoText}>{selectedCoin.symbol[0]}</Text>
                  </View>
                  <Text style={styles.selectorText}>{selectedCoin.symbol}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>{t('addAddress.selectCoin')}</Text>
              )}
            </View>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevron}
              contentFit="contain"
            />
          </Pressable>
        </View>

        {/* 网络选择 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('addAddress.network')}</Text>
          <Pressable
            style={styles.selector}
            onPress={() => setShowNetworkSelect(true)}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
            <View style={styles.selectorLeft}>
              {selectedNetwork ? (
                <>
                  <View style={[styles.networkLogo, { backgroundColor: selectedNetwork.color }]}>
                    <Text style={styles.networkLogoText}>{selectedNetwork.symbol[0]}</Text>
                  </View>
                  <Text style={styles.selectorText}>{selectedNetwork.name}</Text>
                </>
              ) : (
                <Text style={styles.selectorPlaceholder}>{t('addAddress.selectNetwork')}</Text>
              )}
            </View>
            <Image
              source={require('@/assets/images/chevron-right.png')}
              style={styles.chevron}
              contentFit="contain"
            />
          </Pressable>
        </View>

        {/* 地址输入 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('addAddress.address')}</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.textInput}
              placeholder={t('addAddress.addressPlaceholder')}
              placeholderTextColor={Colors.secondary}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* 备注输入 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('addAddress.remark')}</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.textInput}
              placeholder={t('addAddress.remarkPlaceholder')}
              placeholderTextColor={Colors.secondary}
              value={remark}
              onChangeText={setRemark}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* 保存按钮 */}
        <View style={styles.buttonContainer}>
          <Button
            title={t('addAddress.save')}
            onPress={handleSave}
            disabled={isSaveDisabled}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* 选择币种弹窗 */}
      <CoinSelectSheet
        visible={showCoinSelect}
        onClose={() => setShowCoinSelect(false)}
        onSelect={handleSelectCoin}
        selectedCoinId={selectedCoin?.id}
      />

      {/* 选择网络弹窗 */}
      <NetworkSelectSheet
        visible={showNetworkSelect}
        onClose={() => setShowNetworkSelect(false)}
        onSelect={handleSelectNetwork}
        selectedNetworkId={selectedNetwork?.id}
        coinSymbol={selectedCoin?.symbol}
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
    gap: 16,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.secondary,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#303030',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinLogoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.title,
  },
  networkLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkLogoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.title,
  },
  chevron: {
    width: 20,
    height: 20,
    transform: [{ rotate: '90deg' }],
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 0,
    minHeight: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtitle,
    padding: 0,
    margin: 0,
  },
  buttonContainer: {
    paddingTop: 24,
  },
  saveButton: {
    width: '100%',
  },
});


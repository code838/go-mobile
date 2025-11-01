import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Button from '@/components/Button';
import CoinSelectSheet from '@/components/CoinSelectSheet';
import NavigationBar from '@/components/NavigationBar';
import NetworkSelectSheet from '@/components/NetworkSelectSheet';
import PageDecoration from '@/components/PageDecoration';
import { Colors } from '@/constants/colors';
import { CoinMessage, Network } from '@/model/CoinMessage';
import { addressBookApi } from '@/services/api';
import { useBoundStore } from '@/store';
import { toast } from '@/utils/toast';
import { useImmer } from 'use-immer';

export default function AddAddressPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    coinId?: string;
    coinName?: string;
    networkId?: string;
    network?: string;
    address?: string;
    remark?: string;
  }>();

  const coins = useBoundStore(state => state.coins);
  const user = useBoundStore(state => state.user);

  // 判断是编辑模式还是新增模式
  const isEditMode = !!params.id;

  const [state, setState] = useImmer<{
    selectedCoin: CoinMessage | null;
    selectedNetwork: Network | null;
    address: string;
    remark: string;
    showCoinSelect: boolean;
    showNetworkSelect: boolean;
  }>({
    selectedCoin: null,
    selectedNetwork: null,
    address: '',
    remark: '',
    showCoinSelect: false,
    showNetworkSelect: false,
  });

  const setSelectedCoin = (coin: CoinMessage | null) => {
    setState(state => {
      state.selectedCoin = coin;
    });
  }

  const setSelectedNetwork = (network: Network | null) => {
    setState(state => {
      state.selectedNetwork = network;
    });
  }

  const setAddress = (address: string) => {
    setState(state => {
      state.address = address;
    });
  }

  const setRemark = (remark: string) => {
    setState(state => {
      state.remark = remark;
    });
  }

  const setShowCoinSelect = (show: boolean) => {
    setState(state => {
      state.showCoinSelect = show;
    });
  }

  const setShowNetworkSelect = (show: boolean) => {
    setState(state => {
      state.showNetworkSelect = show;
    });
  }
  /**
   * 初始化表单数据
   */
  useEffect(() => {
    // 如果是编辑模式，根据参数初始化表单
    if (isEditMode && params.coinId && params.networkId && params.address) {
      const coinData = coins.find(coin => coin.coinId === Number(params.coinId));
      if (coinData) {
        setSelectedCoin(coinData);
        const networkData = coinData.networks.find(network => network.networkId === Number(params.networkId));
        if (networkData) {
          setSelectedNetwork(networkData);
        }
      }
      setAddress(params.address);
      setRemark(params.remark || '');
    }
  }, []);

  /**
   * 选择币种
   */
  function handleSelectCoin(coin: CoinMessage) {
    setSelectedCoin(coin);
    // 重置网络选择
    if (coin.networks.length > 0) {
      handleSelectNetwork(coin.networks[0]);
    }
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
  async function handleSave() {
    if (!state.selectedCoin || !state.selectedNetwork || !state.address.trim() || !user) {
      return;
    }

    try {
      if (isEditMode) {
        // 调用编辑地址 API
        await addressBookApi.manageAddressBook({
          userId: user.userId,
          id: params.id ? +params.id : undefined,
          address: state.address.trim(),
          coinId: state.selectedCoin.coinId,
          networkId: state.selectedNetwork.networkId,
          operate: 3, // 3:修改
          remark: state.remark.trim(),
        });

        toast.success(t('addressBook.updateSuccess'));
      } else {
        // 调用新增地址 API
        await addressBookApi.manageAddressBook({
          userId: user.userId,
          address: state.address.trim(),
          coinId: state.selectedCoin.coinId,
          networkId: state.selectedNetwork.networkId,
          operate: 1, // 1:新增
          remark: state.remark.trim(),
        });
        toast.success(t('addressBook.addSuccess'));
      }

      // 返回上一页
      router.back();
    } catch (error: any) {
      console.error('保存地址失败:', error);
      toast.error(error.message);
    }
  }

  // 检查是否应该显示网络选择（如果选择的币种有网络可选）
  const shouldShowNetworkSelect = state.selectedCoin && state.selectedCoin.networks.length > 0;
  
  const isSaveDisabled = !state.selectedCoin || !state.address.trim() || !!(shouldShowNetworkSelect && !state.selectedNetwork);

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
              {state.selectedCoin ? (
                <>
                  <Text style={styles.selectorText}>{state.selectedCoin.coinName}</Text>
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

        {/* 网络选择 - 只在选择币种有网络时显示 */}
        {shouldShowNetworkSelect && (
          <View style={styles.field}>
            <Text style={styles.label}>{t('addAddress.network')}</Text>
            <Pressable
              style={styles.selector}
              onPress={() => setShowNetworkSelect(true)}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
              <View style={styles.selectorLeft}>
                {state.selectedNetwork ? (
                  <>
                    <Text style={styles.selectorText}>{state.selectedNetwork.network}</Text>
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
        )}

        {/* 地址输入 */}
        <View style={styles.field}>
          <Text style={styles.label}>{t('addAddress.address')}</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.textInput}
              placeholder={t('addAddress.addressPlaceholder')}
              placeholderTextColor={Colors.secondary}
              value={state.address}
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
              value={state.remark}
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
        visible={state.showCoinSelect}
        onClose={() => setShowCoinSelect(false)}
        onSelect={handleSelectCoin}
        selectedCoinId={state.selectedCoin?.coinId}
        coins={coins}
      />

      {/* 选择网络弹窗 */}
      {shouldShowNetworkSelect && (
        <NetworkSelectSheet
          visible={state.showNetworkSelect}
          onClose={() => setShowNetworkSelect(false)}
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
    gap: 16,
  },
  field: {
    gap: 8,
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
    height: 45,
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
    height: 45,
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


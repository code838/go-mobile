import CheckBox from '@/components/CheckBox';
import ConfirmModal from '@/components/ConfirmModal';
import NavigationBar from '@/components/NavigationBar';
import { Colors } from '@/constants/colors';
import { getImageUrl } from '@/constants/urls';
import { getCartList, manageCart, orderBuy } from '@/services/home';
import { useBoundStore } from '@/store';
import type { CartItem } from '@/types';
import Feather from '@expo/vector-icons/Feather';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function FavoritePage() {
  const { t } = useTranslation();
  const user = useBoundStore(state => state.user);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectAllLoading, setIsSelectAllLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<Map<number, string>>(new Map());

  // 获取购物车列表
  const fetchCartList = useCallback(async () => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    console.log('心愿单 fetchCartList - user:', user);
    console.log('心愿单 fetchCartList - userId:', userId, '类型:', typeof userId);
    
    if (!userId) {
      console.log('心愿单 fetchCartList - userId 为空，清空列表');
      setCartItems([]);
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('心愿单 fetchCartList - 请求参数:', JSON.stringify({ userId }));
      const response = await getCartList({ userId });
      console.log('心愿单 fetchCartList - 响应:', response?.data);
      
      if (response?.data?.code === 0 || response?.data?.code === 200) {
        const items = response.data.data || [];
        console.log('心愿单 fetchCartList - 获取到商品数量:', items.length);
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('获取购物车列表失败:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // 初始加载
  useEffect(() => {
    fetchCartList();
  }, [fetchCartList]);

  // 每次页面聚焦时重新加载数据
  useFocusEffect(
    useCallback(() => {
      fetchCartList();
    }, [fetchCartList])
  );

  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCartList();
  }, [fetchCartList]);

  // 检查是否全选
  const isAllSelected = useMemo(() => {
    return cartItems.length > 0 && cartItems.every((item) => item.selected === 1);
  }, [cartItems]);

  // 计算已选商品数量和总价
  const { selectedCount, totalPrice } = useMemo(() => {
    let count = 0;
    let total = 0;
    cartItems.forEach((item) => {
      if (item.selected === 1) {
        count += item.num;
        total += Number(item.price) * item.num;
      }
    });
    return { selectedCount: count, totalPrice: total };
  }, [cartItems]);

  // 全选/取消全选
  const handleSelectAll = async () => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    if (!userId || isSelectAllLoading) return;

    setIsSelectAllLoading(true);
    try {
      const targetSelected = isAllSelected ? 0 : 1;
      const targetType = targetSelected === 1 ? 4 : 5; // 4: 选中, 5: 取消选中
      console.log('心愿单 handleSelectAll - userId:', userId, 'targetType:', targetType);

      for (const item of cartItems) {
        if (item.selected !== targetSelected) {
          await manageCart({
            userId,
            type: targetType,
            productId: item.productId,
            selected: targetSelected,
          });
        }
      }

      await fetchCartList();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('wishlist.operationFailed'),
      });
    } finally {
      setIsSelectAllLoading(false);
    }
  };

  // 单个商品选中/取消选中
  const handleSelectItem = async (item: CartItem) => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    console.log('心愿单 handleSelectItem - userId:', userId, 'productId:', item.productId);
    
    if (!userId || loadingItems.has(item.productId)) return;

    setLoadingItems((prev) => new Set(prev).add(item.productId));
    try {
      const newSelected = item.selected === 1 ? 0 : 1;
      await manageCart({
        userId,
        type: newSelected === 1 ? 4 : 5, // 4: 选中, 5: 取消选中
        productId: item.productId,
        selected: newSelected,
      });
      await fetchCartList();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('wishlist.operationFailed'),
      });
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.productId);
        return next;
      });
    }
  };

  // 删除商品
  const handleRemoveItem = async (item: CartItem) => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    console.log('心愿单 handleRemoveItem - userId:', userId, 'productId:', item.productId);
    
    if (!userId || loadingItems.has(item.productId)) return;

    setLoadingItems((prev) => new Set(prev).add(item.productId));
    try {
      const requestParams = {
        userId,
        type: 2, // 删除
        productId: item.productId,
      };
      console.log('心愿单 handleRemoveItem - 请求参数:', JSON.stringify(requestParams));
      
      const response = await manageCart(requestParams);
      console.log('心愿单 handleRemoveItem - 响应:', response?.data);
      
      Toast.show({
        type: 'success',
        text1: t('wishlist.removeSuccess'),
      });
      console.log('心愿单 handleRemoveItem - 删除成功，刷新列表');
      await fetchCartList();
    } catch (error: any) {
      console.error('心愿单 handleRemoveItem - 错误:', error);
      Toast.show({
        type: 'error',
        text1: error?.message || t('wishlist.removeFailed'),
      });
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.productId);
        return next;
      });
    }
  };

  // 修改数量
  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    if (!userId || loadingItems.has(item.productId)) return;

    // 清除正在编辑的状态
    if (editingQuantities.has(item.productId)) {
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
    }

    // 如果当前数量为1且是减少操作，则删除商品
    if (item.num === 1 && delta === -1) {
      handleRemoveItem(item);
      return;
    }

    // 计算剩余可参与数量
    const remainingSlots = item.totalPerson - item.joinPerson;
    const maxQuantity = remainingSlots;
    
    const newQuantity = Math.max(1, Math.min(maxQuantity, item.num + delta));
    if (newQuantity === item.num) {
      // 如果已达到最大值，给出提示
      if (delta > 0 && item.num >= maxQuantity) {
        Toast.show({
          type: 'warning',
          text1: t('wishlist.maxQuantityReached', { max: maxQuantity }),
        });
      }
      return;
    }
    
    console.log('心愿单 handleQuantityChange - userId:', userId, 'productId:', item.productId, 'newQuantity:', newQuantity, 'maxQuantity:', maxQuantity);

    setLoadingItems((prev) => new Set(prev).add(item.productId));
    try {
      await manageCart({
        userId,
        type: 3, // 修改数量
        productId: item.productId,
        num: newQuantity,
      });
      await fetchCartList();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('wishlist.updateQuantityFailed'),
      });
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.productId);
        return next;
      });
    }
  };

  // 处理手动输入数量
  const handleQuantityInputChange = (productId: number, value: string) => {
    // 只允许输入数字
    const sanitized = value.replace(/[^0-9]/g, '');
    setEditingQuantities((prev) => {
      const next = new Map(prev);
      next.set(productId, sanitized);
      return next;
    });
  };

  // 提交手动输入的数量
  const handleQuantityInputSubmit = async (item: CartItem) => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    if (!userId || loadingItems.has(item.productId)) return;

    const inputValue = editingQuantities.get(item.productId);
    if (!inputValue) {
      // 如果输入为空，恢复原值
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
      return;
    }

    const newQuantity = parseInt(inputValue, 10);
    
    // 计算剩余可参与数量
    const remainingSlots = item.totalPerson - item.joinPerson;
    const maxQuantity = remainingSlots;
    
    // 验证输入
    if (isNaN(newQuantity) || newQuantity < 1) {
      Toast.show({
        type: 'warning',
        text1: t('wishlist.invalidQuantity'),
      });
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
      return;
    }

    // 检查是否超过最大值
    if (newQuantity > maxQuantity) {
      Toast.show({
        type: 'warning',
        text1: t('wishlist.exceedMaxQuantity', { max: maxQuantity }),
      });
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
      return;
    }

    // 如果数量没有变化，只清除编辑状态
    if (newQuantity === item.num) {
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
      return;
    }

    console.log('心愿单 handleQuantityInputSubmit - userId:', userId, 'productId:', item.productId, 'newQuantity:', newQuantity, 'maxQuantity:', maxQuantity);

    setLoadingItems((prev) => new Set(prev).add(item.productId));
    try {
      await manageCart({
        userId,
        type: 3, // 修改数量
        productId: item.productId,
        num: newQuantity,
      });
      // 清除编辑状态
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
      await fetchCartList();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('wishlist.updateQuantityFailed'),
      });
      // 失败时也清除编辑状态
      setEditingQuantities((prev) => {
        const next = new Map(prev);
        next.delete(item.productId);
        return next;
      });
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.productId);
        return next;
      });
    }
  };

  // 结算
  const handleCheckout = async () => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    console.log('心愿单 handleCheckout - userId:', userId, 'selectedCount:', selectedCount);
    
    if (!userId) {
      Toast.show({
        type: 'warning',
        text1: t('common.pleaseLogin'),
      });
      return;
    }

    if (selectedCount === 0) {
      Toast.show({
        type: 'warning',
        text1: t('wishlist.noSelection'),
      });
      return;
    }

    if (isCheckoutSubmitting) return;

    try {
      setIsCheckoutSubmitting(true);

      // 收集选中的商品
      const selectedItems = cartItems.filter((item) => item.selected === 1);
      const orderData = selectedItems.map((item) => ({
        productId: item.productId,
        num: item.num,
      }));
      
      console.log('心愿单 handleCheckout - orderData:', orderData);

      // 调用下单接口
      const res = await orderBuy({
        userId,
        data: orderData,
      });

      if (res?.data?.code === 0 || res?.data?.code === 200) {
        // 获取订单ID并跳转到确认订单页面
        const orderId = res.data.data?.orderId;
        router.push({
          pathname: '/(guard)/confirm-order',
          params: { orderId },
        } as any);
      } else {
        Toast.show({
          type: 'error',
          text1: res?.data?.msg || t('wishlist.checkoutFailed'),
        });
      }
    } catch (error: any) {
      console.error('下单失败:', error);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.msg || t('wishlist.checkoutFailedRetry'),
      });
    } finally {
      setIsCheckoutSubmitting(false);
    }
  };

  // 获取状态文字
  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return t('wishlist.statusOngoing');
      case 2:
        return t('wishlist.statusEnded');
      case 3:
        return t('wishlist.statusComing');
      default:
        return '-';
    }
  };

  // 清空确认对话框
  const handleClearClick = () => {
    const hasSelected = cartItems.some((item) => item.selected === 1);
    if (!hasSelected) {
      Toast.show({
        type: 'warning',
        text1: t('wishlist.noSelection'),
      });
      return;
    }
    setShowClearDialog(true);
  };

  const handleConfirmClear = async () => {
    const userId = user?.userId ? Number(user.userId) : undefined;
    console.log('心愿单 handleConfirmClear - userId:', userId);
    
    if (!userId) return;

    try {
      // 删除选中的商品
      const selectedItems = cartItems.filter((item) => item.selected === 1);
      console.log('心愿单 handleConfirmClear - 选中的商品数:', selectedItems.length);
      
      for (const item of selectedItems) {
        await manageCart({
          userId,
          type: 2, // 删除
          productId: item.productId,
        });
      }
      Toast.show({
        type: 'success',
        text1: t('wishlist.clearSuccess'),
      });
      console.log('心愿单 handleConfirmClear - 清空成功，刷新列表');
      await fetchCartList();
      setShowClearDialog(false);
    } catch (error: any) {
      console.error('心愿单 handleConfirmClear - 错误:', error);
      Toast.show({
        type: 'error',
        text1: error?.message || t('wishlist.clearFailed'),
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <NavigationBar title={t('wishlist.title')} showBack={false} />
        {/* 内容区域 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand} />
            <Text style={styles.loadingText}>{t('wishlist.loading')}</Text>
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={64} color={Colors.secondary} />
            <Text style={styles.emptyText}>{t('wishlist.emptyMessage')}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {cartItems.map((item) => {
                const isItemLoading = loadingItems.has(item.productId);
                return (
                  <View key={item.productId} style={styles.cartItem}>
                    {/* 加载遮罩 */}
                    {isItemLoading && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      </View>
                    )}

                    {/* 复选框 */}
                    <View style={styles.checkboxContainer}>
                      <CheckBox
                        checked={item.selected === 1}
                        onChange={() => handleSelectItem(item)}
                      />
                    </View>

                    {/* 商品图片 */}
                    <View style={styles.productImageWrapper}>
                      <Image
                        source={{
                          uri: item.logo
                            ? getImageUrl(item.logo)
                            : 'https://via.placeholder.com/40',
                        }}
                        style={styles.productImage}
                      />
                    </View>

                    {/* 商品信息 */}
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {t('confirmOrder.periodNumber', { number: item.serialNumber })}{' '}
                        {item.title}
                      </Text>
                      <View style={styles.productDetails}>
                        <Text style={styles.productDetailText} numberOfLines={1}>
                          {t('wishlist.price')}：{item.price}U
                        </Text>
                        <Text style={styles.productDetailText} numberOfLines={1}>
                          {t('wishlist.productValue')}：{item.productValue}
                        </Text>
                      </View>
                      <Text style={styles.productStatus}>
                        {getStatusText(item.status)} ({item.joinPerson}/{item.totalPerson})
                      </Text>
                    </View>

                    {/* 数量控制 */}
                    <View style={styles.quantityControl}>
                      <Pressable
                        onPress={() => !isItemLoading && handleQuantityChange(item, -1)}
                        disabled={isItemLoading}
                        style={[styles.quantityButton, isItemLoading && styles.buttonDisabled]}
                      >
                        <Feather name="minus" size={16} color="#FFFFFF" />
                      </Pressable>
                      <View style={styles.quantityValue}>
                        <TextInput
                          style={styles.quantityInput}
                          value={editingQuantities.has(item.productId) 
                            ? editingQuantities.get(item.productId) 
                            : String(item.num)}
                          onChangeText={(value) => handleQuantityInputChange(item.productId, value)}
                          onBlur={() => handleQuantityInputSubmit(item)}
                          onSubmitEditing={() => handleQuantityInputSubmit(item)}
                          keyboardType="number-pad"
                          selectTextOnFocus
                          editable={!isItemLoading}
                          maxLength={3}
                          underlineColorAndroid="transparent"
                          placeholderTextColor="#FFFFFF"
                        />
                      </View>
                      <Pressable
                        onPress={() => !isItemLoading && handleQuantityChange(item, 1)}
                        disabled={isItemLoading}
                        style={[styles.quantityButton, isItemLoading && styles.buttonDisabled]}
                      >
                        <Feather name="plus" size={16} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* 底部操作栏 */}
            <View style={styles.bottomBar}>
              <View style={styles.bottomBarContent}>
                {/* 全选 */}
                <View style={styles.selectAllContainer}>
                  <CheckBox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  >
                    <Text style={styles.selectAllText}>{t('wishlist.selectAll')}</Text>
                  </CheckBox>
                  {isSelectAllLoading && (
                    <ActivityIndicator size="small" color={Colors.brand} style={{ marginLeft: 8 }} />
                  )}
                </View>

                {/* 总计和结算按钮 */}
                <View style={styles.checkoutContainer}>
                  <Pressable
                    onPress={handleCheckout}
                    disabled={isCheckoutSubmitting || selectedCount === 0}
                    style={[
                      styles.checkoutButton,
                      (isCheckoutSubmitting || selectedCount === 0) && styles.checkoutButtonDisabled,
                    ]}
                  >
                    {isCheckoutSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.checkoutButtonText}>{t('wishlist.checkout')}</Text>
                    )}
                  </Pressable>
                  <Text style={styles.totalText}>
                    {t('wishlist.total')}
                    <Text style={styles.totalPrice}>{totalPrice.toFixed(0)}U</Text>
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* 清空确认弹窗 */}
        <ConfirmModal
          visible={showClearDialog}
          title={t('wishlist.clearDialogTitle')}
          content={t('wishlist.clearDialogContent')}
          leftButtonText={t('wishlist.cancel')}
          rightButtonText={t('wishlist.confirm')}
          onLeftPress={() => setShowClearDialog(false)}
          onRightPress={handleConfirmClear}
        />
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.subtitle,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: Colors.secondary,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkboxContainer: {
    paddingTop: 4,
  },
  productImageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'linear-gradient(180deg, #8A8A8A 0%, #5A5A5A 100%)',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  productDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  productDetailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  productStatus: {
    color: Colors.secondary,
    fontSize: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantityButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  quantityValue: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    minWidth: 32,
    height: 24,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    padding: 0,
    paddingVertical: 0,
    margin: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
    }),
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  checkoutContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  totalText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
  },
  totalPrice: {
    color: Colors.gold,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: Colors.brand,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 72,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

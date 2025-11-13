import Countdown from '@/components/Countdown';
import NavigationBar from '@/components/NavigationBar';
import { IMG_BASE_URL } from '@/constants/api';
import { Colors } from '@/constants/colors';
import { urls } from '@/constants/urls';
import { useBoundStore } from '@/store';
import { request } from '@/utils/request';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// 类型定义
interface ProductDetail {
  productId: number;
  title: string;
  subTitle?: string;
  logo: string;
  price: number;
  productValue: string;
  totalPerson: number;
  joinPerson: number;
  serialNumber: number;
  endTime: number;
  cart: boolean;
  owner?: string;
  ownerCoding?: string;
  coinId: number;
}

interface BuyUser {
  time: number;
  nickName: string;
  image?: string;
  num: number;
}

interface HistoryDraw {
  productId: number;
  serialNumber: number;
  title: string;
  coinName: string;
  productValue: string;
  ownerCoding: string;
  owner: string;
  ownerImage?: string;
  endTime: number;
}

interface CalcResultItem {
  buyTime: number;
  timeStamp: string;
  productName: string;
  productImage?: string;
  nickName: string;
  userImage?: string;
  serialNumber: number;
}

interface CalcResult {
  sumTime: string;
  totalPerson: number;
  remainder: number;
  result: string;
}

interface CalcResultData {
  buyList: CalcResultItem[];
  calcResult: CalcResult;
}

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const user = useBoundStore(state => state.user);
  
  const productId = Number(params.id);
  const serialNumber = Number(params.serialNumber) || 1;
  const isWinnerView = params.winner === 'true';
  
  // 状态
  const [loading, setLoading] = useState(true);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const quantityInputRef = useRef<TextInput>(null);
  
  // 列表数据
  const [buyUsers, setBuyUsers] = useState<BuyUser[]>([]);
  const [historyDraws, setHistoryDraws] = useState<HistoryDraw[]>([]);
  const [calcResultData, setCalcResultData] = useState<CalcResultData | null>(null);
  
  // 分页
  const [buyUsersPage, setBuyUsersPage] = useState(1);
  const [historyDrawsPage, setHistoryDrawsPage] = useState(1);
  const [hasMoreBuyUsers, setHasMoreBuyUsers] = useState(true);
  const [hasMoreHistoryDraws, setHasMoreHistoryDraws] = useState(true);
  const pageSize = 10;

  // Tab配置
  const tabs = isWinnerView 
    ? [t('productDetail.participantRecords'), t('productDetail.calculationResult')] 
    : [t('productDetail.participantRecords'), t('productDetail.recentDraws')];

  // 监听 isInCart 状态变化
  useEffect(() => {
    console.log(`商品详情[${productId}] - isInCart 状态变化为:`, isInCart);
  }, [isInCart]);

  // 获取商品详情
  useEffect(() => {
    fetchProductDetail();
  }, [productId, serialNumber, user]);

  // 获取参与记录
  useEffect(() => {
    if (activeTab === 0) {
      fetchBuyUsers();
    }
  }, [activeTab, buyUsersPage]);

  // 获取近期开奖
  useEffect(() => {
    if (activeTab === 1 && !isWinnerView) {
      fetchHistoryDraws();
    }
  }, [activeTab, historyDrawsPage, isWinnerView]);

  // 获取计算结果
  useEffect(() => {
    if (activeTab === 1 && isWinnerView) {
      fetchCalcResult();
    }
  }, [activeTab, isWinnerView]);

  // 监听键盘事件
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const userId = user ? Number(user.userId) : undefined;
      console.log('商品详情 fetchProductDetail - user:', user);
      console.log('商品详情 fetchProductDetail - userId:', userId, '类型:', typeof userId);
      
      const apiUrl = (urls as any).productDetail || `${urls.home.replace('/home', '/product/detail')}`;
      const requestParams = {
        productId,
        serialNumber,
        userId,
      };
      console.log('商品详情 fetchProductDetail - 请求参数:', JSON.stringify(requestParams));
      
      const response = await request.post(apiUrl, requestParams);
      
      if (response?.data?.code === 0) {
        const data = response.data.data;
        console.log('商品详情 - 获取到的 data.cart:', data.cart);
        setProductDetail(data);
        setIsInCart(data.cart || false);
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      Toast.show({
        type: 'error',
        text1: t('productDetail.fetchFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyUsers = async () => {
    try {
      const apiUrl = (urls as any).productBuyUsers || `${urls.home.replace('/home', '/product/buyUsers')}`;
      const response = await request.post(apiUrl, {
        productId,
        pageNo: buyUsersPage,
        pageSize,
        userId: user ? Number(user.userId) : undefined,
      });
      
      if (response?.data?.code === 0) {
        const newData = response.data.data || [];
        setBuyUsers(prev => buyUsersPage === 1 ? newData : [...prev, ...newData]);
        setHasMoreBuyUsers(newData.length === pageSize);
      }
    } catch (error) {
      console.error('获取参与记录失败:', error);
    }
  };

  const fetchHistoryDraws = async () => {
    try {
      const apiUrl = (urls as any).productHistoryDraws || `${urls.home.replace('/home', '/product/historyDraws')}`;
      const response = await request.post(apiUrl, {
        productId,
        pageNo: historyDrawsPage,
        pageSize,
      });
      
      if (response?.data?.code === 0) {
        const newData = response.data.data || [];
        setHistoryDraws(prev => historyDrawsPage === 1 ? newData : [...prev, ...newData]);
        setHasMoreHistoryDraws(newData.length === pageSize);
      }
    } catch (error) {
      console.error('获取近期开奖失败:', error);
    }
  };

  const fetchCalcResult = async () => {
    try {
      const apiUrl = (urls as any).productCalcResult || `${urls.home.replace('/home', '/product/calcResult')}`;
      const response = await request.post(apiUrl, {
        productId,
        serialNumber,
      });
      
      if (response?.data?.code === 0) {
        setCalcResultData(response.data.data);
      }
    } catch (error) {
      console.error('获取计算结果失败:', error);
    }
  };

  const handleToggleCart = async () => {
    // 检查是否登录 - 参考 (guard)/_layout.tsx 的处理方式
    if (!user) {
      console.log('商品详情 handleToggleCart - user 为空，跳转到登录');
      router.push('/(auth)/login');
      return;
    }

    try {
      const newCartState = !isInCart;
      console.log('商品详情 handleToggleCart - 当前状态:', isInCart, '目标状态:', newCartState);
      console.log('商品详情 handleToggleCart - user.userId:', user.userId, '类型:', typeof user.userId);
      
      const userIdNumber = Number(user.userId);
      console.log('商品详情 handleToggleCart - 转换后的 userId:', userIdNumber, '是否为 NaN:', isNaN(userIdNumber));
      
      // 验证 userId 是否有效
      if (!userIdNumber || isNaN(userIdNumber)) {
        console.error('商品详情 handleToggleCart - userId 无效:', user.userId);
        Toast.show({
          type: 'error',
          text1: t('productCard.invalidUserId', { defaultValue: '用户信息无效，请重新登录' }),
        });
        return;
      }

      const requestParams = {
        userId: userIdNumber,
        productId,
        type: newCartState ? 1 : 2,
        num: quantity,
      };
      console.log('商品详情 handleToggleCart - 请求参数:', JSON.stringify(requestParams));

      const response = await request.post(urls.cartManage, requestParams);
      
      console.log('商品详情 manageCart 响应:', response?.data);
      
      // 成功：立即更新本地状态
      setIsInCart(newCartState);
      console.log('商品详情 状态更新成功，新状态:', newCartState);
      
      Toast.show({
        type: 'success',
        text1: newCartState ? t('productCard.addedToWishlist') : t('productCard.removedFromWishlist'),
      });
    } catch (error: any) {
      console.error('商品详情 handleToggleCart - 捕获错误:', error);
      console.error('商品详情 handleToggleCart - 错误消息:', error?.message);
      
      // 检查是否是 code: 23（商品已在心愿单中）
      if (error?.message?.includes('商品已在心愿单中') || error?.message?.includes('already in cart')) {
        console.log('商品详情 - 商品已在心愿单中，同步本地状态为 true');
        setIsInCart(true);
        Toast.show({
          type: 'info',
          text1: error?.message || '商品已在心愿单中',
        });
      } else {
        // 其他错误
        const errorMsg = error?.message || error?.response?.data?.msg || t('productCard.operationFailed', { defaultValue: '操作失败' });
        console.log('商品详情 - 操作失败:', errorMsg);
        Toast.show({
          type: 'error',
          text1: errorMsg,
        });
      }
    }
  };

  const handleJoinNow = async () => {
    // 检查是否登录 - 参考 (guard)/_layout.tsx 的处理方式
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await request.post(urls.orderBuy, {
        userId: Number(user.userId),
        data: [{ productId, num: quantity }],
      });
      
      console.log('订单创建响应:', response?.data);
      
      if (response?.data?.code === 0 || response?.data?.code === 200) {
        const orderId = response.data.data?.orderId || response.data.data;
        console.log('获取到的 orderId:', orderId);
        
        if (!orderId) {
          Toast.show({
            type: 'error',
            text1: t('productCard.orderFailed'),
          });
          return;
        }
        
        router.push({
          pathname: '/confirm-order',
          params: { orderId: String(orderId) },
        } as any);
      } else {
        // 显示服务器返回的错误信息
        console.log('订单创建失败 - code:', response?.data?.code, 'msg:', response?.data?.msg);
        Toast.show({
          type: 'error',
          text1: response?.data?.msg || t('productCard.orderFailed'),
        });
      }
    } catch (error: any) {
      console.error('创建订单失败:', error);
      // 优先显示服务器返回的错误信息，然后是错误消息，最后是默认文本
      const errorMsg = error?.response?.data?.msg || error?.message || t('productCard.orderFailed');
      Toast.show({
        type: 'error',
        text1: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecrement = () => {
    // 从输入框的当前值计算
    const currentQuantity = parseInt(quantityInput) || 1;
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      setQuantity(newQuantity);
      setQuantityInput(String(newQuantity));
    }
  };

  const handleIncrement = () => {
    // 从输入框的当前值计算
    const currentQuantity = parseInt(quantityInput) || 1;
    const remainingSlots = productDetail ? productDetail.totalPerson - productDetail.joinPerson : 0;
    if (currentQuantity < remainingSlots) {
      const newQuantity = currentQuantity + 1;
      setQuantity(newQuantity);
      setQuantityInput(String(newQuantity));
    } else {
      Toast.show({
        type: 'warning',
        text1: t('productCard.maxParticipantLimit', { count: remainingSlots }),
      });
    }
  };

  const handleQuantityInputChange = (text: string) => {
    // 只允许输入数字
    const numericText = text.replace(/[^0-9]/g, '');
    setQuantityInput(numericText);
    
    // 实时更新 quantity 状态，但允许临时为空
    const numValue = parseInt(numericText);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
    }
  };

  const handleQuantityInputBlur = () => {
    const remainingSlots = productDetail ? productDetail.totalPerson - productDetail.joinPerson : 0;
    let newQuantity = parseInt(quantityInput) || 1;
    
    // 限制在1到剩余名额之间
    if (newQuantity < 1) {
      newQuantity = 1;
    } else if (newQuantity > remainingSlots) {
      newQuantity = remainingSlots;
      Toast.show({
        type: 'warning',
        text1: t('productCard.maxParticipantLimit', { count: remainingSlots }),
      });
    }
    
    setQuantity(newQuantity);
    setQuantityInput(String(newQuantity));
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return t('productDetail.secondsAgo', { count: seconds });
    if (minutes < 60) return t('productDetail.minutesAgo', { count: minutes });
    if (hours < 24) return t('productDetail.hoursAgo', { count: hours });
    if (days === 1) return t('productDetail.daysHoursAgo', { days: 1, hours: hours % 24 });
    return t('productDetail.daysAgo', { count: days });
  };

  const formatTimestampToHMS = (timestamp: number | string): string => {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6741FF" />
        <Text style={styles.loadingText}>{t('productDetail.loading')}</Text>
      </View>
    );
  }

  if (!productDetail) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noDataText}>{t('productDetail.noData')}</Text>
      </View>
    );
  }

  const progress = ((productDetail.joinPerson / productDetail.totalPerson) * 100).toFixed(0) + '%';
  const progressValue = (productDetail.joinPerson / productDetail.totalPerson) * 100;
  const isProgressComplete = progressValue >= 100;
  const remainingSlots = productDetail.totalPerson - productDetail.joinPerson;

  return (
    <LinearGradient
      colors={['rgba(103, 65, 255, 0.1)', 'rgba(103, 65, 255, 0)', Colors.background]}
      locations={[0, 0.43, 0.43]}
      style={styles.container}>
      {/* 导航栏 */}
      <View style={{ paddingTop: insets.top }}>
        <NavigationBar 
          title={t('productDetail.title')}
          rightContent={
            <TouchableOpacity 
              onPress={() => {
                console.log(`商品详情 点击爱心按钮 - 当前 isInCart: ${isInCart}, 图片: ${isInCart ? 'icon-heart-filled.png' : 'icon-heart.png'}`);
                handleToggleCart();
              }} 
              style={styles.heartButton}
            >
              <Image
                source={
                  isInCart
                    ? require('@/assets/images/icon-heart-filled.png')
                    : require('@/assets/images/icon-heart.png')
                }
                style={styles.heartIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          }
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >

        {/* 商品信息卡片 */}
        <View style={styles.productCard}>
          {/* 商品图片 */}
          <View style={styles.productImageWrapper}>
            <Image
              source={{
                uri: productDetail.logo
                  ? `${IMG_BASE_URL}${productDetail.logo}`
                  : 'https://via.placeholder.com/96',
              }}
              style={styles.productImage}
            />
            {/* 中奖者头像 */}
            {isWinnerView && productDetail.owner && (
              <View style={styles.winnerAvatarWrapper}>
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${productDetail.owner}`,
                  }}
                  style={styles.winnerAvatar}
                />
              </View>
            )}
          </View>

          {/* 标题 */}
          <Text style={styles.productTitle}>
            （第 {productDetail.serialNumber} 期）{productDetail.title}
          </Text>
          
          {/* 副标题 */}
          {productDetail.subTitle && (
            <Text style={styles.productSubTitle}>
              {productDetail.subTitle}
            </Text>
          )}

          {/* 统计信息 */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{productDetail.totalPerson}</Text>
              <Text style={styles.statLabel}>{t('productDetail.maxParticipants')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#E5AD54' }]}>{productDetail.price}U</Text>
              <Text style={styles.statLabel}>{t('productDetail.productPrice')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#1AF578' }]}>{productDetail.productValue}</Text>
              <Text style={styles.statLabel}>{t('productDetail.productValue')}</Text>
            </View>
          </View>

          {/* 中奖信息 */}
          {isWinnerView && (
            <View style={styles.winnerInfo}>
              <Text style={styles.revealTime}>
                {new Date(productDetail.endTime).toLocaleString()}
              </Text>
              <View style={styles.winnerBox}>
                <Text style={styles.winnerText}>
                  🎉 {t('productDetail.congratulations')}{' '}
                  <Text style={{ color: '#6741FF' }}>{productDetail.owner || ''}</Text>{' '}
                  {t('productDetail.wonProduct')}
                </Text>
                <Text style={styles.winnerText}>
                  {t('productDetail.luckyCode')}：
                  <Text style={{ color: '#67E8F2' }}>{productDetail.ownerCoding || ''}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* 进度条和倒计时 */}
          {!isWinnerView && (
            <View style={styles.progressSection}>
              {/* 进度条 */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{t('productDetail.progress')}</Text>
                  <Text style={styles.progressPercent}>{progress}</Text>
                </View>
                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressValue}%` }]} />
                  </View>
                </View>
              </View>

              {/* 倒计时 */}
              {isProgressComplete && (
                <Countdown endTime={productDetail.endTime} showLabels={true} />
              )}
            </View>
          )}
        </View>

        {/* Tab切换 */}
        <View style={styles.tabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTab(index)}
              style={styles.tab}
            >
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab内容 */}
        {activeTab === 0 && (
          <View style={styles.tabContent}>
            {/* 参与记录表头 */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>{t('productDetail.purchaseTime')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.buyer')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.purchaseCount')}</Text>
            </View>

            {/* 参与记录列表 */}
            {buyUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('productDetail.noData')}</Text>
              </View>
            ) : (
              <>
                {buyUsers.map((user, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{formatTimeAgo(user.time)}</Text>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: user.image
                            ? `${IMG_BASE_URL}${user.image}`
                            : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.nickName}`,
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.userNameText} numberOfLines={1}>
                        {user.nickName}
                      </Text>
                    </View>
                    <Text style={styles.tableCell}>x{user.num}</Text>
                  </View>
                ))}

                {/* 只有当有数据且还有更多数据时才显示加载更多按钮 */}
                {hasMoreBuyUsers && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => setBuyUsersPage(prev => prev + 1)}
                  >
                    <Text style={styles.loadMoreText}>{t('productDetail.loadMore')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* 近期开奖 */}
        {activeTab === 1 && !isWinnerView && (
          <View style={styles.tabContent}>
            {/* 表头 */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>{t('productDetail.period')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.luckyNumber')}</Text>
              <Text style={styles.tableHeaderText}>{t('productDetail.winnerShort')}</Text>
            </View>

            {/* 列表 */}
            {historyDraws.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('productDetail.noData')}</Text>
              </View>
            ) : (
              <>
                {historyDraws.map((draw, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {t('productDetail.periodNumber', { number: draw.serialNumber })}
                    </Text>
                    <Text style={[styles.tableCell, { color: '#67E8F2' }]}>
                      {draw.ownerCoding}
                    </Text>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: draw.ownerImage
                            ? `${IMG_BASE_URL}${draw.ownerImage}`
                            : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${draw.owner}`,
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.userNameText} numberOfLines={1}>
                        {draw.owner}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* 只有当有数据且还有更多数据时才显示加载更多按钮 */}
                {hasMoreHistoryDraws && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => setHistoryDrawsPage(prev => prev + 1)}
                  >
                    <Text style={styles.loadMoreText}>{t('productDetail.loadMore')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* 计算结果 */}
        {activeTab === 1 && isWinnerView && calcResultData && (
          <View style={styles.tabContent}>
            {/* 计算规则 */}
            <View style={styles.ruleBox}>
              <Text style={styles.ruleTitle}>{t('productDetail.calculationRule')}</Text>
              <Text style={styles.ruleText}>{t('productDetail.calculationRuleText')}</Text>
            </View>

            {/* 购买记录 */}
            {calcResultData.buyList && calcResultData.buyList.length > 0 && (
              <View style={styles.calcSection}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>{t('productDetail.purchaseTime')}</Text>
                  <Text style={styles.tableHeaderText}>{t('productDetail.purchasedProduct')}</Text>
                  <Text style={styles.tableHeaderText}>{t('productDetail.buyer')}</Text>
                </View>

                {calcResultData.buyList.map((item, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <View style={styles.calcTimeCell}>
                      <Text style={styles.calcTimeText}>  
                        {format(new Date(item.buyTime), 'yyyy/MM/dd HH:mm:ss')}
                      </Text>
                      <Text style={styles.calcTimestamp}>（{item.timeStamp}）</Text>
                    </View>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: item.productImage
                            ? `${IMG_BASE_URL}${item.productImage}`
                            : 'https://via.placeholder.com/16',
                        }}
                        style={styles.avatar}
                      />
                      <Text
                        style={styles.userNameText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.serialNumber !== undefined
                          ? `(${t('productDetail.periodNumber', { number: item.serialNumber })}) ${item.productName}`
                          : item.productName}
                      </Text>
                    </View>
                    <View style={styles.userCell}>
                      <Image
                        source={{
                          uri: item.userImage
                            ? `${IMG_BASE_URL}${item.userImage}`
                            : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.nickName}`,
                        }}
                        style={styles.avatar}
                      />
                      <Text style={styles.userNameText} numberOfLines={1}>
                        {item.nickName}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 计算结果 */}
            {calcResultData.calcResult && (
              <View style={styles.resultBox}>
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>{t('productDetail.calculationResultTitle')}</Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.sum', { value: calcResultData.calcResult.sumTime })}
                  </Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.remainder', {
                      sum: calcResultData.calcResult.sumTime,
                      total: calcResultData.calcResult.totalPerson,
                      remainder: calcResultData.calcResult.remainder,
                    })}
                  </Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.calculation', {
                      remainder: calcResultData.calcResult.remainder,
                      result: calcResultData.calcResult.result,
                    })}
                  </Text>
                  <Text style={styles.resultText}>
                    {t('productDetail.finalResult', { code: '' })}{' '}
                    <Text style={{ color: '#67E8F2' }}>{calcResultData.calcResult.result}</Text>
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      {!isWinnerView && !isProgressComplete && (
        <View style={[
          styles.bottomBar,
          { bottom: keyboardHeight > 0 ? keyboardHeight : (insets.bottom > 0 ? insets.bottom : 0) }
        ]}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>{t('productDetail.total')}</Text>
            <Text style={styles.totalPrice}>
              {(productDetail.price * quantity).toFixed(2)}U
            </Text>
          </View>

          <View style={styles.actionSection}>
            {/* 数量选择器 */}
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={handleDecrement}
                disabled={quantity <= 1}
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <TextInput
                ref={quantityInputRef}
                style={styles.quantityInput}
                value={quantityInput}
                onChangeText={handleQuantityInputChange}
                onBlur={handleQuantityInputBlur}
                keyboardType="number-pad"
                maxLength={4}
                selectTextOnFocus
              />

              <TouchableOpacity
                onPress={handleIncrement}
                disabled={quantity >= remainingSlots}
                style={[
                  styles.quantityButton,
                  quantity >= remainingSlots && styles.quantityButtonDisabled,
                ]}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* 立即参与按钮 */}
            <TouchableOpacity
              style={[styles.joinButton, isSubmitting && styles.joinButtonDisabled]}
              onPress={handleJoinNow}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>{t('productCard.joinNow')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heartButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 20,
    height: 20,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 64,
    paddingTop: 64,
    paddingBottom: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  productImageWrapper: {
    position: 'absolute',
    top: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8A8A8A',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  winnerAvatarWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  winnerAvatar: {
    width: '100%',
    height: '100%',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  productSubTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#6E6E70',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  winnerInfo: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  revealTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  winnerBox: {
    width: 220,
    gap: 10,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6E6E70',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E70',
  },
  progressBarWrapper: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    height: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6741FF',
    borderRadius: 6,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E70',
  },
  tabTextActive: {
    color: '#6741FF',
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E70',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  userCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    flexShrink: 1,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ruleBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  ruleTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ruleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6E6E70',
    lineHeight: 18,
  },
  calcSection: {
    marginTop: 12,
  },
  calcTimeCell: {
    flex: 1,
    alignItems: 'center',
  },
  calcTimeText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calcTimestamp: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6E6E70',
  },
  resultBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  resultContent: {
    gap: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#0E0E10',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5AD54',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantityInput: {
    width: 48,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  joinButton: {
    backgroundColor: '#6741FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 96,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


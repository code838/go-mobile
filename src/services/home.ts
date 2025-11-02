import { urls } from '@/constants/urls';
import type {
    Announcement,
    Carousel,
    CartManageParams,
    Home,
    HomeBuys,
    OrderBuyParams,
    OrderBuyResponse,
} from '@/types';
import { request } from '@/utils/request';

// ==================== 首页相关 ====================

/**
 * 获取首页数据
 * @param params.userId - 用户ID（可选，已登录时传入）
 */
export const getHome = (params?: { userId?: number }) =>
  request.post<Home>(urls.home, params || {});

/**
 * 获取首页中奖和购买滚动列表
 */
export const getHomeBuys = () =>
  request.post<HomeBuys>(urls.homeBuys, {});

// ==================== 轮播图相关 ====================

/**
 * 获取轮播图
 */
export const getCarousel = () =>
  request.get<Carousel[]>(urls.carousel);

// ==================== 公告相关 ====================

/**
 * 获取公告
 */
export const getAnnouncement = () =>
  request.get<Announcement>(urls.announcement);

// ==================== 购物车相关 ====================

/**
 * 管理购物车
 * @param params - 购物车管理参数
 */
export const manageCart = (params: CartManageParams) =>
  request.post(urls.cartManage, params);

// ==================== 购物车相关 ====================

/**
 * 获取购物车列表
 * @param params.userId - 用户ID
 */
export const getCartList = (params: { userId: number }) =>
  request.post(urls.getCartList, params);

// ==================== 订单相关 ====================

/**
 * 创建订单
 * @param params - 订单购买参数
 */
export const orderBuy = (params: OrderBuyParams) =>
  request.post<OrderBuyResponse>(urls.orderBuy, params);

// ==================== 专区相关 ====================

/**
 * 获取专区列表
 */
export const getZones = () =>
  request.get(urls.getZones);

/**
 * 获取专区商品列表
 * @param params - 专区商品请求参数
 */
export const getZoneProducts = (params: any) =>
  request.post(urls.getZoneProducts, params);

/**
 * 获取即将揭晓产品列表
 * @param params - 分页参数
 */
export const getWillProducts = (params: any) =>
  request.post(urls.getWillProducts, params);

/**
 * 获取历史揭晓产品列表
 * @param params - 分页参数
 */
export const getHistoryProducts = (params: any) =>
  request.post(urls.getHistoryProducts, params);


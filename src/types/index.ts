// ==================== 通用类型 ====================

/**
 * 分页请求参数
 */
export interface PaginationParams {
  pageNo: number;
  pageSize: number;
  coinId?: number; // 币种ID筛选
  orderBy?: number; // 排序方式: 1=最新发布, 2=剩余人数
}

// ==================== 产品相关类型 ====================

/**
 * 产品基础信息
 */
export interface Product {
  zoneId: number;
  productId: number;
  coinId?: number;
  title: string;
  subTitle: string;
  coinName: string;
  logo?: string | null;
  productValue: string;
  price: string;
  serialNumber: number;
  totalPerson: number;
  joinPerson: number;
  status: number;
  detail?: string | null;
  startTime: number;
  endTime: number;
  cart?: boolean; // 是否已加入心愿单
  owner?: string; // 中奖者（仅揭晓后有值）
  ownerCoding?: string; // 中奖编码（仅揭晓后有值）
}

/**
 * 历史揭晓产品信息
 */
export interface ProductHistory extends Product {
  owner: string;
  ownerCoding: string;
  ownerImage?: string | null;
}

/**
 * 首页数据
 */
export interface Home {
  hot: Product[]; // 热门商品
  will: Product[]; // 即将揭晓
  new: Product[]; // 最新上架
}

/**
 * 中奖用户信息
 */
export interface WinnerInfo {
  nickName: string;
  productValue: string;
  time: number;
}

/**
 * 购买信息（用于滚动公告）
 */
export interface BuyerInfo {
  nickName: string;
  productName: string;
  image: string;
  time: number;
}

/**
 * 首页购买信息（中奖公告滚动）
 */
export interface HomeBuys {
  owners: WinnerInfo[];
  buys: BuyerInfo[];
}

/**
 * 轮播图项
 */
export interface CarouselImage {
  id: number;
  image: string;
  language: string; // 'zh_CN' | 'en_US'
  showOrder: number;
  link?: string;
}

/**
 * 轮播图
 */
export interface Carousel {
  type: number; // 1: 首页图, 2: 邀请页图
  images: CarouselImage[];
}

/**
 * 公告
 */
export interface Announcement {
  id: number;
  title: string;
  content: string;
  createTime: number;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  data?: T;
}

/**
 * 用户信息
 */
export interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

/**
 * 购物车商品项
 */
export interface CartItem {
  productId: number;
  title: string;
  subTitle: string;
  logo?: string | null;
  price: string;
  productValue: string;
  serialNumber: number;
  totalPerson: number;
  joinPerson: number;
  status: number; // 1-进行中, 2-已结束, 3-即将开始
  num: number;
  selected: number; // 0-未选中, 1-已选中
}

/**
 * 购物车管理参数
 */
export interface CartManageParams {
  userId: number;
  productId: number;
  type: number; // 1-添加, 2-删除, 3-修改数量, 4-选中, 5-取消选中
  num?: number;
  selected?: number; // 0-未选中, 1-已选中
}

/**
 * 订单购买参数
 */
export interface OrderBuyParams {
  userId: number;
  data: {
    productId: number;
    num: number;
  }[];
}

/**
 * 订单购买响应
 */
export interface OrderBuyResponse {
  orderId: string;
}

/**
 * 专区信息
 */
export interface Zone {
  zoneId: number;
  zoneTitle: string;
}

/**
 * 专区商品列表请求参数
 */
export interface ZoneProductsParams extends PaginationParams {
  zoneId: number;
  userId?: number;
}

/**
 * 消息信息
 */
export interface Message {
  id: number | null;
  uid: number | null;
  title: string;
  content: string;
  language: string | null;
  createtime: number;
}

/**
 * 通知类型（用于前端显示）
 */
export interface Notification {
  id: string;
  title: string;
  content: string;
  time: number;
  read: boolean;
  type: 'system' | 'order' | 'promotion' | 'security';
}


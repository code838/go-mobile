// 订单状态
export enum OrderStatus {
  PENDING = 1, // 待支付（审核中）
  PAID = 2,    // 已支付
  CANCELLED = 3 // 订单取消
}

// 订单类型
export enum OrderType {
  LOTTERY = 0,  // 中奖
  UBUY = 1,     // 云购订单
  RECHARGE = 2, // 充值
  WITHDRAW = 3, // 提现
  EXCHANGE = 4, // 闪兑
  COMMISSION = 5 // 返佣
}

// 返佣类型
export enum ReturnType {
  REGISTER = 1, // 注册
  UBUY = 2      // 云购
}

// 云购商品信息
export interface Product {
  /** 商品名称 */
  productName: string;
  /** 商品logo */
  logo: string | null;
  /** 商品价格 */
  price: string;
  /** 序列号 */
  serialNumber: number;
  /** 单个产品的数量 */
  productNum: number;
  /** 商品价值 */
  productValue: string;
  /** 幸运编码（云购订单）/中奖编码（幸运订单） */
  coding: string | null;
  /** 单个产品的总额 */
  productAmount: string;
}

// 订单数据接口
export interface OrderItem {
  /** 订单时间 */
  createTime: number;
  /** 订单总额 */
  amount: string;
  /** 订单状态 1：待支付（审核中） 2：已支付 3：订单取消 */
  status: OrderStatus;
  /** 订单类型 0：中奖 1：云购订单 2：充值 3：提现 4：闪兑 5：返佣 */
  type: OrderType;
  /** 订单ID */
  orderId: string;
  
  // 云购订单相关字段
  /** 云购订单-商品名称 */
  productName?: string;
  /** 云购订单-商品价格 */
  price?: string;
  /** 云购订单/闪兑-订单商品数量或闪兑来源数量 */
  num?: string;
  /** 云购订单-待支付状态下最后支付时间，超过这个时间订单自动取消 */
  lastPayTime?: number;
  /** 云购/提现完成时间 */
  finishTime?: number;
  /** 云购订单商品列表 */
  products?: Product[];
  /** 云购订单（幸运编码）/幸运订单（中奖编码） */
  coding?: number;
  
  // 充值/提现相关字段
  /** 充值/提现/闪兑-资产名称 */
  coinName?: string;
  /** 充值/提现-网络 */
  network?: string;
  /** 充值/提现-接收地址 */
  toAddress?: string;
  /** 充值/提现/闪兑-到账金额 */
  recvAmount?: string;
  /** 充值/提现/闪兑-手续费 */
  fee?: string;
  /** 充值/提现-hash */
  hash?: string;
  /** 充值/提现-发送地址 */
  fromAddress?: string;
  
  // 闪兑相关字段
  /** 闪兑目标资产 */
  toAssert?: string;
  
  // 返佣相关字段
  /** 被邀请用户ID */
  inviteUserId?: number;
  /** 被邀请用户名 */
  inviteUserName?: string;
  /** 被邀请用户头像 */
  inviteUserPhoto?: string;
  /** 返佣类型 1：注册 2：云购 */
  returnType?: ReturnType;
  
  // 中奖相关字段
  /** 中奖时间 */
  ownerTime?: number;
  /** 中奖商品价值 */
  productValue?: string;
}

// 获取订单列表请求参数
export interface GetOrderListParams {
  /** 用户ID */
  userId: string;
  /** 页码 */
  pageNo: number;
  /** 每页数量 */
  pageSize: number;
  /** 订单类型，可选：0:中奖，1:云购，2:充值，3:提现，4:兑换，查询全部时不传type */
  type?: OrderType | null;
}

// 获取订单列表响应
export interface GetOrderListResponse {
  /** 响应码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 订单列表数据 */
  data: OrderItem[];
}

// SectionList 数据格式
export interface OrderSection {
  /** 月份标题 (yyyy-mm) */
  title: string;
  /** 该月份的订单数据 */
  data: OrderItem[];
}
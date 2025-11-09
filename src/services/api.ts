import { urls } from '@/constants/urls';
import { GetOrderListParams } from '@/model/Order';
import { request } from '@/utils/request';

// 认证相关接口
export const authApi = {
  // 用户登录
  login: (data: { 
    type: number;
    timestamp: number;
    nonce: string;
    sign: string;
    content: string;
    password: string;
    osType: number;
  }) => 
    request.post(urls.login, data),
  
  // 用户注册
  register: (data: { 
    type: number; 
    osType: number; 
    content: string; 
    password: string; 
    ip: string; 
    captha: string; 
    lottory?: string; 
  }) => 
    request.post(urls.register, data),
  
  // 退出登录
  logout: (data: { userId: string; osType: string }) => 
    request.post(urls.logout, data),
  
  // 重置密码
  resetPassword: (data: { 
    contentType?: number; 
    content?: string; 
    captha?: string; 
    password: string; 
    type: 1 | 2; 
    userId?: number; 
    originalPwd?: string; 
  }) => 
    request.post(urls.resetPassword, data),
  
  // 发送验证码
  sendCaptcha: (data: { content: string; type: number }) => 
    request.post(urls.sendCaptcha, data),

  // 获取第三方登录信息
  getThirdLoginInfo: () => 
    request.post(urls.getThirdLoginInfo, {}),

  // 第三方登录
  thirdLogin: (data: { type: number; token: string }) => 
    request.post(urls.thirdLogin, data),
};

// 用户相关接口
export const userApi = {
  // 获取用户信息
  getUserInfo: () => 
    request.post(urls.getUserInfo),
  
  // 更新昵称
  updateNickname: (data: { userId: number; nickName: string }) => 
    request.post(urls.updateNickname, data),
  
  // 更新邮箱或手机号
  updateEmailOrPhone: (data: { userId: string; type: 1 | 2; content: string; captha: string }) => 
    request.post(urls.updateEmailOrPhone, data),
  
  // 删除账户
  deleteAccount: (data: { userId: string }) => 
    request.post(urls.deleteAccount, data),

  // 获取邀请记录
  getInviteRecord: () =>
    request.post(urls.getInviteRecord, {}),
};

// 财务相关接口
export const financeApi = {
  // 提现
  withdraw: (data: { 
    userId: string; 
    amount: string; 
    coinId: number; 
    networkId: number; 
    address: string;
  }) => 
    request.post(urls.withdraw, data),
  
  // 获取币种列表
  getCoins: () => 
    request.get(urls.getCoins),
  
  // 获取兑换配置
  getExchangeConfig: (data: { fromCoinId: number }) => 
    request.post(urls.getExchangeConfig, data),

  // 获取所有充值地址
  getAllRechargeAddresses: (data: { userId: string }) =>
    request.post(urls.getAllRechargeAddresses, data),
  
  // 获取提现手续费
  getWithdrawFees: (data = {}) =>
    request.post(urls.getWithdrawFees, data),
  
  // 获取订单列表
  getOrderList: (data: GetOrderListParams) =>
    request.post(urls.getOrderList, data),

  // 获取订单详情
  getOrderDetail: (data: { userId: number; orderId: string; isOwner: boolean }) =>
    request.post(urls.getOrderDetail, data),
  
  // 支付订单
  payOrder: (data: { userId: number; orderId: string }) =>
    request.post(urls.payOrder, data),
  
  // 取消订单
  cancelOrder: (data: { userId: number; orderId: string }) =>
    request.post(urls.cancelOrder, data),
  
  // 兑换
  exchange: (data: { 
    userId: number; 
    coinId: number; 
    num: string;
  }) => 
    request.post(urls.echange, data),
};

// 系统信息相关接口
export const systemApi = {
  // 获取协议信息
  getProtocol: () => 
    request.get(urls.getProtocol),
  
  // 获取地区信息
  getArea: () => 
    request.get(urls.getArea),
  
  // 获取基础信息
  getBasicInfo: () => 
    request.get(urls.getBasicInfo),
  
  // 获取服务信息
  getServiceInfo: () => 
    request.post(urls.getServiceInfo),
};

export const addressBookApi = {
  // 获取地址簿列表
  getAddressBookList: (data: { userId: string }) => 
    request.post(urls.getAddressBookList, data),
  // 管理地址簿
  manageAddressBook: (data: { 
    userId: string; 
    id?: number;
    address?: string; 
    coinId?: number; 
    networkId?: number; 
    operate: number; 
    remark?: string;
  }) => 
    request.post(urls.manageAddressBook, data),
};

export const zoneApi = {
  // 获取专区列表
  getZones: () => 
    request.get(urls.getZones),
  // 获取专区商品列表
  getZoneProducts: (data: any) => 
    request.post(urls.getZoneProducts, data),
  // 获取即将揭晓产品列表
  getWillProducts: (data: any) => 
    request.post(urls.getWillProducts, data),
};
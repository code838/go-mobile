const testServer = 'https://liberty7788.top:7443'
const prodServer = ''

const isTest = true
const server = isTest ? testServer : prodServer

export const getImageUrl = (path: string) => {
  return `${server}${path}`;
}

const apiUrl = `${server}/api`

export const urls = {
  // 认证相关
  login: `${apiUrl}/login`,
  logout: `${apiUrl}/logout`,
  register: `${apiUrl}/register`,
  resetPassword: `${apiUrl}/pwd/reset`,
  sendCaptcha: `${apiUrl}/email/send`,

  // 用户相关
  getUserInfo: `${apiUrl}/user`,
  updateNickname: `${apiUrl}/user/updateNickName`,
  updateEmailOrPhone: `${apiUrl}/user/updateUserName`,
  deleteAccount: `${apiUrl}/account/delete`,
  getInviteRecord: `${apiUrl}/invite/record`,

  // 首页相关
  home: `${apiUrl}/home`,
  homeBuys: `${apiUrl}/home/buys`,
  carousel: `${apiUrl}/carousel`,
  announcement: `${apiUrl}/announcement`,
  message: `${apiUrl}/message`,

  // 购物车相关
  getCartList: `${apiUrl}/cart/list`,
  cartManage: `${apiUrl}/cart/manage`,

  // 订单相关
  orderBuy: `${apiUrl}/order/buy`,
  getOrderList: `${apiUrl}/order/list`,
  getOrderDetail: `${apiUrl}/order/detail`,
  payOrder: `${apiUrl}/order/pay`,
  cancelOrder: `${apiUrl}/order/cancel`,

  // 财务相关
  withdraw: `${apiUrl}/withdraw`,
  getWithdrawFees: `${apiUrl}/withdraw/fee`,
  getCoins: `${apiUrl}/coins`,
  getExchangeConfig: `${apiUrl}/exchange/rate`,
  echange: `${apiUrl}/exchange`,
  getAllRechargeAddresses: `${apiUrl}/user/address`,

  // 地址簿相关
  getAddressBookList: `${apiUrl}/address/withdraw/list`,
  manageAddressBook: `${apiUrl}/address/withdraw/manage`,

  // 系统信息相关
  getProtocol: `${apiUrl}/protocol`,
  getArea: `${apiUrl}/area`,
  getBasicInfo: `${apiUrl}/basic`,
  getServiceInfo: `${apiUrl}/service`,
  getLanguageList: `${apiUrl}/language/get`,

  // 专区相关
  getZones: `${apiUrl}/zone`,
  getZoneProducts: `${apiUrl}/zone/products`,
  getWillProducts: `${apiUrl}/will/products`,

  // 历史揭晓相关
  getHistoryProducts: `${apiUrl}/history/products`,

  // 商品详情相关
  productDetail: `${apiUrl}/product/detail`,
  productBuyUsers: `${apiUrl}/product/buyusers`,
  productHistoryDraws: `${apiUrl}/history/draw/products`,
  productCalcResult: `${apiUrl}/product/calcResult`,
  // getAddressBookList: `${apiUrl}/address/withdraw/list`,
  // manageAddressBook: `${apiUrl}/address/withdraw/manage`,
  // getAllRechargeAddresses: `${apiUrl}/user/address`,
  // getOrderList: `${apiUrl}/order/list`,
  // getOrderDetail: `${apiUrl}/order/detail`,
  // getInviteRecord: `${apiUrl}/invite/record`,
  getThirdLoginInfo: `${apiUrl}/thirdlogin/info`,
  thirdLogin: `${apiUrl}/thirdlogin/login`,
  lotteryInit: `${apiUrl}/lottery/init`,
  lotteryDraw: `${apiUrl}/lottery/draw`,
  lotteryRecord: `${apiUrl}/lottery/record/draw`,
  lotteryAssistRecord: `${apiUrl}/lottery/record/assist`,
}
const testServer = 'https://liberty7788.top:7443'
const prodServer = ''

const isTest = true
const server = isTest ? testServer : prodServer

export const getImageUrl = (path: string) => {
  return `${server}${path}`;
}

const apiUrl = `${server}/api`

export const urls = {
  login: `${apiUrl}/login`,
  logout: `${apiUrl}/logout`,
  register: `${apiUrl}/register`,
  withdraw: `${apiUrl}/withdraw`,
  getWithdrawFees: `${apiUrl}/withdraw/fee`,
  resetPassword: `${apiUrl}/pwd/reset`,
  sendCaptcha: `${apiUrl}/email/send`,
  updateNickname: `${apiUrl}/user/updateNickName`,
  deleteAccount: `${apiUrl}/account/delete`,
  updateEmailOrPhone: `${apiUrl}/user/updateUserName`,
  getCoins: `${apiUrl}/coins`,
  getExchangeConfig: `${apiUrl}/exchange/rate`,
  echange: `${apiUrl}/exchange`,
  getProtocol: `${apiUrl}/protocol`,
  getUserInfo: `${apiUrl}/user`,
  getArea: `${apiUrl}/area`,
  getBasicInfo: `${apiUrl}/basic`,
  getServiceInfo: `${apiUrl}/service`,
  getAddressBookList: `${apiUrl}/address/withdraw/list`,
  manageAddressBook: `${apiUrl}/address/withdraw/manage`,
  getAllRechargeAddresses: `${apiUrl}/user/address`,
  getOrderList: `${apiUrl}/order/list`,
  getOrderDetail: `${apiUrl}/order/detail`,
  getInviteRecord: `${apiUrl}/invite/record`,
}
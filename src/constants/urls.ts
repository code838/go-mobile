const testServer = 'https://liberty7788.top:7443/api'
const prodServer = ''

const isTest = true
const server = isTest ? testServer : prodServer

export const urls = {
  login: `${server}/login`,
  logout: `${server}/logout`,
  register: `${server}/register`,
  withdraw: `${server}/withdraw`,
  resetPassword: `${server}/pwd/reset`,
  sendCaptcha: `${server}/email/send`,
  updateNickname: `${server}/user/updateNickName`,
  deleteAccount: `${server}/account/delete`,
  updateEmailOrPhone: `${server}/user/updateUserName`,
  getCoins: `${server}/coins`,
  getExchangeConfig: `${server}/exchange/rate`,
  echange: `${server}/exchange`,
  getProtocol: `${server}/protocol`,
  getUserInfo: `${server}/user`,
  getArea: `${server}/area`,
  getBasicInfo: `${server}/basic`,
  getServiceInfo: `${server}/service`,
}
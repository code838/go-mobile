/**
 * 充值地址信息
 */
export interface RechargeAddress {
  /** 地址ID */
  id: number;
  /** 币种ID */
  coinId: number;
  /** 币种名称 */
  coinName: string;
  /** 网络ID */
  networkId: number;
  /** 网络名称 */
  network: string;
  /** 充值地址 */
  address: string;
  /** 备注 */
  remark: string;
}

/**
 * 获取充值地址接口请求参数
 */
export interface GetRechargeAddressRequest {
  /** 用户ID */
  userId: number;
}

/**
 * 获取充值地址接口响应
 */
export interface GetRechargeAddressResponse {
  /** 响应码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 充值地址列表 */
  data: RechargeAddress[];
}
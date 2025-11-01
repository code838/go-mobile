export interface AddressBookItem {
  id: number;
  coinId: number;
  coinName: string;
  networkId: number;
  network: string;
  address: string;
  remark: string;
}

export interface AddressBookRequest {
  userId: number;
  address: string;
  coinId: number;
  networkId: number;
  operate: number; // 1:新增， 2：删除， 3:修改
  remark: string;
}

export interface AddressBookQueryRequest {
  userId: number;
}

export interface AddressBookResponse {
  code: number;
  msg: string;
  data: AddressBookItem[] | null;
}

export interface AddressBookOperateResponse {
  code: number;
  msg: string;
  data: null;
}
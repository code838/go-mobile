export interface CoinBalance {
  coinId: number;
  coinName: string;
  balance: string;
}

export interface UserModel {
  userId: string;
  nickName: string;
  photo: string;
  token: string;
  status: number;
  email: string;
  mobile: string | null;
  points: number;
  coinsBalance: CoinBalance[];
  invitePoints: number;
  inviteLink: string;
  inviteUsers: number;
}

export interface RegisterResponse {
  code: number;
  msg: string;
  data: UserModel;
}

export interface InviteRecordItem {
  userId: string;
  nickName: string;
  photo: string;
  time: number;
}

export interface InviteRecordResponse {
  code: number;
  msg: string;
  data: InviteRecordItem[];
}
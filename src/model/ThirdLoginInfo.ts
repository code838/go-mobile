export interface ThirdLoginInfo {
    type: 1 | 2 | 3; // 1: Google, 2: Facebook, 3: Telegram
    clientId: string;
    url: string | null;
    scope: string | null;
}
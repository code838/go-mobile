export interface CoinMessage {
  coinId: number;
  coinName: string;
  logo: string;
  networks: Network[];
}

export interface Network {
  networkId: number;
  network: string;
}
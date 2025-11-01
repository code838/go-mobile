import { OrderItem, OrderStatus, OrderType, ReturnType } from '@/model/Order';

/**
 * 模拟订单数据
 */
export const mockOrderData: OrderItem[] = [
  // 彩票中奖记录
  {
    orderId: 'L001',
    createTime: Date.now() - 86400000, // 1天前
    amount: '1000.00',
    status: OrderStatus.PAID,
    type: OrderType.LOTTERY,
    coinName: 'USDT',
    recvAmount: '1000.00',
    ownerTime: Date.now() - 86400000,
  },
  {
    orderId: 'L002',
    createTime: Date.now() - 172800000, // 2天前
    amount: '500.00',
    status: OrderStatus.PAID,
    type: OrderType.LOTTERY,
    coinName: 'USDT',
    recvAmount: '500.00',
    ownerTime: Date.now() - 172800000,
  },
  
  // 云购订单记录
  {
    orderId: 'U001',
    createTime: Date.now() - 259200000, // 3天前
    amount: '299.99',
    status: OrderStatus.PAID,
    type: OrderType.UBUY,
    productName: 'iPhone 15 Pro Max',
    price: '299.99',
    num: '1',
    finishTime: Date.now() - 259200000,
    coding: 123456,
    products: [{
      productName: 'iPhone 15 Pro Max',
      logo: null,
      price: '299.99',
      serialNumber: 1,
      productNum: 1,
      productValue: '8999.00',
      coding: '123456',
      productAmount: '299.99',
    }],
  },
  {
    orderId: 'U002',
    createTime: Date.now() - 345600000, // 4天前
    amount: '199.99',
    status: OrderStatus.PENDING,
    type: OrderType.UBUY,
    productName: 'MacBook Pro',
    price: '199.99',
    num: '1',
    lastPayTime: Date.now() + 3600000, // 1小时后过期
    coding: 789012,
    products: [{
      productName: 'MacBook Pro',
      logo: null,
      price: '199.99',
      serialNumber: 2,
      productNum: 1,
      productValue: '15999.00',
      coding: '789012',
      productAmount: '199.99',
    }],
  },
  
  // 充值记录
  {
    orderId: 'R001',
    createTime: Date.now() - 432000000, // 5天前
    amount: '1000.00',
    status: OrderStatus.PAID,
    type: OrderType.RECHARGE,
    coinName: 'USDT',
    network: 'TRC20',
    toAddress: 'TXYZabcd1234567890123456789012345678',
    recvAmount: '1000.00',
    fee: '1.00',
    hash: 'abcd1234567890123456789012345678901234567890123456789012345678',
    fromAddress: 'TXYZefgh0987654321098765432109876543',
  },
  {
    orderId: 'R002',
    createTime: Date.now() - 518400000, // 6天前
    amount: '500.00',
    status: OrderStatus.PAID,
    type: OrderType.RECHARGE,
    coinName: 'BTC',
    network: 'Bitcoin',
    toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    recvAmount: '500.00',
    fee: '0.001',
    hash: 'efgh5678901234567890123456789012345678901234567890123456789012',
    fromAddress: 'bc1qmno3456789012345678901234567890123456',
  },
  
  // 提现记录
  {
    orderId: 'W001',
    createTime: Date.now() - 604800000, // 7天前
    amount: '800.00',
    status: OrderStatus.PAID,
    type: OrderType.WITHDRAW,
    coinName: 'USDT',
    network: 'TRC20',
    toAddress: 'TXYZijkl2345678901234567890123456789',
    recvAmount: '790.00',
    fee: '10.00',
    hash: 'ijkl6789012345678901234567890123456789012345678901234567890123',
    fromAddress: 'TXYZmnop8765432109876543210987654321',
    finishTime: Date.now() - 604800000,
  },
  {
    orderId: 'W002',
    createTime: Date.now() - 691200000, // 8天前
    amount: '300.00',
    status: OrderStatus.PENDING,
    type: OrderType.WITHDRAW,
    coinName: 'ETH',
    network: 'ERC20',
    toAddress: '0x1234567890123456789012345678901234567890',
    recvAmount: '295.00',
    fee: '5.00',
  },
  
  // 闪兑记录
  {
    orderId: 'E001',
    createTime: Date.now() - 777600000, // 9天前
    amount: '1000.00',
    status: OrderStatus.PAID,
    type: OrderType.EXCHANGE,
    coinName: 'USDT',
    toAssert: 'BTC',
    num: '1000.00',
    recvAmount: '0.035',
    fee: '0.001',
  },
  {
    orderId: 'E002',
    createTime: Date.now() - 864000000, // 10天前
    amount: '0.5',
    status: OrderStatus.PAID,
    type: OrderType.EXCHANGE,
    coinName: 'BTC',
    toAssert: 'ETH',
    num: '0.5',
    recvAmount: '8.5',
    fee: '0.1',
  },
  
  // 返佣记录
  {
    orderId: 'C001',
    createTime: Date.now() - 950400000, // 11天前
    amount: '50.00',
    status: OrderStatus.PAID,
    type: OrderType.COMMISSION,
    coinName: 'USDT',
    recvAmount: '50.00',
    inviteUserId: 12345,
    inviteUserName: 'user123',
    returnType: ReturnType.REGISTER,
  },
  {
    orderId: 'C002',
    createTime: Date.now() - 1036800000, // 12天前
    amount: '20.00',
    status: OrderStatus.PAID,
    type: OrderType.COMMISSION,
    coinName: 'USDT',
    recvAmount: '20.00',
    inviteUserId: 67890,
    inviteUserName: 'user456',
    returnType: ReturnType.UBUY,
  },
  
  // 上个月的数据
  {
    orderId: 'L003',
    createTime: Date.now() - 2592000000, // 30天前（上个月）
    amount: '2000.00',
    status: OrderStatus.PAID,
    type: OrderType.LOTTERY,
    coinName: 'USDT',
    recvAmount: '2000.00',
    ownerTime: Date.now() - 2592000000,
  },
  {
    orderId: 'U003',
    createTime: Date.now() - 2678400000, // 31天前
    amount: '399.99',
    status: OrderStatus.PAID,
    type: OrderType.UBUY,
    productName: 'iPad Pro',
    price: '399.99',
    num: '1',
    finishTime: Date.now() - 2678400000,
    coding: 345678,
    products: [{
      productName: 'iPad Pro',
      logo: null,
      price: '399.99',
      serialNumber: 3,
      productNum: 1,
      productValue: '6999.00',
      coding: '345678',
      productAmount: '399.99',
    }],
  },
];

/**
 * 根据订单类型过滤模拟数据
 */
export function getMockDataByType(type?: OrderType): OrderItem[] {
  if (type === undefined) {
    return mockOrderData;
  }
  return mockOrderData.filter(item => item.type === type);
}

/**
 * 模拟分页数据
 */
export function getMockPageData(type?: OrderType, pageNo: number = 1, pageSize: number = 20): OrderItem[] {
  const filteredData = getMockDataByType(type);
  const startIndex = (pageNo - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredData.slice(startIndex, endIndex);
}
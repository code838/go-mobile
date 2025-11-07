import { OrderItem, OrderSection, OrderType } from '@/model/Order';
import { format } from 'date-fns';

/**
 * 订单类型图片映射
 */
export const ORDER_TYPE_IMAGES = {
  [OrderType.LOTTERY]: require('@/assets/images/record-type0.png'),
  [OrderType.UBUY]: require('@/assets/images/record-type1.png'),
  [OrderType.RECHARGE]: require('@/assets/images/record-type2.png'),
  [OrderType.WITHDRAW]: require('@/assets/images/record-type3.png'),
  [OrderType.EXCHANGE]: require('@/assets/images/record-type4.png'),
  [OrderType.COMMISSION]: require('@/assets/images/record-type5.png'), // 返佣使用兑换图标
  [OrderType.FREE_RECIVE]: require('@/assets/images/record-type6.png'), // 免费领取使用兑换图标
};

/**
 * 订单类型映射
 */
export const ORDER_TYPE_MAP = {
  [OrderType.LOTTERY]: 'record.lottery',
  [OrderType.UBUY]: 'record.ubuy',
  [OrderType.RECHARGE]: 'record.recharge',
  [OrderType.WITHDRAW]: 'record.withdraw',
  [OrderType.EXCHANGE]: 'record.exchange',
  [OrderType.COMMISSION]: 'record.commission',
  [OrderType.FREE_RECIVE]: 'record.freeRecive',
};

/**
 * 数据按月份分组的工具函数
 * @param orders 订单列表
 * @returns 按月份分组的订单数据
 */
export function groupDataByMonth(orders: OrderItem[]): OrderSection[] {
  const groupedData: { [key: string]: OrderItem[] } = {};
  
  orders.forEach((order) => {
    const date = new Date(order.createTime);
    const monthKey = format(date, 'yyyy-MM');
    
    if (!groupedData[monthKey]) {
      groupedData[monthKey] = [];
    }
    groupedData[monthKey].push(order);
  });

  // 按月份倒序排列
  return Object.keys(groupedData)
    .sort((a, b) => b.localeCompare(a))
    .map((monthKey) => ({
      title: monthKey,
      data: groupedData[monthKey].sort((a, b) => b.createTime - a.createTime),
    }));
}

/**
 * 计算金额显示
 * @param item 订单项
 * @returns 格式化后的金额和正负标识
 */
export function getAmountDisplay(item: OrderItem): { amount: string; isPositive: boolean } {
  const amount = parseFloat(item.amount);
  let isPositive = true;
  let displayAmount = item.amount;

  // 根据订单类型判断金额正负
  switch (item.type) {
    case OrderType.WITHDRAW:
    case OrderType.UBUY:
      isPositive = false;
      displayAmount = amount > 0 ? `-${item.amount}` : item.amount;
      break;
    case OrderType.RECHARGE:
    case OrderType.LOTTERY:
    case OrderType.COMMISSION:
      isPositive = true;
      displayAmount = amount > 0 ? `+${item.amount}` : item.amount;
      break;
    case OrderType.EXCHANGE:
      // 闪兑显示到账金额
      if (item.recvAmount) {
        const recvAmount = parseFloat(item.recvAmount);
        isPositive = recvAmount >= 0;
        displayAmount = recvAmount >= 0 ? `+${item.recvAmount}` : item.recvAmount;
      }
      break;
  }

  // 添加币种信息
  if (item.coinName) {
    displayAmount += ` ${item.coinName}`;
  } else if (item.toAssert) {
    displayAmount += ` ${item.toAssert}`;
  }

  return { amount: displayAmount, isPositive };
}

/**
 * 获取订单标题
 * @param item 订单项
 * @param t 翻译函数
 * @returns 订单标题
 */
export function getOrderTitle(item: OrderItem, t: (key: string) => string): string {
  switch (item.type) {
    case OrderType.UBUY:
      return item.productName || t(ORDER_TYPE_MAP[item.type]);
    case OrderType.COMMISSION:
      return item.returnType === 1 ? t('record.return.register') : t('record.return.ubuy');
    default:
      return t(ORDER_TYPE_MAP[item.type]);
  }
}
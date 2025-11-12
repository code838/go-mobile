/**
 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // 邮箱正则：基本格式验证
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // 手机号正则：纯数字，长度一般为5-15位（适配国际号码）
  const phoneRegex = /^\d{5,15}$/;
  return phoneRegex.test(phone);
}


import * as Crypto from 'expo-crypto';

/**
 * 使用MD5加密密码
 * @param password 明文密码
 * @returns MD5加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, password);
}

/**
 * 生成5-10位随机数字字符串
 * @returns 随机nonce字符串
 */
export function generateNonce(): string {
  const length = Math.floor(Math.random() * 6) + 5; // 5-10位
  return Math.random().toString(36).substr(2, length).padEnd(length, '0');
}

/**
 * 生成登录签名
 * sign = md5(content + nonce + md5(明文密码) + timestamp)
 * @param content 账号内容
 * @param nonce 随机数
 * @param plainPassword 明文密码
 * @param timestamp 时间戳
 * @returns 签名字符串
 */
export async function generateLoginSign(
  content: string,
  nonce: string,
  plainPassword: string,
  timestamp: number
): Promise<string> {
  const hashedPassword = await hashPassword(plainPassword);
  const signString = content + nonce + hashedPassword + timestamp;
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, signString);
}
// src/utils/crypto.ts
// AES 对称加密/解密工具

import CryptoJS from 'crypto-js'

/** 加密密钥 - 生产环境应从服务端获取或使用环境变量 */
const AES_KEY = import.meta.env.VITE_AES_KEY || 'vue-demo-aes-key-2024'
/** AES 偏移量 */
const AES_IV = 'vue-demo-iv-2024!'

/**
 * AES 加密
 * @param text 明文
 * @returns Base64 密文
 */
export function encrypt(text: string): string {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY.padEnd(32).slice(0, 32))
  const iv = CryptoJS.enc.Utf8.parse(AES_IV)
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

/**
 * AES 解密
 * @param ciphertext Base64 密文
 * @returns 明文
 */
export function decrypt(ciphertext: string): string {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY.padEnd(32).slice(0, 32))
  const iv = CryptoJS.enc.Utf8.parse(AES_IV)
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * 加密对象中的指定字段
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    const value = result[field]
    if (typeof value === 'string') {
      result[field] = encrypt(value) as T[keyof T]
    }
  }
  return result
}

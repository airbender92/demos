// src/utils/request.ts

import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './auth'
import router from '@/router'

/** 扩展 Axios 配置支持缓存开关 */
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  cache?: boolean
}

/** 生成请求缓存 key */
function generateCacheKey(config: CustomAxiosRequestConfig): string {
  const { url, method, params, data } = config
  return `${method || 'GET'}_${url}_${JSON.stringify(params || {})}_${JSON.stringify(data || {})}`
}

/** 请求缓存项 */
interface CacheItem {
  data: unknown
  expire: number
}

class Request {
  instance: AxiosInstance
  pendingMap: Map<string, AbortController>
  cacheMap: Map<string, CacheItem>
  cacheTime: number

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 15000,
    })
    this.pendingMap = new Map()
    this.cacheMap = new Map()
    this.cacheTime = 5 * 60 * 1000 // 5分钟缓存

    this.setupInterceptors()
  }

  /** 设置拦截器 */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加 token
        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 防重复请求
        this.addPending(config)

        // 请求缓存（仅 GET）
        const customConfig = config as CustomAxiosRequestConfig
        if (customConfig.method?.toLowerCase() === 'get' && customConfig.cache !== false) {
          const cacheKey = generateCacheKey(customConfig)
          const cached = this.cacheMap.get(cacheKey)
          if (cached && cached.expire > Date.now()) {
            // 取消当前请求，使用缓存
            this.removePending(config)
            return Promise.reject({ __cached: true, data: cached.data })
          }
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data, config } = response

        // 移除已完成请求
        this.removePending(config as CustomAxiosRequestConfig)

        // 缓存 GET 响应
        if (config.method?.toLowerCase() === 'get') {
          const cacheKey = generateCacheKey(config as CustomAxiosRequestConfig)
          this.cacheMap.set(cacheKey, {
            data,
            expire: Date.now() + this.cacheTime,
          })
        }

        const { code, message } = data

        // 业务错误处理
        if (code !== 0 && code !== 200) {
          ElMessage.error(message || '请求失败')

          // 401 未登录或 token 过期
          if (code === 401) {
            this.handleUnauthorized()
          }

          // 403 无权限
          if (code === 403) {
            ElMessage.error('无权限访问')
          }

          return Promise.reject(new Error(message || '请求失败'))
        }

        return response
      },
      (error) => {
        // 移除失败请求
        if (error.config) {
          this.removePending(error.config as CustomAxiosRequestConfig)
        }

        // 缓存请求直接返回
        if (error.__cached) {
          return Promise.resolve(error.data)
        }

        const { response } = error

        if (response) {
          const { status } = response
          switch (status) {
            case 401:
              this.handleUnauthorized()
              break
            case 403:
              ElMessage.error('无权限访问')
              break
            case 404:
              ElMessage.error('请求资源不存在')
              break
            case 500:
              ElMessage.error('服务器错误')
              break
            default:
              ElMessage.error(response.data?.message || '请求失败')
          }
        } else {
          if (error.message === 'Network Error') {
            ElMessage.error('网络异常，请检查网络连接')
          } else if (error.message.includes('timeout')) {
            ElMessage.error('请求超时')
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /** 添加请求到 pending 列表 */
  private addPending(config: CustomAxiosRequestConfig): void {
    const cacheKey = generateCacheKey(config)
    if (this.pendingMap.has(cacheKey)) {
      const controller = this.pendingMap.get(cacheKey)
      controller?.abort()
      this.pendingMap.delete(cacheKey)
    }

    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingMap.set(cacheKey, controller)
  }

  /** 移除已完成请求 */
  private removePending(config: CustomAxiosRequestConfig): void {
    const cacheKey = generateCacheKey(config)
    this.pendingMap.delete(cacheKey)
  }

  /** 处理未授权 */
  private handleUnauthorized(): void {
    removeToken()
    router.push('/login')
    ElMessage.warning('登录已过期，请重新登录')
  }

  /** GET 请求 */
  get<T = unknown>(url: string, config?: CustomAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config)
  }

  /** POST 请求 */
  post<T = unknown>(url: string, data?: unknown, config?: CustomAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config)
  }

  /** PUT 请求 */
  put<T = unknown>(url: string, data?: unknown, config?: CustomAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config)
  }

  /** DELETE 请求 */
  delete<T = unknown>(url: string, config?: CustomAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config)
  }

  /** 清除缓存 */
  clearCache(): void {
    this.cacheMap.clear()
  }
}

export const request = new Request()
export default request

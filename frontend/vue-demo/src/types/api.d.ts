// src/types/api.d.ts

/** API 响应结构 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 登录请求参数 */
interface LoginRequest {
  username: string
  password: string
}

/** 登录响应 */
interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

/** 分页响应 */
interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

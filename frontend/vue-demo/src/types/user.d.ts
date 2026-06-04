// src/types/user.d.ts

/** 用户信息 */
interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
}

/** 登录凭证 */
interface Credentials {
  username: string
  password: string
}

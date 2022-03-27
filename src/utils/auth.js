import Cookies from 'js-cookie'

const TokenKey = 'MS_TOKEN' // 存储 token 的 key

// 获取 token
export function getToken() {
  return Cookies.get(TokenKey)
}

// 存储 token
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

// 删除 token
export function removeToken() {
  return Cookies.remove(TokenKey)
}

const TimeKey = 'MS_TIMES_TEMP' // 存储保存 token 的时间的 key

// 获取保存token的时间戳
export function getTimesTemp() {
  return Cookies.get(TimeKey)
}

// 存储保存 token 的时间戳
export function setTimesTemp() {
  return Cookies.set(TimeKey, Date.now())
}

// 用户信息模块

// 封装存储token到缓存（目的：持久化）
import { getToken, setToken, removeToken } from '@/utils/auth'
// 导入获取存储token的时间戳
import { setTimesTemp } from '@/utils/auth'
// 导入请求api
import { login, getUserInfo, getUserDetailById } from '@/api/user'

const state = {
  token: getToken() || null, // 当 vuex 一初始化的时候从本地获取 token
  userInfo: {} // 定义一个空对象, 不能是null
}
const mutations = {

  // 1、更新 token
  setToken(state, token) {
    // 1.1、更新 vuex 中的 token
    state.token = token
    // 1.2、重新存储 token 到缓存
    setToken(token)
  },

  // 2、移除 token
  removeToken(state) {
    // 2.1、将 vuex 中的 token 置空
    state.token = null
    // 2.2、将缓存中的 token 移除
    removeToken()
  },

  // 3、保存用户信息 userInfo
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  },

  // 4、删除用户信息 userInfo
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
const actions = {
  // 登录
  async login(context, data) {
    // 调用 login 登录接口，返回 token
    // 当这里能拿到结果则，表示执行成功
    // 当拿不到结果，在响应拦截器已经做了对应错误提示
    const token = await login(data)
    // 登录成功 通过调用 mutations 中的方法保存 token 到 vuex
    context.commit('setToken', token)
    // 记录获取 token 的时间到缓存中，用来判断 token 是否过期
    setTimesTemp()
  },

  // 获取用户信息
  async getUserInfo(context) {
    // 获取用户信息，必须在有 token 的地方才能获取信息
    // 在前置路由守卫 有确保有 token 的情况
    const res = await getUserInfo()
    // 获取用户详细信息
    const baseInfo = await getUserDetailById(res.userId)

    // 保存用户信息到 vuex
    context.commit('setUserInfo', { ...res, ...baseInfo })
    // ？
    return res
  },

  // 退出
  logout(context) {
    // 删除 token
    context.commit('removeToken')
    context.commit('removeUserInfo')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

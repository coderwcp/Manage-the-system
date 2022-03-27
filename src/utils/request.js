// 导入axios
import axios from 'axios'
// 导入 element-ui 的提示组件
import { Message } from 'element-ui'
// 导入 vuex
import store from '@/store'
// 导入获取保存token的时间戳
import { getTimesTemp } from './auth'
// 定义 token 的有效期
const TimeOut = 3600
// 导入路由
import router from '@/router'

// 创建实例
const request = axios.create({
  // 基地址
  // 当执行 npm run dev 的时候会读取 .env.development 文件 => /api => 跨域
  // 当执行 npm run build 的时候会读取 .env.production 文件 => /prod-api
  baseURL: process.env.VUE_APP_BASE_API, // /api
  // 超时时间
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 请求配置对象
    if (store.getters.token) {
      // 主动处理 token，判断是否有 token，添加请求头携带 token
      // 只有有 token 的时候才会判断是否 token 有效 checkTimeout() 返回true时则表示token失效了
      if (checkTimeout()) {
        // token 超时
        // 调用登出方法
        store.dispatch('user/logout')
        // // 跳转到 login 页面
        router.push('/login')
        // // 返回错误
        // Message.error('身份认证失败，请重新登录！')
        return Promise.reject(new Error('身份认证失败，请重新登录！'))
      }
      config.headers['Authorization'] = `Bearer ${store.getters.token}`
    }
    // 必须返回请求配置对象才能发起请求
    return config
  },
  error => {
    console.dir(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 响应数据解构
    const { success, data, message } = response.data
    // 当 success 为 false 则表示业务出错，
    if (!success) {
      Message.error(message) // 提示错误
      // 不能进入 then() 而进入 catch() 中
      // 就是在 promise 中 执行了 resolve(Promise.reject(new Error(message))) 进入到 catch()
      return Promise.reject(new Error(message))
    }
    // 当返回的 success 为 true 则表示返回数据成功
    return data
  },
  error => {
    console.dir(error)
    // 被动处理 token
    // 当 token 失效，响应结果会报错，返回的报错中的response=>data=>{code: 10002, message: "您还未登录", success: false}
    if (error.response && error.response.status === 401) {
      // 登出，清除 token 后才能跳转到 login 页面
      store.dispatch('user/logout')
      // 跳转登录页面
      router.push('/login')
    } else {
      Message.error(error.message) // 提示错误
    }
    // 返回 Promise.reject() 进入 catch() 捕获错误，并继续执行
    return Promise.reject(error)
  }
)

// 定义判断 token 超时方法
function checkTimeout() {
  const currentTime = Date.now() // 获取当前时间
  const timesTemp = getTimesTemp() // 获取保存 token 的时间戳
  return ((currentTime - timesTemp) / 1000) > TimeOut
}

// 默认导出
export default request

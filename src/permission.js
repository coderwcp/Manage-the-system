// 权限管理

// 导入路由, 不需要执行
import router from '@/router'
import store from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const whiteList = ['/login', '/404']

// 前置路由守卫
router.beforeEach(async(to, from, next) => {
  // 跳转之前，进度条开始
  NProgress.start()
  // 判断是否有 token
  if (store.getters.token) {
    // 有 token 判断是否去往登录页
    if (to.path === '/login') {
      // 有 token 去往登录页，则直接去往主页
      next('/')
    } else {
      // 在这里获取用户信息，首先判断是否有用户信息，没有则获取
      if (!store.getters.userId) {
        // 因为获取用户信息是异步的，必须等到获取到信息再放行路由
        await store.dispatch('user/getUserInfo')
      }
      // 有 token 直接放行
      next()
    }
  } else {
    // 没有 token 判断去往的页面是否在白名单内
    // 去往页面不需要 token
    if (whiteList.includes(to.path)) {
      // 直接放行
      next()
    } else {
      // 去往登录
      next('/login')
    }
  }
  // 手动关闭进度条，手动在地址栏跳转，不会执行后置路由守卫
  NProgress.done()
})

router.afterEach(() => {
  // 跳转完成 结束进度条
  NProgress.done()
})

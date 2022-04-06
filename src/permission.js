// 权限管理

// 导入路由, 不需要执行
import router from '@/router'
import store from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const whiteList = ['/login', '/404']
// import { constantRoutes } from '@/router'

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
        // // 简化写法
        // // 因为获取用户信息是异步的，必须等到获取到信息再放行路由
        // // 1、获取到角色权限菜单
        // const { roles: { menus }} = await store.dispatch('user/getUserInfo')
        // console.log(menus)
        // store.dispatch('permission/filterRouters', menus)
        // // 2、根据权限菜单筛选出对应的动态路由
        // const filterRouters = asyncRoutes.filter(item => menus.includes(item.name))

        // // 3、将动态路由添加到路由表
        // // 5、为了保证404页面在路由表的最后面，需要从静态路由中放到这里
        // router.addRoutes([...filterRouters, { path: '*', redirect: '/404', hidden: true }])

        // // 4、因为addRoutes不能触发初始化，手动触发
        // router.options.routes = [...constantRoutes, ...filterRouters]
        // // 多执行一次，防止刷新返回不了上一个页面
        // return next(to.path)

        // 标准写法
        // 1、获取到角色权限菜单
        const { roles: { menus }} = await store.dispatch('user/getUserInfo')
        console.log(menus)
        // 2、根据权限菜单筛选出对应的动态路由，调用actions中的筛选路由方法
        const filterRoutes = await store.dispatch('permission/filterRoutes', menus)
        // 3、将动态路由添加到路由表
        // 5、为了保证404页面在路由表的最后面，需要从静态路由中放到这里
        router.addRoutes([...filterRoutes, { path: '*', redirect: '/404', hidden: true }])
        // console.log(router)
        // 多执行一次，防止刷新返回不了上一个页面
        return next(to.path)
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

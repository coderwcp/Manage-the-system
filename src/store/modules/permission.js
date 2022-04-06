/**
 *  Vuex 权限模块
 */

import { asyncRoutes, constantRoutes } from '@/router'

const state = {
  // 所有人默认拥有的静态路由
  routes: constantRoutes
}

const mutations = {
  setRoutes(state, newRoutes) {
    // 添加路由都是在静态路由基础上添加
    state.routes = [...constantRoutes, ...newRoutes]
  }
}

const actions = {
  // 根据角色的权限列表来筛选路由
  // menus: ['settings','permissions']
  // asyncRoutes 是所有的动态路由
  // 筛选 asyncRoutes 后 => [{path: 'settings',name: 'settings'},{},....]
  filterRoutes(context, menus) {
    // const routes = []
    // // 根据菜单筛选匹配的路由name属性
    // menus.forEach(name => {
    //   // asyncRoutes.filter(item => item.name === name)
    //   routes.push(...asyncRoutes.filter(item => item.name === name))
    // })

    // // state中的路由用于展示菜单的 将根据权限列表筛选的路由和静态路由进行合并，用于展示左侧菜单的
    // context.commit('setRoutes', routes)
    // // 将筛选出来的动态路由需要通过router.addRoutes添加到路由表中
    // return routes

    // // 根据菜单筛选匹配的路由name属性
    const filterRouters = asyncRoutes.filter(item => menus.includes(item.name))
    // 修改 state 中的 route
    context.commit('setRoutes', filterRouters)
    return filterRouters
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

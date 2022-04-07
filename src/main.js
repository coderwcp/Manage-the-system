import Vue from 'vue'
import App from './App'
import store from './store' // 导入vuex
import router from './router' // 导入路由
import 'normalize.css/normalize.css' // 样式初始化
import checkPermission from './mixin/checkPermission' // 检查菜单权限
import i18n from '@/lang/index.js' // 多语言切换
import ElementUI from 'element-ui' // ui组件
import 'element-ui/lib/theme-chalk/index.css' // ui组件样式
// import locale from 'element-ui/lib/locale/lang/en' // 语言包
import Print from 'vue-print-nb' // 导入打印功能的插件
import '@/styles/index.scss' // 全局样式
import '@/icons' // icon图标
import '@/permission' // 路由权限控制
import component from '@/components' // 导入自定义定义的全局组件
import * as directives from '@/directives' // 导入所有自定义指令的对象，并设置别名来接收
import * as filters from '@/filters' // 遍历所有的导出的过滤器对象 完成自定义全局注册

// 批量注册过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 遍历所有的导出的指令对象 完成自定义全局注册
Object.keys(directives).forEach(key => {
  Vue.directive(key, directives[key])
})

// 全局挂载检查按钮权限方法
// 方法一：挂载原型对象里
// Vue.prototype.checkPermission = function(key) {
//   try {
//     return this.$store.state.user.userInfo.roles.points.includes(key)
//   } catch (err) {
//     console.log(err)
//     return false
//   }
// }
// 方式二：全局混入
Vue.mixin(checkPermission)

// 全局注册打印组件
Vue.use(Print)
// 注册自定义定义的全局组件
Vue.use(component)
// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// 设置element为当前的语言
Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n, // 将 $i18n 属性挂载到每一个组件身上
  render: h => h(App)
})
// console.log(new Vue())

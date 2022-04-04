import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
// 导入打印功能的插件
import Print from 'vue-print-nb'

import '@/styles/index.scss' // 全局样式

import '@/icons' // icon
import '@/permission' // permission control
// 导入自定义定义的全局组件
import component from '@/components'
// 导入所有自定义指令的对象，并设置别名来接收
import * as directives from '@/directives'

import * as filters from '@/filters'
// 遍历所有的导出的过滤器对象 完成自定义全局注册
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 遍历所有的导出的指令对象 完成自定义全局注册
Object.keys(directives).forEach(key => {
  Vue.directive(key, directives[key])
})

Vue.use(Print)
// 注册自定义定义的全局组件
Vue.use(component)
// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
// console.log(new Vue())

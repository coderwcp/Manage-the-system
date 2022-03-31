// 注册全局公共组件 Vue.use

import PageTools from './PageTools'

import UploadExcel from './UploadExcel'

export default {
  install(Vue) {
    Vue.component('PageTools', PageTools)
    Vue.component('UploadExcel', UploadExcel)
  }
}

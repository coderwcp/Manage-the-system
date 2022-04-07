// 注册全局公共组件 Vue.use

import PageTools from './PageTools'

import UploadExcel from './UploadExcel'

import ImageUpload from './ImageUpload'

import ScreenFull from './ScreenFull'

import ThemePicker from './ThemePicker'

import TagsView from './TagsView'

export default {
  install(Vue) {
    Vue.component('PageTools', PageTools)
    Vue.component('UploadExcel', UploadExcel)
    Vue.component('ImageUpload', ImageUpload)
    Vue.component('ScreenFull', ScreenFull)
    Vue.component('ThemePicker', ThemePicker)
    Vue.component('TagsView', TagsView)
  }
}

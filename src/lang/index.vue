<template>
  <el-dropdown trigger="click" @command="changeLanguage">
    <div>
      <svg-icon icon-class="language" style="color:#fff;font-size:20px" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="zh" :disabled="'zh' === $i18n.locale">中文</el-dropdown-item>
      <el-dropdown-item command="en" :disabled="'en' === $i18n.locale">en</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import Cookie from 'js-cookie'
export default {
  methods: {
    changeLanguage(lang) {
      Cookie.set('language', lang) // 本地存储当前语言，防止刷新重置
      this.$i18n.locale = lang
      this.$message.success('切换语言成功')
    }
  }
}
</script>

<style>

</style>

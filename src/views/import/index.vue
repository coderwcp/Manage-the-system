<template>
  <upload-excel :on-success="success" />
</template>

<script>
import { importEmployee } from '@/api/employees'
export default {
  name: 'Import',
  data() {
    return {
      type: this.$route.query.type
    }
  },
  methods: {
    async success({ header, results }) {
      if (this.type === 'user') {
        const userRelations = {
          '入职日期': 'timeOfEntry',
          '手机号': 'mobile',
          '姓名': 'username',
          '转正日期': 'correctionTime',
          '工号': 'workNumber'
        }
        const arr = []
        // 遍历所有的数据
        results.forEach(item => {
          const userInfo = {}
          // 将每一天的中文属性转为英文
          Object.keys(item).forEach(key => {
            // key 是中文的时间 找到对应的事件进行格式化
            if (userRelations[key] === 'timeOfEntry' || userRelations[key] === 'correctionTime') {
              // 将时间格式化后才能入库
              userInfo[userRelations[key]] = new Date(this.formatDate(item[key], '/'))
            }
            userInfo[userRelations[key]] = item[key]
          })
          // 最终 userInfo 变成全是英文
          arr.push(userInfo)
        })
        await importEmployee(arr)
        this.$message.success('导入成功')
      }
      this.$router.back() // 返回上一级
    },
    formatDate(num, format) {
      const time = new Date((num - 1) * 24 * 3600000 + 1)
      time.setFullYear(time.getFullYear() - 70)
      const year = time.getFullYear() + ''
      const month = time.getMonth() + 1 + ''
      const date = time.getDate() - 1 + ''
      if (format && format.length === 1) {
        return year + format + month + format + date
      }
      return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
    }
  }
}
</script>

<style>

</style>

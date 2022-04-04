<template>
  <el-dialog title="分配角色" :visible="showRoleDialog" @close="close">
    <el-checkbox-group v-model="roleIds">
      <!-- label 表示要存储的值 -->
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button type="primary" size="small" @click="confirm">确定</el-button>
        <el-button size="small" @click="close">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getRoleList } from '@/api/setting'
import { getUserDetailById } from '@/api/user'
import { assignRoles } from '@/api/employees'
export default {
  name: 'AssignRole',
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: [],
      roleIds: []
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { rows } = await getRoleList({ page: 1, pagesize: 20 }) // 先给定20条，角色不会太多
      this.list = rows
    },
    close() {
      // 清空 选中数组
      this.roleIds = []
      // 关闭弹出层
      this.$emit('update:showRoleDialog', false)
    },
    async confirm() {
      // console.log('confirm')
      // 分配角色
      await assignRoles({ id: this.userId, roleIds: this.roleIds })
      this.$message.success('修改成功')
      // 关闭弹层
      this.close()
    },
    // 获取员工角色id (提供给父组件使用的)
    async getUserDetailById(id) {
      const { roleIds } = await getUserDetailById(id)
      this.roleIds = roleIds || []
    }
  }
}
</script>

<style>
</style>

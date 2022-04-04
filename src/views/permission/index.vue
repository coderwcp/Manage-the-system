<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools>
        <template v-slot:after>
          <el-button
            type="primary"
            size="samll"
            @click="addPermission(0,1)"
          >添加权限</el-button>
        </template>
      </page-tools>
      <el-table style="width: 100%" :data="list" border="" row-key="id" default-expand-all>
        <el-table-column width="300" label="名称" prop="name" />
        <el-table-column align="center" label="标识" prop="code" />
        <el-table-column align="center" label="描述" prop="description" />
        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <el-button
              v-if="row.type === 1"
              type="text"
              @click="addPermission(row.id, 2)"
            >添加</el-button>
            <el-button
              type="text"
              @click="editPermission(row.id)"
            >编辑</el-button>
            <el-button
              type="text"
              @click="delPermission(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="`${title}权限点`"
        :visible="showPermissionDialog"
        @close="close"
      >
        <el-form
          ref="perForm"
          :model="formData"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="formData.name" style="width: 90%" />
          </el-form-item>
          <el-form-item label="权限标识" prop="code">
            <el-input v-model="formData.code" style="width: 90%" />
          </el-form-item>
          <el-form-item label="权限描述">
            <el-input v-model="formData.description" style="width: 90%" />
          </el-form-item>
          <el-form-item label="开启">
            <el-switch
              v-model="formData.enVisible"
              active-value="1"
              inactive-value="0"
            />
          </el-form-item>
        </el-form>
        <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
            <el-button size="small" @click="close">取消</el-button>
            <el-button
              size="small"
              type="primary"
              @click="confirm"
            >确定</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import PageTools from '@/components/PageTools/index'
import { addPermission, delPermission, getPermissionList, updatePermission, getPermissionDetail } from '@/api/permission'
import { tranListToTreeData } from '@/utils'
export default {
  name: 'Permisson',
  components: { PageTools },
  data() {
    return {
      list: [],
      formData: {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      },
      rules: {
        name: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '权限标识不能为空', trigger: 'blur' }]
      },
      showPermissionDialog: false
    }
  },
  computed: {
    title() {
      return this.formData.id ? '编辑' : '新增'
    }
  },
  created() {
    this.getPermissionList()
  },
  methods: {
    async getPermissionList() {
      this.list = tranListToTreeData(await getPermissionList(), '0')
    },
    close() {
      this.formData = {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      }
      // 移除校验
      this.$refs.perForm.resetFields()
      this.showPermissionDialog = false
    },
    async confirm() {
      try {
        // 手动校验
        await this.$refs.perForm.validate()
        // 调用添加接口
        let message
        if (this.formData.id) {
          await updatePermission(this.formData)
          message = '更新成功'
        } else {
          await addPermission(this.formData)
          message = '添加成功'
        }
        this.$message.success(message)
        this.getPermissionList() // 更新数据
        // 关闭弹出层
        this.close()
      } catch (err) {
        console.log(err)
      }
    },
    async addPermission(pid, type) {
      this.formData.pid = pid
      this.formData.type = type
      this.showPermissionDialog = true
    },
    async editPermission(id) {
      // 根据id获取权限详情
      this.formData = await getPermissionDetail(id)
      this.showPermissionDialog = true
    },
    async delPermission(id) {
      try {
        await this.$confirm('是否确认删除该权限')
        // 调用删除接口
        await delPermission(id)
        this.$message.success('删除成功')
        // 更新数据
        this.getPermissionList()
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style>
</style>

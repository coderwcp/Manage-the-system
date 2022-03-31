<template>
  <el-dialog title="新增员工" :visible="showDialog" @close="close">
    <!-- 表单 -->
    <el-form ref="formData" label-width="120px" :model="formData" :rules="rules">
      <el-form-item label="姓名" prop="username">
        <el-input v-model="formData.username" style="width:50%" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="formData.mobile" style="width:50%" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="入职时间" prop="timeOfEntry">
        <el-date-picker v-model="formData.timeOfEntry" style="width:50%" placeholder="请选择入职时间" />
      </el-form-item>
      <el-form-item label="聘用形式" prop="formOfEmployment">
        <el-select v-model="formData.formOfEmployment" style="width:50%" placeholder="请选择">
          <el-option v-for="item in employeeEnum.hireType" :key="item.id" :label="item.value" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="工号" prop="workNumber">
        <el-input v-model="formData.workNumber" style="width:50%" placeholder="请输入工号" />
      </el-form-item>
      <el-form-item label="部门" prop="departmentName">
        <el-input v-model="formData.departmentName" style="width:50%" placeholder="请选择部门" @focus="getDepartments" />
        <el-tree
          v-if="showTree"
          v-loading="loading"
          :data="treeData"
          default-expand-all=""
          :props="{label: 'name'}"
          @node-click="selectNode"
        />
      </el-form-item>
      <el-form-item label="转正时间" prop="createTime">
        <el-date-picker v-model="formData.createTime" style="width:50%" placeholder="请选择转正时间" />
      </el-form-item>
    </el-form>
    <!-- footer插槽 -->
    <template v-slot:footer>
      <el-row type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" @click="close">取消</el-button>
          <el-button type="primary" size="small" @click="confirm">确定</el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>
</template>

<script>
import { addEmployee } from '@/api/employees'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils'
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    employeeEnum: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false, // 控制树的显示或者隐藏进度条
      treeData: [], // 定义数组接收树形数据
      showTree: false, // 控制树形的显示或者隐藏
      formData: {
        // username: '张三',
        // mobile: '13355677987',
        // timeOfEntry: '2020',
        // formOfEmployment: '1',
        // workNumber: '111',
        // departmentName: '法外狂徒部',
        // createTime: '2022'
        username: '',
        mobile: '',
        timeOfEntry: '',
        formOfEmployment: '',
        workNumber: '',
        departmentName: '',
        createTime: ''
      },
      rules: {
        username: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { min: 1, max: 4, message: '姓名长度 1-4 位', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        timeOfEntry: [
          { required: true, message: '入职时间不能为空', trigger: 'blur' }
        ],
        formOfEmployment: [
          { required: true, message: '聘用形式不能为空', trigger: 'blur' }
        ],
        workNumber: [
          { required: true, message: '工号不能为空', trigger: 'blur' }
        ],
        departmentName: [
          { required: true, message: '部门不能为空', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '转正时间不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    close() {
      // 重置表单数据
      this.formData = {
        username: '',
        mobile: '',
        timeOfEntry: '',
        formOfEmployment: '',
        workNumber: '',
        departmentName: '',
        createTime: ''
      }
      // 重置校验
      this.$refs.formData.resetFields()
      // 关闭弹出层
      this.$emit('update:showDialog', false)
    },
    async confirm() {
      try {
        // 手动表单校验
        await this.$refs.formData.validate()
        // 校验成功，请求接口
        await addEmployee(this.formData)
        // 提示成功
        this.$message.success('添加成功')
        // 获取最新数据
        this.$emit('addEmployee')
        // 关闭弹出层
        this.close()
      } catch (err) {
        console.log(err)
      }
    },
    async getDepartments() {
      // 显示tree组件
      this.showTree = true
      // 显示加载状态
      this.loading = true
      // 获取部门结构
      const { depts } = await getDepartments()
      // 将部门转化为树形结构
      this.treeData = tranListToTreeData(depts, '')
      // 关闭加载状态
      this.loading = false
    },
    selectNode(node) {
      // 将点击的部门赋值给表单中的部门
      this.formData.departmentName = node.name
      // 隐藏 tree 节点
      this.showTree = false
    }
  }
}
</script>

<style>

</style>

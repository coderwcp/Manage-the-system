<template>
  <!-- 新增部门的弹层 -->
  <!-- 当点击编辑的时候 formData 中就仅仅只有当前定义的四条数据 -->
  <el-dialog :title="title" :visible="showDialog" @close="close">
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <el-form ref="formData" label-width="120px" :rules="formRules" :model="formData">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" style="width:80%" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" style="width:80%" placeholder="请输入部门编码" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" @focus="getEmployeeSimple">
          <el-option v-for="item in peoples" :key="item.id" :value="item.username" :label="item.username" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 列被分为24 -->
      <el-col :span="6">
        <el-button size="small" @click="close">取消</el-button>
        <el-button type="primary" size="small" @click="confirm">确定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getDepartments, addDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'

export default {
  name: 'AddDept',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    // 自定义校验部门名称是否重复(这里只能使用箭头函数, 里面使用到this, 定义时this就绑定给data)
    const checkNameRepeat = async(rule, value, callback) => {
      // 获取最新的数据,判断操作当前部门下是否有同名部门
      const { depts } = await getDepartments()
      let isRepeat = false
      // 判断是编辑部门还是新增部门
      if (this.formData.id) {
        // 编辑部门
        // 当前编辑的 treeNode 就不是父部门，
        //   条件一：查找同级部门下所有的部门（item.pid === this.treeNode.pid）
        //   条件二：且不包含当前编辑的部门（item.id !== this.formData.id）
        isRepeat = depts.filter(item => item.pid === this.treeNode.pid && item.id !== this.formData.id).some(item => item.name === value)
      } else {
        // 新增部门
        // 先筛选当前操作部门下的子部门
        // 再判断子部门的名字是否和当前 value 重复
        isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      }
      isRepeat ? callback(new Error(`当前部门下已存在${value}`)) : callback()
    }
    // 自定义校验部门编码是否重复
    const checkCodeRepeat = async(rule, value, callback) => {
      // 获取所有最新的部门信息
      const { depts } = await getDepartments()
      let isRepeat = false
      // 判断是编辑部门还是新增部门
      if (this.formData.id) {
        // 编辑部门
        // 判断除当前编辑部门（this.formData）外的 code 是否重复
        isRepeat = depts.some(item => item.code === value && value && item.id !== this.formData.id)
      } else {
        // 新增部门
        // 遍历所有的元素的code是否和当前value重复，且不能为空
        isRepeat = depts.some(item => item.code === value && value)
      }

      isRepeat ? callback(new Error(`组织中已存在当前编码`)) : callback()
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      formRules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' },
          { validator: checkNameRepeat, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '部门编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' },
          { validator: checkCodeRepeat, trigger: 'blur' }
        ],
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
        introduce: [
          { required: true, message: '部门介绍不能为空', trigger: 'blur' },
          { trigger: 'blur', min: 1, max: 300, message: '部门介绍要求1-50个字符' }
        ]
      },
      peoples: []
    }
  },
  computed: {
    title() {
      return this.formData.id ? '编辑部门' : '新增部门'
    }
  },
  methods: {
    close() {
      // 传统方式修改父组件中传递的props值需要自定义一个事件传到父组件
      // 然后在父组件中监听传递的事件名称，然后执行修改值
      // <add-dept :show-dialog="showDialog" @close="showDialog = $event" />
      // this.$emit('close', false)
      // 使用sync修饰符：可以省去监听传递的事件，直接在父组件中props值后添加sync修饰符
      // 子组件中固定写法则是 this.$emit('update: props名称',值)
      this.$emit('update:showDialog', false)
      // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      this.$refs.formData.resetFields()
      // 重置数据，因为 resetFileds 只会清除表单上的数据，不能清除编辑时给formData添加的id等数据
      this.formData = {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      }
    },
    confirm() {
      this.$refs.formData.validate(async isOk => {
        if (isOk) {
          // 判断有没有 formData 是否有 id
          if (this.formData.id) {
            // 有 id 则是编辑部门，调用编辑部门接口并提示修改成功
            await updateDepartments(this.formData)
            this.$message.success('修改成功')
          } else {
            // 调用接口，添加部门，将父节点的 id 作为子节点的 pid
            await addDepartments({ ...this.formData, pid: this.treeNode.id })
            // 提示添加成功
            this.$message.success('添加部门成功')
          }
          // 关闭弹窗
          this.close()
          // 添加成功后，通知父组件重新获取数据
          this.$emit('addDept')
        } else {
          console.log('校验失败')
        }
      })
    },
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple()
    },
    async getDepartDetail(id) {
      // 调用接口的时候不能直接传递 treeNode.id
      // 因为props传值是异步的，当父组件修改 传递的treeNode 的时候，子组件可能还没有拿到新数据
      // 这里需要在父组件中 通过$refs来调用子组件的方法来传递 id
      this.formData = await getDepartDetail(id)
    }
  }

}
</script>

<style>

</style>

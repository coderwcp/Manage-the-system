<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <!-- 实现页面的基本布局 -->
      <el-card class="tree-card">
        <!-- 用了一个行列布局 -->
        <!-- 缺少treeNode -->
        <!-- is-root 是否根节点 -->
        <tree-tools :tree-node="company">
          <el-dropdown-item
            :disabled="!checkPermission('add-dept')"
            @click.native="addDept(company)"
          >添加子部门</el-dropdown-item>
        </tree-tools>
        <!--放置一个属性   这里的props和我们之前学习的父传子 的props没关系-->
        <el-tree :data="departs" :props="defaultProps" default-expand-all>
          <!-- 说明el-tree里面的这个内容 就是插槽内容 => 填坑内容  => 有多少个节点循环多少次 -->
          <!-- slot-scope 是 tree组件传给每个节点的插槽的内容的数据 -->
          <!-- 两个参数node和data，分别表示当前节点的 Node 对象和当前节点的数据 -->
          <!-- 顺序一定是 执行slot-scope的赋值 才去执行 props的传值 -->
          <!-- slot-scope="scope" vue2.6之前 作用域插槽，可以和任何标签配合使用 -->
          <!-- v-slot="scope" 2.6之后 作用域插槽，必须和 template 配合使用 -->
          <tree-tools slot-scope="{ data }" :tree-node="data">
            <!-- 使用冒泡来 监听原生点击事件 -->
            <el-dropdown-item
              :disabled="!checkPermission('add-dept')"
              @click.native="addDept(data)"
            >添加子部门</el-dropdown-item>
            <el-dropdown-item
              @click.native="editDept(data)"
            >编辑部门</el-dropdown-item>
            <el-dropdown-item
              @click.native="delDept(data.id)"
            >删除部门</el-dropdown-item>
          </tree-tools>
        </el-tree>
      </el-card>
    </div>
    <!-- <add-dept v-if="showDialog" :tree-node="node" :show-dialog="showDialog" @close="showDialog = $event" @addDept="getDepartments" /> -->
    <add-dept
      ref="addDept"
      :tree-node="node"
      :show-dialog.sync="showDialog"
      @addDept="getDepartments"
    />
  </div>
</template>

<script>
import treeTools from '@/views/departments/components/tree-tools'
import addDept from '@/views/departments/components/add-dept'
import { getDepartments, delDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils'
export default {
  name: 'Departments',
  components: {
    treeTools,
    addDept
  },
  data() {
    return {
      departs: [],
      company: {},
      defaultProps: {
        label: 'name', // 表示以 name 为显示内容
        children: 'children' // 表示从 children 中寻找子项，默认设置也是 children
      },
      showDialog: false, // 是否显示添加部门弹出层
      node: null, // 记录当前操作的部门
      loading: false
    }
  },
  created() {
    // 调用获取部门结构方法
    this.getDepartments()
  },
  methods: {
    // 获取部门结构
    async getDepartments() {
      this.loading = true
      const { depts, companyName, companyManage } = await getDepartments()
      // 给一个空的id时防止 添加一级树节点的时候找不到根节点，所以需要给company
      this.company = { name: companyName, manager: companyManage, id: '' }
      this.departs = tranListToTreeData(depts)
      this.loading = false
    },
    // 添加部门
    addDept(data) {
      // 保存点击的 部门，显示弹出层并传递给弹出层
      this.showDialog = true
      this.node = data
    },
    // 修改部门
    async editDept(data) {
      // 保存点击的 部门，显示弹出层并传递给弹出层
      this.node = data

      // 方式一：调用子组件中的方法获取数据再实现回写
      await this.$refs.addDept.getDepartDetail(data.id)
      this.showDialog = true
      // 方式二：直接修改子组件中的数据
      // const formData = await getDepartDetail(data.id)
      // this.$refs.addDept.formData = formData
    },
    // 删除部门
    async delDept(id) {
      // 因为全局注册了 element-ui 可以直接调用 $confirm 提示框
      try {
        await this.$confirm('是否确认删除该部门?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await delDepartments(id)
        this.$message.success('删除成功')
        // 删除成功后重新获取数据
        this.getDepartments()
      } catch (err) {
        console.log(err)
      }
    }
    // checkPermission(key) {
    //   try {
    //     return this.$store.state.user.userInfo.roles.points.includes(key)
    //   } catch (err) {
    //     console.log(err)
    //     return false
    //   }
    // }
  }
}
</script>

<style scoped>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>

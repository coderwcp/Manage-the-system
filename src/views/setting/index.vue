<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <el-tab-pane label="角色管理">
            <!-- 左侧的内容 -->
            <el-row style="height: 60px">
              <el-button
                icon="el-icon-plus"
                type="primary"
                size="small"
                @click="showDialog = true"
              >新增角色</el-button>
            </el-row>
            <!-- 给表格绑定数据 -->
            <el-table border="" :data="list">
              <el-table-column align="center" type="index" label="序号" width="120" />
              <el-table-column align="center" prop="name" label="名称" width="240" />
              <el-table-column align="center" prop="description" label="描述" />
              <el-table-column align="center" label="操作">
                <!-- 作用域插槽 -->
                <template slot-scope="{ row }">
                  <!-- row 每一行对应的数据对象 -->
                  <el-button size="small" type="success" @click="assignPrem(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 放置分页组件 -->
            <el-row type="flex" justify="center" align="middle" style="height:60px">
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="page.total"
                layout="prev, pager, next"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert type="info" :show-icon="true" :closable="false" title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改" />
            <!-- 右边内容 -->
            <!-- 并不是所有的表单都需要 model rules -->
            <el-form label-width="120px" style="margin-top:50px">
              <el-form-item label="企业名称">
                <el-input v-model="formData.name" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="formData.companyAddress" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="电话">
                <el-input v-model="formData.companyPhone" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="formData.mailbox" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="formData.remarks" type="textarea" :rows="3" disabled style="width:400px" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>

    </div>
    <!-- 添加角色弹出层 -->
    <el-dialog :title="title" :visible="showDialog" @close="close">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <!-- 放置footer插槽 -->
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button size="small" @click="close">取消</el-button>
          <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 分配权限弹出层 -->
    <el-dialog
      title="权限分配"
      :visible.sync="showPremDialog"
      @close="closePre"
    >
      <!-- 权限是一颗树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为true 那表示父子勾选时  不互相关联 如果为false就互相关联 -->
      <!-- id作为唯一标识 -->
      <el-tree
        ref="permTree"
        :data="permData"
        :props="defaultProps"
        :show-checkbox="true"
        :check-strictly="true"
        :default-expand-all="true"
        :default-checked-keys="selectCheck"
        node-key="id"
      />
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button @click="closePre">取 消</el-button>
          <el-button type="primary" @click="confirm">确 定</el-button>
        </el-col>
      </el-row>
    </el-dialog>

  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, addRole, getRoleDetail, updateRole, assignPrem } from '@/api/setting'
import { mapGetters } from 'vuex'
import { getPermissionList } from '@/api/permission'
import { tranListToTreeData } from '@/utils'
export default {
  name: 'Setting',
  data() {
    return {
      list: [],
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 5,
        total: 0 // 记录总数
      },
      formData: {},
      showDialog: false, // 显示添加角色弹出层
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      },
      showPremDialog: false, // 显示分配权限弹出层
      permData: [], // 用来接收权限数据 树形数据
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      selectCheck: [], // 定义一个数组来接收 已经选中的节点
      roleId: null // 用来记录分配角色的id
    }
  },
  computed: {
    ...mapGetters(['companyId']),
    title() {
      return this.roleForm.id ? '编辑角色' : '新增角色'
    }
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { rows, total } = await getRoleList(this.page)
      this.list = rows
      this.page.total = total
    },
    // 切换分页
    changePage(newPage) {
      // newPage 是当前点击的页码
      this.page.page = newPage // 将当前点击的页码赋值给最新页码
      this.getRoleList() // 获取对应页码的数据
    },
    // 获取公司信息
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId)
    },
    // 新增角色
    async btnOK() {
      try {
        // 手动校验表单
        await this.$refs.roleForm.validate()
        // 当点击编辑的时候 this.roleForm 的数据会获取到当前点击的角色详情
        // 判断是否有id就可以区分是编辑还是新增
        let message = ''
        if (this.roleForm.id) {
          // 更新角色
          await updateRole(this.roleForm)
          message = '更新成功'
        } else {
          // 新增角色
          await addRole(this.roleForm)
          message = '添加成功'
        }
        this.$message.success(message)
        // 刷新页面
        this.getRoleList()
        // 关闭弹出层
        this.close()
      } catch (err) {
        console.log(err)
      }
    },
    // 删除角色
    async deleteRole(id) {
      try {
        await this.$confirm('是否确认删除该角色?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await deleteRole(id)
        // 删除成功后重新获取数据
        this.$message.success('删除角色成功')
        // 重新获取新数据
        if (this.page.page === Math.ceil(this.page.total / this.page.pagesize)) {
          this.page.page = Math.ceil((this.page.total - 1) / this.page.pagesize)
        }
        this.getRoleList()
      } catch (err) {
        console.log(err)
      }
    },
    // 修改角色
    async editRole(id) {
      // 根据id获取对应角色的详情
      this.roleForm = await getRoleDetail(id)
      // 显示弹出层
      this.showDialog = true
    },
    close() {
      this.roleForm = {
        name: '',
        description: ''
      }
      // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      this.$refs.roleForm.resetFields()
      // 关闭弹出层
      this.showDialog = false
    },
    // 分配权限
    async assignPrem(id) {
      // console.log(id)
      // 获取权限列表
      // 获取权限列表转为树形结构数据
      this.permData = tranListToTreeData(await getPermissionList(), '0')
      // 保存需要操作的角色id
      this.roleId = id
      // 根据 id 获取角色的权限数据
      const { permIds } = await getRoleDetail(id)
      // console.log('permIds', permIds)
      // 将角色已有的权限列表给树形的默认选中列表
      this.selectCheck = permIds
      // 先获取数据再打开弹出层
      this.showPremDialog = true
    },
    // 关闭分配权限弹出层
    closePre() {
      this.selectCheck = [] // 清空选中的列表
      this.showPremDialog = false
    },
    async confirm() {
      // 调用 el-tree 的方法 获取选中的列表
      // console.log(this.$refs.permTree.getCheckedKeys())
      await assignPrem({ id: this.roleId, permIds: this.$refs.permTree.getCheckedKeys() })
      this.$message.success('权限分配成功')
      // 关闭弹出层
      this.closePre()
    }
  }
}
</script>

<style>

</style>

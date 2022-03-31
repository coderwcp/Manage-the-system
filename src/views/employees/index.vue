<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before">共{{ page.total }}条记录</span>
        <template slot="after">
          <!-- 点击跳转到员工导入页面 -->
          <el-button size="small" type="warning" @click="$router.push('/import?type=user')">导入</el-button>
          <el-button size="small" type="danger">导出</el-button>
          <el-button size="small" type="primary" @click="showDialog = true">新增员工</el-button>
        </template>
      </page-tools>
      <el-card v-loading="loading">
        <el-table :data="list" border>
          <el-table-column align="center" type="index" label="序号" sortable="" width="100" />
          <el-table-column label="姓名" prop="username" sortable="" />
          <el-table-column label="工号" prop="workNumber" sortable="" />
          <el-table-column label="聘用形式" prop="formOfEmployment" :formatter="formatEmployment" sortable="" />
          <el-table-column label="部门" prop="departmentName" sortable="" />
          <el-table-column label="入职时间" sortable="">
            <template slot-scope="{ row }">
              <div>
                {{ row.timeOfEntry | formatDate }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="账户状态" prop="enableState" sortable="">
            <template slot-scope="{row}">
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template slot-scope="{row}">
              <el-button type="text" size="small">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small">角色</el-button>
              <el-button type="text" size="small" @click="deleteEmployee(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row type="flex" justify="center" align="middle" style="height: 60px">
          <el-pagination
            layout="prev, pager, next"
            :current-page="page.page"
            :page-size="page.size"
            :total="page.total"
            @current-change="changePage"
          />
        </el-row>
      </el-card>
    </div>
    <add-employee :show-dialog.sync="showDialog" :employee-enum="EmployeeEnum" @addEmployee="getEmployeeList()" />
  </div>
</template>

<script>
import EmployeeEnum from '@/api/constant/employees'
import { getEmployeeList, deleteEmployee } from '@/api/employees'
import addEmployee from './components/add-employee'
export default {
  name: 'Employees',
  components: { addEmployee },
  data() {
    return {
      EmployeeEnum,
      loading: false,
      list: [],
      page: {
        page: 1,
        size: 10,
        total: 0
      },
      showDialog: false
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      this.loading = true
      const { rows, total } = await getEmployeeList(this.page)
      // if (!rows.length) {
      //   this.page.page--
      //   this.getEmployeeList(this.page)
      // }
      this.list = rows
      this.page.total = total
      this.loading = false
    },
    // 切换分页
    changePage(newPage) {
      // 保存当前页码
      this.page.page = newPage
      // 获取切换后的新数据
      this.getEmployeeList()
    },
    // 格式化表格数据
    formatEmployment(row, column, cellValue, index) {
      // console.log(row, column, cellValue, index)
      const obj = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    // 新增员工
    addEmployee() {

    },
    // 删除员工
    async deleteEmployee(id) {
      try {
        await this.$confirm('是否确认删除该员工?')
        await deleteEmployee(id)
        this.$message.success('删除成功')
        // 重新加载页码
        if (this.page.page === Math.ceil(this.page.total / this.page.size)) {
          this.page.page = Math.ceil((this.page.total - 1) / this.page.size)
        }
        this.getEmployeeList() // 重新获取最新数据
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style>

</style>

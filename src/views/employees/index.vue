<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before">共{{ page.total }}条记录</span>
        <template slot="after">
          <!-- 点击跳转到员工导入页面 -->
          <el-button
            size="small"
            type="warning"
            @click="$router.push('/import?type=user')"
          >导入</el-button>
          <el-button
            size="small"
            type="danger"
            @click="exportData"
          >导出</el-button>
          <!-- 新增员工 -->
          <el-button
            size="small"
            type="primary"
            @click="showDialog = true"
          >新增员工</el-button>
        </template>
      </page-tools>
      <el-card v-loading="loading">
        <el-table :data="list" border>
          <el-table-column
            align="center"
            type="index"
            label="序号"
            sortable=""
            width="100"
          />
          <el-table-column label="姓名" prop="username" sortable="" />
          <el-table-column
            header-align="center"
            align="center"
            prop="prop"
            label="label"
          >
            <template v-slot="{ row }">
              <img
                v-imgerror="require('@/assets/common/bigUserHeader.png')"
                :src="row.staffPhoto"
                style="
                  width: 70px;
                  height: 70px;
                  padding: 10px;
                  border-radius: 50%;
                "
                title="二维码查看"
                @click="showQrCode(row.staffPhoto)"
              >
            </template>
          </el-table-column>
          <el-table-column label="工号" prop="workNumber" sortable="" />
          <el-table-column
            label="聘用形式"
            prop="formOfEmployment"
            :formatter="formatEmployment"
            sortable=""
          />
          <el-table-column label="部门" prop="departmentName" sortable="" />
          <el-table-column label="入职时间" sortable="">
            <template slot-scope="{ row }">
              <div>
                {{ row.timeOfEntry | formatDate }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="账户状态" prop="enableState" sortable="">
            <template slot-scope="{ row }">
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template slot-scope="{ row }">
              <el-button
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
              >查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteEmployee(row.id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row
          type="flex"
          justify="center"
          align="middle"
          style="height: 60px"
        >
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
    <!-- 新增员工弹出层 -->
    <add-employee
      :show-dialog.sync="showDialog"
      :employee-enum="EmployeeEnum"
      @addEmployee="getEmployeeList()"
    />
    <el-dialog title="查看头像" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <assign-role ref="assignRole" :show-role-dialog.sync="showRoleDialog" :user-id="userId" />
  </div>
</template>

<script>
import EmployeeEnum from '@/api/constant/employees'
import { getEmployeeList, deleteEmployee } from '@/api/employees'
import addEmployee from './components/add-employee'
import { formatJson } from '@/utils'
import QrCode from 'qrcode'
import AssignRole from './components/assignRole'

export default {
  name: 'Employees',
  components: { addEmployee, AssignRole },
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
      showDialog: false,
      showCodeDialog: false,
      showRoleDialog: false,
      userId: ''
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
    },
    // 员工导出 Excel
    exportData() {
      // import 懒加载
      import('@/vendor/Export2Excel').then(async excel => {
        // 定义导出excel表的表头
        const headers = {
          '姓名': 'username',
          '手机号': 'mobile',
          '入职日期': 'timeOfEntry',
          '聘用形式': 'formOfEmployment',
          '转正日期': 'correctionTime',
          '工号': 'workNumber',
          '部门': 'departmentName'
        }
        // 获取最新员工的数据 将获取到的page信息里面的总数作为页容量来请求
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        // 将服务器返回的每一条数据转换为headers对应的数组，最后所有数据组成数组
        const data = formatJson(headers, rows)
        excel.export_json_to_excel({
          header: Object.keys(headers), // 表头 必填
          data, // 具体数据 必填
          filename: '员工信息表', // 非必填
          autoWidth: true, // 非必填
          bookType: 'xlsx', // 非必填
          multiHeader: [['姓名', '主要信息', '', '', '', '', '部门']], // 复杂表头
          merges: ['A1:A2', 'B1:F1', 'G1:G2']// 复杂表头合并
        })
      })
    },
    showQrCode(url) {
      // console.log(url)
      if (url) {
        this.showCodeDialog = true // 数据更新了，弹层不会立马显示，页面渲染是一个异步的
        // 当上一次数据更新完毕，页面渲染完成后执行 nextTick 才能拿到最新生成的dom
        // 等弹层出现后才能获取到 this.$refs.myCanvas
        this.$nextTick(() => {
          QrCode.toCanvas(this.$refs.myCanvas, url)
        })
      } else {
        this.$message.warning('该用户还未上传头像')
      }
    },
    async editRole(id) {
      this.userId = id
      await this.$refs.assignRole.getUserDetailById(id)
      this.showRoleDialog = true
    }
  }
}
</script>

<style>
</style>

import request from '@/utils/request'

// 获取下拉列表中的员工名称
export function getEmployeeSimple() {
  return request({
    url: '/sys/user/simple'
  })
}

// 获取员工的综合列表数据
export function getEmployeeList(params) {
  return request({
    url: '/sys/user',
    params
  })
}

// 添加员工
export function addEmployee(data) {
  return request({
    url: '/sys/user',
    method: 'post',
    data
  })
}

// 删除员工
export function deleteEmployee(id) {
  return request({
    url: `/sys/user/${id}`,
    method: 'delete'
  })
}

// 导入员工，data 是一个员工数组
export function importEmployee(data) {
  return request({
    url: '/sys/user/batch',
    method: 'post',
    data
  })
}

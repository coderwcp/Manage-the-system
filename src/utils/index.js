/**
 * Created by PanJiaChen on 16/11/18.
 */
import { formatDate } from '@/filters'
import EmployeesEnum from '@/api/constant/employees'
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

// 将扁平数组转为树形结构
export function tranListToTreeData(list, rootValue = '') {
  const array = []
  list.forEach(item => {
    if (item.pid === rootValue) {
      const children = tranListToTreeData(list, item.id)
      children.length && (item.children = children)
      array.push(item)
    }
  })
  return array
}

// 将数组中的对象转为特定属性对应的数组
export function formatJson(headers, arr) {
  // 遍历每一条数据
  // 将里面返回的数组在放入一个数组中，成为一个二维数组
  return arr.map(item => {
    // Object.values(headers) 拿到对应头部对象所有属性对应的值 数组
    // console.log(Object.values(headers))
    return Object.values(headers).map(key => {
      // 将头部数组中的每一个属性组成一个新的数组
      // ['13800000002', '管理员', '2018-11-02', 1, '2018-11-30', '9002', '总裁办']
      // 时间转换
      // console.log(key)
      if (key === 'correctionTime' || key === 'timeOfEntry') {
        return formatDate(item[key])
      } else if (key === 'formOfEmployment') {
        const res = EmployeesEnum.hireType.find(obj => obj.id === item[key])
        return res ? res.value : '未知'
      }
      // 聘用形式转换
      return item[key]
    })
    // return res
  })
}


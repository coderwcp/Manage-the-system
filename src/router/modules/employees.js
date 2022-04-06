// 导出属于员工的路由规则
import Layout from '@/layout'
//  {  path: '', component: '' }
// 每个子模块 其实 都是外层是layout  组件位于layout的二级路由里面
export default {
  path: '/employees', // 路径
  name: 'employees', // 给路由规则加一个name
  component: Layout, // 组件
  // 配置二级路的路由表
  children: [
    {
      path: '', // 这里当二级路由的path什么都不写的时候 表示该路由为当前二级路由的默认路由
      component: () => import('@/views/employees'),
      // 路由元信息  其实就是存储数据的对象 我们可以在这里放置一些信息
      meta: {
      // meta属性的里面的属性 随意定义 但是这里为什么要用title呢， 因为左侧导航会读取我们的路由里的meta里面的title作为显示菜单名称
        title: '员工管理',
        icon: 'people'
      }
    },
    {
      // path: 'detail/:id?' 不加/则是相对父级的路径跳转 /employees/detail/:id?
      // path: '/detail/:id?' 加/则是直接已当前路径跳转 /detail/:id?
      // detail/:id 可以通过 this.$route.params.id 获取参数
      // detail?id=123 可以通过 this.$route.query.id 获取参数
      path: 'detail/:id?', // ?：表示不传id也可以跳转
      component: () => import('@/views/employees/detail'),
      hidden: true
    },
    {
      path: 'print/:id',
      component: () => import('@/views/employees/print'),
      hidden: true, // 不在侧边栏显示图标
      meta: {
        title: '打印',
        icon: 'people'
      }
    }
  ]
}

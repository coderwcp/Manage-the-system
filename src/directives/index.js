export const imgerror = {
  // 指令对象 会在当前的dom元素插入到节点之后执行
  // dom 表示当前指令作用的dom对象
  // 此时 dom 看作就是图片
  // binding 表示当前指令绑定对象 详细信息
  inserted(dom, binding) {
    // console.log(dom, binding)
    // 当 dom 节点有正确的src，则显示当前路径
    // 当 dom 上的src无法正常显示，则使用当前指令传的路径 binding.value
    dom.src = dom.src || binding.value
    // 当图片有地址 但是地址没有加载成功的时候 会报错 会触发图片的一个事件 => onerror
    dom.onerror = function() {
      // 当图片出现异常的时候 会将指令配置的默认图片设置为该图片的内容
      // dom可以注册error事件
      dom.src = binding.value
    }
  },
  componentUpdated(dom, binding) {
    // 当页面初始化完成 inserted 只会执行一次
    // 后面更改图片的时候也有可能赋值一个null
    // 当 dom 更新后还需要判断一下
    dom.src = dom.src || binding.value
  }
}

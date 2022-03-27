export const imgerror = {
  // 指令对象 会在当前的dom元素插入到节点之后执行
  // dom 表示当前指令作用的dom对象
  // 此时 dom 看作就是图片
  // binding 表示当前指令绑定对象 详细信息
  inserted(dom, binding) {
    // 当图片有地址 但是地址没有加载成功的时候 会报错 会触发图片的一个事件 => onerror
    dom.onerror = function() {
      // 当图片出现异常的时候 会将指令配置的默认图片设置为该图片的内容
      // dom可以注册error事件
      dom.src = binding.value
    }
  }
}

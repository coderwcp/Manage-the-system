<template>
  <div :class="{disabled: fileComputed}">
    <!-- :on-preview="previewHandler" 通过传回调函数在子组件中再调用实现父子传参并修改数据，不会受到插槽的影响 -->
    <el-upload
      action="#"
      list-type="picture-card"
      :limit="1"
      :file-list="fileList"
      :on-preview="previewHandler"
      :on-change="changeHandler"
      :on-remove="removeHandler"
      :before-upload="beforeUpload"
      :http-request="upload"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <!-- 刚开始不显示进度条 使用 v-if   -->
    <el-progress v-if="showPercent" :percentage="percent" style="width: 180px" />
    <el-dialog
      title="图片预览"
      :visible.sync="showDialog"
    >
      <img :src="imgUrl" alt="" style="width: 100%">
    </el-dialog>
  </div>
</template>

<script>
// 导入腾讯云COS的包
import COS from 'cos-js-sdk-v5'
// 创建 COS 实例
const cos = new COS({
  // AKIDe5F9m8C1YooX0C7l9F5exyiBMHvJPGp7
  // 1nIWT9ex0mIXVBbkbBUWZMtA9rHVTAai
  SecretId: 'AKIDe5F9m8C1YooX0C7l9F5exyiBMHvJPGp7', // 身份识别 ID
  SecretKey: '1nIWT9ex0mIXVBbkbBUWZMtA9rHVTAai' // 身份密钥
})
export default {
  data() {
    return {
      fileList: [],
      showDialog: false,
      imgUrl: '',
      currentFileUid: '', // 记录上传文件的uid
      percent: 0, // 记录上传的进度
      showPercent: false,
      uploading: false // 是否正在上传
    }
  },
  computed: {
    fileComputed() {
      return this.fileList.length === 1
    }
  },
  methods: {
    // 图片预览
    previewHandler(file) {
      console.log(file.url)
      this.imgUrl = file.url
      this.showDialog = true
    },
    // 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
    // 不能直接push，会执行多次
    // 添加文件和上传成功都会有值
    // 所以需要完成上传成功功能才能添加到this.fileList中
    changeHandler(file, fileList) {
      // console.log(file, fileList)
      // 上传成功之后 还会进来 需要实现上传代码的逻辑 这里才会成功
      // this.fileList = fileList.map(item => item)
      this.fileList.push(file)
    },
    removeHandler(file, fileList) {
      // file 删除的文件
      // fileList 删除后的文件
      // 过滤掉删除的文件
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
    },
    beforeUpload(file) {
      console.log(file)
      // 检查文件类型
      const type = ['image/jpg', 'image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!type.includes(file.type)) {
        this.$message.error('图片格式只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      // 检查文件大小
      const maxSize = 5 * 1024 * 1024
      if (maxSize < file.size) {
        this.$message.error('图片大小大小不能超过5M')
        return false
      }
      // 通过检查则为上传成功
      this.currentFileUid = file.uid
      this.showPercent = true // 显示进度条
      return true
    },
    // 自定义上传动作 传入一个参数 该参数有个file对象，是我们需要上传到腾讯云服务器的内容
    upload(params) {
      console.log('文件上传', params.file)
      this.uploading = true // 正在上传中
      cos.putObject({
        Bucket: 'file-1310710855', // 存储桶
        Region: 'ap-chengdu', // 地域
        Key: params.file.name, // 文件名
        Body: params.file, // 要上传的文件对象
        // 文件上传进度的回调函数
        onProgress: params => { // 同样也需要使用箭头函数，否则拿不到this.percent
          // console.log(params)
          // params.percent 的值在 [0,1] 之间，需要乘100转为百分制
          this.percent = params.percent * 100
          // if (params.percent === 1) {
          //   this.showPercent = false
          // }
        },
        StorageClass: 'STANDARD' // 上传的模式类型 直接默认 标准模式即可
        // 上传到腾讯云 =》 哪个存储桶 哪个地域的存储桶 文件  格式  名称 回调
        // 下面回调函数使用箭头函数来指向当前组件对象，否则无法获取到组件中的数据
      }, (err, data) => {
        this.uploading = false // 上传成功
        // data返回数据之后 应该如何处理
        console.log(err || data)
        // data中有一个statusCode === 200 则表示上传成功了
        if (!err && data.statusCode === 200) {
          // 文件上传成功，获取上传成功后的地址 file-1310710855.cos.ap-chengdu.myqcloud.com/avatar.jpg
          // this.fileList = this.fileList.map(item => {
          //   // 遍历文件列表，找到和记录的uid是一致的那一个图片
          //   if (item.uid === this.currentFileUid) {
          //     // 获取到这个地址需要和 https:// 拼接成一个完整的地址 然后将这个地址放到 fileList 中才能显示到组件中
          //     return { ...item, url: `https://${data.Location}`, upload: true }
          //   }
          //   return item
          // })
          this.fileList[0] = { ...this.fileList[0], url: `https://${data.Location}` }

          // this.fileList[0].url = `https://${data.Location}`
          // this.fileList[0].upload = true
          // 上传成功后将图片的进度条关闭和记录上传进度清零
          setTimeout(() => {
            this.showPercent = false
            this.percent = 0
          }, 1000)
        }
      })
    }
  }
}
</script>

<style scoped>
::v-deep.disabled .el-upload--picture-card {
  display: none
}
</style>

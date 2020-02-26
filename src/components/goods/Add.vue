<template>
    <div class="add_goods">
        <breadcrumb :position="{navFir: '商品管理', navTwo: '添加商品'}"/>
        <el-card>
            <!-- 警告信息区 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- 完成步骤区 -->
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- tab栏区 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeGoTo" @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input type="number" v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input type="number" v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input type="number" v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_number">
                            <!-- 选择商品级联选择框 -->
                            <el-cascader
                                v-model="addForm.selectedKeys"
                                :options="cateList"
                                :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name' }"
                                @change="handleChange"
                                clearable>
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                      <!-- 渲染商品参数列表 -->
                      <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                        <el-checkbox-group v-model="item.attr_vals" >
                          <el-checkbox v-for="(v, i) in item.attr_vals" :key="i" :label="v" border></el-checkbox>
                        </el-checkbox-group>
                      </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                      <!-- 渲染商品属性列表 -->
                      <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                        <el-input v-model="item.attr_vals"></el-input>
                      </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                      <!-- 上传图片 action上传到后台的地址，此地址是element案例上的，
                      https://www.liulongbin.top:8888/api/private/v1/upload  有效，baseUrl也要换对应地址-->
                      <el-upload
                        action="https://jsonplaceholder.typicode.com/posts/"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture"
                        :headers="headerObj"
                        :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                      </el-upload>
                    </el-tab-pane>
                    <!-- 富文本编辑器 -->
                    <el-tab-pane label="商品内容" name="4">
                      <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                      <!-- 添加商品按钮 -->
                      <el-button type="primary" class="addBtn" @click="addNewGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog
          title="图片预览"
          :visible.sync="previewVisible"
          width="50%">
          <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'

export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择框选中商品的id，数组
        selectedKeys: [],
        // 存放上传后台，返回的图片地址
        pics: [],
        // 编辑器文本内容
        goods_introduce: '',
        // attrs存放参数，属性数组，保存此处再赋值给拷贝对象再上传后台
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称！', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格！', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量！', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量！', trigger: 'blur' }
        ],
        selectedKeys: [
          { required: true, message: '请选择商品分类！', trigger: 'change' }
        ]
      },
      cateList: [],
      manyTableData: [],
      onlyTableData: [],
      // 上传请求头设置,加token
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 保存图片路径
      previewPath: '',
      // 图片预览框
      previewVisible: false
    }
  },
  components: {
    Breadcrumb
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败！')
      }
      this.$message.success('获取分类数据成功！')
      this.cateList = res.data
    //   console.log(this.cateList)
    },
    handleChange () {},
    // tab栏切换前回调
    beforeGoTo (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.selectedKeys.length === 0) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // tab栏点击切换
    async tabClick () {
      if (this.activeIndex === '1') {
        // 为1时，是动态参数页面，获取级联选择框选中的最后一级id
        const id = this.addForm.selectedKeys[2]
        // 发送请求获取参数列表
        const { data: res } = await this.$http(`categories/${id}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        this.$message.success('获取动态参数列表成功！')
        let manyArr = res.data.many_data
        // 把数据中的字符串转换成数组再赋值渲染
        manyArr.forEach(v => {
          v.attr_vals = v.attr_vals ? v.attr_vals.split(' ') : []
        })
        this.manyTableData = manyArr
      } else if (this.activeIndex === '2') {
        const id = this.addForm.selectedKeys[2]
        const { data: res } = await this.$http(`categories/${id}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败！')
        }
        this.$message.success('获取静态属性列表成功！')
        this.onlyTableData = res.data.only_data
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewVisible = true
      // console.log(file)
      this.previewPath = file.url
    },
    // 处理移除图片的操作
    handleRemove (file) {
      // 图片上传后台成功，点击删除返回，图片信息
      // console.log(file)
      // 获取删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从pics数组中找到对应索引并删除这张图片
      const i = this.addForm.pics.findIndex(v => v.pic === filePath)
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm.pics)
    },
    // 监听图片上传成功的事件，返回图片外链地址信息等
    handleSuccess (response) {
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
    },
    addNewGoods () {
      // 预判必填项
      this.$refs.addFormRef.validate(async valie => {
        if (!valie) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 上传数据，selectedkeys要求是字符串，需数组转字符串，级联选择器有用到addForm的selectedkeys数组
        // 神拷贝已新addForm对象用于改数组为字符串再提交
        const cloneAddForm = JSON.parse(JSON.stringify(this.addForm))
        cloneAddForm.selectedKeys = cloneAddForm.selectedKeys.join(',')
        // 动态参数遍历改attr_vals数组为字符串，暂存addForm
        this.manyTableData.forEach(v => {
          const newInfo = {
            attr_id: v.attr_id,
            attr_value: v.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 静态属性遍历，暂存addForm
        this.onlyTableData.forEach(v => {
          const newInfo = {
            attr_id: v.attr_id,
            attr_value: v.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // addForm存参数、属性的attrs数组赋值给拷贝的对象
        cloneAddForm.attrs = this.addForm.attrs
        // console.log(cloneAddForm)
        // 发送请求
        const { data: res } = await this.$http.post('goods', cloneAddForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 跳转回商品列表页面
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style scoped>
.el-checkbox{
  margin-right: 8px !important;
}
.previewImg{
  width: 100%;
}
.addBtn{
  margin-top: 15px;
}
</style>

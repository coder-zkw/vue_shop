<template>
    <div class="cate">
        <breadcrumb :position="{navFir: '商品管理', navTwo: '商品分类'}"/>
        <el-card class="box-card">
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCate">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 商品分类列表 -->
            <tree-table
              class="tableTree"
              :data="cateList"
              :columns="columns"
              :selection-type="false"
              :expand-type="false"
              show-index
              index-text="#"
              border
              :show-row-hover="false">
              <!-- 是否有效 -->
              <template slot="isOk" slot-scope="scope">
                <i class="el-icon-success" style="color:lightGreen;" v-if="!scope.row.cat_deleted"></i>
                <i class="el-icon-error" style="color:red;" v-else></i>
              </template>
              <!-- 排序 -->
              <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                <el-tag type="warning" size="mini" v-else>三级</el-tag>
              </template>
              <!-- 操作 -->
              <template slot="handle">
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </tree-table>
            <!-- 分页 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 6, 8]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCatedialog"
        width="50%"
        @close="addCatedialogClosed">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <!-- options 用来指定数据源 props 用来指定配置对象-->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', checkStrictly: 'true'}"
              @change="parentCateChange"
              clearable>
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCatedialog = false">取 消</el-button>
          <el-button type="primary" @click="handleAddCate">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'

export default {
  components: { Breadcrumb },
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 1,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      //  总数据条数
      total: 0,
      // 为teble指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // template表示当前定义模板列
          type: 'template',
          // 定义模板的名称
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'handle'
        }
      ],
      // 控制添加分类对话框显示隐藏
      addCatedialog: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 验证规则
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 选中父级分类的id数组,多级id,用数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类商品失败！')
      }
      //   把请求成功的数据赋值给分类数据列表
      this.cateList = res.data
      this.total = res.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    addCate () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCatedialog = true
    },
    // 获取父级分类的数据列表,type=2,获取前两级
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 父级分类改变
    parentCateChange () {
      // selectedKeys长度大于0，则有选择
      let len = this.selectedKeys.length
      if (len > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[len - 1]
        this.addCateForm.cat_level = len
      } else {
        // 父级分类为选择时，重置pid,level为0，若有上面操作已改变了值
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 确定添加新的分类
    handleAddCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCatedialog = false
      })
    },
    // 关闭添加分类对话框
    addCatedialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      // 父级分类选择框重置
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>
<style scoped>
  .tableTree{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>

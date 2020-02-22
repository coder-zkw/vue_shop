<template>
  <div class="params">
    <breadcrumb :position="{navFir: '商品管理', navTwo: '参数列表'}"/>
    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" show-icon type="warning" :closable="false"></el-alert>
      <el-row class="paramswrap">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品级联选择框 -->
          <el-cascader
              v-model="selectedKeys"
              :options="cartList"
              :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name' }"
              @change="handleChange"
              clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="handleAddParams">添加参数</el-button>
            <!-- 动态参数列表 -->
            <el-table :data="manyTableData" border stripe>
              <!-- 展开项 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button class="btn-new-tag" v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引项 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column prop="attr_name" label="参数名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="delParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="handleAddParams">添加属性</el-button>
            <!-- 静态属性列表 -->
              <el-table :data="onlyTableData" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <!-- 循环渲染tag标签 -->
                    <el-tag closable v-for="(item, i) in scope.row.attr_vals" :key="i" @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button class="btn-new-tag" v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="delParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
            </el-table>
          </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="paramsdialogVisible"
      width="50%"
      @close="dialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="paramsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editdialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'

export default {
  data () {
    return {
      cartList: [],
      //  级联选择框选择级别的id双向绑定的数组
      selectedKeys: [],
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      paramsdialogVisible: false,
      titleText: '动态参数',
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入动态属性', trigger: 'blur' }
        ]
      },
      // 修改对话框
      editdialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入动态参数', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败！')
      }
      this.cartList = res.data
    //   console.log(this.cartList)
    },
    handleChange () {
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectedKeys.length > 0) {
        const id = this.selectedKeys[2]
        const { data: res } = await this.$http.get(`categories/${id}/attributes`, {
          params: { sel: this.activeName }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败！')
        }
        this.$message.success('获取参数列表成功！')
        // console.log(res.data)
        // 区分获取的数据是动态还是静态的，分别赋值
        // if (this.activeName === 'many') {
        //   this.manyTableData = res.data
        // } else {
        //   this.onlyTableData = res.data
        // }

        // 自己模拟的接口，动态和静态在同一请求地址
        let manyArr = res.data.many_data
        let onlyArr = res.data.only_data
        // attr_vals是字符串，分割成数组在赋值给数据源对象
        manyArr.forEach(item => {
          // 为空字符串时返回数组，不需要分割（空字符串会分割成一个空字符串数组）
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制tag新增和输入框的切换
          item.inputVisible = false
          // 输入框的值
          item.inputValue = ''
        })
        onlyArr.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制tag新增和输入框的切换
          item.inputVisible = false
          // 输入框的值
          item.inputValue = ''
        })
        this.manyTableData = manyArr
        this.onlyTableData = onlyArr
      }
    },
    handleClick () {
      // tab切换，重新获取数据
      // this.getParamsData()   //自己模拟的接口，动态，静态同时获取赋值，不需要切换后重新获取数据
      if (this.activeName === 'many') {
        this.titleText = '动态参数'
      } else {
        this.titleText = '静态属性'
      }
      // 动态改变校验规则中提示信息内容
      this.addFormRules.attr_name[0].message = '请输入' + this.titleText
    },
    // 弹出添加对话框
    handleAddParams () {
      this.paramsdialogVisible = true
    },
    dialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    editdialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击提交添加数据
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const id = this.selectedKeys[2]
        const { data: res } = await this.$http.post(`categories/${id}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数/属性失败！')
        }
        this.$message.success('添加参数/属性成功！')
        this.getParamsData()
        this.paramsdialogVisible = false
      })
    },
    // 点击编辑，弹出修改对话框
    handleEdit (e) {
      // 将点击当前行的名称，赋值到对话框编辑栏中
      // this.editForm = e  //这样写，在编辑对话框中的值时，列表的值会跟着变
      this.editForm.attr_name = e.attr_name
      this.editForm.attr_id = e.attr_id
      this.editdialogVisible = true
    },
    // 提交修改数据
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const id = this.selectedKeys[2]
        const attrId = this.editForm.attr_id
        const { data: res } = await this.$http.put(`categories/${id}/attributes/${attrId}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数/属性失败！')
        }
        this.$message.success('修改参数/属性成功！')
        this.getParamsData()
        this.editdialogVisible = false
      })
    },
    delParams (attrId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const id = this.selectedKeys[2]
        const { data: res } = await this.$http.delete(`categories/${id}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')
        this.getParamsData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 添加tag输入框触发函数
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return false
      }
      // 页面增加新tag，输入框值清空并关闭
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      // 调用函数发送请求，把数据保存到服务器
      this.saveAttributes(row)
    },
    // 删除tag
    handleClosed (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttributes(row)
    },
    // 添加tag按钮
    showInput (row) {
      row.inputVisible = true
      // 输入框自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 更新数据函数
    async saveAttributes (row) {
      const id = this.selectedKeys[2]
      const attrId = row.attr_id
      const { data: res } = await this.$http.put(`categories/${id}/attributes/${attrId}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        // 当前行的数组转换' '间隔的字符串再传值
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新数据失败！')
      }
      this.$message.success('更新数据成功！')
    }
  },
  components: {
    Breadcrumb
  },
  computed: {
    // 如果按钮需要被禁用，返回true，否则返回false
    isBtnDisabled () {
      if (this.selectedKeys.length > 0) {
        return false
      }
      return true
    }
  }
}
</script>
<style scoped>
.paramswrap{
    margin-top: 15px;
}
.el-tag{
  margin-left: 10px;
}
.input-new-tag,.btn-new-tag{
  width: 90px;
  margin-left: 10px;
  vertical-align: middle;
}
</style>

<template>
    <div class="user">
        <breadcrumb/>
        <el-card class="box-card">
            <div style="margin-top: 15px;">
                <el-row :gutter="20">
                    <el-col :span="7">
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="dialogAdd = true">添加用户</el-button>
                    </el-col>
                </el-row>
                <!-- 用户列表 -->
                <el-table :data="userList" border>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="username" label="姓名"></el-table-column>
                    <el-table-column prop="email" label="邮箱"></el-table-column>
                    <el-table-column prop="mobile" label="电话"></el-table-column>
                    <el-table-column prop="role_name" label="角色"></el-table-column>
                    <el-table-column label="状态">
                        <template slot-scope="scope">
                            <el-switch v-model="scope.row.mg_state" @change="stateChanged(scope.row)"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="220px">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" @click="dialogEditShow(scope.row)" size="mini"></el-button>
                            <el-button type="danger" icon="el-icon-delete" @click="removeUser(scope.row.id)" size="mini"></el-button>
                            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                                <el-button type="primary" icon="el-icon-setting" size="mini"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页 -->
                <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="queryInfo.pagenum"
                  :page-sizes="[2, 5, 6, 8]"
                  :page-size="queryInfo.pagesize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total">
                </el-pagination>
                <!-- 添加用户对话框 -->
                <el-dialog
                  title="添加用户"
                  :visible.sync="dialogAdd"
                  @close="addFormClosed"
                  width="30%">
                  <el-form
                  ref="addFormRef"
                  :model="addForm"
                  :rules="addFormRules"
                  label-width="80px">
                    <el-form-item label="用户名" prop="username">
                      <el-input v-model="addForm.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                      <el-input v-model="addForm.password"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="addForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="电话" prop="mobile">
                      <el-input v-model="addForm.mobile"></el-input>
                    </el-form-item>
                  </el-form>
                  <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogAdd = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
                  </span>
                </el-dialog>
                <!-- 修改用户对话框 -->
                <el-dialog
                  title="修改用户"
                  :visible.sync="dialogEdit"
                  @close="editFormClosed"
                  width="30%">
                  <el-form
                  ref="editFormRef"
                  :model="editForm"
                  :rules="editFormRules"
                  label-width="80px">
                    <el-form-item label="用户名" prop="username">
                      <el-input v-model="editForm.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="editForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="电话" prop="mobile">
                      <el-input v-model="editForm.mobile"></el-input>
                    </el-form-item>
                  </el-form>
                  <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogEdit = false">取 消</el-button>
                    <el-button type="primary" @click="editUser">确 定</el-button>
                  </span>
                </el-dialog>
            </div>
        </el-card>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'

export default {
  data () {
    // 自定义校验邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        return cb()
      }
      cb(new Error('请输入合法邮箱！'))
    }
    // 自定义校验手机号
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法手机号
        return cb()
      }
      cb(new Error('请输入合法手机号！'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      dialogAdd: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名！', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码！', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6到15个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱！', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号！', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      dialogEdit: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱！', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号！', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(res)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize // 改变分页数据
      this.getUserList() // 分页数据改变后，重新提交获取数据
      console.log(newSize)
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getUserList()
      console.log(newNum)
    },
    // 监听switch开关状态的改变
    async stateChanged (userInfo) {
      // console.log(userInfo.mg_state, userInfo.id)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    addFormClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户信息失败！')
          } else {
            this.$message.success('添加用户信息成功！')
            this.dialogAdd = false
            this.getUserList()
          }
        }
      })
    },
    async dialogEditShow (userInfo) {
      const { data: res } = await this.$http.get('users' + userInfo.id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.dialogEdit = true
      // console.log(res.data)
    },
    editFormClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$message.error('更新用户信息失败！')
          } else {
            this.$message.success('更新用户信息成功！')
            this.dialogEdit = false
            this.getUserList()
          }
        }
      })
    },
    async removeUser (id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err) // 点击取消会报错，catch后点击取消result返回cancel,箭头函数返回一个err,简写
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getUserList()
      // this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      //   this.$message({
      //     type: 'success',
      //     message: '删除成功!'
      //   })
      // }).catch(() => {
      //   this.$message({
      //     type: 'info',
      //     message: '已取消删除'
      //   })
      // })
    }
  },
  components: {
    Breadcrumb
  }
}
</script>
<style lang="less" scoped>

</style>

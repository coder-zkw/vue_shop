<template>
    <div class="roles">
        <breadcrumb :position="{navFir: '权限管理', navTwo: '角色列表'}"/>
        <el-card class="box-card">
            <!-- 添加角色按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 权限列表 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开项 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['vcenter', 'bd_bottom', i1 === 0 ? 'bd_top' : '']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRoles(scope.row, item1.id)">{{item1.authname}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二、三级权限 -->
                            <el-col :span="19">
                                <el-row :class="['vcenter', i2 === 0 ? '' : 'bd_top']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRoles(scope.row, item2.id)">{{item2.authname}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" closable @close="removeRoles(scope.row, item3.id)" v-for="item3 in item2.children" :key="item3.id">
                                            {{item3.authname}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引项 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="dialogRightsShow(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 权限分配对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="dialogRights"
            @close="rightsFormClosed"
            width="30%">
            <el-form
            ref="rightsFormRef"
            label-width="80px">
                <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="dialogRights = false">取 消</el-button>
            <el-button type="primary" @click="rightsSet">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import Breadcrumb from '@/components/Breadcrumb'

export default {
  components: {
    Breadcrumb
  },
  data () {
    return {
      rolesList: [],
      dialogRights: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authname'
      },
      defKeys: [], // 存放默认选中权限的ID的数组
      roleId: '' // 保存要分配权限的角色id
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      // this.$message.success('获取角色列表成功！')
      this.rolesList = res.data
    },
    async removeRoles (role, rightId) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      //   this.getRolesList() // 若以此重新获取数据会重新渲染列表，展开项会关闭
      role.children = res.data // 目前此处为模拟数据，无后台操作数据，数据变为空
    },
    rightsFormClosed () {
      this.defKeys = [] // 关闭对话框，清空默认选中角色id的数组
    },
    async dialogRightsShow (role) {
      this.roleId = role.id // 保存需分配权限的角色id，以备配置使用
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限树状目录失败')
      }
      this.rightsList = res.data
      // 获取所有三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.dialogRights = true
    },
    getLeafKeys (node, arr) { // 通过递归形式获取角色下所有三级权限的id,并保存到defKey数组中
      if (!node.children) { // 当前node节点无children，则是三级节点
        return arr.push(node.id)
      }
      node.children.forEach(item => { // 有children的，遍历children,提取权限的id
        this.getLeafKeys(item, arr)
      })
    },
    async rightsSet () { // 分配权限功能
      const idArr = [
        ...this.$refs.treeRef.getCheckedKeys(), // 获取全选权限的id
        ...this.$refs.treeRef.getHalfCheckedKeys() // 获取半选权限的id
      ]
      const idStr = idArr.join(',') // 数组转换为字符串
      const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.dialogRights = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bd_bottom{
    border-bottom: 1px solid #eee;
}
.bd_top{
    border-top: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>

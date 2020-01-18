<template>
    <div class="rights">
        <breadcrumb :position="{navFir: '权限管理', navTwo: '权限列表'}"/>
        <el-card class="box-card">
            <!-- 权限列表 -->
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="authname" label="权限名称"></el-table-column>
                <el-table-column prop="path" label="路径"></el-table-column>
                <el-table-column label="权限等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === 0">一级</el-tag>
                        <el-tag v-if="scope.row.level === 1" type="success">二级</el-tag>
                        <el-tag v-if="scope.row.level === 2" type="warning">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'

export default {
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.rightsList = res.data
    }
  },
  components: {
    Breadcrumb
  }
}
</script>
<style lang="less" scoped>

</style>

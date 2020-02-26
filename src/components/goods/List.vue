<template>
    <div class="goods_list">
        <breadcrumb :position="{navFir: '商品管理', navTwo: '商品列表'}"/>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- v-model绑定输入框数据到传值给后台，clearable可删除属性，@clear输入框清空后重新获取数据 -->
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
                <el-table-column label="创建时间" width="140px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deltetGoods(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 8, 10, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'

export default {
  data () {
    return {
      goodsList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  components: {
    Breadcrumb
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.$message.success('获取商品列表成功！')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async deltetGoods (id) {
      const confirmResult = await this.$confirm('确定删除此条商品？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      this.getGoodsList()
    },
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style scoped>
</style>

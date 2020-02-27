<template>
    <div class="orders_list">
        <breadcrumb :position="{navFir: '订单管理', navTwo: '订单列表'}"/>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- v-model绑定输入框数据到传值给后台，clearable可删除属性，@clear输入框清空后重新获取数据 -->
                    <el-input placeholder="请输入内容" clearable>
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表 -->
            <el-table :data="ordersList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单编号"></el-table-column>
                <el-table-column prop="order_price" label="订单价格(元)"></el-table-column>
                <el-table-column label="是否付款">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_end" label="是否发货"></el-table-column>
                <el-table-column label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="editAddress"></el-button>
                        <el-button size="mini" type="success" icon="el-icon-location" @click="showProgress"></el-button>
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
        <!-- 修改地址对话框 -->
        <el-dialog
        title='修改地址'
        :visible.sync="editdialogVisible"
        width="50%"
        @close="editdialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <!-- 选择城市级联选择框 -->
                <el-cascader
                    v-model="addressForm.address1"
                    :options="cityData"
                    :props="{ expandTrigger: 'hover'}"
                    clearable>
                </el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editdialogVisible = false">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 快递进度对话框 -->
        <el-dialog
        title='快递进度'
        :visible.sync="showProgressVisible"
        width="50%">
            <el-timeline>
                <el-timeline-item
                v-for="(activity, index) in showProgressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'
import cityData from './citydata'

export default {
  components: { Breadcrumb },
  data () {
    return {
      ordersList: [],
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editdialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityData,
      showProgressVisible: false,
      showProgressInfo: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单失败！')
      }
      this.$message.success('获取订单成功！')
      // console.log(res)
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    editAddress () {
      this.editdialogVisible = true
    },
    editdialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示快递进度对话框
    async showProgress () {
      // 模拟一个物流单号，用于模拟提交查询
      const id = 804909574412544580
      const { data: res } = await this.$http.get(`kuaidi/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }
      this.$message.success('获取物流进度成功！')
      // console.log(res)
      this.showProgressInfo = res.data
      this.showProgressVisible = true
    }
  }
}
</script>
<style scoped>
</style>

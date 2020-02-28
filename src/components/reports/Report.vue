<template>
    <div class="reports">
        <breadcrumb :position="{navFir: '数据统计', navTwo: '数据报表'}"/>
        <el-card>
            <!-- 2、为ECharts准备一个具备大小（宽高）的Dom -->
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb'
// 1、导入echarts
import echarts from 'echarts'
// 导入lodash插件，用于合并两个对象
import _ from 'lodash'

export default {
  components: { Breadcrumb },
  data () {
    return {
      reportsList: [],
      // 图表中数据跟随鼠标效果，需要合并的选项
      option: {
        title: {
          text: 'mock模拟数据'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
    }
  },
  async mounted () {
    // 3、基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 请求图表数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }
    console.log(res)
    // 4、指定图表的配置项和数据。这里数据由请求的数据和option合并,_引入的lodash插件
    const result = _.merge(res.data, this.option)
    // 5、使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  }
}
</script>
<style scoped>
</style>

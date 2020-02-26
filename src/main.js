import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import { Button, Form, FormItem, Input, Message, Container, Header, Aside, Main } from 'element-ui'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

import '@/assets/css/base.css'

// 导入富文本编辑器插件
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(Element)
// Vue.use(Form)
// Vue.use(FormItem)
// Vue.use(Input)
// Vue.use(Container)
// Vue.use(Header)
// Vue.use(Aside)
// Vue.use(Main)

// Vue.prototype.$message = Message

// 配置请求的根路径 案例地址：https://www.liulongbin.top:8888/api/private/v1/
axios.defaults.baseURL = 'http://mengxuegu.com:7300/mock/5e1d8db1730c4235ebb82d89/shop_api'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 注册为全局可用组件。同Vue.use
Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用组件
Vue.use(VueQuillEditor)

// 定义全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  // 先转换成字符串，再用padStart函数，转换成2位数，前面无数就添'0'
  const M = (date.getMonth() + 1 + '').padStart(2, '0')
  const D = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${M}-${D} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

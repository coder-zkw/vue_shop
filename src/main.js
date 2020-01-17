import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import { Button, Form, FormItem, Input, Message, Container, Header, Aside, Main } from 'element-ui'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

import '@/assets/css/base.css'

Vue.use(Element)
// Vue.use(Form)
// Vue.use(FormItem)
// Vue.use(Input)
// Vue.use(Container)
// Vue.use(Header)
// Vue.use(Aside)
// Vue.use(Main)

// Vue.prototype.$message = Message

// 配置请求的根路径
axios.defaults.baseURL = 'http://mengxuegu.com:7300/mock/5e1d8db1730c4235ebb82d89/shop_api'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

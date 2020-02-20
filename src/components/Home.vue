<template>
    <el-container class="home_container">
        <el-header class="header">
          <div>
            <img src="@/assets/logo1.png" alt="">
            <span>电商后台管理系统</span>
          </div>
          <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse ? '64px' : '200px'">
              <div class="collapse" @click="toggle_collapse">|||</div>
              <el-menu
                :default-active="$route.path"
                :unique-opened="true"
                :collapse="isCollapse"
                :collapse-transition="false"
                router
                background-color="#202834"
                text-color="#fff"
                active-text-color="#409eff">
                <el-submenu :index="item.id+''" v-for="(item, index) in menuList" :key="item.id">
                  <template slot="title">
                    <i :class="iconList[index]"></i>
                    <span>{{item.authName}}</span>
                  </template>
                  <el-menu-item :index="'/'+itemChild.path" v-for="itemChild in item.children" :key="itemChild.id">
                    <template slot="title">
                      <i class="el-icon-menu"></i>
                      <span>{{itemChild.authName}}</span>
                    </template>
                  </el-menu-item>
                </el-submenu>
              </el-menu>
            </el-aside>
            <el-main>
              <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
  data () {
    return {
      menuList: [],
      iconList: ['el-icon-s-custom', 'el-icon-s-check', 'el-icon-s-goods', 'el-icon-s-order', 'el-icon-s-marketing'],
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      // 获取导航信息
      const { data: res } = await this.$http.get('menus')
      this.menuList = res.data
      // console.log(res.data) 导航信息，导航名称，路径。。。
    },
    toggle_collapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>
<style lang="less" scoped>
.header{
  background-color: #273033;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;

  div{
    display: flex;
    align-items: center;

    img{
      height: 60px;
      margin-right: 6px;
    }
  }
}
.home_container{
  height: 100%;

  aside{
    height: 100%;
    background-color: #202834;
    .collapse{
      line-height: 24px;
      text-align: center;
      color: #fff;
      font-size: 12px;
      letter-spacing: 0.2em;
      cursor: pointer;
      background-color: #4a5064;
    }
    .el-menu {
      border-right: none;
    }
  }
  main{
    background-color: #e3eaed;
  }
}
</style>

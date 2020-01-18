<template>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{position.navFir}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{position.navTwo}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>
<script>
export default {
  props: {
    position: {
      type: Object,
      default () {
        return {}
      }
    }
  }
}
</script>
<style lang="less" scoped>
    .el-breadcrumb{
        margin-bottom: 15px;
        font-size: 12px;
    }
</style>

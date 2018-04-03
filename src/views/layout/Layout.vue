<template>
  <div class="app-wrapper" :class="{hideSidebar:!sidebar.opened}">
    <sidebar class="sidebar-container"></sidebar>
    <div class="main-container">
      <navbar></navbar>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
  import {Navbar, Sidebar, AppMain} from '@/views/layout/components'

  var Cookies = require('js-cookie')

  export default {
    name: 'layout',
    components: {
      Navbar,
      Sidebar,
      AppMain
    },
    computed: {
      sidebar() {
        return this.$store.state.app.sidebar
      }
    },
    created() {
      var token = Cookies.get('token')
      var realName = Cookies.get('realName')
      var userId = Cookies.get('userId')
      console.log(token)
      console.log(realName)
      console.log(userId)
      if (token === undefined || token === null) {
        this.$router.push({
          path: '/login'
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>

<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name:{{name}}</div>
    <div class="dashboard-text">roles:<span v-for='role in roles' :key='role'>{{role}}</span></div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  var Cookies = require('js-cookie')
  export default {
    name: 'dashboard',
    computed: {
      ...mapGetters([
        'name',
        'roles'
      ])
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
  .dashboard {
    &-container {
      margin: 30px;
    }
    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }
</style>

<template>
  <div class="login-container">
    <el-form autoComplete="on" :model="loginForm" ref="loginForm" label-position="left" label-width="0px"
             class="card-box login-form">
      <h3 class="title">vue-element-admin</h3>
      <el-form-item prop="username">
				<span class="svg-container svg-container_login">
          <svg-icon icon-class="user"/>
        </span>
        <el-input name="username" type="text" v-model="loginForm.userName" autoComplete="on" placeholder="username"/>
      </el-form-item>
      <el-form-item prop="password">
				<span class="svg-container">
          <svg-icon icon-class="password"></svg-icon>
        </span>
        <el-input name="password" :type="pwdType" @keyup.enter.native="handleLogin" v-model="loginForm.password"
                  autoComplete="on" placeholder="password"></el-input>
        <span class="show-pwd" @click="showPwd"><svg-icon icon-class="eye"/></span>
      </el-form-item>
      <el-form-item inline="true">
        <el-input type="text" placeholder="验证码" v-model="loginForm.verifyCode" style="width: 200px;"></el-input>
        <img v-bind:src="loginForm.verifyCodeUrl" @click="getVerifyCode()"
             style="width: 120px;height: 47px;margin-bottom:-18px;">
      </el-form-item>

      <el-form-item>
        <el-button type="primary" style="width:100%;" :loading="loading" @click.native.prevent="handleLogin">
          Sign in
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {
    HOST_URL,
    generateUUID,
    isEmpty,
    generateSign,
    handleError,
    getNonce
  } from '@/utils/index.js'
  import {
    getPwdEncryptStr,
    getDAesString
  } from '@/utils/cryptoJS/encryptionUtil'

  var Cookies = require('js-cookie')
  var nonce = ''
  export default {
    name: 'login',
    data() {
      return {
        loginForm: {
          userName: '',
          password: '',
          verifyCode: '',
          verifyCodeUrl: ''
        },
        loading: false,
        pwdType: 'password'
      }
    },
    methods: {
      showPwd() {
        if (this.pwdType === 'password') {
          this.pwdType = ''
        } else {
          this.pwdType = 'password'
        }
      },
      getNonce(authorization) {
        // 根据响应头中的authorizationInfo获取nouce
        return authorization.split('=')[1]
      },
      // 获取验证码
      getVerifyCode() {
        this.loginForm.verifyCodeToken = generateUUID()
        this.loginForm.verifyCodeUrl = HOST_URL + '/auth/login/verify_code?nonce=' + this.loginForm.verifyCodeToken
        this.loginForm.verifyCode = ''
      },
      checkInput(data) {
        if (isEmpty(data.userName)) {
          return '请填写用户名！'
        } else if (isEmpty(data.password)) {
          return '请填写密码！'
        } else if (isEmpty(data.verifyCode)) {
          return '请填写验证码！'
        }
        return false
      },
      handleLogin() {
        const that = this
        var sign = generateSign(Cookies.get('tokenId'), nonce, Cookies.get('token'))
        var msg = this.checkInput(this.loginForm)
        if (msg) {
          this.$message.error(msg)
        } else {
          this.$http.post(HOST_URL + '/auth/login', {
            'data': {
              userName: getPwdEncryptStr(this.loginForm.userName),
              password: getPwdEncryptStr(this.loginForm.password),
              verifyCode: this.loginForm.verifyCode,
              verifyCodeToken: this.loginForm.verifyCodeToken
            }
          }, {
            headers: {
              'Authorization': Cookies.get('tokenId') + '__' + nonce + '__' + sign
            }
          }).then(response => {
            console.log(response.headers.map['Authorization-info'])
            if (response.body.errorCode === 0) {
              //	获取nonce并用nonce解密token
              var nonce = getNonce(response.headers.map['Authorization-info'].join())
              Cookies.set('nonce', nonce)
              Cookies.set('token', getDAesString(response.body.token, nonce))
              console.log(getDAesString(response.body.token, nonce))
              console.log(Cookies.get('token'))
              Cookies.set('userName', getDAesString(response.body.userName, nonce))
              Cookies.set('userId', getDAesString(response.body.userId, nonce))
              Cookies.set('tokenId', getDAesString(response.body.tokenId, nonce))
              this.loading = true
              this.$router.push({
                path: '/'
              })
            } else {
              handleError(response)
              that.getVerifyCode()
            }
          }, response => {
            console.log('error')
            handleError(response)
            that.getVerifyCode()
          })
        }
      }
    },
    mounted() {
      this.getVerifyCode()
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  $bg: #2d3a4b;
  $dark_gray: #889aa4;
  $light_gray: #eee;
  .login-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
    input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0px 1000px #293444 inset !important;
      -webkit-text-fill-color: #fff !important;
    }
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
    }
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
    }
    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;
    }
    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
      &_login {
        font-size: 20px;
      }
    }
    .title {
      font-size: 26px;
      font-weight: 400;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .login-form {
      position: absolute;
      left: 0;
      right: 0;
      width: 400px;
      padding: 35px 35px 15px 35px;
      margin: 120px auto;
    }
    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
    .thirdparty-button {
      position: absolute;
      right: 35px;
      bottom: 28px;
    }
  }
</style>

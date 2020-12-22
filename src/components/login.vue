<template>
  <div class="tm">
    <!--二维码-->
    <div class="containerT" :style="{height:height + 'px'}" v-show="tmshow == 1">
      <h1 style="color: #fff">Chaindigg CBI</h1>
      <div id="login_container"></div>
    </div>
    <!---->
    <div class="containerT" :style="{height:height + 'px'}" v-show="tmshow == 2">
      <h1 style="color: #fff">扫码成功</h1>
      <span style="color: #fff">登录请求已发送，待管理员通过申请后，再次扫码即可登录</span>
      <span style="color: #fff;cursor: pointer;margin-top: 1rem" @click="tmC">重新登录</span>
    </div>
    <!---->
    <!---->
    <div class="containerT" :style="{height:height + 'px'}" v-show="tmshow == 3">
      <h1 style="color: #fff">登录失败</h1>
      <span style="color: #fff">账号状态异常，请联系管理员</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "login",
  data() {
    return {
      height: 0,
      tmshow: 1

    }
  },
  methods: {
    tmC() {
      window.location.reload()
    },
    getLogin(url) {
      let that = this;
      axios({
        method: "get",
        url: url,
      }).then(res => {

      }).catch(res => {
      })
    }
  },
  mounted() {
    let that = this;
    that.height = $(window).height();
    window.onresize = () => {
      return (() => {
        that.height = $(window).height();
      })()
    };
    window.onload = function () {
      var url = encodeURIComponent('https://bifrost.chaindigg.com/api/login/auth_code')
      var goto = encodeURIComponent('https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=dingoazcm5jegnjk78as0f&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=' + url)

      // console.log(goto);
      var obj = DDLogin({id: "login_container", goto: goto, style: "border:none;", width: "365", height: "400"});
      var handleMessage = function (event) {
        var origin = event.origin;
        // console.log("origin", event.origin);
        if (origin == "https://login.dingtalk.com") {
          var loginTmpCode = event.data;
          axios({
            method: 'get',
            url: "https://bifrost.chaindigg.com/connect/oauth2/sns_authorize?appid=dingoazcm5jegnjk78as0f&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=REDIRECT_URI&loginTmpCode=" + loginTmpCode,
          }).then(res => {
            if (res.data.code == 0) {
              axios({
                method: 'get',
                url: "/monitor/admin/ding/login?code=" + res.data.data + "&state=monitor",
              }).then(res => {
                // 表示接口调用成功
                let loginData = res.data.data.users[0].permission;
                if (loginData.apply === 0) {
                  that.$router.push('/userMonitor')
                  // 1表示登陆成功
                  sessionStorage.setItem("login","1")
                  sessionStorage.setItem("name",res.data.data.users[0].name)
                } else if (loginData.apply == 1) {
                  that.tmshow = 2
                  axios({
                    method: 'post',
                    url: "/monitor/admin/ding/" + res.data.data.users[0].unionId
                  })
                } else {
                  that.tmshow = 3
                }
              })
              // 表示接口调用成功

            }
          })


          // window.location.href = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=dingoajcdlbphwha01orqh&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=REDIRECT_URI&loginTmpCode='+loginTmpCode;

        }
      };
      if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', handleMessage, false);
      } else if (typeof window.attachEvent != 'undefined') {
        window.attachEvent('onmessage', handleMessage);
      }
    }
  }
}
</script>

<style scoped>
.containerT {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.containerT h1 {
  width: 365px;
  text-align: center;
  margin-top: 4rem;
  margin-bottom: 3rem;
}

#login_container {
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  background: none;
}

#login_container iframe {
  background: none;
}

.login_content {
  background: none !important;
}

.tm {
  background: url("./../assets/back.png");
}
</style>

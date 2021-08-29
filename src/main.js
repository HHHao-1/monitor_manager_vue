// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import cookies from 'js-cookie'
import Config from  './../static/config'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { Button, Select ,Input,Form,FormItem,DatePicker,Upload} from 'element-ui';


Vue.config.productionTip = false
Vue.use(Button)
Vue.use(Select)
Vue.use(Input)
Vue.use(Form)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Antd);
Vue.use(DatePicker);
Vue.use(Upload);

// Vue.use(ElementUI);
/* eslint-disable no-new */
router.beforeEach((to, from, next) => {
  if (to.matched.some(m => m.meta.auth)) {
    // 对路由进行验证
    if (sessionStorage.getItem("login") === '1') {// 已经登陆
      // 正常跳转到你设置好的页面
      next()
    } else {
      // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来；　　　
      // next({path: '/login', query: {Rurl: to.fullPath}})
      next({path: '/'})
    }
  } else {
    next()
  }
})


new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
Vue.prototype.$ajax = axios;
Vue.prototype.$Cookies = cookies;
Vue.prototype.$Config = Config;

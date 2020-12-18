import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  mode:"history",
  routes: [
    {
      path: '/login',
      name: 'login',
      component:resolve => require(['@/components/login'],resolve),
    },
    {
      path: '/detail',
      name: 'detail',
      component:resolve => require(['@/components/detail'],resolve),
      meta:{auth:true},
      children:[
        {
          path: '/userMonitor',
          name: 'userMonitor',
          component:resolve => require(['@/components/detail/userMonitor/userMonitor'],resolve),
        },
        {
          path: '/addressMonitor',
          name: 'addressMonitor',
          component:resolve => require(['@/components/detail/addressMonitor/addressMonitor'],resolve),
        },
        {
          path: '/coinManage',
          name: 'coinManage',
          component:resolve => require(['@/components/detail/coinManageBox/coinManage'],resolve),
        },
        {
          path:'/transMonitor',
          name:'transMonitor',
          component:resolve => require(['@/components/detail/transMonitor/transMonitor'],resolve),
        },
        {
          path: '/userNoticeLog',
          name: 'userNoticeLog',
          component:resolve => require(['@/components/detail/userMonitor/userNoticeLog'],resolve),
        },
        {
          path: '/addressNoticeLog',
          name: 'addressNoticeLog',
          component:resolve => require(['@/components/detail/addressMonitor/addressNoticeLog'],resolve),
        },
        {
          path: '/transNoticeLog',
          name: 'transNoticeLog',
          component:resolve => require(['@/components/detail/transMonitor/transNoticeLog'],resolve),
        },

        {
          path: '/userManage',
          name: 'userManage',
          component:resolve => require(['@/components/detail/userManageBox/userManage'],resolve),
        },
        {
          path: '/500',
          name: '500',
          component:resolve => require(['@/components/detail/500/error'],resolve),
        },

      ]
    },

  ]
})

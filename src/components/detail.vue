<template>
  <a-layout  id="components-layout-demo-responsive" :style="{height:height+'px'}">
    <a-layout-sider
      breakpoint="lg"
      collapsedWidth="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      style="min-width: 300px "
    >
      <div class="logo">
        <h2 class="monitorCenter">监控中心管理后台</h2>
      </div>



<!--
      <a-menu class="leftTopSide"
        style=""

        v-model="selectedKeys"
        :inlineCollapsed="inlineCollapsed"
        mode="inline"
        :theme="theme"
        :selectedKeys="[current]"
        @click="handleClick"
      >
        <a-sub-menu class="list" v-for="(site,i) in menu" :key="site.key" >
          <span slot="title"><a-icon :type="site.type" /><span>{{site.name}}</span></span>
          <a-menu-item v-for="(site2,i) in site.children" :key="site2.key">{{site2.name}}</a-menu-item>
        </a-sub-menu>


      </a-menu>-->



      <a-menu
        :default-selected-keys="['userMonitor']"
        :default-open-keys="['sub1']"
        mode="inline"
        theme="dark"
        @click="handleClick2"
      >
        <a-menu-item key="userMonitor" >
          <a-icon type="dashboard" />
          <span>监控用户管理</span>
        </a-menu-item>
        <a-menu-item key="addressMonitor">
          <a-icon type="form" />
          <span>地址监控规则管理</span>
        </a-menu-item>
        <a-menu-item key="transMonitor">
          <a-icon type="table" />
          <span>大额交易监控规则管理</span>
        </a-menu-item>
        <a-menu-item key="coinManage">
          <a-icon type="profile" />
          <span>监控币种管理</span>
        </a-menu-item>
        <a-menu-item key="userManage">
          <a-icon type="check-circle" />
          <span>用户管理</span>
        </a-menu-item>

      </a-menu>






    </a-layout-sider>
    <a-layout>
      <a-layout-header :style="{ background: '#fff', padding: 0 ,textAlign:'right',paddingRight:'20px'}">   <!--这是顶部栏-->
        <span>momo.xyz{{user}}</span>  <!--这里是显示哪个用户momo.xyz-->
        <span style="font-size: 12px;margin-left: 1rem;color: #1585ff;
    text-decoration: underline;cursor: pointer" @click="showDeleteConfirm">退出</span>
      </a-layout-header>
      <a-layout-content class="mid" :style="{ margin: '24px 16px 0' }">   <!--这是主要内容栏--><!--24是距离上方的margin  160是距离左右的margin，原来是16 我改成了160，这里改也不对-->
        <div :style="{ padding: '24px', background: '#fff', height:'100%' }">
          <router-view style="width: 100%"></router-view>
        </div>
      </a-layout-content>

    </a-layout>
  </a-layout>
</template>

<script>
    export default {
      name: "detail",
      data () {
        return {
          current: 'userMonitor',
          theme: 'dark',
          height:0,
          menu:[
            {
              key:'menu1',
              type:'dashboard',
              name:"监控用户管理",
              children:[
                {
                  key:"userMonitor",
                  name:"监控用户列表"
                }
              ]
            },
            {
              key:'menu2',
              type:'form',
              name:"地址监控规则管理",
              children:[
                {
                  key:"addressMonitor",
                  name:"地址监控规则管理列表"
                }
              ]
            },
            {
              key:'menu3',
              type:'table',
              name:"大额交易监控规则管理",
              children:[
                {
                  key:"transMonitor",
                  name:"大额监控规则管理列表"
                }
              ]
            },
            {
              key:'menu4',
              type:'profile',
              name:"监控币种管理",
              children:[
                {
                  key:"coinManage",
                  name:"监控币种管理列表"
                }
              ]
            },
            {
              key:'menu5',
              type:'check-circle',
              name:"用户管理",
              children:[
                {
                  key:"userManage",
                  name:"用户管理"
                }
              ]
            },
          ],

          user:this.$Cookies.get('user'),
          selectedKeys:['dataRecord'],
          inlineCollapsed:true
        }
      },
      methods: {

        handleClick2 (e) {
          console.log('click ', e)
          this.current = e.key;
          this.$router.push({name:e.key})
        },
        handleClick (e) {
          console.log('click ', e)
          this.current = e.key;
          this.$router.push({name:e.key})
        },
        onCollapse(collapsed, type) {
          console.log(collapsed, type);
        },
        onBreakpoint(broken) {
          console.log(broken);
        },
        showDeleteConfirm() {
          let that = this;
          that.$confirm({
            title: '确定退出登录吗',
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
              that.$router.push('/login')
              location.reload()
              // 0表示未登录
              sessionStorage.setItem("login","0")
            },
            onCancel() {
              console.log('Cancel');
            },
          });
        },
        outAjax(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/account/loginOut',
          }).then(res=>{
            if(res.data.code == "0"){
              that.$message.success(res.data.message);
              that.$router.push({name:"login"})
            }else {
              that.$message.error(res.data.message)
            }
          })
        },
        /*menuAjax(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/al/account/sysmanager',
          }).then(res=>{
            if(res.data.code == "0"){
              that.menu = res.data.data.data;
              that.$router.push({name:res.data.data.firstKey});

            }else {
              that.$message.error(res.data.message)
            }
          })
        }*/
      },
      watch:{
        $route: {
          handler: function(val, oldVal){
            console.log(val);
            let arr = [];
            arr.push(val.name);
            this.selectedKeys = arr;
          },
          // 深度观察监听
          deep: true
        }
      },
      mounted(){
        let that = this;
        that.height = $(window).height();
        window.onresize = () => {
          return (() => {
            that.heights = $(window).height();
          })()
        };
        //that.menuAjax();
        that.$router.push({name:'userMonitor'});
      }
    }
</script>

<style scoped>
  .detail{
    width: 100%;
    display: flex;

  }
  .left{
    width: 300px;
    height: 700px;
    background: #000f16;
  }
  .right{
    flex: 1;
  }
  .logo{
    height: 65px;
    background-color: #0f2e4e
  }
  .monitorCenter{
    color: white;
    margin-left: 60px;
    padding-top: 16px;
  }



</style>

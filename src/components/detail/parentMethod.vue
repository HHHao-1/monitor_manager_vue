<template>

</template>

<script>
import userMonitor from "./userMonitor/userMonitor";
import userNoticeLog from "./userMonitor/userNoticeLog";
import transMonitor from "./transMonitor/transMonitor";
import transNoticeLog from "./transMonitor/transNoticeLog";
import coinManage from "./coinManageBox/coinManage1";
import coinNoticeLog from "./coinManageBox/coinNoticeLog";
import addressMonitor from "./addressMonitor/addressMonitor1";
import addressNoticeLog from "./addressMonitor/addressNoticeLog"
export default {
  name: "parentMethod",
  data(){
    return{
      mainChainList:[],
      coinList:[],
      dataList:[],
      dataList1:[],
      userList:[],
    }
  },
  components:{
    userMonitor,
    userNoticeLog,
    transMonitor,
    transNoticeLog,
    coinManage,
    coinNoticeLog,

  },
  methods:{
    searchUserName(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/trans-rules',
        params:{
          coin:'',
          userName:'',
          userId:'',
          currentPage:1,
          pageSize:9999,
        }
      }).then(res=>{
        if(res.data.code == '1'){
          this.dataList1= res.data.data
          Object.keys(this.dataList1).forEach(key=>{
            let name = this.dataList1[key].name
            // let coin = this.dataList1[key].coinKind
            this.userList.push(name)
            // this.coinList.push(coin)
          })
        }
      })
    },
    /*searchCoinInfo(){
      this.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1){
          this.mainChainList = res.data.data;
        }
      })
    },*/
    searchCoinInfo(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'/monitor/admin/coinlist',
      }).then(res=>{

        if(res.data.code == '1'){
          that.dataList = res.data.data
          Object.keys(that.dataList).forEach(key=>{
            let filterList = {
              text:that.dataList[key],
              value:that.dataList[key]
            }
            that.columns[i].filters.push(filterList)
          })
        }
      })
    },

  },
}
</script>

<style scoped>

</style>

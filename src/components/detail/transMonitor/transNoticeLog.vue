<template>

  <div>
    <div class="top">
      <h2>提醒日志</h2>
      <a-button type="default" @click="gotoBack">返回</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="false" >
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block;"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          Search
        </a-button>
        <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
          Reset
        </a-button>
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
      <template slot="customRender" slot-scope="text">
      <span v-if="searchText && searchedColumn === column.dataIndex">
        <template
          v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
        >
          <mark
            v-if="fragment.toLowerCase() === searchText.toLowerCase()"
            :key="i"
            class="highlight"
          >{{ fragment }}</mark
          >
          <template v-else>{{ fragment }}</template>
        </template>
      </span>
        <template v-else>
          {{ text }}
        </template>
      </template>
      <span slot="notifyType" slot-scope="way">
        {{way | noticeWayFun}}
      </span>
      <span slot="noticeTime" slot-scope="time">
        {{time | timeFilter}}
      </span>
      <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
        提醒内容:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        交易哈希：[{{record.transHash}}]   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        异动时间：[{{record.unusualTime}}]
      </p>
    </a-table>
    <div class="page">
      <a-pagination
        :defaultCurrent="1"
        :current="currentPage"
        :total=total
        :pageSize="pageSize"
        @change="onChange"
        @showSizeChange="onShowSizeChange"
        :pageSizeOptions="pageNt" />
    </div>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
  import coinMixin from "../mixin/coinMixin";

export default {
  name: 'TransNoticeLog',
  mixins: [coinMixin],
  data() {
    return {
      pagination:false,
      total:0,
      pageNt:['8','10','20','30'],
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      dataList:[],
      dataList1:[],
      currentPage:1,
      pageSize:10,
      columns: [
        {
          title: '监控用户',
          dataIndex: 'userName',
          key: 'userName',
       //   width:'250px',
        },
        {
          title: '监控类型',
          dataIndex: 'monitorType',
          key: 'monitorType',
        //  width:'250px',
          /*filters: [
            { text: '大额交易监控', value: '大额交易监控' },
            { text: '地址异动监控', value: '地址异动监控' },
          ],*/
        },

        {
          title: '币种',
          dataIndex: 'coinKind',
          key: 'coinKind',
         // width:'200px',
          /*filters: [
            { text: 'BTC', value: 'BTC' },
            { text: 'ETC', value: 'ETC' },
          ],*/
          filters: [],
          onFilter: (value, record) => record.coinKind.indexOf(value) === 0,

        },
        {
          title: '通知方式',
          dataIndex: 'notifyType',
          key: 'notifyType',
        //  width:'300px',
          scopedSlots: {
            customRender: 'notifyType',
          }

        },
        {
          title: '提醒时间',
          dataIndex: 'noticeTime',
          key: 'noticeTime',
          scopedSlots: {
            customRender: 'noticeTime',
          }
        }
      ],
      currentItem: {} // 上页传入数据
    };
  },
  methods: {
    /*getTransLogList(){
      let id =sessionStorage.getItem('id');
      let coinArr=[];
      let str;
      let strAll='';
      this.$ajax({
        method:"get",
        url:'monitor/admin/coinmain',
      }).then(res=>{
        if(res.data.code==1001){
          coinArr= res.data.data;
          Object.keys(coinArr).forEach(key=>{
            if(coinArr[key][0] == '0' &&  coinArr[key][1] =='x'){
              coinArr[key]= coinArr[key].slice(2)
            }
            str = coinArr[key]+','
            strAll = strAll+ str
            })
              this.$ajax({
                method:"get",
                url:'/monitor/admin/notice-logs/trans',
                params:{
                  ruleId:id,
                  userName:name,
                  coinKind:strAll,
                  currentPage:this.currentPage,
                  pageSize:this.pageSize,
                }
              }).then(res=>{
                if(res.data.code == '1001'){
                  this.dataList = res.data.data.data
                  this.total=res.data.data.total
                  for(let i= 0 ;i<this.dataList.length;i++) {
                    this.dataList[i].monitorType = '大额交易监控'
                  }
                }
              })
          }
      })

    },*/
    async getTransLogList(){
      // let id = sessionStorage.getItem('id');

      // const coinmain =await  this.$ajax.get('monitor/admin/coinmain')
      // const {code,data} =coinmain.data
      // if(code ==1001){
      //   const coins = data.map(item => {
      //     return item
      //   }).join(',')
      //   const  coin = await this.$ajax.get('/monitor/admin/coincontract',{
      //     params:{
      //       coins,
      //     }
      //   })
      //   const {data: coinData,code : coinCode}=coin.data
      //   if(coinCode == 1001){
      //     const coinKind = coinData.map(item => {
      //       return item
      //     }).join(',')

      const coinKind = this.coinType.map(item => item.contractAddr).join(",")

          const dataList = await this.$ajax.get('/monitor/admin/notice-logs/trans',{
            params:{
              ruleId: this.currentItem.id,
              userName: name,
              coinKind,
              currentPage:this.currentPage,
              pageSize:this.pageSize,
            }
          })
          const {data: noticeData,code : noticeCode}=dataList.data
          if(noticeCode == '1001'){
            this.dataList = noticeData.content.map(item => {
              if (item.eventName != null) {
                item.monitorType = '地址异动监控'
              } else {
                item.monitorType = '大额交易监控'
              }

              const coinKindArr = this.coinType.filter(i => item.coinKind == i.contractAddr)
              if (coinKindArr.length > 0) {
                item.coinKind = coinKindArr[0].coinName
              }

              item.userName = this.currentItem.name
              return item
            })
            this.total = noticeData.totalElements
          } else {
            this.total = 0
            this.dataList = []
          }
      //   }
      //
      // }
    },
    gotoBack(){
      this.$router.replace('/transMonitor');
    },
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    onChange(page,pageSize){
      this.currentPage=page;
      this.getTransLogList();
    },
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.getTransLogList();
    },
    /*searchCoinInfo(){
      /!*this.$ajax({
        method:"get",
        url:'/monitor/admin/coinmain',
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList1 = res.data.data
          Object.keys(this.dataList1).forEach(key=>{
            let filterList = {
              text:this.dataList1[key],
              value:this.dataList1[key]
            }
            this.columns[2].filters.push(filterList)
          })

        }
      })
    },*!/
  },*/
    searchCoinInfo(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coinmain',
      }).then(res=>{
        if(res.data.code == '1001'){
          const { data } = res.data
          this.dataList1 = data.map(item => {
            if (item.startsWith('0x')) {
              return {
                text: item.substring(2, item.length),
                value: item
              }
            }
            return {
              text: item,
              value: item
            }
          })
          let obj = {};
          let result = [];
          for(let i =0; i<this.dataList1.length; i++){
            if(!obj[this.dataList1[i].text]){
              result.push(this.dataList1[i]);
              obj[this.dataList1[i].text] = true;
            }
          }
          console.log(result)
          this.columns[2].filters = result

        }
      })
    },
    fetchAfterHasCoinType() {
      this.getTransLogList();
    }
  },
  filters:{
    timeFilter(time){
      if(time!=null) {
        let d = new Date(time);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        let hours = d.getHours();
        let min = d.getMinutes();
        let seconds = d.getSeconds();
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;
        if (hours < 0) hours = '0' + hours;
        if (min < 10) min = '0' + min;
        if (seconds < 10) seconds = '0' + seconds;
        return (year + '-' + month + '-' + day + '  ' + hours + ':' + min + ':' + seconds);
      }
    },
    noticeWayFun(way){
      if(way==0){
        return '短信'
      }
      else if(way == 1){
        return '邮件'
      }else if(way == 2){
        return '客户端提醒'
      }else if(way == 3) {
        return '短信、邮件'
      }else if(way ==4){
        return '短信、客户端提醒'
      }else if(way == 5){
        return '邮件、客户端提醒'
      }else if(way == 6){
        return '短信、邮件、客户端提醒'
      }
    },
  },
  mounted() {
    // this.getTransLogList();
    // this.searchCoinInfo();
    this.currentItem = JSON.parse(sessionStorage.getItem('id'));
  }
};
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
.top{
  display: flex;
  justify-content: space-between;
}
</style>

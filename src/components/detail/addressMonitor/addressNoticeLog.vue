<template>

  <div>
    <div class="top">
      <h2>提醒日志</h2>
      <a-button type="default" @click="gotoBack">返回</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="pagination" @change="handleChange">
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          v-model="searchEvent"
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
        <!--<div >
          <a-input
            style="width: 188px; margin-bottom: 8px; display: block;left:80px"
            placeholder="Search EventName"
            v-model="searchEvent"
            @pressEnter="searchEventAjax"
            id="searchInput"
          />
          <a-button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px; margin-right: 8px;left:80px"
            @click="searchEventAjax"
          >
            Search
          </a-button>
          <a-button size="small" style="width: 90px;left:80px" @click="reset">
            Reset
          </a-button>
        </div>-->
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
      <template slot="customRender" slot-scope="text, record, index, column">
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
      <span slot="noticeWay" slot-scope="way">
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
        showQuickJumper showSizeChanger
        :defaultCurrent="1"
        :total=total
        :pageSize="pageSize"
        @change="onChange"
        @showSizeChange="onShowSizeChange"
        :pageSizeOptions="pageNt" />
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      isEvent:false,
      searchEvent:'',
      pagination:false,
      currentPage:1,
      pageSize:8,
      total:500,
      pageNt:['8','10','20','30'],
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      dataList:[],
      dataList1:[],
      columns: [
        {
          title: '监控用户',
          dataIndex: 'userName',
          key: 'userName',
        //  width:'200px',
        },
        {
          title: '监控类型',
          dataIndex: 'monitorType',
          key: 'monitorType',
        //  width:'200px',
          /*filters: [
            { text: '大额交易监控', value: '大额交易监控' },
            { text: '地址异动监控', value: '地址异动监控' },
          ],*/
        },
        {
          title: '监控事件',
          dataIndex: 'eventName',
          key: 'eventName',
        //  width:'300px',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          onFilter: (value, record) =>
            record.name
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => {
                const input = document.getElementById('searchInput')
                input.focus()
               // this.searchInput.focus();
              }, 0);
            }
          },
        },

        {
          title: '币种',
          dataIndex: 'coinKind',
          key: 'coinKind',
        //  width:'200px',
          /*filters: [
            { text: 'BTC', value: 'BTC' },
            { text: 'ETC', value: 'ETC' },
          ],*/
          filters:[],
          onFilter: (value, record) => record.coinKind.indexOf(value) === 0,

        },
        {
          title: '通知方式',
          dataIndex: 'noticeWay',
          key: 'noticeWay',
       //   width:'300px',
          scopedSlots: {
            customRender: 'noticeWay',
          }

        },
        {
          title: '提醒时间',
          dataIndex: 'noticeTime',
          key: 'noticeTime',
          scopedSlots: {
            customRender: 'noticeTime',
          }
        },

      ],
    };
  },
  methods: {
    getStrList(array){
      let list=[];
      let str;
      let strAll='';
      Object.keys(array).forEach(key=>{
        if(array[key][0] == '0' &&  array[key][1] =='x'){
          array[key]= array[key].slice(2)
        }
        str = array[key];
        list.push(str)
      })
      return this.unique(list)
    },
    /*getAddrLogList(){
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
              url:'/monitor/admin/notice-logs/addr',
              params:{
                ruleId:id,
                userName:'',
                eventName:'',
                coinKind:strAll,
                currentPage:this.currentPage,
                pageSize:this.pageSize,
              }
            }).then(res=>{
              if(res.data.code == '1001'){
                this.dataList = res.data.data.data;
                this.total=res.data.data.total
                for(let i= 0 ;i<this.dataList.length;i++) {
                  this.dataList[i].monitorType = '地址异动监控'
                }
              }
            })
          }
      })


    },*/
    async getAddrLogList(){
      let id =sessionStorage.getItem('id2');
      const coinmain =await  this.$ajax.get('monitor/admin/coinmain')
      const {code,data} =coinmain.data
      if(code ==1001){
        const coins = data.map(item => {
          return item
        }).join(',')
        const  coin = await this.$ajax.get('/monitor/admin/coincontract',{
          params:{
            coins,
          }
        })
        const {data: coinData,code : coinCode}=coin.data
        if(coinCode == 1001){
          const coinKind = coinData.map(item => {
            return item
          }).join(',')
          const dataList = await this.$ajax.get('/monitor/admin/notice-logs/addr',{
            params:{
              ruleId:id,
              userName:'',
              eventName:'',
              coinKind,
              currentPage:this.currentPage,
              pageSize:this.pageSize,
            }
          })
          const {data: noticeData,code : noticeCode}=dataList.data
          if(noticeCode == '1001'){
            this.dataList = noticeData.data.map(item => {
              if (item.eventName != null) {
                item.monitorType = '地址异动监控'
              } else {
                item.monitorType = '大额交易监控'
              }
              return item
            })
            Object.keys(this.dataList).forEach(key=>{
              console.log(this.dataList[key].coinKind)
              if(this.dataList[key].coinKind.startsWith('0x')){
                this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
              }
            })
            this.total = noticeData.total
          }
        }

      }
    },

    async handleChange(pagination, filters, sorter, { currentDataSource }){

    },
    searchEventAjax(){
      this.isEvent=true
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs/addr',
        params:{
          eventName:this.searchEvent,
          coinKind:'',
          currentPage:this.currentPage,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total = res.data.data.total
        }
        else {
          this.dataList = null
        }
      })
    },
    reset(){
      this.searchEvent = '';
      this.getAddrLogList();
    },
    gotoBack(){
      this.$router.replace('/addressMonitor');
    },
    /*handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      let id =sessionStorage.getItem('id');
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs/addr',
        params:{
          ruleId:id,
          userName:'',
          eventName:this.searchEvent,
          coinKind:'',
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data;
          this.total=res.data.data.total
          for(let i= 0 ;i<this.dataList.length;i++) {
            this.dataList[i].monitorType = '地址异动监控'
          }
        }
      })
    },*/
    async handleSearch(selectedKeys, confirm, dataIndex){
      confirm();
      let id =sessionStorage.getItem('id2');
      const coinmain =await  this.$ajax.get('monitor/admin/coinmain')
      const {code,data} =coinmain.data
      if(code ==1001){
        const coins = data.map(item => {
          return item
        }).join(',')
        const  coin = await this.$ajax.get('/monitor/admin/coincontract',{
          params:{
            coins,
          }
        })
        const {data: coinData,code : coinCode}=coin.data
        if(coinCode == 1001){
          const coinKind = coinData.map(item => {
            return item
          }).join(',')
          const dataList = await this.$ajax.get('/monitor/admin/notice-logs/addr',{
            params:{
              ruleId:id,
              userName:'',
              eventName:this.searchEvent,
              coinKind,
              currentPage:1,
              pageSize:this.pageSize,
            }
          })
          const {data: noticeData,code : noticeCode}=dataList.data
          if(noticeCode == '1001'){
            this.dataList = noticeData.data.map(item => {
              if (item.eventName != null) {
                item.monitorType = '地址异动监控'
              } else {
                item.monitorType = '大额交易监控'
              }
              return item
            })
            Object.keys(this.dataList).forEach(key=>{
              console.log(this.dataList[key].coinKind)
              if(this.dataList[key].coinKind.startsWith('0x')){
                this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
              }
            })
            this.total = noticeData.total
          }
        }

      }
    },

    /*handleReset(clearFilters) {
      clearFilters();
      this.searchEvent = '';
      let id =sessionStorage.getItem('id');
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs/addr',
        params:{
          ruleId:id,
          userName:'',
          eventName:this.searchEvent,
          coinKind:'',
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data;
          this.total=res.data.data.total
          for(let i= 0 ;i<this.dataList.length;i++) {
            this.dataList[i].monitorType = '地址异动监控'
          }
        }
      })
    },*/
    async handleReset(clearFilters){
      clearFilters()
      this.searchEvent='';
      let id =sessionStorage.getItem('id2');
      const coinmain =await  this.$ajax.get('monitor/admin/coinmain')
      const {code,data} =coinmain.data
      if(code ==1001){
        const coins = data.map(item => {
          return item
        }).join(',')
        const  coin = await this.$ajax.get('/monitor/admin/coincontract',{
          params:{
            coins,
          }
        })
        const {data: coinData,code : coinCode}=coin.data
        if(coinCode == 1001){
          const coinKind = coinData.map(item => {
            return item
          }).join(',')
          const dataList = await this.$ajax.get('/monitor/admin/notice-logs/addr',{
            params:{
              ruleId:id,
              userName:'',
              eventName:this.searchEvent,
              coinKind,
              currentPage:1,
              pageSize:this.pageSize,
            }
          })
          const {data: noticeData,code : noticeCode}=dataList.data
          if(noticeCode == '1001'){
            this.dataList = noticeData.data.map(item => {
              if (item.eventName != null) {
                item.monitorType = '地址异动监控'
              } else {
                item.monitorType = '大额交易监控'
              }
              return item
            })
            Object.keys(this.dataList).forEach(key=>{
              console.log(this.dataList[key].coinKind)
              if(this.dataList[key].coinKind.startsWith('0x')){
                this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
              }
            })
            this.total = noticeData.total
          }
        }

      }

    },
    onChange(page,pageSize){
      this.currentPage=page;
      if(this.isEvent) {
        this.searchEventAjax()
      }
      else {
        this.getAddrLogList();
      }
    },
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.getAddrLogList();
    },
    /*searchCoinInfo(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coinmain',
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList1 = res.data.data
          //this.dataList1=this.getStrList(this.dataList1)
          Object.keys(this.dataList1).forEach(key=>{
            let filterList = {
              text:this.dataList1[key],
              value:this.dataList1[key]
            }
            this.columns[3].filters.push(filterList)
          })
        }
      })
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
          this.columns[3].filters = result

        }
      })
    },
  },
  filters:{
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
  },
  mounted() {
    this.getAddrLogList();
    //setTimeout(this.searchCoinInfo(), 1000);
    this.searchCoinInfo()


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

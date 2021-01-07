<template>

  <div>
    <div class="top">
      <h2>提醒日志</h2>
      <a-button type="default" @click="gotoBack" >返回</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="pagination"  @change="tableFilterChangeHandle">
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
        <!--<a-input
          style="width: 188px; margin-bottom: 8px; display: block;"
          placeholder="Search Name"
          v-model="searchEvent"
          @pressEnter="searchEventAjax"
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="searchEventAjax"
        >
          Search
        </a-button>
        <a-button size="small" style="width: 90px" @click="reset">
          Reset
        </a-button>-->
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
      <span slot="notifyType" slot-scope="notifyType">
        {{notifyType | noticeWayFun}}
      </span>
      <!--<span slot="noticeTime" slot-scope="time">
        {{time | timeFilter}}
      </span>-->
      <span slot="noticeTime" slot-scope="time"> {{time | timeFilter}}</span>
      <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
        提醒内容:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        交易哈希：[{{record.transHash}}]   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        异动时间：[{{record.unusualTime | timeFilter}}]
      </p>
    </a-table>
    <div class="page">
      <a-pagination
        showQuickJumper showSizeChanger
        :defaultCurrent="1"
        :current="this.currentPage"
        :total=total
        :pageSize="pageSize"
        @change="onChange"
        @showSizeChange="onShowSizeChange"
        :pageSizeOptions="pageNt" />
    </div>

  </div>
</template>

<script>
import coinMixin from "../mixin/coinMixin";

export default {
  name: "UserNoticeLog",
  mixins: [coinMixin],
  data() {
    let monitorType=[];

    return {
      isEvent:false,
      searchEvent:'',
      pagination:false,
      currentPage:1,
      pageSize:8,
      total:0,
      pageNt:['8','10','20','30'],
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      dataList:[],
      dataList1:[],
      isSearchMonitorType:false,
      filtersObj: {monitorType},
      strAllCoin:'',
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
          filters: [
            { text: '大额交易监控', value: '大额交易监控' },
            { text: '地址异动监控', value: '地址异动监控' },
          ],
          onFilter: (value, record) => record.monitorType.indexOf(value) === 0,
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
          /*onFilter: (value, record) =>
            record.name
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),*/
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              }, 0);
            }
          },
        },

        {
          title: '币种',
          dataIndex: 'coinKind',
          key: 'coinKind',
        //  width:'200px',
          filters: [],
         // onFilter: (value, record) => record.coinKind.indexOf(value) === 0,

        },
        {
          title: '通知方式',
          dataIndex: 'notifyType',
          key: 'notifyType',
        //  width:'250px',
          scopedSlots: {
            customRender: 'notifyType',
          }

        },
        {
          title: '提醒时间',
          dataIndex: 'noticeTime',
          key: 'noticeTime',
          align:'center',
          scopedSlots: {
            customRender: 'noticeTime',
          }
        },

      ],
      currentUser: {},
      searchMonitorType: '', // 检索监控类型
      searchEventName: '',   // 检索监控事件
      coinKinds: ''          // 检索的币种条件
    };
  },
  methods: {
    async pageHandleChange(pagination, filters, sorter, { currentDataSource }){
      let name = sessionStorage.getItem('name1');
      const { monitorType } = filters
      if (monitorType.length == 1) {
        const [ first ] = monitorType
        if (first === '大额交易监控') {
          debugger
          const coinmain = await this.$ajax.get('monitor/admin/coinmain')
          const {code, data} = coinmain.data
          if (code == 1001) {
            const coins = data.map(item => {
              return item
            }).join(',')
            const coin = await this.$ajax.get('/monitor/admin/coincontract', {
              params: {
                coins,
              }
            })
            const {data: coinData, code: coinCode} = coin.data
            if (coinCode == 1001) {
              const coinKind = coinData.map(item => {
                return item
              }).join(',')
              const dataList = await this.$ajax.get('/monitor/admin/notice-logs', {
                params: {
                  userName: name,
                  monitorType: 'trans',
                  eventName: '',
                  coinKind,
                  currentPage:1,
                  pageSize: this.pageSize,
                }
              })
              const {data: noticeData, code: noticeCode} = dataList.data
              if (noticeCode == '1001') {
                this.dataList = noticeData.data.map(item => {
                  if (item.eventName != null) {
                    item.monitorType = '地址异动监控'
                  } else {
                    item.monitorType = '大额交易监控'
                  }
                  return item
                })
                Object.keys(this.dataList).forEach(key => {
                  console.log(this.dataList[key].coinKind)
                  if (this.dataList[key].coinKind.startsWith('0x')) {
                    this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2, this.dataList[key].coinKind.length)
                  }
                })
                this.total = noticeData.total
                //debugger
              }
            }
          }
        }
        else{
          let name = sessionStorage.getItem('name1');
          const { monitorType } = filters
          if (monitorType.length == 1) {
            const [first] = monitorType
            if (first === '地址异动监控') {
              debugger
              const coinmain = await this.$ajax.get('monitor/admin/coinmain')
              const {code, data} = coinmain.data
              if (code == 1001) {
                const coins = data.map(item => {
                  return item
                }).join(',')
                const coin = await this.$ajax.get('/monitor/admin/coincontract', {
                  params: {
                    coins,
                  }
                })
                const {data: coinData, code: coinCode} = coin.data
                if (coinCode == 1001) {
                  const coinKind = coinData.map(item => {
                    return item
                  }).join(',')
                  const dataList = await this.$ajax.get('/monitor/admin/notice-logs', {
                    params: {
                      userName: name,
                      monitorType: 'addr',
                      eventName: '',
                      coinKind,
                      currentPage: 1,
                      pageSize: this.pageSize,
                    }
                  })
                  const {data: noticeData, code: noticeCode} = dataList.data
                  if (noticeCode == '1001') {
                    this.dataList = noticeData.data.map(item => {
                      if (item.eventName != null) {
                        item.monitorType = '地址异动监控'
                      } else {
                        item.monitorType = '大额交易监控'
                      }
                      return item
                    })
                    Object.keys(this.dataList).forEach(key => {
                      console.log(this.dataList[key].coinKind)
                      if (this.dataList[key].coinKind.startsWith('0x')) {
                        this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2, this.dataList[key].coinKind.length)
                      }
                    })
                    this.total = noticeData.data.length
                  }
                }
              }
            }
          }
        }
      }
      else {
        let name = sessionStorage.getItem('name1');
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
            const dataList = await this.$ajax.get('/monitor/admin/notice-logs',{
              params:{
                userName:name,
                monitorType:'',
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
              this.total = noticeData.data.length
            }
          }

        }

      }
    },
    searchEventAjax(){
      this.isEvent=true
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs',
        params:{
          monitorType:'',
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
      this.searchEvent='';
      this.getUserLogList();
    },
    onChange(page,pageSize){
      this.currentPage=page;
      this.commonFetchUserLogList()
      // if(this.isEvent){
      //   this.handleSearch()
      //   console.log('执行 分页2')
      // }
      // else if(this.isSearchMonitorType){
      //   console.log('执行 分页3')
      //   this.handleChange()
      // }
      // else{
      //   this.getUserLogList();
      // }
    },
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.commonFetchUserLogList()
      // this.getUserLogList();
    },
    // 获取用户数据
    async getUserLogList(){
      let name = sessionStorage.getItem('name1');
      const coinmain = await this.$ajax.get('monitor/admin/coinmain')
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
          const dataList = await this.$ajax.get('/monitor/admin/notice-logs',{
            params:{
              userName:name,
              monitorType:'',
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
            this.total = noticeData.data.length
          }
        }

      }
    },
    gotoBack(){
      this.$router.replace('/userMonitor');
    },
    /*handleSearch(selectedKeys, confirm, dataIndex) {
      this.isEvent=true
      confirm();
      let name = sessionStorage.getItem('name1');
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs',
        params:{
          userName:name,
          monitorType:'',
          eventName:this.searchEvent,
          coinKind:'',
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total = res.data.data.total
          for(let i = 0 ;i< this.dataList.length;i++) {
            if (this.dataList[i].eventName != null) {
              this.dataList[i].monitorType = '地址异动监控'
            } else {
              this.dataList[i].monitorType = '大额交易监控'
            }

          }

        }
      })
    },*/
    async handleSearch(selectedKeys, confirm, dataIndex){
      confirm();
      // let name = sessionStorage.getItem('name1');
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
      //     const dataList = await this.$ajax.get('/monitor/admin/notice-logs',{
      //       params:{
      //         userName:name,
      //         monitorType:'',
      //         eventName:this.searchEvent,
      //         coinKind,
      //         currentPage:1,
      //         pageSize:this.pageSize,
      //       }
      //     })
      //     const {data: noticeData,code : noticeCode}=dataList.data
      //     if(noticeCode == '1001'){
      //       this.dataList = noticeData.data.map(item => {
      //         if (item.eventName != null) {
      //           item.monitorType = '地址异动监控'
      //         } else {
      //           item.monitorType = '大额交易监控'
      //         }
      //         return item
      //       })
      //       Object.keys(this.dataList).forEach(key=>{
      //         console.log(this.dataList[key].coinKind)
      //         if(this.dataList[key].coinKind.startsWith('0x')){
      //           this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
      //         }
      //       })
      //       this.total = noticeData.total
      //     }
      //   }
      // }
    },
    async handleReset(clearFilters){
      clearFilters();
      // this.searchEvent='';
      // let name = sessionStorage.getItem('name1');
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
      //     const dataList = await this.$ajax.get('/monitor/admin/notice-logs',{
      //       params:{
      //         userName:name,
      //         monitorType:'',
      //         eventName:'',
      //         coinKind,
      //         currentPage:1,
      //         pageSize:this.pageSize,
      //       }
      //     })
      //     const {data: noticeData,code : noticeCode}=dataList.data
      //     if(noticeCode == '1001'){
      //       this.dataList = noticeData.data.map(item => {
      //         if (item.eventName != null) {
      //           item.monitorType = '地址异动监控'
      //         } else {
      //           item.monitorType = '大额交易监控'
      //         }
      //         return item
      //       })
      //       Object.keys(this.dataList).forEach(key=>{
      //         console.log(this.dataList[key].coinKind)
      //         if(this.dataList[key].coinKind.startsWith('0x')){
      //           this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
      //         }
      //       })
      //       this.total = noticeData.total
      //     }
      //
      // }
    },
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
    // 过滤条件
    tableFilterChangeHandle(pagination, filters) {
      this.currentPage = 1
      // 说明是监控类型变化
      if (filters.monitorType != undefined) {
        if (filters.monitorType.length == 2 || filters.monitorType.length == 0) {
          this.searchMonitorType = ''
        } else {
          const [ first ] = filters.monitorType
          if (first === '大额交易监控') {
            this.searchMonitorType = '2'
          } else {
            this.searchMonitorType = '1'
          }
        }
      }

      // 案件监控事件进行检索
      if (filters.eventName != undefined) {
        if (filters.eventName.length == 0) {
          this.searchEventName = ''
          this.searchEvent = ''
        } else {
          this.searchEventName = filters.eventName[0]
        }
      }

      // 币种检索条件过滤
      if (filters.coinKind != undefined) {
        if (filters.coinKind.length == 0) {
          this.coinKinds = ''
        } else {
          this.coinKinds = filters.coinKind.join(',')
        }
      }

      this.commonFetchUserLogList()
    },
    // mixin 同一接口
    fetchAfterHasCoinType() {
      this.createColumnsFilters()
      this.commonFetchUserLogList()
    },
    // 创建币种过滤条件
    createColumnsFilters() {
      const filtersResult = this.coinType.map(item => {
        return {
          text: item.coinName,
          value: item.contractAddr
        }
      })
      this.columns[3].filters = filtersResult
    },
    // 获取用户信息
    async commonFetchUserLogList() {

      const params = {
        userId: this.currentUser.id,
        page: this.currentPage - 1,
        size: this.pageSize,
        monitorType: this.searchMonitorType,
        eventName: this.searchEventName,
        coinKinds: this.coinKinds
      }

      const dataList = await this.$ajax.get('/monitor/admin/events/logs/user', { params })
      const { data: noticeData,code : noticeCode} = dataList.data
      if(noticeCode == 1001){
        this.dataList = noticeData.content.map((item, index) => {
          if (item.eventName != null) {
            item.monitorType = '地址异动监控'
          } else {
            item.monitorType = '大额交易监控'
          }
          const coinKindArr = this.coinType.filter(i => item.coinKind == i.contractAddr)
          if (coinKindArr.length > 0) {
            item.coinKind = coinKindArr[0].coinName
          }
          item.userName = this.currentUser.name
          item.key = index
          return item
        })
        this.total = noticeData.totalElements
      } else {
        this.dataList = []
        this.total = 0
      }
    }
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
      //let d = time ? new Date(time):'';
      //let d = time ? new Date(time) : new Date();
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
    // 以前的逻辑 现在先不调用这个方法
    // this.getUserLogList();
    // this.searchCoinInfo();
    const userInfo = sessionStorage.getItem('name1');
    this.currentUser = JSON.parse(userInfo)
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

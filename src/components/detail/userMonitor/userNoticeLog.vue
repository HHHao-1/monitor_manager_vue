<template>

  <div>
    <div class="top">
      <h2>提醒日志</h2>
      <a-button type="default" @click="gotoBack" >返回</a-button>
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
      <!--<span slot="noticeTime" slot-scope="time">
        {{time | timeFilter}}
      </span>-->
      <span slot="noticeTime" slot-scope="time"> {{time | timeFilter}}</span>
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
          width:'200px',
        },
        {
          title: '监控类型',
          dataIndex: 'monitorType',
          key: 'monitorType',
          width:'200px',
          filters: [
            { text: '大额交易监控', value: '大额交易监控' },
            { text: '地址异动监控', value: '地址异动监控' },
          ],
          //onFilter: (value, record) => record.monitorType.indexOf(value) === 0,
        },
        {
          title: '监控事件',
          dataIndex: 'eventName',
          key: 'eventName',
          width:'300px',
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
          width:'200px',
          filters: [],
         // onFilter: (value, record) => record.coinKind.indexOf(value) === 0,

        },
        {
          title: '通知方式',
          dataIndex: 'noticeWay',
          key: 'noticeWay',
          width:'250px',
          scopedSlots: {
            customRender: 'noticeWay',
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
    };
  },
  methods: {
    handleChange(pagination, filters, sorter, { currentDataSource }){
      console.log('params', pagination, filters, sorter);
      let filtersObj = [] ;
      filtersObj=filters
      console.log('1111')
      console.log(filtersObj)
      let trans,addr;
      if(filtersObj.monitorType.length==1){
        if(filtersObj.monitorType[0] == '大额交易监控'){
          let name = sessionStorage.getItem('name');
          this.$ajax({
            method:"get",
            url:'/monitor/admin/notice-logs',
            params:{
              userName:name,
              monitorType:'trans',
              eventName:'',
              coinKind:'',
              currentPage:this.currentPage,
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
        }
        else {
          let name = sessionStorage.getItem('name');
          this.$ajax({
            method:"get",
            url:'/monitor/admin/notice-logs',
            params:{
              userName:name,
              monitorType:'addr',
              eventName:'',
              coinKind:'',
              currentPage:this.currentPage,
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

        }
      }
      else{
        let name = sessionStorage.getItem('name');
        this.$ajax({
          method:"get",
          url:'/monitor/admin/notice-logs',
          params:{
            userName:name,
            monitorType:'',
            eventName:'',
            coinKind:'',
            currentPage:this.currentPage,
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
      }
      /*for(let i=0;i<filtersObj.monitorType.length;i++){
        console.log(filtersObj.monitorType[i])
      }*/

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
        console.log(res)
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
      console.log(page,pageSize)
      this.currentPage=page;
      if(this.isEvent){
        this.searchEventAjax()
      }
      else{
        this.getUserLogList();
      }
    },
    onShowSizeChange(current, pageSize) {
      console.log(current, pageSize);
      this.pageSize = pageSize;
      this.getUserLogList();
    },
    getUserLogList(){    //需要上一个页面传入name
      let name = sessionStorage.getItem('name');
      //console.log(name)
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs',
        params:{
          userName:name,
          monitorType:'',
          eventName:'',
          coinKind:'',
          currentPage:this.currentPage,
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
       //   console.log(sessionStorage.getItem("logName"))

        }
      })
    },
    gotoBack(){
      this.$router.replace('/userMonitor');
    },
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      let name = sessionStorage.getItem('name');
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs',
        params:{
          userName:name,
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
          for(let i = 0 ;i< this.dataList.length;i++) {
            if (this.dataList[i].eventName != null) {
              this.dataList[i].monitorType = '地址异动监控'
            } else {
              this.dataList[i].monitorType = '大额交易监控'
            }
          }
        }
      })
    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchEvent = '';
      let name = sessionStorage.getItem('name');
      //console.log(name)
      this.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs',
        params:{
          userName:name,
          monitorType:'',
          eventName:'',
          coinKind:'',
          currentPage:this.currentPage,
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

    },
    searchCoin(){
      // this.$parent.searchCoinInfo();
      this.$emit('searchCoinInfo');
    },
    searchCoinInfo(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coinlist',
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          console.log(res.data.data)
          this.dataList1 = res.data.data
          Object.keys(this.dataList1).forEach(key=>{
            let filterList = {
              text:this.dataList1[key],
              value:this.dataList1[key]
            }
            this.columns[3].filters.push(filterList)
          })
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
    this.getUserLogList();
    this.searchCoinInfo();
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

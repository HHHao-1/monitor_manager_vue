<template>

  <div>
    <div class="top">
      <h2>提醒日志</h2>
      <a-button type="default" @click="gotoBack">返回</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="pagination" >
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <!--<a-input
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
        </a-button>-->
        <div >
          <a-input
            style="width: 188px; margin-bottom: 8px; display: block;left:80px"
            placeholder="Search EventName"
            v-model="searchEvent"
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
        </div>
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
      <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
        提醒内容:<br>
        1.交易哈希：{{record.transHash}}<br>
        2.异动时间：{{record.unusualTime}}
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
const data = [
  {
    name:'张三',
    coinKind:'BTC',
    monitorMinVal:100,
    noticeWay:1,
    addTime:'2020-10-01',
    state:1,
  },
  {
    name:'张三',
    coinKind:'BTC',
    monitorMinVal:100,
    noticeWay:2,
    addTime:'2020-10-01',
    state:1,
  },
  {
    name:'张三',
    coinKind:'BTC',
    monitorMinVal:40,
    noticeWay:3,
    addTime:'2020-10-01',
    state:0,
  },
  {
    name:'张三',
    coinKind:'BTC',
    monitorMinVal:60,
    noticeWay:4,
    addTime:'2020-10-01',
    state:0,
  },
];

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
      data,
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      dataList:[],
      dataList1:[],
      columns: [
        {
          title: '监控用户',
          dataIndex: 'userName',
          key: 'userName'
        },
        {
          title: '监控类型',
          dataIndex: 'monitorType',
          key: 'monitorType',
          /*filters: [
            { text: '大额交易监控', value: '大额交易监控' },
            { text: '地址异动监控', value: '地址异动监控' },
          ],*/
        },
        {
          title: '监控事件',
          dataIndex: 'eventName',
          key: 'eventName',
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
                this.searchInput.focus();
              }, 0);
            }
          },
        },

        {
          title: '币种',
          dataIndex: 'coinKind',
          key: 'coinKind',
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
          scopedSlots: {
            customRender: 'noticeWay',
          }

        },
        {
          title: '提醒时间',
          dataIndex: 'noticeTime',
          key: 'noticeTime',
        },

      ],
    };
  },
  methods: {
    getAddrLogList(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'/monitor/admin/notice-logs/addr',
        params:{
          eventName:'',
          coinKind:'',
          currentPage:that.currentPage,
          pageSize:that.pageSize,
        }
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          that.dataList = res.data.data.data;
          that.total=res.data.data.total
          for(let i= 0 ;i<res.data.data.length;i++) {
            that.dataList[i].monitorType = '地址异动监控'
          }
        }
      })
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
      this.searchEvent = '';
      this.getDataList();
    },
    /*searchCoinInfo(i){
      //this.$parent.searchCoinInfo(i);
      this.$emit('searchCoinInfo')
    },*/
    gotoBack(){
      this.$router.replace('/addressMonitor');
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
      console.log(page,pageSize)
      this.currentPage=page;
      if(this.isEvent) {
        this.searchEventAjax()
      }
      else {
        this.getDataList();
      }
    },
    onShowSizeChange(current, pageSize) {
      console.log(current, pageSize);
      this.pageSize = pageSize;
      this.getDataList();
    },
    searchCoinInfo(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'/monitor/admin/coinlist',
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          console.log(res.data.data)
          that.dataList = res.data.data
          Object.keys(that.dataList).forEach(key=>{
            let filterList = {
              text:that.dataList[key],
              value:that.dataList[key]
            }
            that.columns[3].filters.push(filterList)
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
      }

    }
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

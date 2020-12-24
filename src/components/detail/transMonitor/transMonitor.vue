<template>
  <div>
    <div class="top">
      <h2>大额交易监控规则管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
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
          style="width: 188px; margin-bottom: 8px; display: block;left:80px"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px;left:80px"
          @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          Search
        </a-button>
        <a-button size="small" style="width: 90px;left:80px" @click="() => handleReset(clearFilters)">
          Reset
        </a-button>-->
        <a-input
          style="width: 188px; margin-bottom: 8px; display: block;left: 70px"
          v-model="searchName1"
          placeholder="Search Name"
          id="searchInput"
          @pressEnter="searchNameAjax"
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px;left: 70px"
          @click="searchNameAjax"
        >
          Search
        </a-button>
        <a-button size="small" style="width: 90px;left: 70px" @click="reset">
          Reset
        </a-button>

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
      <span slot="state" slot-scope="tags">
        <a-badge :status="statePoint(tags)"></a-badge>
        {{tags | stateFun}}
      </span>
      <span slot="eventAddTime" slot-scope="time">
        {{time | timeFilter}}
      </span>
      <span slot="action" slot-scope="text, record">
        <a  @click="edit(text.id,text.name,text.coinKind,text.monitorMinVal,text.noticeWay)">编辑</a>
        <a  v-show="text.state == 0"  @click="startUse(text.id)">启用</a>
        <a  v-show="text.state == 1"  @click="stopUse(text.id)">停用</a>
        <a  @click="gotoLog">提醒日志</a>
        <!--{{text.id}}{{text.coinKind}}{{text.monitorMinVal}}{{text.name}}{{text.coinKind}}-->
      </span>
      <span slot="noticeWay" slot-scope="way">
      {{way | noticeWayFun}}
      </span>
    </a-table>

    <!--添加弹出框-->
    <a-modal
      title="添加交易监控"
      v-model="visible"
      cancelText="取消"
      okText="确定"
      @ok="handleOk"
      @cancel="cancelClick"
      width="800px"
    >
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <p class="tmp3">
          <a-form-item label="监控用户" >
            <a-select  style="width: 300px"  v-model="uploadData.name"  placeholder="请选择"  v-decorator="['name',{rules: [{required: true,whitespace: true,message: '请选择监控用户',},],},]">
              <a-select-option v-for="(item,i) in unique(userList)" :value="item" :key="i">
                {{item}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="币种">
            <a-select style="width: 300px"  v-model="uploadData.coinKind"  placeholder="请选择"  v-decorator="['coinKind',{rules: [{required: true,whitespace: true,message: '请选择币种',},],},]">
              <a-select-option v-for="(item,i) in unique(coinList)" :value="item" :key="i" >
                {{item}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <span>&nbsp;&nbsp;监控阈值:&nbsp;&nbsp;&nbsp; </span>
          <a-input style="width: 300px" placeholder="请输入阈值" v-model="uploadData.monitorMinVal"/>
        </p>
        <br>
        <p class="tmp3">
          <span>&nbsp;&nbsp;通知方式 :&nbsp;&nbsp; </span>
          <a-checkbox-group v-model="uploadData.noticeWay" >
            <a-row>
              <a-checkbox value="0">短信</a-checkbox>
              <a-checkbox value="1">邮件</a-checkbox>
              <a-checkbox value="2">客户端提醒</a-checkbox>
            </a-row>
          </a-checkbox-group>
        </p>
      </a-form>
    </a-modal>
    <!--编辑弹出框-->
    <a-modal
      title="编辑交易监控"
      v-model="editVisible"
      cancelText="取消"
      okText="确定"
      @ok="editHandleOk"
      @cancel="editCancelClick"
      width="800px"
    >
      <a-form :form="editForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <!--<p class="tmp3" v-if="false">
          <span>&nbsp;&nbsp;监控阈值:&nbsp;&nbsp;&nbsp; </span>
          <a-input style="width: 300px" placeholder="请输入" v-model="uploadData2.id"/>
        </p>-->
        <p class="tmp3">
          <a-form-item label="监控用户" >
            <a-select style="width: 300px" v-model="uploadData2.name"  placeholder="请选择" v-decorator="['name',{rules: [{required: true,whitespace: true,message: '请选择监控用户',},],},]">
              <a-select-option v-for="(item,i) in unique(userList)" :value="item" :key="i">
                {{item}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="币种">
            <a-select style="width: 300px" v-model="uploadData2.coinKind"  placeholder="请选择" v-decorator="['coinKind',{rules: [{required: true,whitespace: true,message: '请选择币种',},],},]">
              <a-select-option v-for="(item,i) in unique(coinList)" :value="item" :key="i" >
                {{item}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <span>&nbsp;&nbsp;监控阈值:&nbsp;&nbsp;&nbsp; </span>
          <a-input style="width: 300px" placeholder="请输入" v-model="uploadData2.monitorMinVal"/>
        </p>
        <br>
        <p class="tmp3">
          <span>&nbsp;&nbsp;通知方式 :&nbsp;&nbsp; </span>
          <a-checkbox-group   v-model="uploadData2.noticeWay">
            <a-row>
              <a-checkbox value="0">短信</a-checkbox>
              <a-checkbox value="1">邮件</a-checkbox>
              <a-checkbox value="2">客户端提醒</a-checkbox>
            </a-row>
          </a-checkbox-group>
        </p>
      </a-form>
    </a-modal>

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
      isMonitorName:false,
      id:0,
      allowClear:false,
      searchName1:'',
      pagination:false,
      currentPage:1,
      pageSize:8,
      total:500,
      pageNt:['8','10','20','30'],
      bbb:[],
      editVisible:false,
      coinFilterList:[],
      dataList:[],
      userList:[],
      coinList:[],
      dataList1:[],
      data,
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      centered: true,
      fileList:[],
      form: this.$form.createForm(this, { name: 'coordinated' }),
      editForm:this.$form.createForm(this, { name: 'coordinated' }),
      visible: false,
      showValue:'',
      uploadData: {
        name:0,
        monitorMinVal:"",
        coinKind:"",
        noticeWay:[]
      },
      uploadData2:{
        id:0,
        name:0,
        monitorMinVal:"",
        coinKind:"",
        noticeWay:[]
      },

      columns: [
        {
          title: '交易id',
          dataIndex: 'id',
          key: 'id',
          className:"notshow",
        },
        {
          title: '监控用户',
          dataIndex: 'name',
          key: 'name',
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
                const input = document.getElementById("searchInput")
                input.focus()
               // this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: '监控币种',
          dataIndex: 'coinKind',
          key: 'coinKind',
          // filters: (() => {return this.aaa})(),
          filters:[],
          onFilter: (value, record) => record.coinKind.indexOf(value) === 0,


        },
        {
          title: '阈值',
          dataIndex: 'monitorMinVal',
          key: 'monitorMinVal',
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
          title: '添加时间',
          dataIndex: 'eventAddTime',
          key: 'eventAddTime',
          scopedSlots: {
            customRender: 'eventAddTime',
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          key: 'state',
          scopedSlots: {
            customRender: 'state',
          }
        },
        {
          title: '操作',
          dataIndex: '',
          key: 'action',
          scopedSlots: {
            customRender: 'action',
          }
        },
      ],
    };
  },
  computed: {
    aaa() {
      return [
        { text: 'BTC', value: 'BTC' },
        { text: 'ETC', value: 'ETC' }
      ]
    }
  },
  methods: {
    searchNameAjax(){
      this.isMonitorName=true
      this.$ajax({
        method:"get",
        url:'/monitor/admin/trans-rules',
        params:{
          coin:'',
          userName:this.searchName1,
          userId:'',
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
      this.searchName1 = '';
      this.getDataList();
    },
    onChange(page,pageSize){
      console.log(page,pageSize)
      this.currentPage=page;
      if(this.isMonitorName){
        this.searchNameAjax()
      }else{
        this.getDataList();
      }
    },
    onShowSizeChange(current, pageSize) {
      console.log(current, pageSize);
      this.pageSize = pageSize;
      this.getDataList();
    },
    getDataList(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'/monitor/admin/trans-rules',
        params:{
          coin:'',
          userName:'',
          userId:'',
          currentPage:that.currentPage,
          pageSize:that.pageSize,
        }
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          that.dataList = res.data.data.data
          that.total=res.data.data.total
        }
      })
    },
    //监控用户的下拉列表查询方法
    searchUserName(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users/list',
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          this.dataList1= res.data.data.data
          Object.keys(this.dataList1).forEach(key=>{
            let name = this.dataList1[key].name
            // let coin = this.dataList1[key].coinKind
            this.userList.push(name)
            // this.coinList.push(coin)

          })
        }
      })
    },
    //币种下拉查询
    searchCoin(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1001){
          that.coinList = res.data.data;
          Object.keys(that.coinList).forEach(key=>{
            let filterList = {
              text:that.coinList[key],
              value:that.coinList[key]
            }
            that.columns[2].filters.push(filterList)
          })
        }
      })
    },
    //添加
    addTransDataList(){
      let notice=0
      let mid=this.uploadData.noticeWay
      switch(mid.length){
        case 1:
          notice = new Number(mid[0]);
          break
        case 2:
          switch (new Number(mid[0])+new Number(mid[1])){
            case 1:
              notice=3
              break
            case 2:
              notice = 4
              break
            case 3:
              notice = 5
              break
          }
          break
        case 3:
          notice = 6
          break
      }
      let list =[];
      class obj{
        userName
        coinKind
        noticeWay
        monitorMinVal
        constructor(userName,coinKind,noticeWay,monitorMinVal){
          this.userName=userName;
          this.coinKind=coinKind;
          this.noticeWay=noticeWay;
          this.monitorMinVal=monitorMinVal;
        }
      };
      list.push(new obj(this.uploadData.name,
        this.uploadData.coinKind,
        notice,
        this.uploadData.monitorMinVal))

      let that = this;
      that.$ajax({
        method:"post",
        url:'/monitor/admin/trans-rules',
        data:list,
      }).then(res=>{
        if(res.data.code=='1001'){
          alert('添加成功')
          this.getDataList()
        }else{
          alert('添加失败')
        }
      })

    },
    // 修改
    updataList(){
      let notice=0
      console.log(this.uploadData2.noticeWay)
      let mid=this.uploadData2.noticeWay
      switch(mid.length){
        case 1:
          notice = mid[0]
          break
        case 2:
          switch (mid[0]+mid[1]){
            case 1:
              notice=3
              break
            case 2:
              notice = 4
              break
            case 3:
              notice = 5
              break
          }
          break
        case 3:
          notice = 6
          break
      }
      let list=[];
      class obj{
        id
        userName
        coinKind
        noticeWay
        monitorMinVal
        constructor(id,userName,coinKind,noticeWay,monitorMinVal){
          this.id = id
          this.userName=userName;
          this.coinKind=coinKind;
          this.noticeWay=noticeWay;
          this.monitorMinVal=monitorMinVal;
        }
      };
      list.push(new obj(this.uploadData2.id,this.uploadData2.name,
        this.uploadData2.coinKind,
        notice.toString(),
        this.uploadData2.monitorMinVal))
      this.$ajax({
        method:"put",
        url:'/monitor/admin/trans-rules',
        data:list,
      }).then(res=>{
        if(res.data.code=='1001'){
          alert('修改成功')
          this.getDataList();
        }else{
          alert('修改失败')
        }
      })
    },
    edit(id,name,coinKind,monitorMinVal,noticeWay){
      this.searchCoin()
      this.searchUserName()
      this.uploadData2.id = id
      this.uploadData2.name= name;
      this.uploadData2.coinKind = coinKind;
      this.uploadData2.monitorMinVal = monitorMinVal;
      //this.uploadData2.noticeWay = noticeWay;
      switch(noticeWay){
        case 0:
          this.uploadData2.noticeWay = ['0']
          break
        case 1:
          this.uploadData2.noticeWay = ['1']
          break
        case 2:
          this.uploadData2.noticeWay = ['2']
          break
        case 3:
          this.uploadData2.noticeWay = ['0','1']
          break
        case 4:
          this.uploadData2.noticeWay = ['0','2']
          break
        case 5:
          this.uploadData2.noticeWay = ['1','2']
          break
        case 6:
          this.uploadData2.noticeWay = ['0','1','2']
          break
      }

      this.editVisible = true;
      this.$nextTick(_ => {
        this.editForm.setFieldsValue(this.uploadData2)
      })


    },
    unique(array) {
      return Array.from(new Set(array));
    },

    startUse(id){
      let that = this;
      that.$ajax({
        method:'delete',
        url:'/monitor/admin/trans-rules',
        params:{
          id:id
        }
      }).then(res=>{
        if(res.data.code == "1001"){
          //  that.$message.success(res.data.msg);
          alert('成功重新启用此用户')
          that.getDataList();
        }else {
          //  that.$message.error(res.data.msg)
          alert('启用此用户失败')
          that.getDataList();

        }
      })

    },
    stopUse(id){
      let that = this;
      that.$ajax({
        method:'delete',
        url:'/monitor/admin/trans-rules',
        params:{
          id:id
        }
      }).then(res=>{
        if(res.data.code == "1001"){
          alert('成功禁用此规则')
          that.getDataList();
        }else {
          alert('禁用此规则失败')
          that.getDataList();

        }
      })
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields(err => {
        if (!err) {
          this.addTransDataList();
          this.getDataList();
          this.visible=false;

        }
      });

    },
    cancelClick() {
      this.visible = false;
      this.uploadData = {
        name:0,
        monitorMinVal:"",
        coinKind:"",
        noticeWay:[]
      }
    },
    editHandleOk(e){
      //this.updataList();
      e.preventDefault();
      this.editForm.validateFields(err => {
        if (!err) {
          this.updataList();
          this.editVisible=false;
          this.getDataList();
        }
      });


    },
    editCancelClick(){
      //
    },
    statePoint(state){
      if(state==1){
        return 'success';
      }
      else
        return 'default';
    },
    gotoLog(){
      this.$router.replace('/transNoticeLog')
    },
    showModal(){
      this.visible = true;
      this.allowClear=true;

      this.searchUserName();
      this.searchCoin();
      this.uploadData = {
        name:null,
        coinKind:'',
        monitorMinVal:'',
        noticeWay: '',
      }
      this.$nextTick(_ => {
        this.form.setFieldsValue(this.uploadData)
      })
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


  },
  filters:{
    stateFun(state){
      if(state==1){
        return '正常'
      }
      else
        return '禁用'
    },
    timeFilter(time){
      let d = time ? new Date(time) : new Date();
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
      return (year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + seconds);
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
    }

  },
  mounted() {
    this.getDataList();
    this.searchCoin();
    /*let that = this;
    that.$ajax({
      method:"get",
      url:'/monitor/admin/coinlist',
    }).then(res=>{
      console.log(res)
      if(res.data.code == '1001'){
        that.dataList1 = res.data.data
        Object.keys(that.dataList1).forEach(key=>{
          let filterList = {
            text:that.dataList1[key],
            value:that.dataList1[key]
          }
          //that.columns[1].filters.push(filterList)
        })
      }
    })*/
  }
};
</script>
<style >
.ant-form-item-control-wrapper{
  display: inline-block;
}
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
.top{
  display: flex;
  justify-content: space-between;
}
#coordinated_coin{
  left:28px
}
.ant-form-explain{
  margin-left: 28px;
}

/*.ant-input{
  left:18px;
}*/
.ant-dropdown-placement-bottomRight{
  left:320px;
}
.ant-dropdown {
  left:320px;

}
#coordinated_coinKind{
  left:28px
}
.notshow{
  display: none;
}
</style>

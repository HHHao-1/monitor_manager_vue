<template>
  <div>
    <div class="top">
      <h2>大额交易监控规则管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="pagination" @change="handleChange">
      <div slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px">
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          v-model="searchName1"
          style="width: 188px; margin-bottom: 8px; display: block;left:80px"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"/>
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px;left:80px"
          @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)">
          Search
        </a-button>
        <a-button size="small" style="width: 90px;left:80px" @click="() => handleReset(clearFilters)">
          Reset
        </a-button>
        <!--<a-input
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
        </a-button>-->

      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"/>
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
      <span slot="state" slot-scope="tags">
        <a-badge :status="statePoint(tags)"></a-badge>
        {{tags | stateFun}}
      </span>
      <span slot="eventAddTime" slot-scope="time">
        {{time | timeFilter}}
      </span>
      <span slot="action" slot-scope="text">
        <a  @click="edit(text)">编辑</a>
        <a  v-show="text.state == 0"  @click="startUse(text.id)">启用</a>
        <a  v-show="text.state == 1"  @click="stopUse(text.id)">停用</a>
        <a  @click="gotoLog(text)">提醒日志</a>
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

    >
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <p class="tmp3">
          <a-form-item label="监控用户" v-bind="formItemLayout">
            <a-select  style="width: 300px"  v-model="uploadData.name"  placeholder="请选择"  v-decorator="['name',{rules: [{required: true,whitespace: true,message: '请选择监控用户',},],},]">
              <a-select-option v-for="item in userList" :value="JSON.stringify(item)" :key="item.id">
                {{item.name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="币种" v-bind="formItemLayout">
            <a-select style="width: 300px"  v-model="uploadData.coinKind"  placeholder="请选择"  v-decorator="['coinKind',{rules: [{required: true,whitespace: true,message: '请选择币种',},],},]">
              <a-select-option v-for="item in coinList" :value="JSON.stringify(item)" :key="item.id" >
                {{item.coinName}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <!--<p class="tmp3">
          <span style="margin-left: 170px">&nbsp;&nbsp;监控阈值:&nbsp;&nbsp;&nbsp; </span>
          <a-input style="width: 300px" placeholder="请输入阈值" v-model="uploadData.monitorMinVal"/>
        </p>-->
        <p>
          <a-form-item label="监控阈值" v-bind="formItemLayout">
            <a-input  placeholder="请输入" v-model="uploadData.monitorMinVal"></a-input>
          </a-form-item>
        </p>

        <p class="tmp3">
          <span style="margin-left: 40px">&nbsp;&nbsp;通知方式 :&nbsp;&nbsp; </span>
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
    >
      <a-form :form="editForm"  >
        <!--<p class="tmp3" v-if="false">
          <span>&nbsp;&nbsp;监控阈值:&nbsp;&nbsp;&nbsp; </span>
          <a-input style="width: 300px" placeholder="请输入" v-model="uploadData2.id"/>
        </p>-->
        <p class="tmp3">
          <a-form-item label="监控用户" v-bind="formItemLayout">
            <a-select style="width: 300px" v-model="uploadData2.name"  placeholder="请选择" v-decorator="['name',{rules: [{required: true,whitespace: true,message: '请选择监控用户',},],},]">
              <a-select-option v-for="item in userList" :value="JSON.stringify(item)" :key="item.id">
                {{item.name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="币种" v-bind="formItemLayout">
            <a-select style="width: 300px" v-model="uploadData2.coinKind"  placeholder="请选择" v-decorator="['coinKind',{rules: [{required: true,whitespace: true,message: '请选择币种',},],},]">
              <a-select-option v-for="item in coinList" :value="JSON.stringify(item)" :key="item.id" >
                {{item.coinName}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p>
        <a-form-item label="监控阈值" v-bind="formItemLayout">
          <a-input  placeholder="请输入" v-model="uploadData2.monitorMinVal"></a-input>
        </a-form-item>
        </p>

        <p class="tmp3">
          <span style="margin-left: 40px;margin-top: -20px">&nbsp;&nbsp;通知方式 :&nbsp;&nbsp; </span>
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
        :total="total"
        :current="currentPage"
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
  name: 'TransMonitor',
  mixins: [coinMixin],
  data() {
    return {
      isMonitorName:false,
      id:0,
      allowClear:false,
      searchName1:'',
      pagination:false,
      currentPage:1,
      pageSize:8,
      total:0,
      pageNt:['8','10','20','30'],
      bbb:[],
      editVisible:false,
      coinFilterList:[],
      dataList:[],
      userList:[],
      coinList:[],
      coinList1:[],
      dataList1:[],
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
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
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
        //  width:'200px',
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
        //  width:'200px',
          // filters: (() => {return this.aaa})(),
          filters:[],
         // onFilter: (value, record) => record.coinKind.indexOf(value) === 0,
        },
        {
          title: '阈值',
          dataIndex: 'monitorMinVal',
          key: 'monitorMinVal',
        //  width:'200px',
        },
        {
          title: '通知方式',
          dataIndex: 'noticeWay',
          key: 'noticeWay',
        //  width:'250px',
          scopedSlots: {
            customRender: 'noticeWay',
          }
        },
        {
          title: '添加时间',
          dataIndex: 'eventAddTime',
          key: 'eventAddTime',
       //  width:'220px',
          scopedSlots: {
            customRender: 'eventAddTime',
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          key: 'state',
       //   width:'180px',
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

      coinKinds: ''
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
    async handleChange(pagination, filters) {

      // 根据用户名查询
      if (filters.name != undefined) {
        if (filters.name.length == 0) {
          this.searchName1 = ''
        } else {
          this.searchName1 = filters.name[0]
        }
      }

      // 根据币种检索
      if (filters.coinKind != undefined) {
        if (filters.coinKind.length == 0 || filters.coinKind.length == this.coinType.length) {
          this.coinKinds = this.coinType.map(item => item.contractAddr).join(",")
        } else {
          this.coinKinds = filters.coinKind.join(',')
        }
      }

      this.commonFetchData()
    },
    /*searchNameAjax(){
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
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total = res.data.data.total
        }
        else {
          this.dataList = null

        }
      })
    },*/
    reset(){
      this.searchName1 = '';
      this.getDataList();
    },
    onChange(page,pageSize){
      this.currentPage=page;
      // if(this.isMonitorName){
      //   this.searchNameAjax()
      // }else{
      //   this.getDataList();
      // }
      this.commonFetchData()
    },
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.getDataList();
    },
    // 获取币种
    getDataList(){
        let coinArr=[];
        let coinArr2=[];
        let str;
        let str2;
        let strAll='';
        let strAll2='';
        this.$ajax({
          method:"get",
          url:'monitor/admin/coinmain',
        }).then(res=>{
          if(res.data.code==1001){
            coinArr= res.data.data;
            Object.keys(coinArr).forEach(key=>{
              str = coinArr[key]+','
              strAll = strAll+ str
            })
            this.$ajax({
              method:"get",
              url:'/monitor/admin/coincontract',
              params:{
                coins:strAll,
              }
            }).then(res=>{
              if(res.data.code == 1001){
                coinArr2= res.data.data
                Object.keys(coinArr2).forEach(key=>{
                  str2 = coinArr2[key]+','
                  strAll2 = strAll2+ str2
                })
                this.$ajax({
                  method:"get",
                  url:'/monitor/admin/trans-rules',
                  params:{
                    coin:strAll2,
                    userName:'',
                    userId:'',
                    currentPage:this.currentPage,
                    pageSize:this.pageSize,
                  }
                }).then(res=>{
                  if(res.data.code == '1001'){
                    this.dataList = res.data.data.data
                    Object.keys(this.dataList).forEach(key=>{
                      console.log(this.dataList[key].coinKind)
                      if(this.dataList[key].coinKind.startsWith('0x')){
                        this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
                      }
                    })
                    this.total=res.data.data.total
                  }
                })
              }
            })
          }
        })
      },
    //监控用户的下拉列表查询方法
    searchUserName(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users/list',
      }).then(res=>{
        if(res.data.code == '1001'){
          // this.dataList1= res.data.data.data
          // Object.keys(this.dataList1).forEach(key=>{
          //   let name = this.dataList1[key].name
          //   this.userList.push(name)
          //
          // })
          this.userList = res.data.data.data
        }
      })
    },
    //币种下拉查询
    searchCoin1(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1001){
          that.coinList1 = res.data.data;
        }
      })
    },
    searchCoin(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1001){
          that.coinList = res.data.data;
          this.coinList = this.getStrList(this.coinList)
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
      let notice
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
      // let list =[];
      // class obj{
      //   userName
      //   coinKind
      //   noticeWay
      //   monitorMinVal
      //   constructor(userName,coinKind,noticeWay,monitorMinVal){
      //     this.userName=userName;
      //     this.coinKind=coinKind;
      //     this.noticeWay=noticeWay;
      //     this.monitorMinVal=monitorMinVal;
      //   }
      // };

      const coinInfo = JSON.parse(this.uploadData.coinKind)
      const userInfo = JSON.parse(this.uploadData.name)
      // list.push(new obj(this.uploadData.name,
      //   coinInfo.contractAddr,
      //   notice,
      //   this.uploadData.monitorMinVal))

      const list = {
        userId: userInfo.id,
        coinKind: coinInfo.contractAddr,
        noticeWay: notice,
        monitorMinVal: this.uploadData.monitorMinVal,
        state: 1
    }

      let that = this;
      that.$ajax({
        method:"post",
        url:'/monitor/admin/trans-rules',
        data:list,
      }).then(res=>{
        if(res.data.code=='1001'){
          Message.success('添加成功')
          this.currentPage = 1
          this.commonFetchData()
        }else{
          Message.error('添加失败')
        }
      })
    },
    // 修改
    updataList(){
      let notice
      let mid=this.uploadData2.noticeWay
      switch(mid.length){
        case 1:
          notice = Number(mid[0])
          break
        case 2:
          switch (Number(mid[0])+Number(mid[1])){
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
      class obj{
        uid
        id
        coinKind
        noticeWay
        monitorMinVal
        constructor(uid,idTEST,coinKind,noticeWay,monitorMinVal){
          this.uid = uid
          this.id=idTEST;
          this.coinKind=coinKind;
          this.noticeWay=noticeWay;
          this.monitorMinVal=monitorMinVal;
        }
      };

      const coinInfo = JSON.parse(this.uploadData2.coinKind)
      const userInfo = JSON.parse(this.uploadData2.name)

      // list.push(new obj(this.uploadData2.id,this.uploadData2.id,
      //   coinInfo.contractAddr,
      //   notice.toString(),
      //   this.uploadData2.monitorMinVal))
      const list = {
        id: this.uploadData2.id,
        coinKind: coinInfo.contractAddr,
        monitorMinVal: this.uploadData2.monitorMinVal,
        noticeWay: notice,
        userId: userInfo.id
    }
      this.$ajax({
        method:"put",
        url:'/monitor/admin/trans-rules',
        data:list,
      }).then(res=>{
        if(res.data.code=='1001'){
          Message.success('修改成功')
          this.editVisible=false;
          this.commonFetchData();
        }else{
          Message.error('修改失败')
        }
      })
    },
    edit(item){
      // this.searchCoin1()
      const {id,name,coinKind,monitorMinVal,noticeWay, userId} = item

      this.uploadData2.id = id

      const userInfo = this.userList.filter(item => item.id == userId)
      if (userInfo.length > 0) {
        this.uploadData2.name = JSON.stringify(userInfo[0])
      } else {
        this.uploadData2.name = name;
      }

      const coinInfo = this.coinType.filter(item => item.coinName == coinKind)
      if (coinInfo.length > 0) {
        this.uploadData2.coinKind = JSON.stringify(coinInfo[0]);
      } else {
        this.uploadData2.coinKind = coinKind;
      }

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
          Message.success('成功重新启用此用户')
          that.commonFetchData();
        }else {
          //  that.$message.error(res.data.msg)
          Message.success('启用此用户失败')
          that.commonFetchData();

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
          Message.success('成功禁用此规则')
          // that.getDataList();
          this.commonFetchData()
        }else {
          Message.error('禁用此规则失败')
          // that.getDataList();
          this.commonFetchData()
        }
      })
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields(err => {
        if (!err && this.uploadData.noticeWay!='') {
          this.addTransDataList();
          // this.getDataList();
          this.visible=false;
        }
        else{
          Message.error('请填写通知方式！')
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
      e.preventDefault();
      this.editForm.validateFields(err => {
        if (!err && this.uploadData2.noticeWay!='') {
          this.updataList();
          // this.editVisible=false;
          // this.getDataList();
        }
        else{
          Message.error('请填写通知方式！')
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
    gotoLog(id){
      sessionStorage.setItem('id', JSON.stringify(id));
      this.$router.replace('/transNoticeLog')
    },
    showModal(){
      this.visible = true;
      this.allowClear=true;

      this.searchUserName();
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
   /* handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.$ajax({
        method:"get",
        url:'/monitor/admin/trans-rules',
        params:{
          coin:'',
          userName:this.searchName1,
          userId:'',
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
      })

    },*/
    handleSearch(selectedKeys, confirm, dataIndex){
      confirm();
      // let coinArr=[];
      // let coinArr2=[];
      // let str;
      // let str2;
      // let strAll='';
      // let strAll2='';
      // this.$ajax({
      //   method:"get",
      //   url:'monitor/admin/coinmain',
      // }).then(res=>{
      //   if(res.data.code==1001){
      //     coinArr= res.data.data;
      //     Object.keys(coinArr).forEach(key=>{
      //       str = coinArr[key]+','
      //       strAll = strAll+ str
      //     })
      //     this.$ajax({
      //       method:"get",
      //       url:'/monitor/admin/coincontract',
      //       params:{
      //         coins:strAll,
      //       }
      //     }).then(res=>{
      //       if(res.data.code == 1001){
      //         coinArr2= res.data.data
      //         Object.keys(coinArr2).forEach(key=>{
      //           str2 = coinArr2[key]+','
      //           strAll2 = strAll2+ str2
      //         })
      //         this.$ajax({
      //           method:"get",
      //           url:'/monitor/admin/trans-rules',
      //           params:{
      //             coin:strAll2,
      //             userName:this.searchName1,
      //             userId:'',
      //             currentPage:1,
      //             pageSize:this.pageSize,
      //           }
      //         }).then(res=>{
      //           if(res.data.code == '1001'){
      //             this.dataList = res.data.data.data
      //             Object.keys(this.dataList).forEach(key=>{
      //               console.log(this.dataList[key].coinKind)
      //               if(this.dataList[key].coinKind.startsWith('0x')){
      //                 this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
      //               }
      //             })
      //             this.total=res.data.data.total
      //           }
      //         })
      //       }
      //     })
      //   }
      // })
    },
    /*handleReset(clearFilters) {
      clearFilters();
      this.searchName1='';
      this.$ajax({
        method:"get",
        url:'/monitor/admin/trans-rules',
        params:{
          coin:'',
          userName:this.searchName1,
          userId:'',
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
      })
    },*/
    handleReset(clearFilters){
      clearFilters();
      this.searchName1='';
      // let coinArr=[];
      // let coinArr2=[];
      // let str;
      // let str2;
      // let strAll='';
      // let strAll2='';
      // this.$ajax({
      //   method:"get",
      //   url:'monitor/admin/coinmain',
      // }).then(res=>{
      //   if(res.data.code==1001){
      //     coinArr= res.data.data;
      //     Object.keys(coinArr).forEach(key=>{
      //       str = coinArr[key]+','
      //       strAll = strAll+ str
      //     })
      //     this.$ajax({
      //       method:"get",
      //       url:'/monitor/admin/coincontract',
      //       params:{
      //         coins:strAll,
      //       }
      //     }).then(res=>{
      //       if(res.data.code == 1001){
      //         coinArr2= res.data.data
      //         Object.keys(coinArr2).forEach(key=>{
      //           str2 = coinArr2[key]+','
      //           strAll2 = strAll2+ str2
      //         })
      //         this.$ajax({
      //           method:"get",
      //           url:'/monitor/admin/trans-rules',
      //           params:{
      //             coin:strAll2,
      //             userName:this.searchName1,
      //             userId:'',
      //             currentPage:1,
      //             pageSize:this.pageSize,
      //           }
      //         }).then(res=>{
      //           if(res.data.code == '1001'){
      //             this.dataList = res.data.data.data
      //             Object.keys(this.dataList).forEach(key=>{
      //               console.log(this.dataList[key].coinKind)
      //               if(this.dataList[key].coinKind.startsWith('0x')){
      //                 this.dataList[key].coinKind = this.dataList[key].coinKind.substring(2,this.dataList[key].coinKind.length)
      //               }
      //             })
      //             this.total=res.data.data.total
      //           }
      //         })
      //       }
      //     })
      //   }
      // })
    },
    // 获取用户数据
    commonFetchData() {
      const params = {
        coin: this.coinKinds,
        userName:this.searchName1,
        userId:'',
        currentPage:this.currentPage,
        pageSize:this.pageSize,
      }

      this.$ajax.get('/monitor/admin/trans-rules', {
        params
      }).then(res => {
        const {code, data} = res.data

        if (code == 1001) {
          this.dataList = data.data.map(item => {

            const coinKindArr = this.coinType.filter(i => item.coinKind == i.contractAddr)
            if (coinKindArr.length > 0) {
              item.coinKind = coinKindArr[0].coinName
            }

            return item
          })
          this.total = data.total
        } else {
          this.dataList = []
          this.total = 0
        }
      })
    },
    fetchAfterHasCoinType() {
      this.columns[2].filters = this.coinType.map(item => {
        return {
          text: item.coinName,
          value: item.contractAddr
        }
      })
      this.coinKinds = this.coinType.map(item => item.contractAddr).join(',')
      this.coinList = this.coinType
      this.commonFetchData();
      this.searchUserName()
    }
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
    // this.getDataList();
    // this.searchCoin(); that.columns[2].filters
  }
};
</script>
<style >
/*.ant-form-item-control-wrapper{
  display: inline-block;
}*/
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
.top{
  display: flex;
  justify-content: space-between;
}
/*#coordinated_coin{
  left:28px
}*/
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
/*#coordinated_coinKind{
  left:28px
}*/
.notshow{
  display: none;
}
</style>

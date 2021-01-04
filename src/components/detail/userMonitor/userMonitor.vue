<template>

  <div>
    <div class="top">
      <h2>用户管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
    </div>
    <div class="table">
      <a-table :columns="columns" :data-source="dataList" :pagination="pagination" rowKey="id">

        <div
          slot="filterDropdown"
          slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
          style="padding: 8px"
        >
          <a-input
            v-ant-ref="c => (searchInput = c)"
            :placeholder="`Search ${column.dataIndex}`"
            v-model="searchName"
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
            id="searchInput"
            style="width: 188px; margin-bottom: 8px; display: block;"
            placeholder="Search Name"
            v-model="searchName"
            @pressEnter="searchNameAjax"
          />
          <a-button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px; margin-right: 8px"
            @click="searchNameAjax"
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
<!--
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
-->
        <span slot="state" slot-scope="tags">
        <a-badge :status="statePoint(tags)"></a-badge>
        {{tags | stateFun}}
      </span>
        <span slot="action" slot-scope="text, record">
        <a  @click="edit(text.name,text.phone,text.email,text.remark, text.id)">编辑</a>
        <a  v-show="text.state == 0"  @click="startUse(text.id)">启用</a>
        <a  v-show="text.state == 1"  @click="stopUse(text.id)">停用</a>
        <a  @click="gotoLog(text.name)">提醒日志</a>
      </span>
        <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
          添加时间：{{ record.createTime | timeFilter}}
        </p>
      </a-table>
    </div>
    <a-modal
      title="添加/编辑新用户"
      v-model="addVisible"
      cancelText="取消"
      okText="确定"
      @ok="addHandleOk"
      @cancel="addCancelClick"
      width="600px"
    >
      <a-form :form="addForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <p class="tmP">
          <a-form-item label="用户名" v-bind="formItemLayout">
            <a-input  placeholder="请输入" v-model="uploadData.name"  v-decorator="['name',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入用户名',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="电话"  v-bind="formItemLayout">
            <a-input placeholder="请输入" v-model="uploadData.phone" v-decorator="['phone', {validateTrigger: ['change', 'blur'],rules: [{ required: true, message:' ',whitespace: true,},{validator:phoneCheck.bind(this)} ] },]"></a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="邮箱" v-bind="formItemLayout">
            <a-input placeholder="请输入" v-model="uploadData.email" v-decorator="['email',{validateTrigger: ['change', 'blur'],rules: [{type: 'email',message: '请输入格式正确的邮箱!',},{required: true,message: '请输入邮箱',},],},]"/>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="备注" name="remark"  v-bind="formItemLayout">
            <a-input placeholder="请输入" v-model="uploadData.remark" v-decorator="['remark',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入备注',},],},]"></a-input>
          </a-form-item>
        </p>
      </a-form>
    </a-modal>

    <a-modal
      title="添加/编辑新用户"
      v-model="editVisible"
      cancelText="取消"
      okText="确定"
      width="600px"
      :footer="null"
    >
      <a-form :form="editForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <p class="tmP">
          <a-form-item label="用户名"  v-bind="formItemLayout" >
            <a-input  placeholder="请输入" v-model="uploadData.name" v-decorator="['name',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入用户名',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="电话"  v-bind="formItemLayout">
            <a-input placeholder="请输入" v-model="uploadData.phone" v-decorator="['phone', {validateTrigger: ['change', 'blur'],rules: [{ required: true, message:' ',whitespace: true,},{validator:phoneCheck.bind(this)} ] },]"
            >
            </a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="邮箱" v-bind="formItemLayout">
            <a-input placeholder="请输入" v-model="uploadData.email" v-decorator="['email',{validateTrigger: ['change', 'blur'],rules: [{type: 'email',message: '请输入格式正确的邮箱!',},{required: true,message: '请输入邮箱',},],},]"/>

          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="备注" v-bind="formItemLayout" >
            <a-input placeholder="请输入" v-model="uploadData.remark" v-decorator="['remark',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入备注',},],},]"></a-input>
          </a-form-item>
        </p>
      </a-form>
      <div class="hr"></div>
      <div class="modalButton">
        <a-button type="default" @click="editCancelClick">取消</a-button>
        <a-button type="primary" @click="editHandleOk">确定</a-button>
      </div>
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
let flag=false
export default {
  name: "userMonitor",
  data() {
    return {
      isUserName:false,
      searchName:'',
      searchInput: null,
      searchedColumn: '',
      id:0,
      fileList:[],
      addForm: this.$form.createForm(this, { name: 'coordinated' }),
      editForm: this.$form.createForm(this, { name: 'coordinated' }),
      pagination:false,
      addVisible: false,
      editVisible: false,
      showValue:'',
      dataList:[],
      currentPage:1,
      pageSize:8,
      total:0,
      pageNt:['8','10','20','30'],
      uploadData: {
        id:"",
        name:"",
        phone:"",
        email:"",
        remark:""
      },
      searchText:"",
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      },

      columns: [
        {
          title: 'AppID',
          dataIndex: 'appId',
          key: 'appId',
        //  width:'100px',
          align:'center'

        },
        {
          title: 'UID',
          dataIndex: 'id',
          key: 'id',
        //  width:'100px'
        },
        { title: '用户名',
          dataIndex: 'name',
          key: 'name',
         // width:'150px',

          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
        /*/* onFilter: (value, record) =>{
        record.name
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
    },*!/*/
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          const input = document.getElementById("searchInput")
          //input.focus()
          // this.searchInput.focus();
        }, 0);
      }
    },
  },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
     // width:'220px',
      align:'center',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
     // width:'250px',
      align:'center',

    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      //width:'200px',
      align:'center',

    },

    {
      title: '状态',
      key: 'state',
      dataIndex: 'state',
      //width:'200px',
      align:'center',
      scopedSlots:
      {
        customRender: 'state'
      },
    },
    {
      title: '操作',
      key: 'action',
      align:'center',
      dataIndex:'',
      scopedSlots:
      {
        customRender: 'action'
      },
    },
  ]

    };

  },
  methods:{
    phoneCheck(rule, value, callbackFn) {
      const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/
      if(!value){
        callbackFn('请输入手机号码')
        return
      }
      else if (!reg.test(value)) {
        callbackFn('请输入正确的手机号码')
        return
      }
      callbackFn()
    },
    searchNameAjax(){
      this.isUserName=true
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users',
        params:{
          name:this.searchName,
          currentPage:this.currentPage,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
        else {
          this.dataList=null;
        }
      })

    },
    reset(){
      this.searchName='';
      this.getDataList();
    },
    onChangeP(pageNumber) {
     //
    },
    edit(name , phone , email , remark, id ){
      this.uploadData.id = id
      this.uploadData.name= name;
      this.uploadData.phone = phone;
      this.uploadData.email = email;
      this.uploadData.remark = remark;
      this.editVisible = true;
      this.$nextTick(_ => {
        this.editForm.setFieldsValue(this.uploadData)
      })
    },
    getDataList(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users',
        headers: {"Content-Type": "application/json"},
        params:{
          name:'',
          currentPage:this.currentPage,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
      })
    },
    addDataList(){
      let that = this;
      that.$ajax({
        method:"post",
        url:'/monitor/admin/users',
        params:{
          name:that.uploadData.name,
          phone:that.uploadData.phone,
          email:that.uploadData.email,
          remark:that.uploadData.remark,
        }
      }).then(res=>{
        if(res.data.code=='1001'){
          alert('添加成功')
          this.getDataList();
        }else{
          alert('添加失败')
        }
      })
    },
    editDataList(){
      let that = this;
      that.$ajax({
        method:"put",
        url:'/monitor/admin/users',
        params:{
          id:that.uploadData.id,
          name:that.uploadData.name,
          phone:that.uploadData.phone,
          email:that.uploadData.email,
          remark:that.uploadData.remark,
          // ...that.uploadData
        }
      }).then(res=>{
        if(res.data.code=='1001') {
          this.getDataList()
          alert('修改成功')
        }
        else{
          alert('修改失败')
        }
      })
    },
    startUse(id){
      let that = this;
      that.$ajax({
        method:'delete',
        url:'/monitor/admin/users',
        params:{
          id:id
        }
      }).then(res=>{
        if(res.data.code == "1001"){
          // that.$message.success(res.data.msg);
          alert('成功重新启用此用户')
          that.getDataList();
        }else {
          //that.$message.error(res.data.msg)
          alert('启用此用户失败')
          that.getDataList();

        }
      })

    },
    stopUse(id){
      let that = this;
      that.$ajax({
        method:'delete',
        url:'/monitor/admin/users',
        params:{
          id:id
        }
      }).then(res=>{
        if(res.data.code == "1001"){
          //that.$message.success(res.data.msg);
          alert('成功禁用此用户')
          that.getDataList();
        }else {
          //that.$message.error(res.data.msg)
          alert('禁用此用户失败')
          that.getDataList();

        }
      })
    },
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users',
        params:{
          name:this.searchName,
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
        else {
          this.dataList=null;
        }
      })

    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchName = '';
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users',
        params:{
          name:'',
          currentPage:1,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
        else {
          this.dataList=null;
        }
      })

    },
    onChange(page,pageSize){
      console.log('1232131')
      this.currentPage=page;
      if(this.isUserName){
        this.searchNameAjax()
      }else {
        this.getDataList();
      }

    },
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.getDataList();
    },
    addHandleOk(e) {
      e.preventDefault();
      this.addForm.validateFields(err => {
        if (!err) {
          this.addDataList();
          this.addVisible=false;
          this.getDataList();
        }
      });


    },
    addCancelClick() {
      this.uploadData = {
        name:"",
        phone:"",
        email:"",
        remark:""
      }
      this.$nextTick(_ => {
        this.addForm.setFieldsValue(this.uploadData)
      })
    },
    editHandleOk(e){
      e.preventDefault();
      this.editForm.validateFields(err => {
        if (!err) {
          this.editDataList();
          this.editVisible=false;
          this.getDataList();
        }
      });

    },
    editCancelClick(){
      this.editVisible=false;
    },
    handleSubmit() {
      //
    },
    gotoLog(name){
      sessionStorage.setItem('name1',name);
      this.$router.replace('/userNoticeLog')
    },
    statePoint(state){
      if(state==1){
        return 'success';
      }
      else
        return 'default';
    },
    showModal() {
      this.addVisible = true;
      this.uploadData = {
        name:"",
        phone:"",
        email:"",
        remark:""
      }
      this.$nextTick(_ => {
        this.addForm.setFieldsValue(this.uploadData)
      })
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
    this.getDataList();
  },
};
</script>
<style>
.ant-form-item-control-wrapper{
  /*display: inline-block;*/
}
.anticon {
  left: 80px;
}
.top{
  display: flex;
  justify-content: space-between;
}
.page{
  text-align: right;
  margin-top: 30px;
}
.modalButton{
  margin-top:10px;
  margin-left: 340px;
}
.hr{
  border-bottom:1px solid #ece9e9;
  margin-top: 50px;
}
.ant-input{
  width:300px;
}
/*#coordinated_phone{
  left:15px;
}
#coordinated_email{
  left:15px;
}
#coordinated_remark{
  left: 15px;
}*/

/*.page{
 padding-bottom: 2px;
}*/
</style>



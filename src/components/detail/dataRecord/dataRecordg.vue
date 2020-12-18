<template>

  <div>
    <div class="top">
      <h2>用户管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
    </div>
    <a-table :columns="columns" :data-source="data">
      <span slot="state" slot-scope="tags">
        <a-badge :status="statePoint(tags)"></a-badge>
        {{tags | stateFun}}
      </span>
      <span slot="action" slot-scope="text, record">
        <a  href="javascript:;">编辑</a>
        <a  v-show="text.state == 0"  @click="czRefuse(text.uid)">启用</a>
        <a  v-show="text.state == 1"  @click="czRefuse(text.uid)">停用</a>
        <a  @click="gotoLog">提醒日志</a>
      </span>
      <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
        添加时间：{{ record.createTime }}
      </p>
    </a-table>
    <a-modal
      title="添加/编辑新用户"
      v-model="visible"
      cancelText="取消"
      okText="确定"
      @ok="handleOk"
      @cancel="cancelClick"
    >
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
        <p class="tmP">
          <a-form-item label="用户名" name="name" >
            <a-input placeholder="请输入" v-model="uploadData.name"  v-decorator="['name',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入用户名',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="电话" name="phone" >
            <a-input placeholder="请输入" v-model="uploadData.phone" v-decorator="['phone',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入手机号',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="邮箱" name="email" >
            <a-input placeholder="请输入" v-model="uploadData.email" v-decorator="['email',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入邮箱号',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmP">
          <a-form-item label="备注" name="desc" >
            <a-input placeholder="请输入" v-model="uploadData.desc" v-decorator="['desc',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入备注',},],},]"></a-input>
          </a-form-item>
        </p>
      </a-form>
    </a-modal>

  </div>
</template>
<script>
const columns = [
  { title: 'AppID', dataIndex: 'appid', key: 'appid' },
  { title: 'UID', dataIndex: 'uid', key: 'uid' },
  { title: '用户名', dataIndex: 'name', key: 'name' },
  { title: '手机', dataIndex: 'email', key: 'email' },
  { title: '邮箱', dataIndex: 'phone', key: 'phone' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },

  {
    title: '状态',
    key: 'state',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' },
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

const data = [
  {
    appid:1,
    uid:1,
    name:'张三',
    email:'1234@qq.com',
    phone:188888,
    remark:'这是备注',
    state:1,
    createTime:'2020-10-01',
  },
  {
    appid:1,
    uid:1,
    name:'张三',
    email:'1234@qq.com',
    phone:188888,
    remark:'这是备注',
    state:0,
    createTime:'2020-10-01',
  }
];

export default {
  data() {
    return {
      data,
      columns,
      fileList:[],
      form: this.$form.createForm(this, { name: 'coordinated' }),
      visible: false,
      showValue:'',
      uploadData: {
        name:"",
        phone:"",
        email:"",
        remark:""
      }
    };

  },
  methods:{
    handleOk() {
      //
    },
    cancelClick() {
      //
    },
    handleSubmit() {
      //
    },
    gotoLog(){
      this.$router.replace('/noticeLog')
    },
    statePoint(state){
      if(state==1){
        return 'success';
      }
      else
        return 'default';
    },
    showModal() {
      this.visible = true;
      this.uploadData = {
        name:"",
        phone:"",
        email:"",
        remark:""
      }
      this.fileList = [];
    },
  },
  filters:{
    stateFun(state){
      if(state==1){
        return '正常'
      }
      else
        return '禁用'
    }

  }
};
</script>
<style>
.top{
  display: flex;
  justify-content: space-between;
}
</style>

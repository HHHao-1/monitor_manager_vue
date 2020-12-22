<template>
  <div>
    <div class="top">
      <h2>监控币种管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
    </div>
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination">
      <span slot="action" slot-scope="text, record">
        <a  @click="edit(text.id,text.mainChain,text.coinName,text.contractAddr,text.point)">编辑</a>
        <a @click="deleteChain(text.mainChain,text.coinName,text.contractAddr,text.point)">删除</a>
        <!--<a @click="deleteChain">删除</a>-->
      </span>

    </a-table>
    <!--// <div>{{mainChainList}}</div>-->
    <a-modal
      title="添加新Token"
      v-model="visible"
      cancelText="取消"
      okText="确定"
      @ok="handleOk"
      @cancel="cancelClick"
    >
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <p class="tmp3">
          <a-form-item label="主链:">
            <a-select style="width: 300px" placeholder="请选择" v-model="uploadData.mainChain"   v-decorator="['mainChain',{rules: [{required: true,whitespace: true,message: '请选择主链',},],},]">
              <a-select-option v-for="(item,i) in unique(mainChainList)" :value="item" :key="i">{{item}}</a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="Token名称:">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.tokenName"  v-decorator="['tokenName',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入Token名称',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="合约地址:">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.contractAddr" v-decorator="['contractAddr',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入合约地址',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="小数位:">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.point" v-decorator="['point',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入小数位',},],},]"></a-input>
          </a-form-item>
        </p>
      </a-form>
    </a-modal>




    <!--编辑Token-->

    <a-modal
      title="编辑新Token"
      v-model="editVisible"
      cancelText="取消"
      okText="确定"
      @ok="editHandleOk"
      @cancel="editCancelClick"
    >
      <a-form :form="editForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <p class="tmp3">
          <a-form-item label="主链:">
            <a-select style="width: 300px" placeholder="请选择" v-model="uploadData.mainChain"   v-decorator="['mainChain',{rules: [{required: true,whitespace: true,message: '请选择主链',},],},]">
              <a-select-option v-for="(item,i) in unique(mainChainList)" :value="item" :key="i">{{item}}</a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="Token名称:">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.tokenName"  v-decorator="['tokenName',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入Token名称',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="合约地址:">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.contractAddr" v-decorator="['contractAddr',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入合约地址',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="小数位:">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.point" v-decorator="['point',{rules: [{required: true,message: '请输入小数位',},],},]"></a-input>
          </a-form-item>
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

    <!--<div>{{dataList}}</div>-->
  </div>
</template>
<script>
const columns = [
  {
    title: '主链',
    dataIndex: 'mainChain',
    key: 'mainChain',
    filters:[],
    onFilter: (value, record) => record.mainChain.indexOf(value) === 0,
  },
  {
    title: '币种名称',
    dataIndex: 'coinName',
    key: 'coinName',
    filters: [],
    onFilter: (value, record) => record.coinName.indexOf(value) === 0,
  },
  {
    title: '合约地址',
    dataIndex: 'contractAddr',
    key: 'contractAddr',
  },
  {
    title: '小数位',
    dataIndex: 'point',
    key: 'point',
  },
  {
    title: '操作',
    dataIndex: '',
    key: 'action',
    scopedSlots: {
      customRender: 'action',
    }
  },
];


export default {
  data() {
    return {
      dataList1:[],
      columns,
      pagination:false,
      currentPage:1,
      pageSize:8,
      total:500,
      pageNt:['8','10','20','30'],
      dataList:[],
      mainChainList:[],
      coinKindList:[],
      editVisible:false,
      deleteVisible:false,
      form: this.$form.createForm(this, { name: 'coordinated' }),
      editForm: this.$form.createForm(this, { name: 'coordinated' }),
      visible:false,
      filteredInfo: null,
      sortedInfo: null,
      centered:true,
      uploadData: {
        tokenName:"",
        contractAddr:"",
        mainChain:"",
        point:""
      },
      oldUploadData: {}
    };
  },

  methods: {

    onChange(page,pageSize){
      console.log(page,pageSize)
      this.currentPage=page;
      this.getDataList();
    },
    onShowSizeChange(current, pageSize) {
      console.log(current, pageSize);
      this.pageSize = pageSize;
      this.getDataList();
    },
    getDataList(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coin-kinds',
        params:{
          event:'',
          userName:'',
          userId:'',
          currentPage:this.currentPage,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          this.columns[0].filters = []
          this.columns[1].filters = []
          this.dataList = res.data.data.data
          this.total=res.data.data.total
          Object.keys(this.dataList).forEach(key=>{
            let filterList = {
              text:this.dataList[key].mainChain,
              value:this.dataList[key].mainChain
            }
            this.columns[0].filters.push(filterList)
          })
          Object.keys(this.dataList).forEach(key=>{
            let filterList = {
              text:this.dataList[key].coinName,
              value:this.dataList[key].coinName
            }
            this.columns[1].filters.push(filterList)
          })
        }
      })
    },

    /*searchCoinFilter(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coinlist',
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          console.log('132412352435')
          console.log(res.data.data)
          this.dataList = res.data.data
          Object.keys(this.dataList).forEach(key=>{
            let filterList = {
              text:this.dataList[key],
              value:this.dataList[key]
            }
            this.columns[0].filters.push(filterList)
          })
        }
      })
    },
    searchCoinFilter2(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coin-kinds',
        params:{
          event:'',
          userName:'',
          userId:'',
          currentPage:this.currentPage,
          pageSize:this.pageSize,
        }
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          this.dataList = res.data.data
          Object.keys(this.dataList).forEach(key=>{
            let filterList = {
              text:this.dataList.coinKind[key],
              value:this.dataList.coinKind[key]
            }
            this.columns[1].filters.push(filterList)
          })
        }
      })
    },*/

    addDataList(){
      let that = this;
      that.$ajax({
        method:"post",
        url:'/monitor/admin/coin-kinds',
        params:{
          mainChain:that.uploadData.mainChain,
          coinName:that.uploadData.tokenName,
          contract:that.uploadData.contractAddr,
          point :that.uploadData.point,
        }
      }).then(res=>{
        if(res.data.code=='1001'){
          that.$message.success(res.data.msg);
          alert('添加成功');
          this.visible=false;
          this.getDataList();
        }
        else{
          alert('添加失败');
          this.visible=false;
        }
      })
    },
    updataList(){
      this.$ajax({
        method:"put",
        url:'/monitor/admin/coin-kinds',
        params:{
          ...this.oldUploadData,
          mainChainNew: this.uploadData.mainChain,
          coinNameNew:this.uploadData.tokenName,
          contractNew:this.uploadData.contractAddr,
          pointNew:this.uploadData.point,
        }
      }).then(res=>{
        if(res.data.code=='1001'){
          alert('修改成功');
          this.visible=false;
          this.getDataList();
        }
        else{
          alert('修改失败');
          this.visible=false;
        }
      })

    },
    deleteDataList(mainChain,coinName,contractAddr,point){
      let that = this;
      that.$ajax({
        method:"delete",
        url:'/monitor/admin/coin-kinds',
        params:{
          mainChain:mainChain,
          coinName:coinName,
          contract:contractAddr,
          point :point,
        }
      }).then(res=>{
        console.log('hello13')
        console.log(mainChain)
        console.log('hello13')
        if(res.data.code==1001){
          that.$message.success(res.data.msg);
          that.getDataList();
          alert('删除成功');
        }
        else {
          that.$message.success(res.data.msg);
          alert('删除失败');
        }
      })
    },
    searchCoinInfo(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1001){
          that.mainChainList = res.data.data;
        }
      })
    },
    unique(array) {
      return Array.from(new Set(array));
    },
    deleteChain(mainChain,coinName,contractAddr,point){
      let r = confirm("确定删除此链吗？")
      if (r==true) {
        this.deleteDataList(mainChain, coinName, contractAddr, point);
        this.getDataList();
      }

    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields(err=>{
        if(!err){
          this.addDataList();
          this.visible=false
          this.getDataList();
        }
      })
    },
    cancelClick() {
      this.visible=false;
      this.uploadData = {
        mainChain:'',
        tokenName:'',
        contractAddr:'',
        point:''
      }
      this.$nextTick(_ => {
        this.form.setFieldsValue(this.uploadData)
      })

    },

    /*okType:{
      props: {disabled: true},
    },*/
    showModal() {
      this.visible = true;
      this.searchCoinInfo();
      this.uploadData = {
        mainChain:'',
        tokenName:'',
        contractAddr:'',
        point:''
      }
      this.$nextTick(_ => {
        this.form.setFieldsValue(this.uploadData)
      })
      //this.fileList = [];
    },
    /*handleChange(pagination, filters, sorter) {
      // console.log('Various parameters', pagination, filters, sorter);
      this.filteredInfo = filters;
      // this.sortedInfo = sorter;
    },*/
    edit(id,mainChain,tokenName,contractAddr,point){
      this.searchCoinInfo();
      this.uploadData.id = id
      this.uploadData.mainChain= mainChain;
      this.uploadData.tokenName = tokenName;
      this.uploadData.contractAddr = contractAddr;
      this.uploadData.point = point;
      this.editVisible=true;
      this.oldUploadData = {
        mainChain, tokenName, contractAddr, point
      }
      this.$nextTick(_ => {
        this.editForm.setFieldsValue(this.uploadData)
      })
    },
    editHandleOk(e){
      e.preventDefault();
      this.editForm.validateFields(err=>{
        if(!err){
          this.updataList();
          this.editVisible=false;
          this.getDataList();
        }
      })

    },
    editCancelClick(){
      this.editVisible=false
    },

  },
  mounted() {
    this.getDataList();
    //this.searchCoinFilter2();
    //this.searchCoinFilter();

    /*this.$ajax({
      method:"get",
      url:'/monitor/admin/coinlist',
    }).then(res=>{
      console.log(res)
      if(res.data.code == '1001'){
        this.dataList1 = res.data.data
        Object.keys(this.dataList1).forEach(key=>{
          let filterList = {
            text:this.dataList1[key],
            value:this.dataList1[key]
          }
          this.columns[0].filters.push(filterList)
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
.table-operations {
  margin-bottom: 16px;
}

.table-operations > button {
  margin-right: 8px;
}
.top{
  display: flex;
  justify-content: space-between;
}
#coordinated_mainChain{
  left:45px;
}
#coordinated_contractAddr{
  left:15px;
}
#coordinated_point{
  left:30px
}
#coordinated_tokenName{
  left:5px
}
.ant-form-explain{
  font-size: 5px;
  margin-left: 50px;
}
</style>

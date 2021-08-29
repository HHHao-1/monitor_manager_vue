<template>
  <div>
    <div class="top">
      <h2>监控币种管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
    </div>
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="handleChange">
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
          <a-form-item label="主链:" v-bind="formItemLayout">
            <a-select style="width: 300px" placeholder="请选择" v-model="uploadData.mainChain"   v-decorator="['mainChain',{rules: [{required: true,whitespace: true,message: '请选择主链',},],},]">
              <a-select-option v-for="(item,i) in getStrList(mainChainList)" :value="item" :key="i">{{item}}</a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="Token名称:" v-bind="formItemLayout">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.tokenName"  v-decorator="['tokenName',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入Token名称',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="合约地址:" v-bind="formItemLayout">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.contractAddr" v-decorator="['contractAddr',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入合约地址',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="小数位:" v-bind="formItemLayout">
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
          <a-form-item label="主链:" v-bind="formItemLayout">
            <a-select style="width: 300px" placeholder="请选择" v-model="uploadData.mainChain"   v-decorator="['mainChain',{rules: [{required: true,whitespace: true,message: '请选择主链',},],},]">
              <a-select-option v-for="(item,i) in getStrList(mainChainList)" :value="item" :key="i">{{item}}</a-select-option>
            </a-select>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="Token名称:" v-bind="formItemLayout">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.tokenName"  v-decorator="['tokenName',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入Token名称',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="合约地址:" v-bind="formItemLayout">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.contractAddr" v-decorator="['contractAddr',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入合约地址',},],},]"></a-input>
          </a-form-item>
        </p>
        <p class="tmp3">
          <a-form-item label="小数位:" v-bind="formItemLayout">
            <a-input style="width: 300px" placeholder="请输入" v-model="uploadData.point" v-decorator="['point',{rules: [{required: true,message: '请输入小数位',},],},]"></a-input>
          </a-form-item>
        </p>
      </a-form>
    </a-modal>

    <div class="page">
      <a-pagination
        :defaultCurrent="1"
        :total=total
        :current="currentPage"
        :pageSize="pageSize"
        @change="onChange"
        @showSizeChange="onShowSizeChange"
        :pageSizeOptions="pageNt" />
    </div>

    <!--<div>{{dataList}}</div>-->
  </div>
</template>
<script>
import { Message } from 'element-ui'
export default {
  data() {
    return {
      dataList1:[],
      pagination:false,
      currentPage:1,
      pageSize:10,
      total:0,
      pageNt:['8','10','20','30'],
      dataList:[],
      mainChainList:[],

      mainChainList2:[],
      coinKindNameList:[],
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
      oldUploadData: {},
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 12 },
          sm: { span: 8 },
        },
      },
      columns:[
        {
          title: '主链',
          dataIndex: 'mainChain',
          key: 'mainChain',
        //  width:'300px',
          filters:[],
        //  onFilter: (value, record) => record.mainChain.indexOf(value) === 0,
        },
        {
          title: '币种名称',
          dataIndex: 'coinName',
          key: 'coinName',
        //  width:'300px',
          filters: [],
        //  onFilter: (value, record) => record.coinName.indexOf(value) === 0,
        },
        {
          title: '合约地址',
          dataIndex: 'contractAddr',
          key: 'contractAddr',
        //  width:'400px',
        },
        {
          title: '小数位',
          dataIndex: 'point',
          key: 'point',
        //  width:'200px',
        },
        {
          title: '操作',
          dataIndex: '',
          key: 'action',
          scopedSlots: {
            customRender: 'action',
          }
        },
      ]

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
    onChange(page,pageSize){
      this.currentPage=page;
      this.getDataList();
    },
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.getDataList();
    },
    /*getDataList(){
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
        if(res.data.code == '1001'){
          this.dataList = res.data.data.data
          this.total=res.data.data.total
        }
      })
    },*/
    async getDataList(){
      let mainChain,coinKind
      const  coinMain = await this.$ajax.get('monitor/admin/coinmain')
      const {code,data} = coinMain.data
      if(code ==1001 ){
        const data1 = this.unique(data)
        mainChain =data1.map(item=>{
          return item ;
        }).join(',')
      }
      const  coinList  =  await this.$ajax.get('monitor/admin/coinlist')
      const {data :coinData,code:coinCode}=coinList.data
      if(coinCode == 1001 ){
        const data1 = this.unique(data)
        coinKind = coinData.map(item =>{
          return item
        }).join(',')
      }
      this.$ajax({
        method:"get",
        url:'/monitor/admin/coin-kinds',
        params:{
          mainChain: mainChain,
          coinKind:coinKind,
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
    async handleChange(pagination, filters, sorter, { currentDataSource }){
      const {mainChain,coinKind} = filters
      if(mainChain.length !=0) {
        const chain = mainChain.map(item => {
          return item
        }).join(',')
        const coinList = await this.$ajax.get('monitor/admin/coinlist')
        const {data: coinData, code: coinCode} = coinList.data
        if (coinCode == 1001) {
          const data1 = this.unique(coinData)
          const coin = data1.map(item => {
            return item
          }).join(',')
          this.currentPage = 1
          const datalist  = await this.$ajax.get('/monitor/admin/coin-kinds',{
            params:{
              mainChain: chain,
              coinKind: coin,
              currentPage:this.currentPage,
              pageSize:this.pageSize,
            }
          })
          const {data : dataL ,code :codeL} = datalist.data
          if(codeL == 1001){
            this.dataList = dataL.data
            this.total = dataL.total
          }
        }
      }
      if(coinKind.length !=0 ){
        const coin = coinKind.map(item =>{
          return item
        }).join(',')
        const mainList = await this.$ajax.get('monitor/admin/coinmain')
        const {data :mainData ,code :mainCode } = mainList.data
        if(mainCode ==1001){
          const data1  = this.unique(mainData)
          const main =data1.map(item =>{
            return item
          }).join(',')
          this.currentPage =1
          const datalist  = await this.$ajax.get('/monitor/admin/coin-kinds',{
            params:{
              mainChain: main,
              coinKind: coin,
              currentPage:this.currentPage,
              pageSize:this.pageSize,
            }
          })
          const {data : dataL ,code :codeL} = datalist.data
          if(codeL == 1001){
            this.dataList = dataL.data
            this.total = dataL.total
          }
        }
      }

    },

    addDataList(){
      this.$ajax({
        method:"post",
        url:'/monitor/admin/coin-kinds',
        params:{
          mainChain:this.uploadData.mainChain,
          coinName:this.uploadData.tokenName,
          contract:this.uploadData.contractAddr,
          point :this.uploadData.point,
        }
      }).then(res=>{
        if(res.data.code=='1001'){
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
      /*if(mainChain=='LTC' || mainChain=='BTC' || mainChain=='ETH' || mainChain=='BCH'){
         Message.error('该币种不能删除！')
      }*/
      this.$ajax({
        method:"delete",
        url:'/monitor/admin/coin-kinds',
        params:{
          mainChain:mainChain,
          coinName:coinName,
          contract:contractAddr,
          point :point,
        }
      }).then(res=>{
        if(res.data.code==1001){
          this.getDataList();
          alert('删除成功');
        }
        else {
          alert('删除失败');
        }
      })
    },
    searchCoinInfo(){
      this.$ajax({
        method:"get",
        url:'monitor/admin/coinmain',
      }).then(res=>{
        if(res.data.code==1001){
          this.mainChainList2 = res.data.data;
          this.mainChainList2=this.getStrList(this.mainChainList2)
          Object.keys(this.mainChainList2).forEach(key=>{
            let filterList = {
              text:this.mainChainList2[key],
              value:this.mainChainList2[key]
            }
            this.columns[0].filters.push(filterList)
          })
        }
      })
    },
    searchCoinInfo2(){
      this.$ajax({
        method:"get",
        url:'monitor/admin/coinmain',
      }).then(res=>{
        if(res.data.code==1001){
          this.mainChainList = res.data.data;
          Object.keys(this.mainChainList).forEach(key=>{
            let filterList =this.mainChainList[key]
            this.mainChainList.push(filterList)
          })
        }
      })
    },
    searchCoinKindNameList(){
      this.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1001){
          this.mainChainList2 = res.data.data;
          this.mainChainList2=this.getStrList(this.mainChainList2)
          Object.keys(this.mainChainList2).forEach(key=>{
            let filterList = {
              text:this.mainChainList2[key],
              value:this.mainChainList2[key]
            }
            this.columns[1].filters.push(filterList)
          })
        }
      })
      /*this.$ajax({
        method:"get",
        url:'/monitor/admin/coin-kinds',
        params:{
          event:'',
          userName:'',
          userId:'',
          currentPage:this.currentPage,
          pageSize:this.total,
        }
      }).then(res=>{
        if(res.data.code == '1001'){
          this.coinKindNameList = res.data.data.data
          this.coinKindNameList=this.getStrList(this.coinKindNameList)
          Object.keys(this.coinKindNameList).forEach(key=>{
            let filterList = {
              text:this.coinKindNameList[key].coinName,
              value:this.coinKindNameList[key].coinName
            }
            this.columns[1].filters.push(filterList)
          })

        }
      })*/
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

    showModal() {
      this.searchCoinInfo2()
      this.visible = true;
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
    edit(id,mainChain,tokenName,contractAddr,point){
      this.searchCoinInfo2();
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
    this.searchCoinInfo();
    this.searchCoinKindNameList();
    /*let a = ['0x11','0x11','0x22']
    this.getStrList(a)
    console.log('11',this.getStrList(a))*/
  }
};
</script>
<style >

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

</style>

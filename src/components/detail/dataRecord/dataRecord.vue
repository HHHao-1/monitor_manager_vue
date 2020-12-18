<template>
   <div>
     <div class="dataRecord" v-show="utff == 1">
       <div class="top">
         <h2>用户管理</h2>
         <a-button type="primary" @click="showModal" >添加</a-button>
       </div>
       <!---->
        <div class="detail">
         <!--头部-->
            <!--这里是监控用户列表的那个 返回数据的表头-->
         <div class="header" >

           <span class="blank" ></span>

           <span class="id" >AppID</span>

           <span class="uid">UID</span>

           <span class="username">用户名 <a-icon type="search" /></span>

           <span class="source" >手机</span>

           <span class="source">邮箱</span>

           <span class="desc">备注</span>

           <span>状态</span>

           <span class="headerDo">操作</span>

         </div>
        </div>


       <!--详情-->   <!--这里是对应的返回的数据-->
       <div class="body" :style="{height:height-400 + 'px'}">
         <!---->
         <div class="bodyMin" v-for="(site,index) in dataList">
           <!---->
           <div class="bodyMinTop">
             <span class="sblank"><a-icon :type="icon_type" @click="detailShow(index,$event,site.uid)" deg="0" /></span><!--<a-icon type="minus-square" />-->
             <span class="id" style="margin-left: 40px">{{site.appid}}</span>
             <span class="id" style="margin-left: 20px">{{site.uid}}</span>
             <span class="id" style="margin-left: 40px">{{site.name}}</span>
             <span class="source" style="margin-left: 50px">{{site.phone}}</span>
             <p class="source" style="margin-left: 50px">{{site.email}}</p>
             <p class="desc" style="margin-left: 50px">{{site.remark}}</p>
             <span><b style="font-size: 15px;margin-right: 4px" :class="checkColor(site.state)">•</b>{{site.state | checkFil}}</span>
             <span class="headerDo">
               <span class="cz" @click="czPass(site.uid,site,name,site.phone,site.email,site.remark)">编辑</span>
               <span class="cz" style="cursor: pointer" v-show="site.state == 1"  @click="czRefuse(site.uid)">停用</span>
               <span class="cz" style="cursor: pointer" v-show="site.state == 0"   @click="czRefuse2(site.uid)">启用</span>
               <span class="cz" style="cursor: pointer"  @click="czRefuse3(site.id)">提醒日志</span>
             </span>
           </div>
           <!---->
           <div class="bodyMinBom" v-show="bodyIndex == index + 1" style="background-color: #fafafa; height: 60px; ">
             <div style="margin-top: 20px">用户创建时间:{{site.createTime}}</div>
             <!--<div>用户修改时间:{{site.modifyTime}}</div>-->
           </div>
         </div>
       </div>

       <!---->
       <div class="page">
         <a-pagination showQuickJumper showSizeChanger :defaultCurrent="1" :total=total :pageSize="pageSize" @change="onChange" @showSizeChange="onShowSizeChange" :pageSizeOptions="pageNt" />
       </div>
       <!---->nani
       <a-modal
         title="添加/编辑新用户"
         :centered=centered
         v-model="visible"
         cancelText="取消"
         okText="确定"
         @ok="handleOk"
         @cancel="cancelClick"
         :okButtonProps="okType"
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
       <!---->
       <a-modal
         title="编辑"
         :centered=centered
         v-model="visible2"
         cancelText="取消"
         okText="确定"
         @ok="handleOk2"
         @cancel="cancelClick"
         :okButtonProps="okType2"
       >
         <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">

           <p class="tmP">
             <a-form-item label="用户名" name="name" >
               <a-input placeholder="请输入" v-model="uploadData2.name"  v-decorator="['name',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入用户名',},],},]"></a-input>
             </a-form-item>
           </p>
           <p class="tmP">
             <a-form-item label="电话" name="phone" >
               <a-input placeholder="请输入" v-model="uploadData2.phone" v-decorator="['phone',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入手机号',},],},]"></a-input>
             </a-form-item>
           </p>
           <p class="tmP">
             <a-form-item label="邮箱" name="email" >
               <a-input placeholder="请输入" v-model="uploadData2.email" v-decorator="['email',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入邮箱号',},],},]"></a-input>
             </a-form-item>
           </p>
           <p class="tmP">
             <a-form-item label="备注" name="remark" >
               <a-input placeholder="请输入" v-model="uploadData2.remark" v-decorator="['remark',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入备注',},],},]"></a-input>
             </a-form-item>
           </p>
         </a-form>
       </a-modal>
     </div>
     <div class="dataRecord" v-show="utff == 2">
       <div class="top">
         <h2>提醒日志</h2>
         <a-button type="default" @click="backTo">返回</a-button>
       </div>
       <!---->
       <div class="detail">
         <!--头部-->
         <div class="header">  <!--这里不清楚-->
           <span class="blank"></span>
           <span class="">监控用户</span>
           <span class="">监控类型</span>
           <span class="">监控事件</span>
           <span class="">币种</span>
           <span class="">通知方式</span>
           <span class="">提醒时间</span>
         </div>
       </div>
       <!--详情-->
       <div class="body" :style="{height:height-400 + 'px'}">
         <!---->
         <div class="bodyMin" v-for="(site,index) in dataList2">
           <!---->
           <div class="bodyMinTop">
             <span class="">{{site.userId}}</span>
             <span class="">{{site.ruleId}}</span>
             <p class="" style="flex: 1;word-break: break-all;padding-left: 1rem;margin: 0">{{site.operationType}}</p>
             <p class="" style="flex: 1;word-break: break-all;padding-left: 1rem;margin: 0">{{site.notifyType | operationType}}</p>
             <p class="" style="flex: 1;word-break: break-all;padding-left: 1rem;margin: 0">{{site.target}}</p>
             <span><i style="margin-right: 4px" :class="checkColor(site.isEnable)">•</i>{{site.notifyStatus | checkFil}}</span>
               <span class="cz2 id"><a-icon style="cursor: pointer;margin: 0;padding: 0" type="dowiconn" @click="detailShow(index,$event,site.morId)" deg="0" /></span>

           </div>
           <!---->
           <div class="bodyMinBom" v-show="bodyIndex == index + 1">
             <!---->
             <!--<div class="bodyMinBomTop">-->
             <!--<span>编号</span>-->
             <!--<span class="headerDo">地址哈希</span>-->
             <!--<span>外部标注</span>-->
             <!--<span>来源</span>-->
             <!--</div>-->
             <!---->
             <div>通知内容:{{site.notifyContent}}</div>
             <div>添加时间:{{site.createTime}}</div>
             <div>修改时间:{{site.modifyTime}}</div>
             <!--<div class="bodyMinBomB" v-for="site in detailList">-->
             <!--<span>{{site.numId}}</span>-->
             <!--<span class="headerDo">{{site.address}}</span>-->
             <!--</div>-->
           </div>
         </div>
       </div>
       <!---->
       <div class="page">
         <a-pagination showQuickJumper showSizeChanger :defaultCurrent="1" :total=total2 :pageSize="pageSize2" @change="onChange2" @showSizeChange="onShowSizeChange2" :pageSizeOptions="pageNt" />
       </div>
       <!---->
       <a-modal
         title="审核信息"
         :centered=centered
         v-model="czVisible"
         cancelText="取消"
         okText="提交"
         @ok="handleOkPass"
       >
         <p class="tmP">
           <span>请输入备注：</span>
           <a-input placeholder="请输入" v-model="checkDec" @pressEnter="handleOkPass"/>
         </p>
       </a-modal>
       <a-modal
         title="审核信息"
         :centered=centered
         v-model="czVisible2"
         cancelText="取消"
         okText="提交"
         @ok="handleOkRefuse"
       >
         <p class="tmP">
           <span>请输入备注：</span>
           <a-input placeholder="请输入" v-model="checkDec2" @pressEnter="handleOkRefuse"/>
         </p>
       </a-modal>
     </div>
     <a-modal
       title="添加"
       :centered=centered
       v-model="visible"
       cancelText="取消"
       okText="提交"
       @ok="handleOk"
       @cancel="cancelClick"
       :okButtonProps="okType"
     >
       <p class="tmP">
         <span>手机：</span>
         <a-input placeholder="请输入" v-model="uploadData.phone"/>
       </p>
       <p class="tmP">
         <span>邮箱：</span>
         <a-input placeholder="请输入" v-model="uploadData.email"/>
       </p>
       <p class="tmP">
         <span>备注：</span>
         <a-input placeholder="请输入" v-model="uploadData.desc"/>
       </p>
     </a-modal>
     <!---->
     <a-modal
       title="编辑"
       :centered=centered
       v-model="visible2"
       cancelText="取消"
       okText="提交"
       @ok="handleOk2"
       @cancel="cancelClick"
       :okButtonProps="okType2"
     >
       <p class="tmP">
         <span>手机：</span>
         <a-input placeholder="请输入" v-model="uploadData2.phone"/>
       </p>
       <p class="tmP">
         <span>邮箱：</span>
         <a-input placeholder="请输入" v-model="uploadData2.email"/>
       </p>
       <p class="tmP">
         <span>备注：</span>
         <a-input placeholder="请输入" v-model="uploadData2.desc"/>
       </p>
     </a-modal>
   </div>
</template>

<script>
    export default {
      name: "dataRecord",
      data(){
        return {
          form: this.$form.createForm(this, { name: 'coordinated' }),  //创建form实例的方法
          icon_type:'plus-square',
          icon_flag:true,


          height:0,
          visible: false,
          visible2: false,
          czVisible:false,
          czVisible2:false,
          centered:true,
          tp:this.$Config.baseUrl + '/al/origin/importDataSource',
          headers: {
            authorization: 'authorization-text',
          },
          headers2: {
            Authorization: this.$Cookies.get("token"),
          },
          coinType:"",
          checkType:"",
          pageSize:50,
          pageNum:0,
          pageSize2:50,
          pageNum2:0,
          dataList:[],
          dataList2:[],
          bodyIndex:0,
          bodyIndex2:0,
          total:0,
          total2:0,
          detailList:[],
          fileList:[],
          uploadData:{
            name:"",
            phone:"",
            email:"",
            remark:"",
            // dataSourceExecl:""
          },
          uploadData2:{
            name:"",
            phone:"",
            email:"",
            remark:"",
            // dataSourceExecl:""
          },
          checkDec:'',
          checkDec2:'',
          morId:0,
          coinList:[],
          pageNt:['50','100'],
          okType:{
            props: {disabled: true},
          },
          okType2:{
            props: {disabled: true},
          },
          searchMsgs:"",
          utff:1,

          //me
          name:'',
          currentPage:0,
        }
      },
      methods: {
        user(){
          let test = [
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
              uid:2,
              name:'张三',
              email:'1234@qq.com',
              phone:188888,
              remark:'这是备注',
              state:1,
              createTime:'2020-10-01',
            }
          ];
          this.dataList = test;
        },
        //点击导入源数据按钮
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
        //点击导入弹窗取消按钮
        cancelClick(){
          this.visible = false;
          this.visible2 = false;
          this.uploadData = {
            name:"",
            phone:"",
            email:"",
            remark:""
          }
          this.uploadData2 = {
            name:"",
            phone:"",
            email:"",
            remark:"",
          }
          this.fileList = [];
        },
        //导入窗口提交
        handleOk(e) {
          console.log(e);
          this.addAjax()
          // this.visible = false;
        },
        handleOk2(e) {
          console.log(e);
          this.editAjax()
          // this.visible = false;
        },
        //点击通过按钮
        handleOkPass(e) {
          console.log(e);
         // this.czVisible = false;
          this.checkAjax(this.morId,2,this.checkDec)
        },
        //点击拒绝按钮
        handleOkRefuse(e) {
          console.log(e);
          //this.czVisible2 = false;
          this.checkAjax(this.morId,1,this.checkDec2)
        },
        //币种筛选
        handleChange(value) {
          console.log(`selected ${value}`);
          let that  =this;
          that.coinType = value;
          that.pageNum = 0;
          that.pageSize = 50;
          that.getDataList();
        },
        //审核状态筛选
        handleChange2(value) {
          console.log(`selected ${value}`);
          let that = this;
          that.checkType = value;
          that.pageNum = 0;
          that.pageSize = 50;
          that.getDataList();
        },
        //导入源数据币种筛选
        handleChange3(value) {
          console.log(`selected ${value}`);
          this.uploadData.coinType = value;
        },
        //分页
        onChange(pageNumber) {
          console.log('Page: ', pageNumber);
          this.pageNum = pageNumber-1;
          this.getDataList();
        },
        onChange2(pageNumber) {
          console.log('Page: ', pageNumber);
          this.pageNum2 = pageNumber-1;
          this.getDataList2();
        },
        //单页数目
        onShowSizeChange(current, pageSize) {
          console.log(current, pageSize);
          this.pageSize = pageSize;
          this.getDataList();
        },
        //单页数目
        onShowSizeChange2(current, pageSize) {
          console.log(current, pageSize);
          this.pageSize2 = pageSize;
          this.getDataList2();
        },
        //
        czPass(morId,name,phone,email,remark){
          let that = this;
          that.visible2 = true;  //选择哪个弹出框来显示
          that.morId=morId;
          that.uploadData2.name = name;
          that.uploadData2.phone = phone;
          that.uploadData2.email = email;
          that.uploadData2.remark = remark;

        },
        czRefuse(morId){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/userCease',
            params:{
              id:morId
            }
          }).then(res=>{
            if(res.data.code == "0"){
              that.$message.success(res.data.message);
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();
            }else {
              that.$message.error(res.data.message)
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();

            }
          })

        },
        czRefuse2(morId){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/userOpen',
            params:{
              id:morId
            }
          }).then(res=>{
            if(res.data.code == "0"){
              that.$message.success(res.data.message);
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();
            }else {
              that.$message.error(res.data.message)
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();

            }
          })
        },

        czRefuse3(morId){
          let that = this;
          that.utff = 2;
          that.morId = morId;
          that.getDataList2()
        },
        //获取列表信息
        getDataList(){
          let that = this;
          that.bodyIndex =0;
          that.$ajax({
            method:"get",
            url:that.$Config.baseUrl + '/monitor/admin'+'/users?',
            params:{
              name:that.name,
              currentPage:that.currentPage,
              pageSize:that.pageSize,
            }
          }).then(res=>{
            if(res.data.code == "1"){
              that.dataList = res.data.data.list;
              that.total = res.data.data.total;
            }
          })
        },
        //审核点的颜色
        checkColor(value){
          if(value == 0){
            return 'grey'
          }else if(value == 1){
            return 'green'
          }
        },
        //点击展开详情页
        detailShow(index,$event,morId){
          let that = this;
          that.bodyIndex = index + 1;
          let deg = $($event.currentTarget).attr('deg');
          if(deg == 0){
            that.bodyIndex = index + 1;
            $($event.currentTarget).attr('deg',90);
            //that.detailAjax(morId)
          }else {
            that.bodyIndex = 0;
            $($event.currentTarget).attr('deg',0)
          }
          this.icon_flag=!this.icon_flag
          if(this.icon_flag){
            this.icon_type='plus-square'
          }
          if(!this.icon_flag){
            this.icon_type='minus-square'
          }

        },
        //请求详情
        detailAjax(morId){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/al/origin/originDetail',
            params:{
              morId:morId
            }
          }).then(res=>{
            if(res.data.code == "0"){
              that.detailList  = res.data.data;
            }
          })
        },
        //上传
        submitUpload() {
          if(this.uploadData.dataSource != ""){
            this.$refs.upload.submit();
          }else {
            this.$message.error('数据来源不能为空')
          }
        },
        handleRemove(file, fileList) {
          console.log(file, fileList);
        },
        handlePreview(file) {
          console.log(file);
          this.uploadData.dataSourceExecl = file;
        },
        //提交审核
        checkAjax(morId,examinType,examinNote){
          let that = this;
          that.$ajax.interceptors.response.use(function (response) {
            return response;
          }, function (err) {
            if (err && err.response) {
              console.log(err);
              that.$router.push({name:"500",params:{err:err}})
            }else{
              console.log(err);
            }
          });
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/al/origin/originExamin',
            params:{
              morId:morId,
              examinType:examinType,
              examinNote:examinNote
            }
          }).then(res=>{
            if(res.data.code == "0"){
              that.$message.success(res.data.message)
              that.czVisible = false;
              that.czVisible2 = false;
              that.coinType = "";
              that.checkType = "";
              that.pageNum = 0;
              that.pageSize = 50;
              that.getDataList();
            }else {
              that.$message.error(res.data.message)
            }
          })
        },
        uploadSuccess(response){
          console.log(response);
          if(response.code == "0"){
            this.visible = false;
            this.coinType = ""
            this.$message.success(response.message)
            this.checkType = "";
            this.pageNum = 0;
            this.pageSize = 50;
            this.getDataList();
          }else{
            this.$message.error(response.message)
          }
        },
        //获取币种
        cointype(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/al/seed/coinMsg',
          }).then(res=>{
            if(res.data.code =="0"){
              that.coinList = res.data.data
            }
          })
        },
        onSearch (value) {
          console.log(value);
          this.searchMsgs = value;
          this.getDataList();
        },
        addAjax(){
          let that = this;
          that.$ajax.defaults.headers.post['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'post',
            url:that.$Config.baseUrl + '/monitor/mmc/userAddEdit',
            data:{
              id:null,
              mobile:that.uploadData.phone,
              email:that.uploadData.email,
              userName:that.uploadData.desc
            }
          }).then(res=>{
            if(res.data.code =="0"){
              that.$message.success(res.data.message);
              that.visible =false;
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();

            }else {
              that.$message.error(res.data.message);
              that.visible =false;

              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();
            }
          })
        },
        editAjax(){
          let that = this;
          that.$ajax.defaults.headers.post['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'post',
            url:that.$Config.baseUrl + '/monitor/mmc/userAddEdit',
            data:{
              id:that.morId,
              mobile:that.uploadData2.phone,
              email:that.uploadData2.email,
              userName:that.uploadData2.desc
            }
          }).then(res=>{
            if(res.data.code =="0"){
              that.$message.success(res.data.message);
              that.visible2 =false;
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();

            }else {
              that.$message.error(res.data.message);
              that.visible2 =false;

              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();
            }
          })
        },
        //获取列表信息
        getDataList2(){
          let that = this;
          that.bodyIndex2 =0;
          // console.log(that.$Cookies.get("token"));
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:"get",
            url:that.$Config.baseUrl + '/monitor/mmc/record',
            // url:'baseUrl:"https://trace.chaindigg.cn/v3Manager/follow",',
            params:{
              id:that.morId,
              pageNum:that.pageNum2,
              pageSize:that.pageSize2
            }
          }).then(res=>{
            if(res.data.code == "0"){
              that.dataList2 = res.data.data.list;
              that.total2 = res.data.data.total;
            }
          })
        },
        backTo(){
          let that = this;
          that.utff = 1;
        }
      },
      watch: {
        uploadData: {
          handler(newValue, oldValue) {
            if(newValue.phone != "" || newValue.email != ""){
              this.okType.props.disabled = false;
            }else {
              this.okType.props.disabled = true;
            }
          },
          deep: true
        },
        uploadData2: {
          handler(newValue, oldValue) {
            if(newValue.phone != "" || newValue.email != ""){
              this.okType2.props.disabled = false;
            }else {
              this.okType2.props.disabled = true;
            }
          },
          deep: true
        },
      },
      filters:{
        checkFil(value){      /*state状态为正常和禁用的方法*/
          if(value == 1){
            return '正常'
          }else if(value == 0){
            return '禁用'
          }
        },
        examinNoteChe(val){
          if(val != "" && val != null){
            return val
          }else {
            return '无'
          }
        },
        operationType(val){
          if(val == 1){
            return '邮件通知'
          }else if(val == 2){
            return '短信通知'
          }else if(val == 3){
            return "邮件短信通知"
          }
        }
      },
      mounted(){
        this.user();
        let that = this;
        that.height = $(window).height();
        window.onresize = () => {
          return (() => {
            that.height = $(window).height();
          })()
        };
        that.getDataList();
        //that.cointype();
      }
    }
</script>

<style scoped>
  .top{
    display: flex;
    justify-content: space-between;
  }
  .topRight{
    display: flex;
  }
  .detail{
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .header{
    min-height: 54px;
    display: flex;
    background: #fafafa;
    transition: background 0.3s ease;
    text-align: left;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    border: 1px solid #e8e8e8;
    margin-top: 20px;
    align-items: center;
  }
  .header span{
    flex: 1;
    box-sizing: border-box;
    padding-left: 16px;
  }
  .headerDo{
    flex-grow: 1.5 !important;
  }
  .id{
    flex-grow: 0.5 !important;
  }
  .source{
    flex-grow: 1.5 !important;
  }
  .desc{
    flex-grow: 2.5 !important;
  }
  /**/
  .body{
    min-height: 400px !important;
    overflow: auto;
  }
  .bodyMinTop{
    display: flex;
    border-bottom: 1px solid #e8e8e8;
    transition: all 0.3s, border 0s;
    align-items: center;
  }
  .bodyMinTop span{
    flex: 1;
    box-sizing: border-box;
    padding-left: 16px;
    min-height: 54px;
    align-items: center;
    white-space: nowrap;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    display: flex;
  }
  .bodyMinBom{
    width: 100%;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    /*background: #fafafa;*/
    box-sizing: border-box;
    padding-left: 1rem;
  }
  .bodyMinBom div{
    margin: 0.5rem 0;
    color: darkgray;
  }
  .bodyMinBomTop{
    display: flex;
    box-sizing: border-box;
    padding: 20px 16px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
  }
  .bodyMinBomTop span{
    flex: 1;
  }
  .bodyMinBomB{
    display: flex;
    box-sizing: border-box;
    padding: 0px 16px 20px 16px;

  }
  .bodyMinBomB span{
    flex: 1;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }

  /**/
  .page{
    text-align: right;
    margin-top: 30px;
  }
  .tmP{
    display: flex;
    align-items: center;
  }
  .tmP span{
    width: 100px;
    display: inline-block;
  }
  .tmP input{
    flex: 1;
  }
  .cz{
    color: #1585ff !important;
    margin-right: 16px;
    /*cursor: pointer;*/
    display: flex;
  }
  .cz2{
    color: #1585ff !important;
    /*cursor: pointer;*/
  }
  .headerDo span{
    /*width: 50px !important;*/
    display: inline-flex;
    padding: 0 !important;
    flex: auto !important;
  }
  .darkgray{
    color: darkgray !important;
  }
  .red{
    color:red !important;
  }
  .green{
    color:green !important;
  }
</style>

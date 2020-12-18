<template><!--这里对应的是地址监控规则-->
   <div>
     <div class="dataRecord" v-show="utff == 1">

       <div class="top">
         <h2 >地址监控规则管理</h2>
         <a-button type="primary" @click="showModal">添加</a-button>
         <a-modal
           title="添加地址监控规则"
           :centered=centered
           v-model="visible"
           cancelText="取消"
           okText="确定"
           @ok="handleOk"
           @cancel="cancelClick"
           :okButtonProps="okType"
           width="800px"
         >   <!--以下是点击添加规则 然后弹出的那个框里面的内容-->
           <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
           <table  >
             <tr>
               <td>
                 <p class="tmP">
                   <a-form-item label="监控用户">
                   <a-select style="width: 170px"  placeholder="请选择" v-decorator="['monitor',{validateTrigger: ['change', 'blur'],rules: [{required: true,whitespace: true,message: '请输入监控用户',},],},]">
                   </a-select>
                   </a-form-item>
                 </p>
               </td>
               <td rowspan="2" >
                 <a-input placeholder="Search name" ></a-input>
                 <br> &nbsp;
                 <a-button  style="background-color: #1585ff; color: white;margin-top: 7px"><a-icon type="search" />Search</a-button>
                 <a-button style="width: 90px">reset </a-button>
               </td>
             </tr>
             <tr>
               <td>
                 <p class="tmP" style="align-items: flex-start">
                   <span>监控事件:</span>
                   <a-input  style="flex: 1; width: 40%" placeholder="给目标起个名字" type="text"
                             :rows="3" v-model="uploadData.phone"/>      &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
                 </p>
               </td>
             </tr>
           </table>
           <p class="tmP" style="align-items: flex-start">
             <span>通知方式:</span>
             <a-checkbox-group  >
             <a-row>
               <a-checkbox value="短信">短信</a-checkbox>
               <a-checkbox value="邮件">邮件</a-checkbox>
               <a-checkbox value="App提醒">App提醒</a-checkbox>
               <a-checkbox value="客户端提醒">客户端提醒</a-checkbox>
             </a-row>
             </a-checkbox-group>
           </p>
           <!--<p class="tmP" style="align-items: flex-start">
             <a-form-item label="地址信息">
               <a-select style="width: 170px"  placeholder="请选择币种" v-decorator="['coin',{ rules: [{ required: true, message: '请选择币种!' }] },]">
               </a-select>
             </a-form-item>
             &nbsp; &#45;&#45; &nbsp;
             <a-form-item  >
               <a-input placeholder="请输入地址"  v-decorator="['username', { rules: [{ required: true, message: '请输入地址!' }] }]"></a-input>
             </a-form-item>
             &nbsp;&#45;&#45; &nbsp;
             <a-input placeholder="请输入地址标注"></a-input>
             &nbsp;&#45;&#45; &nbsp;
             <a-input placeholder="请输入监控阈值"></a-input>
           </p>-->
             <p>
               <span>地址信息：</span>

             <a-form-item
               v-for="(k, index) in form.getFieldValue('keys')"
               :key="k"

               :required="false"
             >
               <a-select
                 v-decorator="[
                  `names[${k}]`,
                  {
                    validateTrigger: ['change', 'blur'],
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: '请选择币种',
                      },
                    ],
                  },
                ]"
                 placeholder="请选择币种"
                 style="width: 150px; margin-right: 8px"
               />
               --
               <a-input
                 v-decorator="[
                  ,
                  {
                    validateTrigger: ['change', 'blur'],
                    rules: [
                      {
                        required: true,
                        whitespace: true,
                        message: '请输入地址',
                      },
                    ],
                  },
                ]"
                 placeholder="请输入地址"
                 style="width: 150px; margin-right: 8px"
               />
               --
               <a-input
                 placeholder="请输入地址标注"
                 style="width: 150px; margin-right: 8px"
               />
                --
               <a-input
                 placeholder="请输入监控阈值"
                 style="width: 150px; margin-right: 8px"
               />
               <!--右侧的图标-->
               <a-icon
                 v-if="form.getFieldValue('keys').length > 1"
                 class="dynamic-delete-button"
                 type="minus-circle-o"
                 :disabled="form.getFieldValue('keys').length === 1"
                 @click="() => remove(k)"
               />
             </a-form-item>
             <a-form-item v-bind="formItemLayoutWithOutLabel">
               <a-button type="dashed" style="width: 60%" @click="add">
                 <a-icon type="plus" /> 添加
               </a-button>
             </a-form-item>
             <a-form-item v-bind="formItemLayoutWithOutLabel">
               <a-button type="primary" html-type="submit">
                 Submit
               </a-button>
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
       <!---->

       <div class="detail">
         <!--头部-->
         <div class="header">  <!--这里相当于返回数据的那个表格-->
           <span class="">监控用户 &nbsp;<a-icon type="search"  @click="searchUserName"/></span>
           <span>监控事件 &nbsp;<a-icon type="search" /></span>
           <span>通知方式</span>
           <span>添加时间</span>
           <span>状态</span>
           <span>操作</span>
           <!--<span class="id">规则ID</span>
           <span class="id">用户ID</span>
           <span  style="padding-left: 1rem"class="">监控类型</span>
           <span class="id">币种</span>
           <span >监控地址</span>
           <span>地址tag</span>
           <span>监控阈值</span>
           <span>通知方式</span>
           <span class="headerDo">操作</span>-->
         </div>
       </div>
       <!--详情-->
       <div class="body" :style="{height:height-400 + 'px'}">
         <!---->
         <div class="bodyMin" v-for="(site,index) in dataList">
           <div class="bodyMinTop">
             <span class="id">{{site.name}}</span>
             <span class="id" style="margin-left: 100px">{{site.eventName}}</span>
             <span class="id" style="margin-left: 100px">{{site.noticeWay | notifyType}}</span>
             <span class="id" style="margin-left: 100px">{{site.addTime}}</span>
             <span style="margin-left: 100px"><b style="margin-right:4px; font-size: 20px" :class="checkColor(site.state)">•</b>{{site.state | checkFil}}</span>
             <span class="headerDo" style="margin-left: 100px;">
               <span class="cz" @click="czPass(site.uid,site.phone,site.email,site.remark)">编辑</span>  <!--编辑这个页面还不知道-->
               <span class="cz" style="cursor: pointer" v-show="site.state == 1"  @click="czRefuse(site.uid)">停用</span>
               <span class="cz" style="cursor: pointer" v-show="site.state == 0"   @click="czRefuse2(site.uid)">启用</span>
               <span class="cz" style="cursor: pointer"  @click="czRefuse3(site.id)">提醒日志</span>
             </span>
            <!-- <p class="" style="flex: 1;word-break: break-all;padding-left: 1rem;margin: 0">{{site.operationType | operationType2}}</p>
             <p class="id" style="flex: 1;word-break: break-all;padding-left: 1rem;margin: 0">{{site.thresholdUnit}}</p>
             <div class="addrHash" style="">
               <span class="adHash" style="    background: #d9d9d9;
    height: 30px;
    padding: 0 1rem;
    min-height: 30px;
    line-height: 30px;
    border-radius: 5px;">{{site.operationAddress}}</span>
             </div>
             <span>{{site.addressTag}}</span>
             <span>{{site.thresholdValue}}</span>
             <span>{{site.notifyType | notifyType}}</span>
             <span class="headerDo">
              <span class="cz"><a-icon style="cursor: pointer" type="down" @click="detailShow(index,$event,site.morId)" deg="0" /></span>
              <span class="cz" style="cursor: pointer"  @click="czPass(site.id,site.userId,site.coinHash,site.operationAddress,site.addressTag,site.thresholdValue,site.thresholdUnit,site.notifyType,site.ruleName,site.operationType)">编辑</span>
              <span class="cz" style="cursor: pointer"  @click="showDeleteConfirm(site.id)">删除</span>
            </span>-->
           </div>
           <!---->
           <div class="bodyMinBom" v-show="bodyIndex == index + 1">

             <div>单位:{{site.coinHash}}</div>
             <div>规则备注:{{site.ruleName}}</div>
             <div>用户添加时间:{{site.createTime}}</div>
             <div>用户修改时间:{{site.modifyTime}}</div>

           </div>
         </div>
       </div>
       <!---->
       <div class="page">
         <a-pagination showQuickJumper showSizeChanger :defaultCurrent="1" :total=total :pageSize="pageSize" @change="onChange" @showSizeChange="onShowSizeChange" :pageSizeOptions="pageNt" />
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
     <div class="dataRecord" v-show="utff == 2">   <!--这里是用户管理 点击添加 弹出的那个小框框-->
       <div class="top">
         <!--<a-button type="default" @click="backTo">返回</a-button>-->
         <a-modal
           title="添加"
           :centered=centered
           v-model="visible"
           cancelText="取消"
           okText="确定"
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
           okText="确定"
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
       <!---->
       <div class="top">
         <h2>提醒日志</h2>
         <a-button type="default" @click="backTo">返回</a-button>
       </div>
       <div class="detail">
         <!--头部-->
         <div class="header">
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
               <span class="cz2 id"><a-icon style="cursor: pointer;margin: 0;padding: 0" type="down" @click="detailShow(index,$event,site.morId)" deg="0" /></span>

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
   </div>
</template>

<script>
let id = 0;
    export default {
      name: "dataRecord",
      data(){
        return {
          //form: this.$form.createForm(this, { name: 'coordinated' }),

          formItemLayout: {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 20 },
            },
          },
          formItemLayoutWithOutLabel: {
            wrapperCol: {
              xs: { span: 24, offset: 0 },
              sm: { span: 20, offset: 4 },
            },
          },


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
            phone:"",
            email:"",
            desc:"",
            t1:0,
            t2:0,
            t3:0,
            t4:0,
            tag:"",
            ruleName:"",
            num:0
            // dataSourceExecl:""
          },
          uploadData2:{
            phone:"",
            email:"",
            desc:"",
            t1:0,
            t2:0,
            t3:0,
            t4:0,
            tag:"",
            ruleName:"",
            num:0
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
          //
          type1:[],
          type2:[],
          type3:[],
          type4:[],
        }
      },
      beforeCreate() {
        this.form = this.$form.createForm(this, { name: 'dynamic_form_item' });
        this.form.getFieldDecorator('keys', { initialValue: [], preserve: true });
      },

      methods: {
        address() {
          let test = [
            {
              name: '张三',
              eventName: 'PT事件',
              noticeWay: 1,
              addTime: '2020-10-01',
              state: 1,
            },
            {
              name: '张三',
              eventName: 'PT事件',
              noticeWay: 2,
              addTime: '2020-10-01',
              state: 0,
            },
            {
              name: '张三',
              eventName: 'PT事件',
              noticeWay: 3,
              addTime: '2020-10-01',
              state: 1,
            },
            {
              name: '张三',
              eventName: 'PT事件',
              noticeWay: 4,
              addTime: '2020-10-01',
              state: 0,
            }
          ];
          this.dataList=test;
        },
        searchUserName(username){


        },
        remove(k) {
          const { form } = this;
          // can use data-binding to get
          const keys = form.getFieldValue('keys');
          // We need at least one passenger
          if (keys.length === 1) {
            return;
          }

          // can use data-binding to set
          form.setFieldsValue({
            keys: keys.filter(key => key !== k),
          });
        },

        add() {
          const { form } = this;
          const keys = form.getFieldValue('keys');
          const nextKeys = keys.concat(id++);
          form.setFieldsValue({
            keys: nextKeys,
          });
        },

        //点击导入源数据按钮
        showModal() {
          let that = this;
          that.visible = true;
          that.uploadData = {
              phone:"",
              email:"",
              desc:"",
              t1:that.type1[0].key,
              t2:that.type2[0].key,
              t3:that.type3[0].key,
              t4:that.type4[0].key,
              tag:"",
              num:0,
              ruleName:"",
              id:null

          }
          this.fileList = [];
        },
        //点击导入弹窗取消按钮
        cancelClick(){
          this.visible = false;
          this.visible2 = false;
          this.uploadData = {
            phone:"",
            email:"",
            desc:""
          }
          this.uploadData2 = {
            phone:"",
            email:"",
            desc:""
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
        handleChangeT1(value) {
          console.log(`selected ${value}`);
          let that  =this;
          that.uploadData.t1 = value;
        },
        handleChangeT2(value) {
          console.log(`selected ${value}`);
          let that  =this;
          that.uploadData.t2 = value;
        },
        handleChangeT3(value) {
          console.log(`selected ${value}`);
          let that  =this;
          that.uploadData.t3 = value;
        },
        handleChangeT4(value) {
          console.log(`selected ${value}`);
          let that  =this;
          that.uploadData.t4 = value;
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
        zczPass(id,userId,coinHash,operationAddress,addressTag,thresholdValue,thresholdUnit,notifyType,ruleName,operationType){
          let that = this;
          that.visile = true;
          that.uploadData.id = id;
          that.uploadData.phone = userId;
          that.uploadData.t2 = coinHash;
          that.uploadData.desc = operationAddress;
          that.uploadData.tag = addressTag;
          that.uploadData.num = thresholdValue;
          that.uploadData.t4 =thresholdUnit.toString();
          that.uploadData.t3 = notifyType.toString();
          that.uploadData.ruleName = ruleName;
          that.uploadData.t1 = operationType.toString();
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
        czRefuse4(morId){
          let that = this;
          that.umAjax(morId)
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
          // console.log(that.$Cookies.get("token"));
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:"get",
            url:that.$Config.baseUrl + '/monitor/mmc/ruleList',
            // url:'baseUrl:"https://trace.chaindigg.cn/v3Manager/follow",',
            params:{
              searchMsgs:that.searchMsgs,
              pageNum:that.pageNum,
              pageSize:that.pageSize
            }
          }).then(res=>{
            if(res.data.code == "0"){
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
            url:that.$Config.baseUrl + '/monitor/mmc/ruleAddEdit',
            data:{
              id:that.uploadData.id,
              userId:that.uploadData.phone,
              coinHash:that.uploadData.t2,
              operationType:that.uploadData.t1,
              operationAddress:that.uploadData.desc,
              thresholdValue:that.uploadData.num,
              notifyType:that.uploadData.t3,
              addressTag:that.uploadData.tag,
              ruleName:that.uploadData.ruleName,
              thresholdUnit:that.uploadData.t4
              // thresholdUnit:that.uploadData.num,
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
        },
        umAjax(id){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/ruledelete',
            params:{
              id:id
            }
          }).then(res=>{
            if(res.data.code =="0"){
              that.$message.success(res.data.message);
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();

            }else {
              that.$message.error(res.data.message);
              that.searchMsgs = "";
              that.pageSize = 50;
              that.pageNum = 0;
              that.getDataList();
            }
          })
        },
        type1Ajax(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/monitorType',
          }).then(res=>{
            if(res.data.code =="0"){
              that.type1 = res.data.data;
              console.log(that.type1[0].key);
            }
          })
        },
        type2Ajax(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/monitorCoinHash',
          }).then(res=>{
            if(res.data.code =="0"){
              that.type2 = res.data.data
            }
          })
        },
        type3Ajax(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/monitorNotifyType',
          }).then(res=>{
            if(res.data.code =="0"){
              that.type3 = res.data.data
            }
          })
        },
        type4Ajax(){
          let that = this;
          that.$ajax.defaults.headers.get['Authorization'] = that.$Cookies.get("token");
          that.$ajax({
            method:'get',
            url:that.$Config.baseUrl + '/monitor/mmc/monitorThresholdUnit',
          }).then(res=>{
            if(res.data.code =="0"){
              that.type4 = res.data.data
            }
          })
        },
        showDeleteConfirm(userId) {
          let that = this;
          that.$confirm({
            title: '确定删除吗',
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
              console.log('OK');
              that.czRefuse3(userId)
            },
            onCancel() {
              console.log('Cancel');
            },
          });
        },
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
        checkFil(value){
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
        operationType3(val){
          if(val == 1){
            return '邮件通知'
          }else if(val == 2){
            return '短信通知'
          }else if(val == 3){
            return "邮件短信通知"
          }
        },
        /*operationType2(val){
          if(val == 0){
            return "地址监控"
          }else {
            return "大额交易监控"
          }
        },*/
        notifyType(val){
          if(val == 1){
            return '邮件'
          }else if(val == 2){
            return '短信'
          }else if(val == 3){
            return 'App提醒'
          }
          else if(val==4){
            return '客户端提醒'
          }
        }
      },
      mounted(){
        let that = this;
        that.height = $(window).height();
        window.onresize = () => {
          return (() => {
            that.height = $(window).height();
          })()
        };
        that.getDataList();
        that.type1Ajax();
        that.type2Ajax();
        that.type3Ajax();
        that.type4Ajax();
        //that.cointype();
        this.address();


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
    flex-grow: 0.6 !important;
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
    background: #fafafa;
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
  .addrHash{
    display: flex;flex: 1;padding-left: 16px;box-sizing: border-box;position: relative;align-items: center;min-height: 54px;
  }
  .adHash{
    position: absolute;left: 0;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;width: 100px;height: 100%;display: block !important;line-height: 54px;
  }
  .adHash:hover{
    width: auto;
    min-width: 100px;
    background: #d9d9d9;
    /*height: 54px;*/
    z-index: 9;
    padding: 0 1rem;
  }
</style>

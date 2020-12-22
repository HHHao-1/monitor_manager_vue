<template>
  <div>
    <div class="top">
      <h2>地址监控规则管理</h2>
      <a-button type="primary" @click="showModal">添加</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="pagination" >
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <div >
          <a-input
            style="width: 188px; margin-bottom: 8px; display: block;left:80px"
            placeholder="Search Name"
            v-model="searchName1"
            @pressEnter="searchNameAjax"
            id="searchInput1"
          />
          <a-button
            type="primary"
            icon="search"
            size="small"
            style="width: 90px; margin-right: 8px;left:80px"
            @click="searchNameAjax"
          >
            Search
          </a-button>
          <a-button size="small" style="width: 90px;left:80px" @click="reset">
            Reset
          </a-button>
        </div>

      </div>

      <div
        slot="filterDropdown1"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >

        <a-input
          style="width: 188px; margin-bottom: 8px; display: block;"
          placeholder="Search Event"
          v-model="searchEvent1"
          id="searchInput2"
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
        <a-button size="small" style="width: 90px" @click="reset1">
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
      <span slot="action" slot-scope="text, record">
        <a  @click="edit(text.id,text.name,text.eventName,text.noticeWay,text.address,text.coinKind,text.addressMark,text.monitorMinVal)">编辑</a>
        <a  v-show="text.state == 0"  @click="startUse(text.id)">启用</a>
        <a  v-show="text.state == 1"  @click="stopUse(text.id)">停用</a>
        <a  @click="gotoLog">提醒日志</a>
        <!--{{text.coinKind}}{{text.addressMark}}{{text.monitorMinVal}}-->
      </span>
      <span slot="noticeWay" slot-scope="way">
      {{way | noticeWayFun}}
    </span>
    </a-table>
    <!--添加-->
    <a-modal
      title="添加地址监控规则"
      v-model="visible"
      cancelText="取消"
      okText="确定"
      @ok="handleOk"
      @cancel="cancelClick"
      width="1200px"
    >   <!--以下是点击添加规则 然后弹出的那个框里面的内容-->
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <table  >
          <tr>
            <td>
              <p class="tmP">
                <a-form-item label="监控用户">
                <a-select
                  show-search
                  placeholder="请选择"
                  option-filter-prop="children"
                  style="width: 170px"
                  :filter-option="filterOption"
                  @focus="handleFocus"
                  @blur="handleBlur"
                  @change="handleChange"
                  v-decorator="['userName',{rules: [{required: true,whitespace: true,message: '请输入监控用户',},],},]"
                >
                  <a-select-option v-for="(item,i) in unique(searchNameList)" :value="item" :key="i">
                    {{item}}
                  </a-select-option>
                </a-select>
                </a-form-item>
              </p>
              <!--<p class="tmP">
                <a-form-item label="监控用户">
                  <a-select style="width: 170px"  placeholder="请选择" v-model="uploadData.userName" v-decorator="['userName',{rules: [{required: true,whitespace: true,message: '请输入监控用户',},],},]">

                  </a-select>
                </a-form-item>
              </p>-->
            </td>
            <td rowspan="2"  >
            </td>
          </tr>
          <tr>
            <td>
              <p class="tmP" >
                <span>&nbsp;&nbsp;&nbsp;监控事件:&nbsp;&nbsp;</span>
                <a-input  style="flex: 1; width: 170px" placeholder="给目标起个名字" type="text"
                          :rows="3" v-model="uploadData.eventName"/>      &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
              </p>
            </td>
          </tr>
        </table>
        <table >
          <tr>
            <td>
              <span>&nbsp;&nbsp;&nbsp;通知方式:&nbsp;&nbsp;</span>
              <br><br>
            </td>
            <td>
              <a-checkbox-group v-model="uploadData.noticeWay" >
                <a-row>
                  <a-checkbox value="0">短信</a-checkbox>
                  <a-checkbox value="1">邮件</a-checkbox>
                  <a-checkbox value="2">客户端提醒</a-checkbox>
                </a-row>
              </a-checkbox-group>
              <br><br>
            </td>
          </tr>
          <tr>
            <td  style="display: flex">
              <div style="margin-top: 10px ">&nbsp;&nbsp;&nbsp;地址信息:&nbsp;&nbsp;</div>
            </td>


            <td width="1000px">
              <a-form-item
                v-for="(k, index) in form.getFieldValue('keys')"
                :key="k"
                :required="false"

              >
                <a-select
                  v-decorator="[
                  `coinKind[${k}]`,
                  {
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
                  v-model="dataObj.coinKind[index]"
                >
                  <a-select-option v-for="(item,i) in unique(mainChainList)" :value="item" :key="i">
                    {{item}}
                  </a-select-option>
                </a-select>
                --
                <a-input
                  v-model="dataObj.address[index]"
                  v-decorator="[
                     `address[${k}]`,
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

                  style="width: 250px; margin-right: 8px"
                />
                <!-- <a-input
                   v-model="dataObj.address[index]"
                   placeholder="请输入地址"
                   style="width: 250px; margin-right: 8px"
                 />-->
                --
                <a-input
                  v-decorator="[
                     `aMark[${k}]`,
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
                  placeholder="请输入地址标注"
                  v-model="dataObj.addressMark[index]"
                  style="width: 150px; margin-right: 8px"
                />
                --
                <a-input
                  v-decorator="[
                     `min[${k}]`,
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
                  placeholder="请输入监控阈值"
                  v-model="dataObj.monitorMinVal[index]"
                  style="width: 150px; margin-right: 8px"></a-input>
                <!--右侧的图标-->
                <a-icon
                  v-if="form.getFieldValue('keys').length > 0"
                  class="dynamic-delete-button"
                  type="minus-circle-o"
                  :disabled="form.getFieldValue('keys').length === 0"
                  @click="() => remove(k)"
                />
              </a-form-item>
              <br>
              <a-form-item v-bind="formItemLayoutWithOutLabel">
                <a-button type="dashed" style="width: 118%" @click="add">
                  <a-icon type="plus" /> 添加
                </a-button>
              </a-form-item>
              <!--<a-form-item v-bind="formItemLayoutWithOutLabel">
              </a-form-item>-->
            </td>

          </tr>

        </table>
      </a-form>
    </a-modal>

    <!--编辑-->
    <a-modal
      title="编辑地址监控规则"
      v-model="editVisible"
      cancelText="取消"
      okText="确定"
      @ok="editHandleOk"
      @cancel="editCancelClick"
      width="1200px"
    >   <!--以下是点击编辑规则 然后弹出的那个框里面的内容-->
      <a-form :form="editForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <table >
          <tr>
            <td>
              <p class="tmP">
                <a-form-item label="监控用户">
                  <a-select
                    show-search
                    placeholder="请选择"
                    option-filter-prop="children"
                    style="width: 170px"
                    :filter-option="filterOption"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange"
                    v-decorator="['userName',{rules: [{required: true,whitespace: true,message: '请输入监控用户',},],},]"
                  >
                    <a-select-option v-for="(item,i) in unique(searchNameList)" :value="item" :key="i">
                      {{item}}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </p>
            </td>
            <td rowspan="2" >
            </td>
          </tr>
          <tr>
            <td>
              <p class="tmP" >
                <span>&nbsp;&nbsp;&nbsp;监控事件:&nbsp;&nbsp;</span>
                <a-input  style="flex: 1; width: 170px" placeholder="给目标起个名字" type="text" v-model="dataObj1.eventName"
                          :rows="3" />      &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
              </p>
            </td>
          </tr>
        </table>
        <table >
          <tr>
            <td>
              <span>&nbsp;&nbsp;&nbsp;通知方式:&nbsp;&nbsp;</span>
              <br><br>
            </td>
            <td>
              <a-checkbox-group  v-model="notice" >
                <a-row>
                  <a-checkbox value="0">短信</a-checkbox>
                  <a-checkbox value="1">邮件</a-checkbox>
                  <a-checkbox value="2">客户端提醒</a-checkbox>
                </a-row>
              </a-checkbox-group>
              <br><br>
            </td>
          </tr>
          <tr>
            <td style="display: flex">
              <div style="margin-top: 10px">&nbsp;&nbsp;&nbsp;地址信息:&nbsp;&nbsp;</div>
            </td>
            <td>
              <a-form-item
                v-for="(k, index) in editForm.getFieldValue('keys1')"
                :key="k"
                :required="false"

              >
                <a-select
                  v-decorator="[
                  ,
                  {
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
                  v-model="dataObj1.coinKind[index]"
                >
                  <a-select-option v-for="(item,i) in unique(mainChainList)" :value="item" :key="i">
                    {{item}}
                  </a-select-option>
                </a-select>
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
                  style="width: 250px; margin-right: 8px"
                  v-model="dataObj1.address[index]"
                  @change="validataAddr1"
                />
                --
                <a-input
                  placeholder="请输入地址标注"
                  v-model="dataObj1.addressMark[index]"
                  style="width: 150px; margin-right: 8px"
                />
                --
                <a-input
                  placeholder="请输入监控阈值"
                  v-model="dataObj1.monitorMinVal[index]"
                  style="width: 150px; margin-right: 8px"
                />
                <!--编辑右侧的图标-->
                <!--<a-icon
                  v-if="editForm.getFieldValue('keys1').length > 0"
                  class="dynamic-delete-button"
                  type="minus-circle-o"
                  :disabled="editForm.getFieldValue('keys1').length === 0"
                  @click="() => remove1(k)"
                />-->
              </a-form-item>
              <div class="va" id="va">请输入地址</div>
              <a-form-item v-if="false" v-bind="formItemLayoutWithOutLabel" style="width: 800px">
                <a-button type="dashed" style="width: 147%" @click="add1">
                  <a-icon type="plus" /> 添加
                </a-button>
              </a-form-item>
              <!--<a-form-item v-bind="formItemLayoutWithOutLabel">
              </a-form-item>-->

            </td>
          </tr>
        </table>
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
let id = 0;
export default {
  data() {
    return {
      isValidata1:false,
      isShow1:true,
      dataList2:[],
      isName:false,
      isEvent:false,
      mainChainList:[],
      notice:[],
      TextVisible:false,
      searchName1:'',
      searchEvent1:'',
      searchVal:'',
      pagination:false,
      currentPage:1,
      pageSize:8,
      total:0,
      pageNt:['10','20','30','40','50'],
      dataObj:{
        userName:'',
        eventName:'',
        noticeWay:'',
        coinKind:[],
        address:[],
        addressMark:[],
        monitorMinVal:[]
      },
      dataObj1:{
        userName:'',
        eventName:'',
        noticeWay:'',
        coinKind:[],
        address:[],
        addressMark:[],
        monitorMinVal:[]
      },
      searchName:'',
      test:[],
      coin:[],
      val:[],
      address:[],
      addressM:[],
      width:700,
      dataList:[],
      searchNameList:[],
      searchCoinList:[],
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      fileList:[],
      editVisible:false,
      visible: false,
      showValue:'',
      uploadData: {
        eventName:"",
        coinKind:"",
        address:"",
        userName:"",
        addressMark:"",
        monitorMinVal:"",
        noticeWay:'',
        id:0,

      },
      columns: [
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
                const input = document.getElementById("searchInput1")
                input.focus()
               // this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: '监控事件',
          dataIndex: 'eventName',
          key: 'eventName',
          scopedSlots: {
            filterDropdown: 'filterDropdown1',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          onFilter: (value, record) =>
            record.age
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => {
                const input = document.getElementById("searchInput2")
                input.focus()
                //this.searchInput.focus();
              }, 0);
            }
          },
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
          key: 'x',
          scopedSlots: {
            customRender: 'action'
          }
        },
      ],
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
          xs: { span: 8, offset: 0 },
          sm: { span: 16, offset: 0 },
        },
      },
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' });
    this.editForm = this.$form.createForm(this, { name: 'coordinated' });
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true });
    console.log('hello')
    console.log(this.form.getFieldValue('keys')[0]);
    this.editForm.getFieldDecorator('keys1', { initialValue: [], preserve: true });
    /*this.$nextTick(_ => {
      this.editForm.setFieldsValue(this.uploadData2)
    })*/
  },
  methods: {
    validataAddr1(){
      for(let i=0;i<this.dataObj1.address.length;i++) {
        console.log(this.dataObj1.address[i])
        if (this.dataObj1.address[i]=="") {
          setTimeout(function () {
            document.getElementById("va").style.color = "red";
          }, 0);
          this.isValidata1=true;
        }
        else  {
          setTimeout(function () {
            document.getElementById("va").style.color = "white";
          },0);
          this.isValidata1=false;
        }
      }
    },
    searchNameAjax(){
      this.isName = true
      this.$ajax({
        method:"get",
        url:'/monitor/admin/addr-rules',
        params:{
          event:'',
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
    searchEventAjax(){
      this.isShow1 = false
      this.isEvent = true
      this.$ajax({
        method:"get",
        url:'/monitor/admin/addr-rules',
        params:{
          event:this.searchEvent1,
          userName:'',
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
    reset1(){
      this.searchEvent1 = '';
      this.getDataList();
    },
    resetButton(){
      this.searchVal='';
    },
    searchN(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/addr-rules/search',
        params:{
          name:this.searchVal
        }
      }).then(res=>{
        console.log(res)
        if(res.data.code == '1001'){
          alert(res.data.data)
        }
        else{
          alert('用户不存在')
        }

      })
    },
    getDataList(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'/monitor/admin/addr-rules',
        params:{
          event:'',
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
    addAddressDataList(){
      var list=[]
      class obj{
        userName
        eventName
        noticeWay
        coinKind
        address
        addressMark
        monitorMinVal
        constructor(userName,eventName,noticeWay,coinKind,address,addressMark,monitorMinVal) {
          this.userName=userName;
          this.eventName=eventName
          this.noticeWay=noticeWay;
          this.coinKind=coinKind;
          this.address=address;
          this.addressMark=addressMark;
          this.monitorMinVal=monitorMinVal;
        }
      }
      let notice = 0
      let mid=this.uploadData.noticeWay
      switch(mid.length){
        case 1:
          notice = new Number(mid[0]);
          break
        case 2:
          switch (new Number(mid[0])+new Number(mid[1])){
            case 1:
              notice= 3
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
      for (let i = 0; i <this.dataObj.coinKind.length ; i++) {
        list.push(new obj(
          this.form.getFieldValue('userName'),
          this.uploadData.eventName,
          notice.toString(),
          this.dataObj.coinKind[i],
          this.dataObj.address[i],
          this.dataObj.addressMark[i],
          this.dataObj.monitorMinVal[i])
        )
      }

      this.$ajax({
        method:"post",
        url:'/monitor/admin/addr-rules',
        data: list
      }).then(res=>{
        if(res.data.code=='1001'){
          alert('添加成功')
          this.getDataList();
        }else{
          alert('添加失败')
        }
      })
    },
//编辑ajax
    editDataList1(){
      var list=[]
      class obj{
        id
        userName
        eventName
        noticeWay
        coinKind
        address
        addressMark
        monitorMinVal
        constructor(id,userName,eventName,noticeWay,coinKind,address,addressMark,monitorMinVal) {
          this.id=id;
          this.userName=userName;
          this.eventName=eventName
          this.noticeWay=noticeWay;
          this.coinKind=coinKind;
          this.address=address;
          this.addressMark=addressMark;
          this.monitorMinVal=monitorMinVal;
        }
      }
      let notice=0
      let mid=this.notice
      let length = mid.length
      switch(length){
        case 1:
          this.notice = Number(mid[0]);
          break
        case 2:
          switch (Number(mid[0])+Number(mid[1])){
            case 1:
              this.notice=3
              break
            case 2:
              this.notice = 4
              break
            case 3:
              this.notice = 5
              break
          }
          break
        case 3:
          this.notice = 6
          break
      }
      for (let i = 0; i <this.dataObj1.coinKind.length ; i++) {
        list.push(new obj(this.dataObj1.id,
          this.dataObj1.userName,
          this.dataObj1.eventName,
          this.notice,
          this.dataObj1.coinKind[i],
          this.dataObj1.address[i],
          this.dataObj1.addressMark[i],
          this.dataObj1.monitorMinVal[i]))
      }
      let that = this;
      that.$ajax({
        method:"put",
        url:'/monitor/admin/addr-rules',
        data:list,
      }).then(res=>{
        if(res.data.code=='1001'){
          alert('修改成功')
          this.getDataList()
        }else{
          alert('修改失败')
        }
      })
    },

    searchAddressInfo(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users/list',
      }).then(res=>{
        if(res.data.code=='1001'){

          this.dataList2 = res.data.data.data;
          Object.keys(this.dataList2).forEach(key=>{
            let name = this.dataList2[key].name
            // let coinKind = that.dataList[key].coinKind
            this.searchNameList.push(name)
            // that.searchCoinList.push(coinKind)
          })
        }
      })
    },
    searchCoinListFun(){
      this.$ajax({
        method:"get",
        url:'monitor/admin/coinlist',
      }).then(res=>{
        if(res.data.code==1001){
          this.mainChainList = res.data.data;
        }
      })
    },
    unique(array) {
      return Array.from(new Set(array));
    },
    edit(id,name,eventName,noticeWay,address,coinKind,addressMark,monitorMinVal){
      setTimeout(function () {
        document.getElementById("va").style.color = "white";
      },0);
      const { editForm } = this;
      const keys1 = editForm.getFieldValue('keys1');
      editForm.setFieldsValue({
        keys1: [],
      });
      this.searchAddressInfo();
      this.searchCoinListFun()
      this.dataObj1.id = id;
      this.dataObj1.userName = name;
      this.dataObj1.eventName= eventName;
      this.dataObj1.coinKind[0]=coinKind
      this.dataObj1.address[0]=address;
      this.dataObj1.addressMark[0]=addressMark ;
      this.dataObj1.monitorMinVal[0]=monitorMinVal;
      switch(noticeWay){
        case 0:
          this.notice = ['0']
          break
        case 1:
          this.notice = ['1']
          break
        case 2:
          this.notice = ['2']
          break
        case 3:
          this.notice= ['0','1']
          break
        case 4:
          this.notice=['0','2']
          break
        case 5:
          this.notice=['1','2']
          break
        case 6:
          this.notice=['0','1','2']
          break
      }

      this.add1();
      this.editVisible = true;
      this.$nextTick(_ => {
        this.editForm.setFieldsValue(this.dataObj1)
      })

    },
    startUse(id){
      let that = this;
      that.$ajax({
        method:'delete',
        url:'/monitor/admin/addr-rules',
        params:{
          id:id
        }
      }).then(res=>{
        if(res.data.code == "1001"){
          that.$message.success(res.data.msg);
          alert('成功重新启用此用户')
          that.getDataList();
        }else {
          that.$message.error(res.data.msg)
          alert('启用此用户失败')
          that.getDataList();

        }
      })

    },
    stopUse(id){
      let that = this;
      that.$ajax({
        method:'delete',
        url:'/monitor/admin/addr-rules',
        params:{
          id:id
        }
      }).then(res=>{
        if(res.data.code == "1001"){
          that.$message.success(res.data.msg);
          alert('成功禁用此用户')
          that.getDataList();
        }else {
          that.$message.error(res.data.msg)
          alert('禁用此用户失败')
          that.getDataList();

        }
      })
    },
    remove(k) {
      const { form } = this;
      // can use data-binding to get
      const keys = form.getFieldValue('keys');
      // We need at least one passenger
      if (keys.length === 0) {
        return;
      }
      // can use data-binding to set
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    },
    remove1(k) {
      const { editForm } = this;
      // can use data-binding to get
      const keys1 = editForm.getFieldValue('keys1');
      // We need at least one passenger
      if (keys1.length === 0) {
        return;
      }

      // can use data-binding to set
      editForm.setFieldsValue({
        keys1: keys1.filter(key => key !== k),
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
    add1() {
      const { editForm } = this;
      const keys1 = editForm.getFieldValue('keys1');
      const nextKeys1 = keys1.concat(id++);
      editForm.setFieldsValue({
        keys1: nextKeys1,
      });
    },
    handleOk(e){
      e.preventDefault();
      this.form.validateFields(err=>{
        if(!err){
          this.addAddressDataList();
          this.visible=false;
          this.getDataList();

        }
      })
     // this.$router.replace({name:'addressMonitor'});
    },
    cancelClick(){
      const { form } = this;
      const keys = form.getFieldValue('keys');
      const nextKeys = keys.concat(id++);
      form.setFieldsValue({
        keys: [],
      });
      this.uploadData.userName='';
      for(let i=0;i<this.dataObj.addressMark.length;i++) {
        this.dataObj.addressMark[i] = '';
      }
      for(let i=0;i<this.dataObj.monitorMinVal.length;i++) {
        this.dataObj.monitorMinVal[i] = '';
      }



    },

    editHandleOk(e){
      e.preventDefault();
      this.editForm.validateFields(err=>{
        if(!err && (this.isValidata1==false)){
          this.editVisible=false;
          this.editDataList1();
          this.getDataList();
        }
        else{
          // TODO 使用element ui 提示
          alert('请完善信息')
        }
      })
    },
    editCancelClick(){
      const { editForm } = this;
      const keys1 = editForm.getFieldValue('keys1');
      const nextKeys = keys1.concat(id++);
      editForm.setFieldsValue({
        keys1: [],
      });
    },

    gotoLog(){
      this.$router.replace('/addressNoticeLog')
    },
    showModal(){
      const { form } = this;
      const keys = form.getFieldValue('keys');
      form.setFieldsValue({
        keys: [],
      });
      this.visible = true;
      this.searchAddressInfo();
      this.searchCoinListFun();
      this.add()
      this.uploadData = {
        userName:'',
        eventName:'',
        coinKind:'',
        noticeWay: [],
      }

      this.$nextTick(_ => {
        this.form.setFieldsValue(this.uploadData)
      })

    },
    statePoint(state){
      if(state==1){
        return 'success';
      }
      else
        return 'default';
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
      if(this.isName){
        this.searchNameAjax()
      }else if(this.isEvent){
        this.searchEventAjax()
      }
      else{
        this.getDataList();
      }
    },
    onShowSizeChange(current, pageSize) {
      console.log(current, pageSize);
      this.pageSize = pageSize;
      this.getDataList();
    },
    handleChange(value) {
      console.log(`selected ${value}`);
    },
    handleBlur() {
      console.log('blur');
    },
    handleFocus() {
      console.log('focus');
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
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
  },

};
</script>
<style scoped>
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
.ant-select-selection__rendered{
  display: inline-block;
}
.ant-btn-dashed{
  width:100%
}

.ant-dropdown .ant-dropdown-placement-bottomRight{
  left:320px;

}
.ant-form-item{
  margin-bottom: 0px;
}
.va{
  color:white;
  margin-left: 190px;

}
</style>


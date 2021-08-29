<template>
  <div>
    <div class="top">
      <h2>监控事件管理</h2>
      <a-button type="primary" @click="addEventClickHandle">添加</a-button>
    </div>
    <a-table :data-source="dataList" :columns="columns" :pagination="pagination" >
      <div
        slot="userNameFilterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px;"
      >
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          v-model="searchName1"
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
        <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters, column.dataIndex)">
          Reset
        </a-button>
      </div>
      <div
        slot="eventNameFilterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="c => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          v-model="searchEvent1"
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
        <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters, column.dataIndex)">
          Reset
        </a-button>
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
      <template slot="customRender" slot-scope="text">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template
            v-for="(fragment, i) in text
              .toString()
              .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
            <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight">
              {{ fragment }}
            </mark>
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

      <span slot="action" slot-scope="item">
        <a @click.stop="editCurrentItem(item)">编辑</a>
        <a v-show="item.state == 0"  @click.stop="forbidCurrentItem(item)">启用</a>
        <a v-show="item.state == 1"  @click.stop="forbidCurrentItem(item)">停用</a>
        <a @click.stop="gotoLog(item)">提醒日志</a>
      </span>
      <span slot="noticeWay" slot-scope="way">
        {{way | noticeWayFun}}
      </span>
      <span slot="eventAddTime" slot-scope="time">
        {{time | timeFilter}}
      </span>
    </a-table>
    <div class="page">
      <a-pagination
        :defaultCurrent="currentPage"
        :current="currentPage"
        :total=total
        :pageSize="pageSize"
        @change="onChange"
        @onShowSizeChange="onShowSizeChange"
        :pageSizeOptions="pageNt" />
    </div>
    <!--添加-->
    <a-modal
      title="添加监控事件规则"
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
                <a-form-item label="监控用户" v-bind="formItemLayout">
                  <a-select
                    show-search
                    placeholder="请选择"
                    option-filter-prop="children"
                    style="width: 170px"
                    :filter-option="filterOption"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange"
                    v-decorator="['userName',{rules: [{required: true,whitespace: true,message: '请输入监控用户'}]}]"
                  >
                    <a-select-option v-for="item in searchNameList" :value="JSON.stringify(item)" :key="item.id">
                      {{item.name}}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </p>
            </td>
            <td rowspan="2">
            </td>
          </tr>
          <tr>
            <td>
              <p class="tmP">
                <span>&nbsp;&nbsp;&nbsp;监控事件:&nbsp;&nbsp;</span>
                <a-input style="flex: 1; width: 170px" placeholder="给目标起个名字" type="text" :rows="3" v-model="uploadData.eventName"/>      &nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;
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
            <td style="display: flex">
              <div style="margin-top: 10px ">&nbsp;&nbsp;&nbsp;地址信息:&nbsp;&nbsp;</div>
            </td>
            <td width="1000px">
              <a-form-item
                v-for="(k, index) in form.getFieldValue('keys')"
                :key="k"
                :required="false">
                <div>
                  <a-select
                    v-decorator="[`coinKind[${k}]`,{rules: [{ required: true, whitespace: true, message: '请选择币种'}]}]"
                    placeholder="请选择币种"
                    style="width: 150px; margin-right: 8px"
                    v-model="dataObj.coinKind[index]">
                    <a-select-option v-for="item in mainChainList" :value="JSON.stringify(item)" :key="item.id">
                      {{item.coinName}}
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
                          }
                        ]
                      }
                    ]"
                    placeholder="请输入地址"
                    @change="validataAddr2"
                    @blur="validataAddr2"
                    style="width: 250px; margin-right: 8px"/>
                  --
                  <a-input
                    v-decorator="[
                     `aMark[${k}]`,
                      {},
                    ]"
                    placeholder="请输入地址标注"
                    v-model="dataObj.addressMark[index]"
                    style="width: 150px; margin-right: 8px"
                  />
                  --
                  <a-input
                    v-decorator="[
                     `min[${k}]`,
                      {},
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
                </div>
                <div class="va2" :name="va2">请输入地址</div>
              </a-form-item>
              <br>

              <a-form-item v-bind="formItemLayoutWithOutLabel">
                <a-button type="dashed" style="width: 118%" @click="add">
                  <a-icon type="plus" /> 添加
                </a-button>
              </a-form-item>
            </td>
          </tr>
        </table>
      </a-form>
    </a-modal>

    <!--编辑-->
    <a-modal
      title="编辑监控事件规则"
      v-model="editVisible"
      cancelText="取消"
      okText="确定"
      @ok="editHandleOk"
      @cancel="editCancelClick"
      width="1200px"
    >   <!--以下是点击编辑规则 然后弹出的那个框里面的内容-->
      <a-form :form="editForm" :label-col="{span: 5}" :wrapper-col="{ span: 12 }" >
        <table >
          <tr>
            <td>
              <p class="tmP">
                <a-form-item label="监控用户" v-bind="formItemLayout">
                  <a-select
                    show-search
                    placeholder="请选择"
                    option-filter-prop="children"
                    style="width: 170px"
                    :filter-option="filterOption"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @change="handleChange"
                    v-decorator="['userName',{rules: [{required: true,whitespace: true,message: '请输入监控用户'}]}]">
                    <a-select-option v-for="item in searchNameList" :value="JSON.stringify(item)" :key="item.id">
                      {{item.name}}
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
              <a-checkbox-group v-model="notice" >
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
              <div style="margin-top: 5px;">&nbsp;&nbsp;&nbsp;地址信息:&nbsp;&nbsp;</div>
            </td>
            <td>
              <div class="edit-rule-item" v-for="(item,index) in dataObj1.allData" :key="index">
                <a-select
                  v-decorator="[{rules: [{ required: true, whitespace: true, message: '请选择币种'}]}]"
                  placeholder="请选择币种"
                  style="width: 150px; margin-right: 8px"
                  v-model="item.coinKind">
                  <a-select-option v-for="coin in mainChainList" :value="JSON.stringify(coin)" :key="coin.id">
                    {{coin.coinName}}
                  </a-select-option>
                </a-select>
                --
                <a-input
                  v-decorator="[{
                    validateTrigger: ['change', 'blur'],
                    rules: [{ required: true, whitespace: true, message: '请输入地址'}]
                  }]"
                  placeholder="请输入地址"
                  style="width: 250px; margin-right: 8px"
                  v-model="item.address"
                  @change="validataAddr1" />
                --
                <a-input
                  placeholder="请输入地址标注"
                  v-model="item.addressMark"
                  style="width: 150px; margin-right: 8px" />
                --
                <a-input
                  placeholder="请输入监控阈值"
                  v-model="item.monitorMinVal"
                  style="width: 150px; margin-right: 8px" />
                <a-icon
                  v-if="dataObj1.allData.length > 0"
                  class="dynamic-delete-button"
                  type="minus-circle-o"
                  :disabled="dataObj1.allData.length === 0"
                  @click="removeCurrentItem(index)"/>
              </div>

<!--              <a-form-item v-for="(k, index) in editForm.getFieldValue('keys1')"-->
<!--                           :key="k"-->
<!--                           :required="false">-->
<!--                <a-select-->
<!--                  v-decorator="[{rules: [{ required: true, whitespace: true, message: '请选择币种'}]}]"-->
<!--                  placeholder="请选择币种"-->
<!--                  style="width: 150px; margin-right: 8px"-->
<!--                  v-model="dataObj1.coinKind[index]">-->
<!--                  <a-select-option v-for="item in mainChainList" :value="JSON.stringify(item)" :key="item.id">-->
<!--                    {{item.coinName}}-->
<!--                  </a-select-option>-->
<!--                </a-select>-->
<!--                &#45;&#45;-->
<!--                <a-input-->
<!--                  v-decorator="[{-->
<!--                    validateTrigger: ['change', 'blur'],-->
<!--                    rules: [{ required: true, whitespace: true, message: '请输入地址'}]-->
<!--                  }]"-->
<!--                  placeholder="请输入地址"-->
<!--                  style="width: 250px; margin-right: 8px"-->
<!--                  v-model="dataObj1.address[index]"-->
<!--                  @change="validataAddr1" />-->
<!--                &#45;&#45;-->
<!--                <a-input-->
<!--                  placeholder="请输入地址标注"-->
<!--                  v-model="dataObj1.addressMark[index]"-->
<!--                  style="width: 150px; margin-right: 8px" />-->
<!--                &#45;&#45;-->
<!--                <a-input-->
<!--                  placeholder="请输入监控阈值"-->
<!--                  v-model="dataObj1.monitorMinVal[index]"-->
<!--                  style="width: 150px; margin-right: 8px" />-->
<!--                <a-icon-->
<!--                  v-if="editForm.getFieldValue('keys1').length > 0"-->
<!--                  class="dynamic-delete-button"-->
<!--                  type="minus-circle-o"-->
<!--                  :disabled="editForm.getFieldValue('keys1').length === 0"-->
<!--                  @click="() => remove1(k)"/>-->
<!--              </a-form-item>-->

<!--              <div class="va" id="va">请输入地址</div>-->
              <a-form-item v-bind="formItemLayoutWithOutLabel" style="width: 800px">
                <a-button type="dashed" style="width: 147%" @click="addNewItem">
                  <a-icon type="plus" /> 添加
                </a-button>
              </a-form-item>
            </td>
          </tr>
        </table>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
  import coinMixin from "../mixin/coinMixin";

let id = 0;
export default {
  name: 'AddressMonitor',
  mixins: [coinMixin],
  data() {
    return {
      va2:[],
      isValidata1:false,
      isValidata2:false,
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
      pageSize:10,
      total:0,
      pageNt:['8','10','20','30'],
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
          dataIndex: 'userName',
          key: 'name',
         // width:'200px',
          scopedSlots: {
            filterDropdown: 'userNameFilterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => {
                //const input = document.getElementById("searchInput1")
               // input.focus()
                this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: '监控事件',
          dataIndex: 'eventName',
          key: 'eventName',
        //  width:'250px',
          scopedSlots: {
            filterDropdown: 'eventNameFilterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender1',
          },
          onFilterDropdownVisibleChange: visible => {
            if (visible) {
              setTimeout(() => {
                //const input = document.getElementById("searchInput2")
                //input.focus()
                this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: '通知方式',
          dataIndex: 'noticeWay',
          key: 'noticeWay',
        //  width:'300px',
          scopedSlots: {
            customRender: 'noticeWay',
          }
        },
        {
          title: '添加时间',
          dataIndex: 'createTime',
          key: 'createTime',
        //  width:'250px',
          scopedSlots: {
            customRender: 'eventAddTime',
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          key: 'state',
       //   width:'200px',
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
          sm: { span: 6},
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12 },
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 8, offset: 0 },
          sm: { span: 16, offset: 0 },
        },
      },
      // userName: '', // 检索的用户名 暂时 searchName1
      // eventName: '', // 检索的监控事件名称 searchEvent1
    };
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' });
    this.editForm = this.$form.createForm(this, { name: 'coordinated' });
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true });
    this.editForm.getFieldDecorator('keys1', { initialValue: [], preserve: true });
    /*this.$nextTick(_ => {
      this.editForm.setFieldsValue(this.uploadData2)
    })*/
  },
  methods: {
    validataAddr1(){
      for(let i=0;i<this.dataObj1.address.length;i++) {
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
    validataAddr2(){
      let temp=[];
      for(let i=0;i<this.dataObj.address.length;i++) {
        if (this.dataObj.address[i]=="") {
          temp[i]=document.getElementsByName(this.va2)[i];
          setTimeout(function () {
            temp[i].style.display="block"
          }, 0);
          this.isValidata2=true;
        }
        else  {
          temp[i]=document.getElementsByName(this.va2)[i];
          setTimeout(function () {
            temp[i].style.display="none"
          }, 0);
          this.isValidata2=false;
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
        if(res.data.code == '1001'){
          alert(res.data.data)
        }
        else{
          alert('用户不存在')
        }

      })
    },
    // 启用停用当前的监控事件
    forbidCurrentItem(item) {
      let params = {
        ...item,
        state: item.state == 0 ? 1 : 0
      }
      delete params.createTime
      delete params.updateTime
      this.$ajax.put('/monitor/admin/events/state', params).then(res => {
        const {code, msg} = res.data
        if (code == 1001) {
          Message.success(msg)
        } else {
          Message.error(msg)
        }
        this.commonFetchData()
      })
    },
    // 通用的获取数据接口
    commonFetchData(){
      this.$ajax.get('/monitor/admin/events', {
        params: {
          page: this.currentPage - 1,
          size: this.pageSize,
          userName: this.searchName1,
          eventName: this.searchEvent1
        }
      }).then(res => {
        const eventsData = res.data
        const { code, data: {content, totalElements}, msg} = eventsData
        if (code == 1001) {
          this.dataList = content.map(item => {
            item.key = item.id
            return item
          })
          this.total = totalElements
        } else {
          this.dataList = []
          this.total = 0
          Message.error(msg)
        }
      })
    },
    // 转换通知方式为数字
    changeNoticeWayToNum(mid) {
      let notice;
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
      return notice
    },
    // 将通知方式转换为数组
    changeNoticeWayToArray(noticeWay) {
      switch(noticeWay) {
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
    },
    // 点击添加后的确认按钮
    addAddressDataList(){
      const mid = this.uploadData.noticeWay
      const notice = this.changeNoticeWayToNum(mid)

      const userInfo = JSON.parse(this.form.getFieldValue('userName'))
      const eventInfo = {
        eventName: this.uploadData.eventName,
        noticeWay: notice,
        userName: userInfo.name,
        userId: userInfo.id,
        state: 1
      }

      const addrRules = this.dataObj.coinKind.map((item, index) => {
        const coinInfo = JSON.parse(item)
        return {
          coinKind: coinInfo.contractAddr,
          address: this.dataObj.address[index].trim(),
          addressMark: this.dataObj.addressMark[index],
          monitorMinVal: this.dataObj.monitorMinVal[index]
        }
      })

      const data = {
        "event": eventInfo,
        addrRules
      }

      this.$ajax({
        method:"post",
        url:'/monitor/admin/events',
        data
      }).then(res=>{
        if(res.data.code=='1001'){
          Message.success('添加成功')
          this.visible = false;
          this.commonFetchData();
        }else{
          Message.error('添加失败')
        }
      })
    },
    //编辑ajax
    editDataList1(){
      const notice = this.changeNoticeWayToNum(this.notice)

      const tmpArr = this.dataObj1.allData.filter(item => item.coinKind == '' || item.address == '')
      if (tmpArr.length > 0) {
        Message.warning("请补充完整信息再提交")
        return
      }

      const userInfo = JSON.parse(this.dataObj1.userName)
      const eventInfo = {
        eventName: this.dataObj1.eventName,
        id: this.dataObj1.id,
        noticeWay: notice,
        userName: userInfo.name,
        userId: userInfo.id,
        state: this.dataObj1.state
      }

      const addrRules = this.dataObj1.allData.map(item => {
        const coinInfo = JSON.parse(item.coinKind)
        let obj = {
          coinKind: coinInfo.contractAddr,
          address: item.address.trim(),
          addressMark: item.addressMark,
          monitorMinVal: item.monitorMinVal
        }
        if (item.id != undefined || item.id > 0) {
          obj = {
            ...obj,
            id: item.id
          }
        }
        return obj
      })

      const toDeleteAddrRuleIds =
        this.dataObj1.originData.filter(item => this.dataObj1.allData.findIndex(c => item.id == c.id) == -1).map(i => i.id)

      const data = {
        "event": eventInfo,
        addrRules,
        toDeleteAddrRuleIds
      }

      this.$ajax.put('/monitor/admin/events', data).then(res => {
        const { msg, code} = res.data
        if (code == 1001) {
          Message.success("修改成功")
          this.editVisible = false;
          this.commonFetchData()
        } else {
          Message.error(msg)
        }

      })

      // var list=[]
      // class obj{
      //   uid
      //   id
      //   eventName
      //   noticeWay
      //   coinKind
      //   address
      //   addressMark
      //   monitorMinVal
      //   constructor(uid,id,eventName,noticeWay,coinKind,address,addressMark,monitorMinVal) {
      //     this.uid=uid;
      //     this.id=0;
      //     this.eventName=eventName
      //     this.noticeWay=noticeWay;
      //     this.coinKind=coinKind;
      //     this.address=address.trim();
      //     this.addressMark=addressMark;
      //     this.monitorMinVal=monitorMinVal;
      //   }
      // }
      // let notice
      // let mid=this.notice
      // let length = mid.length
      // switch(length){
      //   case 1:
      //     this.notice = Number(mid[0]);
      //     break
      //   case 2:
      //     switch (Number(mid[0])+Number(mid[1])){
      //       case 1:
      //         this.notice=3
      //         break
      //       case 2:
      //         this.notice = 4
      //         break
      //       case 3:
      //         this.notice = 5
      //         break
      //     }
      //     break
      //   case 3:
      //     this.notice = 6
      //     break
      // }
      // for (let i = 0; i <this.dataObj1.coinKind.length ; i++) {
      //   list.push(new obj(this.dataObj1.id,
      //     this.dataObj1.userName,
      //     this.dataObj1.eventName,
      //     this.notice,
      //     this.dataObj1.coinKind[i],
      //     this.dataObj1.address[i],
      //     this.dataObj1.addressMark[i],
      //     this.dataObj1.monitorMinVal[i]))
      // }
      // let that = this;
      // that.$ajax({
      //   method:"put",
      //   url:'/monitor/admin/addr-rules',
      //   data:list,
      // }).then(res=>{
      //   if(res.data.code=='1001'){
      //     Message.success('修改成功')
      //     this.editVisible = false;
      //     this.commonFetchData()
      //   }else{
      //     Message.error('修改失败')
      //   }
      // })
    },
    // 获取用户列表
    searchAddressInfo(){
      this.$ajax({
        method:"get",
        url:'/monitor/admin/users/list',
      }).then(res=>{
        if(res.data.code=='1001'){
          this.searchNameList = res.data.data.data
        } else {
          this.searchNameList = []
        }
      })
    },
    editCurrentItem(item) {
      setTimeout(function () {
        document.getElementById("va").style.color = "white";
      },0);
      const { editForm } = this;
      const keys1 = editForm.getFieldValue('keys1');
      editForm.setFieldsValue({
        keys1: [],
      });
      this.$ajax.get(`/monitor/admin/events/rules?eventId=${item.id}`).then(res => {
        const { code, msg, data} = res.data
        if (code == 1001) {
          // 获取基础信息
          if (data.length > 0) {
            const { eventName, userName, noticeWay, eventId, userId, state } = data[0]
            // 设置通知方式
            this.changeNoticeWayToArray(noticeWay)
            this.dataObj1.id = eventId
            this.dataObj1.state = state
            const userInfo = this.searchNameList.filter(item => item.id == userId )
            if (userInfo && userInfo.length > 0) {
              this.dataObj1.userName = JSON.stringify(userInfo[0])
            }
            this.dataObj1.eventName = eventName
            // 展示用的数据
            this.dataObj1.allData = data.map(item => {
              const { coinKind } = item
              const coinInfo = this.coinType.filter(item => item.contractAddr == coinKind)
              if (coinInfo && coinInfo.length > 0) {
                item.coinKind = JSON.stringify(coinInfo[0])
              }
              return item
            })
            this.dataObj1.originData = data
            // debugger
            this.editVisible = true;
            this.$nextTick(_ => {
              this.editForm.setFieldsValue(this.dataObj1)
            })
          }
        } else {
          this.dataObj1.allData = {}
          this.dataObj1.originData = []
          Message.error(msg)
        }
      })
    },
    // 删除当前
    removeCurrentItem(index) {
      this.dataObj1.allData.splice(index, 1)
      const dataObj1 = {
        ...this.dataObj1
      }
      this.dataObj1 = dataObj1
    },
    // 添加新的地址信息
    addNewItem() {
      const data = this.dataObj1.allData
      data.push({
        address: '',
        addressMark: '',
        coinKind: '',
        monitorMinVal: ''
      })
      const dataObj1 = {
        ...this.dataObj1,
        allData: data
      }
      this.dataObj1 = dataObj1
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
          alert('成功重新启用此用户')
          that.commonFetchData();
        }else {
          alert('启用此用户失败')
          that.commonFetchData();

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
          //that.$message.success(res.data.msg);
          alert('成功禁用此规则')
          that.commonFetchData();
        }else {
          //that.$message.error(res.data.msg)
          alert('禁用此规则失败')
          that.commonFetchData();

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
      const keys1 = editForm.getFieldValue('keys1');
      if (keys1.length === 0) {
        return;
      }
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
    add1(id) {
      const { editForm } = this;
      const keys1 = editForm.getFieldValue('keys1');
      const nextKeys1 = keys1.concat(id);
      editForm.setFieldsValue({
        keys1: nextKeys1,
      });
    },
    handleOk(e){
      e.preventDefault();
      this.form.validateFields(err=>{
        if(!err  && (this.isValidata2==false) && this.uploadData.noticeWay!=''){
          this.addAddressDataList();
        }
        else if(this.uploadData.noticeWay==''){
          Message.error('请填写通知方式！')
        }
        else {
          Message.error('请填写地址信息！')
        }
      })
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
        if(!err && (this.isValidata1==false && this.notice!='')){
          this.editDataList1();
        }
        else if(this.notice==''){
          Message.error('请填写通知方式！')
        }
        else{
          Message.error('请填写地址信息！')
          // alert('请完善信息')
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

    gotoLog(item){
      sessionStorage.setItem('id2', JSON.stringify(item));
      //sessionStorage.setItem('name',name);
      this.$router.replace('/addressNoticeLog')
    },
    addEventClickHandle(){
      const { form } = this;
      const keys = form.getFieldValue('keys');
      form.setFieldsValue({
        keys: [],
      });
      this.visible = true;
      this.searchAddressInfo();
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
    handleSearch(selectedKeys, confirm) {
      confirm();
      this.currentPage = 1
      this.commonFetchData()
    },

    handleReset(clearFilters, dataIndex) {
      clearFilters();
      if (dataIndex == 'eventName') {
        this.searchEvent1 = ''
      }
      if (dataIndex == 'userName') {
        this.searchName1 = '';
      }
      this.currentPage = 1
      this.commonFetchData()
    },

    onChange(page,pageSize){
      this.currentPage = page;
      this.pageSize = pageSize
      this.commonFetchData()
      // if(this.isName){
      //   this.searchNameAjax()
      // }else if(this.isEvent){
      //   this.searchEventAjax()
      // }
      // else{
      //   this.commonFetchData();
      // }
    },
    onShowSizeChange(current, pageSize) {
      this.currentPage = current
      this.pageSize = pageSize;
      this.commonFetchData();
    },
    handleChange(value) {
     //
    },
    handleBlur() {
     //
    },
    handleFocus() {
      //
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    // 获取最新的币种信息
    fetchAfterHasCoinType() {
      // 获取数据
      this.mainChainList = this.coinType
      this.commonFetchData();
      this.searchAddressInfo();
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
      if (hours < 10) hours = '0' + hours;
      if (min < 10) min = '0' + min;
      if (seconds < 10) seconds = '0' + seconds;
      return (year + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + seconds);
    }
  },
  mounted() {
  }
};
</script>
<style scoped>
  .edit-rule-item {
    margin-bottom: 10px;
  }
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
/*.ant-select-selection__rendered{
  display: inline-block;
}*/
.ant-btn-dashed{
  width:100%
}

#dynamic_form_item_userName{
  margin-left: 10px;
}
#coordinated_userName{
  margin-left: 10px;
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
.va2{
  color: red;
  margin-left: 190px;
  margin-top: -10px;
  display: none;

}
  .dynamic-delete-button {
    cursor: pointer;
  }
</style>


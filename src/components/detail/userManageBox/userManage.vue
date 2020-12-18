<template>

  <div>
    <div class="top">
      <h2>用户管理</h2>
    </div>
    <div class="table">
      <a-table :columns="columns" :data-source="dataList" :pagination="pagination">

        <div
          slot="filterDropdown"
          slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
          style="padding: 8px"
        >

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
        <a  v-show="text.state == 0"  @click="startUse(text.id)">启用</a>
        <a  v-show="text.state == 1"  @click="stopUse(text.id)">停用</a>
      </span>
      </a-table>
    </div>

    <div class="page">
      <a-pagination
        showQuickJumper showSizeChanger
        :defaultCurrent="1"
        :total=total
        :pageSize="pageSize"
        :pageSizeOptions="pageNt" />
    </div>

  </div>
</template>
<script>

const columns = [
  {
    title: 'UID',
    dataIndex: 'unionId',
    key: 'unionId',
  },
  {
    title: '用户名',
    dataIndex: 'name',
    key: 'name',

  },
  {
    title: '手机',
    dataIndex: 'mobile',
    key: 'mobile',
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',

  },

  {
    title: '权限',
    key: 'state',
    dataIndex: 'state',
    scopedSlots:
      {
        customRender: 'state'
      },
  },
  {
    title: '操作',
    key: 'action',
    dataIndex:'',
    scopedSlots:
      {
        customRender: 'action'
      },
  },
];

export default {
  name: "userMonitor",
  data() {
    return {
      unionId:'',
      isUserName:false,
      searchName:'',
      searchInput: null,
      searchedColumn: '',
      id:0,
      columns,
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
      total:500,
      pageNt:['8','10','20','30'],
      uploadData: {
        id:"",
        name:"",
        phone:"",
        email:"",
        remark:""
      },
      searchText:""
    };

  },
  methods:{
    getDataList(){
      let that = this;
      that.$ajax({
        method:"get",
        url:'/monitor/admin/ding/user-list'
      }).then(res=>{
        if(res.data.code === 0){
          that.total=res.data.data.users.length
          that.dataList = res.data.data.users
          let userList = []
          res.data.data.users.forEach(s=>{
            let{unionId, name, mobile,department,permission}= s
            department = department.slice(0,department.indexOf(';'))
            let apply = permission.apply
            let user = {
              unionId,
              name,
              mobile,
              department,
              state:!parseInt(apply),
            }
            userList.push(user)
            this.unionId=unionId
          })
          this.dataList=userList
        }
      })
    },
    startUse(id){
      let that = this;
      that.$ajax({
        method:'post',
        url:'/monitor/admin/ding/'+this.unionId,
        params:{
          apply:0
        }
      }).then(res=>{
        console.log(res)
        if(res.data.code === 0){
          // that.$message.success(res.data.msg);
          alert('成功开通用户权限')
          that.getDataList();
        }else {
          //that.$message.error(res.data.msg)
          alert('开通用户权限失败')
          that.getDataList();

        }
      })

    },
    stopUse(id){
      let that = this;
      that.$ajax({
        method:'post',
        url:'/monitor/admin/ding/'+this.unionId,
        params:{
          apply:0
        }
      }).then(res=>{
        if(res.data.code === 0){
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

    statePoint(state){
      if(state==1){
        return 'success';
      }
      else
        return 'default';
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

  },
  mounted() {
    this.getDataList();
  },
};
</script>
<style>
.ant-form-item-control-wrapper{
  display: inline-block;
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
#coordinated_phone{
  left:15px;
}
#coordinated_email{
  left:15px;
}
#coordinated_remark{
  left: 15px;
}
.ant-form-explain{

}
/*.page{
 padding-bottom: 2px;
}*/

</style>


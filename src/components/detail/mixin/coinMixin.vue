<script>
  import qs from 'qs'
  import { Message } from 'element-ui'

  export default {
    name: "coinMixin",
    data() {
      return {
        coinType: []
      }
    },
    methods: {
      // 请求获取所有的币种信息
      async fetchAllCoinType() {
        const coinResult = await this.$ajax.get('/monitor/admin/coins')
        const { code , data, msg } = coinResult.data
        if (code == 1001) {
          this.coinType = data
          this.fetchAfterHasCoinType()
        } else {
          // 提示信息
          Message.error(msg)
        }
      },
      // 在获取币种信息之后请求
      fetchAfterHasCoinType() {
      },
      // 使用QS 序列化
      stringifyWithQs(data) {
        return qs.stringify(data)
      }
    },
    mounted() {
      this.fetchAllCoinType()
    }
  }
</script>


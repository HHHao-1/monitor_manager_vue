<template>
    <div>
      {{params.err.response.data.message}}
    </div>
</template>

<script>
    export default {
      name: "500",
      data(){
        return {
          params:this.$route.params
        }
      },
      mounted(){
        //console.log(this.params);
      }
    }
</script>

<style scoped>

</style>

<template>
  <div id="app">
    <calendar></calendar>
  </div>
</template>

<script>
import calendar from './components/Calendar.vue'
// import headerList from './components/HeaderList.vue'

export default {
  name: 'App',
  components: {
    calendar,
    // headerList
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

export default {
  computed: {
    taskList() {
      return this.$store.getters.taskList;
    },

    getUser() {
      return this.$store.getters.getUser;
    }
  }
}
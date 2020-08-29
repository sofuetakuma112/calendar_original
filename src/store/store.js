import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tasks: [],
    user: {}
  },
  getters: {
    taskList: state => {
      return state.tasks
    },
    getUser: state => {
      return state.user
    }
  },
  mutations: {
    addTask(state, payload) {
      state.tasks.push({
        id: payload.id,
        name: payload.message,
        date: payload.date,
        uid: payload.uid
      })
    },
    // taskIdで検索してヒットしたタスクの内容を上書きする
    editTask(state, payload) {
      const task = state.tasks.find(task => task.id === payload.taskId)
      task.name = payload.editMessage
    },
    // idが一致しないタスクのみの配列を作り置き換える
    deleteTask(state, payload) {
      const task = state.tasks.filter(task => task.id !== payload.id)
      state.tasks = task
    },
    setUser(state, payload) {
      state.user = payload.user
    }
  }
})
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    tasks: [
      {
        id: 1,
        name: 'Vue.jsの勉強をする',
        date: '2020_08_22'
      },
      {
        id: 2,
        name: 'ご飯を食べる',
        date: '2020_09_03'
      }
    ],

    nextTaskId: 3
  },
  getters: {
    taskList: state => {
      return state.tasks
    }
  },
  mutations: {
    addTask(state, payload) {
      state.tasks.push({
        id: state.nextTaskId,
        name: payload.message,
        date: payload.date
      })

      state.nextTaskId++
    },
    editTask(state, payload) {
      const task = state.tasks.find(task => task.id === payload.taskId)
      task.name = payload.editMessage
    }
  }
})

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')

import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import firebase from 'firebase'

Vue.use(Vuex)

const store = new Vuex.Store({
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

const firebaseConfig = {
  apiKey: "AIzaSyBx5CAHGeGeSoL_A2eE3PWLNCPKKVpg2ZM",
  authDomain: "calendar-app-sofue.firebaseapp.com",
  databaseURL: "https://calendar-app-sofue.firebaseio.com",
  projectId: "calendar-app-sofue",
  storageBucket: "calendar-app-sofue.appspot.com",
  messagingSenderId: "174240335545",
  appId: "1:174240335545:web:542937969f858b72e83d68"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft, faAngleRight, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faAngleLeft, faAngleRight, faTrash)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')

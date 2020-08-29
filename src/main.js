import Vue from 'vue'
import App from './App.vue'
import store from './store/store.js'
import firebase from 'firebase'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft, faAngleRight, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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

library.add(faAngleLeft, faAngleRight, faTrash)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')

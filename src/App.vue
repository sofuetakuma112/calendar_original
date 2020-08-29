<template>
  <div id="app">
    <calendar @edit="openEditModal" @open="openModal" @login="doLogin" @logout="doLogout"></calendar>
    <!-- 新規追加用モーダル -->
    <my-modal @close="closeModal" v-if="modal">
      <p>タスクを入力してください</p>
      <div class="text">
        <input type="text" v-model="message" class="text-message" />
      </div>
      <template slot="footer">
        <button @click="doSend">送信</button>
      </template>
    </my-modal>
    <!-- 編集用モーダル -->
    <my-modal @close="closeModal" v-if="editModal">
      <font-awesome-icon icon="trash" @click="deleteTask" class="trash" />
      <p>タスク編集</p>
      <div class="text">
        <input type="text" v-model="editMessage" class="text-message" />
      </div>
      <template slot="footer">
        <button @click="doEdit">送信</button>
      </template>
    </my-modal>
  </div>
</template>

<script>
import calendar from "./components/Calendar.vue";
import MyModal from "./components/MyModal.vue";
import firebase from "firebase";
import "firebase/firestore";
import getMixin from './mixins/get.js'

export default {
  name: "App",
  components: {
    calendar,
    MyModal,
  },
  mixins: [getMixin],
  data() {
    return {
      modal: false, // 新規追加用モーダル表示
      editModal: false, // 更新用モーダル表示
      message: "", // タスク内容をv-modelで一時的に保存
      editMessage: "", // 編集するタスク内容をv-modelで一時的に保存
      taskId: null, // タスクを特定するid
      fullDate: "",
      db: null,
    };
  },
  computed: {
    getTaskMessage() {
      const editTask = this.taskList.find((task) => task.id === this.taskId);
      return editTask;
    }
  },
  created() {
    this.db = firebase.firestore();

    var that = this;
    this.db
      .collection("tasks")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          that.$store.commit("addTask", {
            message: data.message,
            date: data.date,
            id: data.id,
            uid: data.uid,
          });
        });
      });

    // ログイン、ログアウト時にも実行している
    firebase.auth().onAuthStateChanged((user) => {
      this.commitUser(user ? user : {})
    });
  },
  methods: {
    openModal(value) {
      if (this.getUser.uid) {
        this.message = "";
        this.modal = true;
        // doSendでmutationに渡すのに使う
        this.fullDate = value;
      }
    },
    openEditModal(taskId) {
      this.editModal = true;
      this.taskId = taskId;
      this.editMessage = this.getTaskMessage.name;
    },
    closeModal() {
      this.modal = false;
      this.editModal = false;
      this.message = "";
    },
    doSend() {
      if (this.getUser.uid && this.message.length > 0) {
        const doc = this.db.collection("tasks").doc();
        doc
          .set({
            message: this.message,
            date: this.fullDate,
            id: doc.id,
            uid: this.getUser.uid,
          })
          .then(function () {
            console.log("Done!");
          })
          .catch(function () {
            console.log("Error!");
          });

        this.$store.commit("addTask", {
          message: this.message,
          date: this.fullDate,
          id: doc.id,
          uid: this.getUser.uid,
        });
        this.message = "";
        this.closeModal();
      } else {
        alert("タスクを入力してください");
      }
    },
    doEdit() {
      if (this.getUser.uid && this.editMessage.length > 0) {
        const that = this;
        this.db.collection("tasks").doc(this.taskId).update({
          message: that.editMessage,
        });
        this.$store.commit("editTask", {
          editMessage: this.editMessage,
          taskId: this.taskId,
        });
        this.editMessage = "";
        this.closeModal();
      } else {
        alert("タスクを入力してください");
      }
    },
    deleteTask() {
      if (!confirm("このタスクを削除しますか？")) {
        return;
      }
      this.db
        .collection("tasks")
        .doc(this.taskId)
        .delete()
        .then(() => {
          console.log("delete!");
        });
      this.$store.commit("deleteTask", { id: this.taskId });
      this.editModal = false;
    },
    commitUser(user) {
      this.$store.commit('setUser', {user})
    },
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    doLogout() {
      firebase.auth().signOut();
    }
  },
};
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.text {
  &-message {
    padding: 8px 12px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    width: 80%;
  }
}

.trash {
  font-size: 18px;
  transition: 0.3s;
  cursor: pointer;
}
.trash:hover {
  opacity: 0.6;
}
</style>

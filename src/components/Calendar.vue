<template>
  <div class="calendar-wrapper example-modal-window">
    <table>
      <thead>
        <tr>
          <th id="prev" @click="prevPage">&laquo;</th>
          <th id="title" colspan="3">{{getTitleDate}}</th>
          <th id="next" @click="nextPage">&raquo;</th>
          <th v-if="user.uid" key="login" colspan="2">
            <div>
              ようこそ{{user.displayName}}様
              <button type="button" @click="doLogout">ログアウト</button>
            </div>
          </th>
          <th v-else key="logout" colspan="2">
            <div>
              <button type="button" @click="doLogin">ログイン</button>
            </div>
          </th>
        </tr>
        <tr>
          <th>Sun</th>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, index) in createCalendar" :key="index">
          <td
            v-for="day in week"
            :key="day.fullDate"
            :class="{disabled: day.isDisabled, today: day.isToday}"
            @click="openModal(day.fullDate)"
          >
            {{day.date}}
            <br />
            <div class="taskList">
              <template v-for="task in taskList">
                <span
                  v-if="task.date === day.fullDate && task.uid === user.uid"
                  :key="task.id"
                  @click.stop="openEditModal(task.id)"
                >{{task.name}}</span>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 新規追加用モーダル -->
    <my-modal @close="closeModal" v-if="modal">
      <p>タスクを入力してください</p>
      <div>
        <input type="text" v-model="message" />
      </div>
      <template slot="footer">
        <button @click="doSend">送信</button>
      </template>
    </my-modal>
    <!-- 編集用モーダル -->
    <my-modal @close="closeModal" v-if="editModal">
      <button @click="deleteTask()">削除</button>
      <p>タスクを入力してください</p>
      <div>
        <input type="text" v-model="editMessage" />
      </div>
      <template slot="footer">
        <button @click="doEdit()">送信</button>
      </template>
    </my-modal>
  </div>
</template>

<script>
import firebase from "firebase";
import "firebase/firestore";
import MyModal from "./MyModal.vue";

export default {
  components: {
    MyModal,
  },
  data() {
    return {
      month: "", // new Dateから作成した現在の月
      year: "", // new Dateから作成した現在の年
      today: "", // new Date用
      modal: false, // 新規追加用モーダル表示
      editModal: false, // 更新用モーダル表示
      message: "", // タスク内容をv-modelで一時的に保存
      editMessage: "", // 編集するタスク内容をv-modelで一時的に保存
      fullDate: "", // 年月日
      taskId: null, // タスクを特定するid
      db: null,
      user: {},
    };
  },
  created() {
    this.today = new Date();

    this.year = this.today.getFullYear();
    // 0 ~ 11
    this.month = this.today.getMonth();

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
        console.log(this.$store.state.tasks);
      });

    // ログイン、ログアウト時にも実行している
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user ? user : {};
    });
  },
  computed: {
    createCalendar() {
      const dates = [
        ...this.getCalendarHead,
        ...this.getCalendarBody,
        ...this.getCalendarTail,
      ];
      // 一週間ごとのオブジェクトが配列にまとめて入っている
      const weeks = [];
      const weeksCount = dates.length / 7;

      for (let i = 0; i < weeksCount; i++) {
        weeks.push(dates.splice(0, 7));
      }

      return weeks;
    },

    getTitleDate() {
      return `${this.year}/${String(this.month + 1).padStart(2, "0")}`;
    },

    getCalendarHead() {
      const dates = [];
      const d = new Date(this.year, this.month, 0).getDate();
      const n = new Date(this.year, this.month, 1).getDay();

      for (let i = 0; i < n; i++) {
        dates.unshift({
          date: d - i,
          isToday: false,
          isDisabled: true,
          fullDate: `${this.year}_${String(this.month).padStart(
            2,
            "0"
          )}_${String(d - i).padStart(2, "0")}`,
        });
      }

      return dates;
    },

    getCalendarBody() {
      const dates = []; // date: 日付, day: 曜日
      const lastDate = new Date(this.year, this.month + 1, 0).getDate();

      for (let i = 1; i <= lastDate; i++) {
        dates.push({
          date: i,
          isToday: false,
          isDisabled: false,
          fullDate: `${this.year}_${String(this.month + 1).padStart(
            2,
            "0"
          )}_${String(i).padStart(2, "0")}`,
        });
      }
      // 年月がthis.todayと一致するとき実行
      if (
        this.year === this.today.getFullYear() &&
        this.month === this.today.getMonth()
      ) {
        // dates配列は0から始まる
        dates[this.today.getDate() - 1].isToday = true;
      }

      return dates;
    },

    getCalendarTail() {
      const dates = [];
      const lastDay = new Date(this.year, this.month + 1, 0).getDay();

      for (let i = 1; i < 7 - lastDay; i++) {
        dates.push({
          date: i,
          isToday: false,
          isDisabled: true,
          fullDate: `${this.year}_${String(this.month + 2).padStart(
            2,
            "0"
          )}_${String(i).padStart(2, "0")}`,
        });
      }

      return dates;
    },

    taskList() {
      return this.$store.getters.taskList;
    },

    getTaskMessage() {
      const editTask = this.taskList.filter(
        (task) => task.id === this.taskId
      )[0];
      return editTask;
    },
  },
  methods: {
    prevPage() {
      this.month--;
      if (this.month < 0) {
        this.year--;
        this.month = 11;
      }
    },
    nextPage() {
      this.month++;
      if (this.month > 11) {
        this.year++;
        this.month = 0;
      }
    },
    openModal(value) {
      if (this.user.uid) {
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
      if (this.user.uid && this.message.length > 0) {
        const that = this;
        const doc = this.db.collection("tasks").doc();
        doc
          .set({
            message: that.message,
            date: that.fullDate,
            id: doc.id,
            uid: that.user.uid,
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
          uid: this.user.uid,
        });
        this.message = "";
        this.closeModal();
      } else {
        alert("タスクを入力してください");
      }
    },
    doEdit() {
      if (this.user.uid && this.message.length > 0) {
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
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    doLogout() {
      firebase.auth().signOut();
    },
  },
};
</script>

<style lang="scss" scoped>
.calendar-wrapper {
  height: 100vh;
}

table {
  border-collapse: collapse;
  border: 2px solid #eeeeee;
  width: 100%;
  height: 100%;
  table-layout: fixed;
}

thead {
  background: #eeeeee;
}

th,
td {
  padding: 8px;
  text-align: center;
  // height: 50px;
  border: 1px solid #eeeeee;
  user-select: none;
  -moz-user-select: none;
}

td {
  vertical-align: top;
  overflow-y: scroll;
  cursor: pointer;
}

.taskList {
  display: flex;
  flex-direction: column;
  span {
    background-color: rgb(199, 36, 58);
    color: white;
    padding: 5px;
    margin-bottom: 10px;
  }
  span.visible {
    display: none;
  }
}

tbody td:first-child {
  color: red;
}

tbody td:last-child {
  color: blue;
}

td.disabled {
  opacity: 0.3;
}

td.today {
  font-weight: bold;
}

#prev,
#next,
#today {
  cursor: pointer;
  user-select: none;
}
</style>
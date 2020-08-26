<template>
  <div class="calendar-wrapper example-modal-window">
    <table>
      <thead>
        <tr>
          <th id="prev" @click="prevPage">&laquo;</th>
          <th id="title" colspan="5">{{getTitleDate}}</th>
          <th id="next" @click="nextPage">&raquo;</th>
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
            <span
              v-for="task in taskList"
              :key="task.id"
              @click.stop="openEditModal(task.id)"
            >{{task.date == day.fullDate ? task.name : ''}}</span>
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
      <button @click="deleteTask(taskId)">削除</button>
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
import MyModal from "./MyModal.vue";

export default {
  components: {
    MyModal,
  },
  data() {
    return {
      month: "",
      year: "",
      today: "",
      modal: false,
      editModal: false,
      message: "",
      editMessage: "",
      fullDate: "",
      taskId: null
    };
  },
  created() {
    this.today = new Date();

    this.year = this.today.getFullYear();
    // 0 ~ 11
    this.month = this.today.getMonth();
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
      const editTask = this.taskList.filter(task => task.id === this.taskId)[0]
      return editTask
    }
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
      this.modal = true;
      // doSendでmutationに渡すのに使う
      this.fullDate = value;
    },
    openEditModal(taskId) {
      this.editModal = true;
      this.taskId = taskId;
      console.log(this.taskId)
      this.editMessage = this.getTaskMessage.name
    },
    closeModal() {
      this.modal = false;
      this.editModal = false;
    },
    doSend() {
      if (this.message.length > 0) {
        this.$store.commit("addTask", {
          message: this.message,
          date: this.fullDate,
        });
        this.message = "";
        this.closeModal();
      } else {
        alert("タスクを入力してください");
      }
    },
    doEdit() {
      if (this.editMessage.length > 0) {
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
    deleteTask(id) {
      if (!confirm('このタスクを削除しますか？')) {
        return
      }
      this.$store.commit('deleteTask', {id})
      this.editModal = false;
    }
  },
};
</script>

<style scoped>
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
  height: 50px;
  border: 1px solid #eeeeee;
}

td {
  vertical-align: top;
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
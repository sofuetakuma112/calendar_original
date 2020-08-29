<template>
  <div class="calendar-wrapper example-modal-window">
    <table>
      <thead>
        <tr>
          <th id="prev" @click="prevPage">
            <font-awesome-icon icon="angle-left" class="icon" />
          </th>
          <th id="title" colspan="3">{{getTitleDate}}</th>
          <th id="next" @click="nextPage">
            <font-awesome-icon icon="angle-right" class="icon" />
          </th>
          <th v-if="getUser.uid" key="login" colspan="2">
            <div>
              ようこそ{{getUser.displayName}}様
              <button
                type="button"
                @click="$emit('logout')"
                class="logout button"
              >ログアウト</button>
            </div>
          </th>
          <th v-else key="logout" colspan="2">
            <div>
              <button type="button" @click="$emit('login')" class="login button">ログイン</button>
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
            @click="$emit('open', day.fullDate)"
          >
            {{day.date}}
            <br />
            <div class="taskList">
              <template v-for="task in taskList">
                <span
                  v-if="task.date === day.fullDate && task.uid === getUser.uid"
                  :key="task.id"
                  @click.stop="$emit('edit', task.id)"
                >{{task.name}}</span>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import getMixin from '../mixins/get.js'
export default {
  mixins: [getMixin],
  data() {
    return {
      month: "", // new Dateから作成した現在の月
      year: "", // new Dateから作成した現在の年
      today: "", // new Date用
    };
  },
  created() {
    this.today = new Date();

    this.year = this.today.getFullYear();

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

.icon {
  font-size: 28px;
  transition: 0.3s;
}
.icon:hover {
  opacity: 0.6;
}

thead {
  background: #eeeeee;
}

.button {
  background-color: white;
  border: 1px solid #333333;
  border-radius: 5px;
  padding: 2.5px 5px;
  cursor: pointer;
  transition: 0.3s;
}
.button:hover {
  opacity: 0.6;
}

th,
td {
  padding: 8px 0;
  text-align: center;
  border: 1px solid #eeeeee;
  user-select: none;
  -moz-user-select: none;
}

td {
  vertical-align: top;
  overflow-y: hidden;
  cursor: pointer;
}

.taskList {
  display: flex;
  flex-direction: column;
  height: 90%;
  overflow-y: scroll;
  padding-bottom: 20px;
  span {
    font-size: 12.5px;
    background-color: rgb(199, 36, 58);
    color: white;
    padding: 2.5px;
    margin-bottom: 3px;
    border-radius: 5px;
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
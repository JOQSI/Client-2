Vue.component('task-card', {
    props: ['card'],
    template: `
    <div class="task-card">
      <h3>{{ card.title }}</h3>
      <ul>
        <li v-for="(task, index) in card.tasks" :key="index">
          <input type="checkbox" v-model="task.completed">
          {{ task.text }}
          <span v-if="task.completed" style="color: green;"> (ВЫПОЛНЕНО)</span>
        </li>
      </ul>
      <input 
        type="text" 
        v-model="newTask" 
        placeholder="Введите задачу" 
        @keyup.enter="addTask"
      />
      <button @click="addTask" :disabled="card.tasks.length >= 5 || !newTask.trim()">Добавить</button>
      <p v-if="card.tasks.length < 3" style="color: red;">Вам нужно добавить минимум 3 задачи!</p>
      <p v-if="card.tasks.length >= 5" style="color: red;">Вы можете добавить не более 5 задач!</p>
    </div>
  `,
    data() {
        return {
            newTask: ''
        };
    },
    methods: {
        addTask() {
            if (this.newTask.trim() && this.card.tasks.length < 5) {
                this.card.tasks.push({ text: this.newTask, completed: false });
                this.newTask = '';
                this.saveTasks();
            }
        },
        saveTasks() {
            const cards = JSON.parse(localStorage.getItem('cards')) || [];
            const cardIndex = this.$parent.cards.findIndex(c => c === this.card);
            if (cardIndex !== -1) {
                cards[cardIndex] = this.card;
                localStorage.setItem('cards', JSON.stringify(cards));
            }
        }
    },
    mounted() {
        const savedCards = JSON.parse(localStorage.getItem('cards')) || [];
        const cardIndex = this.$parent.cards.findIndex(c => c === this.card);
        if (savedCards[cardIndex] && savedCards[cardIndex].tasks) {
            this.card.tasks = savedCards[cardIndex].tasks;
        }
    }
});

new Vue({
    el: '#app',
    data() {
        return {
            cards: [],
            newCardTitle: ''
        };
    },
    methods: {
        addCard() {
            if (this.newCardTitle) {
                this.cards.push({ title: this.newCardTitle.trim(), tasks: [] });
                this.newCardTitle = '';
                this.saveCards();
            }
        },
        saveCards() {
            localStorage.setItem('cards', JSON.stringify(this.cards));
        },
        deleteAllCards() {
            this.cards = [];
            localStorage.removeItem('cards');
        }
    },
    mounted() {
        // Загружаем карточки при монтировании
        const savedCards = JSON.parse(localStorage.getItem('cards'));
        if (savedCards) {
            this.cards = savedCards;
        }
    },
    template: `
    <div class="app">
      <h2>Менеджер задач</h2>
      <div>
        <input 
          type="text" 
          v-model="newCardTitle" 
          placeholder="Введите название карточки"/>
        <button @click="addCard">Добавить карточку</button>
        <button @click="deleteAllCards">Удалить всё</button>
      </div>
      
      <div v-for="(card, index) in cards" :key="index"">
        <task-card :card="card"></task-card>
      </div>
    </div>
  `
});

Vue.component('task-card', {
    props: ['card','currentColumnIndex'],
    template: `
    <div class="task-card">
      <h3>{{ card.title }}</h3>
      <ul v-if="card.tasks && card.tasks.length > 0">
        <li v-for="(task, index) in card.tasks" :key="index">
          <input type="checkbox" v-model="task.completed"@change="checkCompletion">
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
      <p v-if="card.lastUpdated">Последнее обновление: {{ card.lastUpdated }}</p>
    </div>
  `,
    data() {
        return {
            newTask: ''
        };
    },
    methods: {
        addTask() {
            if (!this.card.tasks) {
                this.card.tasks = []; // Инициализация tasks, если он undefined
            }
            if (this.card.tasks.length < 5 && this.newTask) {
                this.card.tasks.push({ text: this.newTask, completed: false });
                this.newTask = '';
                this.saveTasks();
            }
        },
        saveTasks() {
            const cards = JSON.parse(localStorage.getItem('cards')) || [];
            const cardIndex = this.$parent.cards.findIndex(c => c === this.card);
            if (cardIndex !== -1) {
                const cardIndex = cards.findIndex(c => c.id === this.card.id); // Ищем карточку по id

                if (cardIndex !== -1) {
                    cards[cardIndex] = {
                        ...this.card,
                        tasks: this.card.tasks.map(task => ({ ...task })) // Глубокая копия задач
                    };
                } else {
                    cards.push({
                        ...this.card,
                        tasks: this.card.tasks.map(task => ({ ...task }))
                    });
                }

                localStorage.setItem('cards', JSON.stringify(cards));
            }

        },
        checkCompletion() {
            if (this.card.tasks) {
                const totalTasks = this.card.tasks.length;
                const completedTasks = this.card.tasks.filter(task => task.completed).length;

                if (totalTasks > 0) {
                    const completionRate = (completedTasks / totalTasks) * 100;

                    // Перемещение карточки между столбцами
                    if (completionRate > 50 && completionRate <= 100) {
                        this.$emit('move-to-next', this.card, this.currentColumnIndex); // Перемещение во второй столбец
                    } else if (completionRate === 100) {
                        this.card.lastUpdated = new Date().toLocaleString(); // Установка времени последнего обновления
                        this.$emit('move-to-next', this.card, this.currentColumnIndex); // Перемещение в третий столбец
                    }

                    this.saveTasks();
                }
            }
        }
    },
    mounted() {
        const savedCards = JSON.parse(localStorage.getItem('cards')) || [];
        const savedCard = cards.find(c => c.id === this.card.id); // Ищем сохранённую карточку по id
        if (savedCard && savedCard.tasks) {
            this.card.tasks = savedCard.tasks.map(task => ({ ...task })); // Глубокая копия задач
        } else {
        this.card.tasks = []; // Инициализация пустого масива задач
        }
    }

});

Vue.component('column1', {
    props: ['cards'],
    template: `
    <div class="column">
        <h2>Столбец 1</h2>
        <task-card 
            v-for="(card, index) in cards" 
            :key="index" 
            :card="card"
            :currentColumnIndex="0" 
            @move-to-next="moveToNext"
        ></task-card>
    </div>
    `,
    methods: {
        moveToNext(card,currentColumnIndex) {
            this.$emit('move-to-next', card,currentColumnIndex);
        }
    }
});
Vue.component('column1', {
    props: ['cards'],
    template: `
    <div class="column">
      <h2>Столбец 1</h2>
      <task-card 
        v-for="(card, index) in cards" 
        :key="index" 
        :card="card"
        :currentColumnIndex="0" 
        @move-to-next="moveToNext"
      ></task-card>
    </div>
  `,
    methods: {
        moveToNext(card, currentColumnIndex) {
            this.$emit('move-to-next', card, currentColumnIndex);
        }
    }
});

Vue.component('column2', {
    props: ['cards'],
    template: `
    <div class="column">
      <h2>Столбец 2</h2>
      <task-card 
        v-for="(card, index) in cards" 
        :key="index" 
        :card="card"
        :currentColumnIndex="1"   <!-- ДОБАВЛЕНО -->
        @move-to-next="moveToNext"
      ></task-card>
    </div>
  `,
    methods: {
        moveToNext(card, currentColumnIndex) {  // Теперь принимает 2 аргумента
            this.$emit('move-to-next', card, currentColumnIndex);
        }
    }
});

Vue.component('column3', {
    props: ['cards'],
    template: `
    <div class="column">
      <h2>Столбец 3</h2>
      <task-card 
        v-for="(card, index) in cards" 
        :key="index" 
        :card="card"
        :currentColumnIndex="2"
      ></task-card>
    </div>
  `

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
                this.cards.push({
                    title: this.newCardTitle,
                    id: Date.now(),
                    tasks: [],
                    moved:false,
                    finalMoved:false,
                    lastUpdated: null });
            }
        },
        saveCards() {
            localStorage.setItem('cards', JSON.stringify(this.cards));
        },
        deleteAllCards() {
            this.cards = [];
            localStorage.removeItem('cards');
        },
        moveCardToNext(card,currentColumnIndex) {
            const cardIndex = this.cards.indexOf(card);

            if (cardIndex !== -1 && card.tasks) {
                const completedTasks = card.tasks.filter(task => task.completed).length;
              const totalTasks =card.tasks.length;
              if (completedTasks > totalTasks /2 && currentColumnIndex < 2) {
                  card.moved = true;
                  if (completedTasks === totalTasks) {
                      card.finalMoved = true;
                  }
                  this.saveCards();
              }
            }
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
      
       <div class="tables">
            <column1 :cards="cards.filter(card => !card.moved)" @move-to-next="moveCardToNext"></column1>
            <column2 :cards="cards.filter(card => card.moved && !card.finalMoved)" @move-to-next="moveCardToNext"></column2>
            <column3 :cards="cards.filter(card => card.finalMoved)"></column3>
        </div>
      </div>
    </div>
  `
});

import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import "bootstrap/dist/css/bootstrap.css";

// Импортируйте ваши компоненты страниц
import HomePage from './components/HomePage.vue'; // Пример
import FriendDetails from './components/FriendDetails.vue'; // Пример

// Определите маршруты
const routes = [
    { path: '/VueVKEchartExample.github.io/', component: HomePage , name:"HomePage"}, // Пример главной страницы
    { path: '/VueVKEchartExample.github.io/friend/:friend', component: FriendDetails, name: "FriendDetails" } // Пример маршрута с деталями друга
];

// Создайте роутер
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Создайте и подключите Vue приложение с роутером
createApp(App).use(router).mount('#app');
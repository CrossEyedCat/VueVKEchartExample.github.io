<script setup>
import {computed, onBeforeMount, onMounted, ref, watch} from 'vue';
import _ from 'lodash';

const APP_ID = 51824315;
const VERSION = "5.199";
const loading = ref(false);
const searchQuery = ref(localStorage.getItem('searchQuery') || '');
const users = ref(JSON.parse(localStorage.getItem('users'))||[]);
const original = ref(JSON.parse(localStorage.getItem('original')) || []);
const friends = ref(JSON.parse(localStorage.getItem('friends'))||[]);
const wallPosts = ref([]);
const authState = ref({
  isLogged: false,
  user: null
});
const userIsInOriginal = computed(() => {
  return user => original.value.some(u => u.id === user.id);
});
onMounted(() => {
  VK.Auth.getLoginStatus(response => {
    if (response.status === "connected") {
      authState.value.isLogged = true;
      authState.value.user = response.session.user;
    }
  });
});
const addToOriginal = (user) => {
  const index = original.value.findIndex(u => u.id === user.id);
  if (index !== -1) {
    original.value.splice(index, 1);
  } else {
    original.value.push(user);
  }
};
const getBackgroundColor = (friendCount) => {
  // Определяем цвет фона на основе friendCount
  const blueShade =255 - Math.min((friendCount-1)*10, 255);
  return `rgb(${blueShade}, ${blueShade}, ${blueShade})`;
};
const getTextColor = (friendCount) =>{
  const blueShade =Math.min((friendCount-1)*10, 255);
  return `rgb(${blueShade}, ${blueShade}, ${blueShade})`;
}
const buildFriendsList = async () => {
  friends.value = [];
  if(!original.value.length){
    friends.value = [];
    return
  }
  for (let user of original.value) {
    const userFriends = await getUserFriends(user.id) || [];
    for (let i = 0; i < userFriends.length; i++){
      userFriends[i].counters = await getUserCounts(userFriends[i])
    }
    friends.value = mergeFriendsLists(friends.value, userFriends, user);
  }
  friends.value.sort((a, b) => {
    const lastNameComparison = a.last_name.localeCompare(b.last_name);
    if (lastNameComparison !== 0) {
      return lastNameComparison;
    }
    return a.first_name.localeCompare(b.first_name);
  });

};
const getUserCounts = async (user) => {
  return new Promise((resolve) => {
    VK.Api.call("users.get", {
      user_ids: user.id,
      v: VERSION,
      fields: ['counters'],
    }, r => {
      if(r.response){
        resolve(r.response[0].counters);
      }
      resolve();
    })
  });
};

const getUserFriends = async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return new Promise((resolve) => {
    VK.Api.call("friends.get", {
      user_id: userId,
      v: VERSION,
      fields: ['photo_200',' sex', 'bdate', 'counters'],
    }, r => {
      if(r.response && r.response.items){
        resolve(r.response.items);
      }
      else{
        resolve();
      }
    })
  });
};

const mergeFriendsLists = (currentList, newUserFriends, user) => {
  const updatedList = [...currentList];
  for (let newUser of newUserFriends) {
    const existingUser = updatedList.find(user => user.id === newUser.id);
    if (existingUser) {
      existingUser.friend_count++;
      existingUser.friend.push(user)
    } else {
      newUser.friend_count = 1;
      newUser.friend = [];
      newUser.friend.push(user)
      updatedList.push(newUser);
    }
  }

  return updatedList;
};
const handleSearch = _.debounce(() => {
  loading.value = true;
  users.value = [];

  VK.Api.call("users.search", {
    q: searchQuery.value,
    v: VERSION,
    fields: 'photo_200'
  }, r => {
    users.value = r.response.items;
    loading.value = false;
  })
}, 300);

onBeforeMount(async () => {
  await VK.init({
    apiId: APP_ID
  });
});
const calculateAge = (birthdate) => {
  if (birthdate) {
    const birthdateParts = birthdate.split('.');
    if (birthdateParts.length === 3) {
      const birthYear = parseInt(birthdateParts[2], 10);
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    }
  }
  return '?';
};
// Function to save searchQuery to local storage
const saveSearchQueryToLocalStorage = () => {
  localStorage.setItem('searchQuery', searchQuery.value);
};

// Function to save original data to local storage
const saveOriginalToLocalStorage = () => {
  localStorage.setItem('original', JSON.stringify(original.value));
};
const saveUsersToLocalStorage = () => {
  localStorage.setItem('users', JSON.stringify(users.value));
};
const saveFriendsToLocalStorage = () => {
  localStorage.setItem('friends', JSON.stringify(friends.value));
};
watch(users, saveUsersToLocalStorage)
watch(searchQuery, saveSearchQueryToLocalStorage);
watch(original.value, saveOriginalToLocalStorage);
watch(friends, saveFriendsToLocalStorage)

// Function to handle click on friend-item
</script>

<template>
  <div v-if="authState.isLogged">
    <div>
      <h1 class="header">Найти людей</h1>
      <div class="search-container">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск..."
            @input="handleSearch"
            class="search-input"
        >
      </div>
      <div v-if="users" class="users-window">
        <div class="users-list">
          <div
              v-for="user in users"
              :key="user.id"
              :class="['user-item', { 'is-original': userIsInOriginal(user) }]"
              @click="addToOriginal(user)"
          >
            <img :src="user.photo_200" alt="" class="user-avatar">
            <span class="user-name">{{ user.last_name }} {{ user.first_name }}</span>
          </div>
        </div>
      </div>
      <div class="main-container">
        <!-- Левая панель -->
        <div class="left-panel">
          <div class="original-window">
            <h2 class="header">Исходный</h2>
            <div>
              <!-- Отображаем список друзей из переменной "friends" -->
              <div v-for="user in original" :key="user.id">
                <img :src="user.photo_200" alt="" class="user-avatar">
                <span class="user-name">{{ user.last_name }} {{ user.first_name }}</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="buildFriendsList" class="build-button">Построить</button>
        <div class="right-panel">
          <!-- Правая панель -->
          <div class="friends-window">
            <h2 class="header">Друзья</h2>
            <div class="friends-list">
              <div v-for="friend in friends" :key="friend.id" class="friend-item" :style="{ backgroundColor: getBackgroundColor(friend.friend_count), color:getTextColor(friend.friend_count) }">
                <router-link :to="{ name: 'FriendDetails', params: { friend: JSON.stringify(friend) } }">
                  <img :src="friend.photo_200" alt="" class="user-avatar">
                  <div class="friend-info">
                    <span class="friend-name">{{ friend.last_name }} {{ friend.first_name }}</span><br/>
                    <span class="friend-age">{{ calculateAge(friend.bdate) }} лет</span><br/>
                    <span class="friend-gender">Пол: {{ friend.sex === 1 ? 'Ж' : 'М' }}</span><br/>
                    <span class="friends-count">Друзей:{{friend.counters ? friend.counters.friends: "?"}}</span><br/>
                    <span class="friends-count">Общих друзей:{{friend.friend_count}}</span><br/>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
<!--    <div class="friend-details-container" v-if="selectedFriend">
      <FriendDetails :friend="selectedFriend" :wallPosts="wallPosts" @reset-friend="resetSelectedFriend"/>

    </div>-->
  </div>
</template>

<style scoped>
.login-button {
  float: right; /* Размещение справа на панели навигации */
  margin-right: 20px; /* Отступ справа для разделения кнопок */
}

.logout-button {
  float: right; /* Размещение справа на панели навигации */
  margin-right: 20px; /* Отступ справа для разделения кнопок */
}

/* Стили для ссылок в кнопках */
.login-link,
.logout-link {
  text-decoration: none; /* Убрать подчеркивание в ссылках */
  color: black; /* Цвет текста */
  font-weight: bold; /* Жирный шрифт */
  transition: color 0.2s; /* Плавный переход цвета текста */
}

.login-link:hover,
.logout-link:hover {
  color: #007BFF; /* Изменить цвет текста при наведении */
}
.header{
  text-align: center;
}
.search-input {
  width: 50%;
  justify-self: center;
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 20px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #007BFF;
}

.users-window {
  width: 50%;
  height: 300px;
  overflow-y: auto;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.user-item:hover {
  background-color: #007BFF;
  color: white;
}

.user-item:active {
  background-color: #B3D4FF;
}

.user-item.is-original {
  background-color: #B3D4FF;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  font-weight: bold;
}

.user-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
}
.main-container {
  display: flex;
  justify-content: space-between;
}
.left-panel {
  width: 45%;
}
.right-panel {
  width: 45%;
}

.build-button{
  width:100px;
  height:50px;
  background-color: white;
  border-radius: 10px;
}
.friend-item{
  border-radius: 25px;
}
.friends-list {
  display: grid;
  grid-template-columns: auto auto auto auto;
  gap: 10px;
}

.friend-item {
  width: 250px;
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.friend-item:hover {
  background-color: #007BFF !important;
  color: white;
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-weight: bold;
}
.search-container{
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
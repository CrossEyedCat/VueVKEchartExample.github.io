<script setup>
import {computed, onBeforeMount, onMounted, ref, watch} from 'vue';
import _ from 'lodash';
import FriendDetails from "@/components/friendDetails.vue";

const APP_ID = 51824315;
const VERSION = "5.199";
const loading = ref(false);
const searchQuery = ref(localStorage.getItem('searchQuery') || '');
const users = ref(JSON.parse(localStorage.getItem('users'))||[]);
const original = ref(JSON.parse(localStorage.getItem('original')) || []);
const friends = ref([]);
const wallPosts = ref([]);
const authState = ref({
  isLogged: false,
  user: null
});
const login = () => {
  VK.Auth.login(response => {
    console.log(response)
    if (response.session) {
      authState.value.isLogged = true;
      authState.value.user = response.session.user;
    }
  }, VK.access.FRIENDS);
};

const logout = () => {
  VK.Auth.logout(() => {
    authState.value.isLogged = false;
    authState.value.user = null;
  });
};
/*const userIsInOriginal = computed(() => {
  return user => original.value.some(u => u.id === user.id);
});
const getWallOfUser = async (userId) => {
  console.log(userId)
  try {
    VK.Api.call("wall.get", {
      owner_id: userId,
      v: VERSION,
      extended: 1,
    }, r => {
      if(r.response) {
        wallPosts.value = r.response.items;
      }
      else{
        wallPosts.value=[];
      }
    })
  } catch (error) {
    console.error("Error fetching wall data:", error);
  }
};*/
onMounted(() => {
  VK.Auth.getLoginStatus(response => {
    console.log(response)
    if (response.status === "connected") {
      authState.value.isLogged = true;
      authState.value.user = response.session.user;
    }
  });
});
/*const addToOriginal = (user) => {
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
    console.log(userFriends)
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

};*/
/*const getUserCounts = async (user) => {
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
}, 300);*/

onBeforeMount(async () => {
  await VK.init({
    apiId: APP_ID
  });
});
/*const calculateAge = (birthdate) => {
  if (birthdate) {
    const birthdateParts = birthdate.split('.');
    if (birthdateParts.length === 3) {
      const birthYear = parseInt(birthdateParts[2], 10);
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    }
  }
  return '?';
};*/
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
watch(users, saveUsersToLocalStorage)
watch(searchQuery, saveSearchQueryToLocalStorage);
watch(original.value, saveOriginalToLocalStorage);

const selectedFriend = ref(null);

// Function to handle click on friend-item
/*const handleFriendItemClick = async (friend) => {
  console.log(friend)
  await getWallOfUser(friend.id);
  selectedFriend.value = friend;
};
const resetSelectedFriend = () => {
  selectedFriend.value = null;
};*/
</script>

<template>
  <div id="app">
  <div class="login-button">
    <a class="login-link" v-if="!authState.isLogged" @click="login">
      Авторизоваться
    </a>
  </div>
  <div class="logout-button">
    <a class="logout-link" v-if="authState.isLogged" @click="logout">
      Выход
    </a>
  </div>
    <router-view>
    </router-view>
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

<template>
  <div class="friend-details">
    <h2>{{ friend.first_name }} {{ friend.last_name }}</h2>
    <img :src="friend.photo_200" alt="">
  </div>
  <div class="original-window">
    <h2 class="header">В друзьях:</h2>
    <div>
      <div v-for="user in friend.friend" :key="user.id">
        <img :src="user.photo_200" alt="" class="user-avatar">
        <span class="user-name">{{ user.last_name }} {{ user.first_name }}</span>
      </div>
    </div>
  </div>
  <div>
    <h2 class="header" v-if="wallPosts">Записи:</h2>
    <div v-for="post in wallPosts" :key="post.id" class="post-card">
      <div class="card-content">
        <img :src="post.attachments[0]&& post.attachments[0].photo && post.attachments[0].photo.sizes?post.attachments[0].photo.sizes[2].url:''">
        <p v-if="post.text">Написал: {{ post.text ? post.text : '' }}</p>
        <p>Дата публикации: {{ new Date(post.date * 1000).toLocaleString() }}</p>
        <p>Количество лайков: {{ post.likes.count }}</p>
        <p>Количество комментариев: {{ post.comments.count }}</p>
      </div>
    </div>
  </div>
  <button @click="resetSelectedFriend" class="reset-button">
    <span>&larr;</span> Вернуться
  </button>
</template>

<script>
import {onBeforeMount, onMounted, ref} from "vue";

export default {
  props: {
    friend: Object,
    wallPosts: null,
  },
  emits: ['reset-friend'],

  setup(props, { emit }) {
    const resetSelectedFriend = () => {
      emit('reset-friend');
    };

    return {
      resetSelectedFriend,
    };
  },
};
</script>

<style scoped>
.reset-button {
  margin-top: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px 10px 10px;
  cursor: pointer;
}
.post-card {
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px;
}
.reset-button span {
  font-size: 20px;
  margin-right: 5px;
}
.user-avatar{
  width: 50px;
  height: 50px;
  border-radius: 25px;
}
</style>
<template>
  <div id="app">
    <div id="top"><div id="header"><h3>Arron Norwell - Posts</h3></div></div>
    <div class="posts">
      <Post
        v-for="post in posts"
        v-bind:key="post.title"
        v-bind:title="post.title"
        v-bind:content="post.content"
      ></Post>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Post from "./components/Post.vue";
import store from "./store";

document.title="Arron Norwell"

export default Vue.extend({
  name: "app",
  components: {
    Post
  },
  data: () => store.data,
  created: () => store.fetchPosts()
});
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0 !important;
}

#top {
  background-color: #00042b;
  height: 2em;
  top: 50%;  
  vertical-align: middle;
  padding-left: 1em;
  display: flex;
  align-items: center;
}

#header {
  margin-top: 0 !important;
  padding-top: 0 !important;
  color: aliceblue;
}
</style>

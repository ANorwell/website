<template>
    <div class="posts">
      <Post
        v-for="post in posts"
        v-bind:key="post.summary.title"
        v-bind:summary="post.summary"
        v-bind:content="post.content"
      ></Post>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Post from './components/Post.vue';
import Store from './store';

document.title = 'Arron Norwell';

const store = new Store();

export default Vue.component('app', {
  components: {
    Post,
  },
  data: () => store.data,
  created(): void { store.fetchPosts(this.$route.params.tag);  },
  computed: {
    tag(): string {
      return this.$route.params.tag;
    }
  },
  watch: {
    $route(to, from): void {
      store.fetchPosts(this.$route.params.tag);

    }
  }
});
</script>

<style>
.posts {
  font-family: Verdana, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

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

function fetchPosts(params: any) {
  if (params.title) {
    store.fetchPostsByTitle(params.title);
  } else {
    store.fetchPostsByTag(params.tag);
  }
}

export default Vue.component('app', {
  components: {
    Post,
  },
  data: () => store.data,
  created(): void { fetchPosts(this.$route.params);  },
  computed: {
    tag(): string {
      return this.$route.params.tag;
    }
  },
  watch: {
    $route(to, from): void {
      fetchPosts(this.$route.params);

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

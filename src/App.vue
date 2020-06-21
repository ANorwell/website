<template>
  <div>
    <div class="posts">
      <Post
        v-for="post in loadedPosts"
        v-bind:key="post.summary.title"
        v-bind:summary="post.summary"
        v-bind:content="post.content"
      ></Post>
    </div>
    <div class="load-more" v-if="loadedPosts.length < postSummaries.length">
      <button class="load-more-button" v-on:click="fetchMore()">Load Older Posts</button>
    </div>
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
  },
  methods: {
    fetchMore(): void {
      store.fetchMore()
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

.load-more {
  margin: 2em;
}

.load-more-button {
  display: inline-block;
  font-family: Verdana, Arial, sans-serif;
  padding: 0.5rem 1rem;
  border: 0px;
  background: rgb(65,78,100);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer
}

</style>

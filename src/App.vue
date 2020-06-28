<template>
  <div>
    <div id="header">
      <div id="top">
        <div id="header-title">
          <h2><a href="/#/">{{ title }}</a></h2>
        </div>
      </div>
    </div>    
    <div class="posts">
      <Post
        v-for="post in loadedPosts"
        v-bind:key="post.summary.title"
        v-bind:summary="post.summary"
        v-bind:content="post.content"
      ></Post>
    </div>
    <div class="load-more" v-if="(loadedPosts.length > 0) && (loadedPosts.length < postSummaries.length)">
      <button class="load-more-button" v-on:click="fetchMore()">Load Older Posts</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Post from './components/Post.vue';
import Store from './store';
import config from './config';

document.title = config.title;

const store = new Store(config.postsPath, config.postsPerPage);

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
    },
    title(): string {
      return config.title;
    }
  },
  watch: {
    $route(to, from): void {
      fetchPosts(this.$route.params);

    }
  },
  methods: {
    fetchMore(): void {
      store.fetchMore();
    }
  }
});
</script>

<style src="./stylesheets/posts.css"></style>

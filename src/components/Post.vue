<template>
  <div class="post">
    <h1 class="post-title">
      <router-link :to="'/posts/' + summary.title">
        {{ summary.title }}
      </router-link>
    </h1>
    <div class="post-info"> {{ formattedDate }} - 
      <li class="tag-link" v-for="tag in tags" :key="tag">
        <router-link :to="'/tags/' + tag">
          {{tag}}
        </router-link>
      </li>
    </div>
    <div class="content" v-html="content"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Moment } from 'moment';

export default Vue.component('Post', {
  props: {
    summary: Object,
    content: String,
  },
  computed: {
    formattedDate(): string {
      return this.summary.date.format('MMM DD, YYYY');
    },
    tags(): string[] {
      return this.summary.tags;
    }
  },
});
</script>

<!-- This is for the post itself -->
<style>
.content a, .content a:visited {
  color: rgb(75, 75, 75) !important;
}

.content p {
  color: rgb(75, 75, 75) !important;
}

.content pre, .content code {
  font-family: "Lucida Console", Monaco, monospace !important;
  margin: 0em !important;
  padding-left: 0.25em !important;
  padding-right: 0.25em !important;
  background-color: rgb(75, 75, 75) !important;
  color: rgb(212, 209, 209) !important;
}

.content pre {
  padding: 0.5em !important; 
}

</style>

<!-- Because this is scoped, it doesn't apply to the v-html post itself -->
<style scoped src="../stylesheets/post.css"></style>

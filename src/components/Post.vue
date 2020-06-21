<template>
  <div class="post">
    <h1>{{ summary.title }}</h1>
    <div class="postinfo"> {{ formattedDate}} - 
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
<style scoped>
.postinfo {
  font-size: 14px;
  font-family: Verdana, Arial, sans-serif;
  color:rgba(0, 0, 0, 0.55);
}

h1 {
  margin: 0;
}

.tag-link {
  display: inline-block;
  margin: 2px;
}

.tag-link a, .tag-link a:link {
  color:rgba(0, 0, 0, 0.55);
}

.content {
  margin: 1em;
}

.post {
  border: 1px solid rgb(175, 175, 175);
  box-shadow:Z 5px #dddddd;
  box-shadow: 2px 2px 2px 1px rgba(197, 197, 199, 1);
  margin: 2em;
  padding: 1em;
}


</style>

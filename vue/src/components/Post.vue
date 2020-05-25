<template>
  <div class="post">
    <h1>{{ summary.title }}</h1>
    <h4>{{ formattedDate }}</h4>
    <div class="content" v-html="content"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Moment } from 'moment';

export default Vue.extend({
  name: 'Post',
  props: {
    summary: Object,
    content: String,
  },
  computed: {
    formattedDate(): string {
      return this.summary.date.format("MMM DD, YYYY");
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

h1 {
  margin: 0;
}

.content {
  margin: 1em;
}

.post {
  border: 1px solid #b1b1b1;
  background-color: #f6f6f6;
  box-shadow:Z 5px #dddddd;
  -webkit-box-shadow: 6px 6px 23px 1px rgba(197, 197, 199, 1);
  -moz-box-shadow: 6px 6px 23px 1px rgba(197, 197, 199, 1);
  box-shadow: 6px 6px 23px 1px rgba(197, 197, 199, 1);
  margin: 2em;
  padding: 1em;
}
</style>

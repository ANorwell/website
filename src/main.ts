import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';

Vue.config.productionTip = false;

const router = new VueRouter({
  routes: [
    { path: '/', component: App },
    { path: '/tags/:tag', component: App },
    { path: '/posts/:title', component: App }
  ]
});

Vue.use(VueRouter);

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');

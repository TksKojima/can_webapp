import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ToggleButton from 'vue-js-toggle-button'
//import vuetify from './plugins/vuetify'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')



Vue.config.productionTip = false;

Vue.use(ToggleButton)
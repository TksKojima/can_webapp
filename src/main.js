import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'


Vue.config.productionTip = false



// 1. グローバル変数を定義する
let GlobalData = new Vue({
  data: {
    $url: "no_url", // グローバル変数
    $esp32ip: "no_ip", // グローバル変数
  }
});

// 2. mixin でグローバル変数をラッピングする
Vue.mixin({
  methods: {
    // 2-1. 各コンポーネント内の<script>タグ内でグローバル変数を参照するための関数
    $_getGlobalUrl(){
      return GlobalData.$data.$url
    },
    $_setGlobalUrl(newUrl){
      GlobalData.$data.$url = newUrl;
    },
    $_getGlobalEsp32ip(){
      return GlobalData.$data.$esp32ip
    },    
    $_setGlobalEsp32ip(newIp){
      GlobalData.$data.$esp32ip = newIp;
    }  
  },
  computed: {
    // 2-2. 各コンポーネント内の<template>タグ内でグローバル変数を参照するための処置
    $url: {
      get: function () { return GlobalData.$data.$url },
      set: function (newUrl) { GlobalData.$data.$url = newUrl; }
    },
    $esp32ip: {
      get: function () { return GlobalData.$data.$esp32ip },
      set: function (newIp) { GlobalData.$data.$esp32ip = newIp; }
    }    
  }
})

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')

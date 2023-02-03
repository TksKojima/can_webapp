import Vue from 'vue'
import VueRouter from 'vue-router'
import CanRecv from '../views/CanRecv.vue'
import Tabs from '../views/RouteTabs.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Tabs
  },
  {
    path: '/canrx',
    component: CanRecv
  },
  {
    path: '/tab',
    component: Tabs,

  },

  {
    path: '/cantab',
    component: Tabs,
  }


]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

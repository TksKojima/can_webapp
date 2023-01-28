import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/CanRecv.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'can_recv',
    component: HomeView
  },
  {
    path: '/can_tx',
    name: 'can_recv2',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

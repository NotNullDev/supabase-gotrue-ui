import { createRouter, createWebHistory } from 'vue-router'
import UsersView from '../views/UserView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'users',
      component: UsersView
    },
    {
      path: '/sessions',
      name: 'sessions',
      component: () => import('../views/SessionsView.vue')
    },
    {
      path: '/users/:id',
      beforeEnter: () => {},
      component: () => import('../views/UserDetailsView.vue')
    }
  ]
})

export default router

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
      path: '/users/:id',
      beforeEnter: () => {},
      component: () => import('../views/UserDetailsView.vue')
    },
    {
      path: '/audit-log',
      name: 'audit-log',
      beforeEnter: () => {},
      component: () => import('../views/AuditLogView.vue')
    }
  ]
})

export default router

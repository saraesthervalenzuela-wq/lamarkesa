import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/catalog'
    },
    {
      path: '/catalog',
      name: 'Catalog',
      component: () => import('../views/CatalogView.vue')
    },
    {
      path: '/edit',
      name: 'Edit',
      component: () => import('../views/EditView.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/AdminView.vue')
    }
  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/catalog',
      name: 'Catalog',
      component: () => import('../views/CatalogView.vue'),
      meta: { public: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiredRole: 'admin' }
    },
    {
      path: '/devs',
      name: 'Devs',
      component: () => import('../views/DevsView.vue'),
      meta: { requiresAuth: true, requiredRole: 'devs' }
    }
  ]
})

// Navigation guard para proteger rutas con validación de roles
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.meta.requiredRole
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    // Redirigir al login si no está autenticado
    next('/')
    return
  }

  // Si la ruta requiere un rol específico, validar
  if (requiredRole && isAuthenticated) {
    const userRole = localStorage.getItem('userRole')

    // Si no hay rol en localStorage o no coincide, redirigir
    if (!userRole || userRole !== requiredRole) {
      // Redirigir según el rol que tenga
      if (userRole === 'devs') {
        next('/devs')
      } else if (userRole === 'admin') {
        next('/admin')
      } else {
        next('/catalog')
      }
      return
    }
  }

  next()
})

export default router

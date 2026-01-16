import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'

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
      component: () => import('../views/CatalogView.vue'),
      meta: { requiresAuth: false, roles: [] }
    },
    {
      path: '/edit',
      name: 'Edit',
      component: () => import('../views/EditView.vue'),
      meta: { requiresAuth: true, roles: ['editor', 'admin'] }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false, roles: [] }
    },
    {
      path: '/unauthorized',
      name: 'Unauthorized',
      component: () => import('../views/UnauthorizedView.vue')
    }
  ]
})

// Lista de emails autorizados
const ADMIN_EMAILS = [
  'devs@markesa.com',
]

const EDITOR_EMAILS = [
  'admin@markesa.com',
]

const getUserRole = (email) => {
  if (!email) return null
  if (ADMIN_EMAILS.includes(email)) return 'admin'
  if (EDITOR_EMAILS.includes(email)) return 'editor'
  return null
}

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.roles || []
  const currentUser = auth.currentUser

  // Si la ruta no requiere auth, permitir acceso
  if (!requiresAuth) {
    next()
    return
  }

  // Si requiere auth pero no hay usuario logueado
  if (!currentUser) {
    next('/login')
    return
  }

  // Verificar el rol del usuario
  const userRole = getUserRole(currentUser.email)

  // Si no tiene rol asignado o su rol no está en los permitidos
  if (!userRole || !allowedRoles.includes(userRole)) {
    next('/unauthorized')
    return
  }

  next()
})

export default router

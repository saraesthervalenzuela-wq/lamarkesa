<script setup>
import { useAuth } from './composables/useAuth'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import UserAuth from './components/UserAuth.vue'

const { user, loading } = useAuth()
const router = useRouter()
const route = useRoute()

// Rutas que no deben mostrar el navbar
const hideNavbar = computed(() => {
  return route.path === '/' || route.path === '/devs'
})

const goToAdmin = () => {
  router.push('/admin')
}

const goToCatalog = () => {
  router.push('/catalog')
}

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div id="app">
    <!-- Navigation Bar (oculto en login y devs) -->
    <nav v-if="!hideNavbar" class="navbar">
      <div class="nav-content">
        <div class="nav-links">
          <button
            @click="goToHome"
            :class="{ active: route.path === '/' }"
            class="nav-btn"
          >
            Inicio
          </button>
          <button
            @click="goToCatalog"
            :class="{ active: route.path === '/catalog' }"
            class="nav-btn"
          >
            Catálogo
          </button>
          <button
            v-if="user"
            @click="goToAdmin"
            :class="{ active: route.path === '/admin' }"
            class="nav-btn"
          >
            Admin
          </button>
        </div>

        <!-- User Auth Component -->
        <div class="nav-auth">
          <UserAuth />
        </div>
      </div>
    </nav>

    <!-- Router View -->
    <router-view v-if="!loading" />

    <!-- Loading State -->
    <div v-else class="loading-screen">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Montserrat', sans-serif;
  background: linear-gradient(180deg, #FFFBF7 0%, #FFF9F5 50%, #FDF8F3 100%);
  min-height: 100vh;
  color: #333;
}

#app {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(183, 152, 72, 0.2);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1800px;
  margin: 0 auto;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-btn {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid rgba(183, 152, 72, 0.4);
  border-radius: 25px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(183, 152, 72, 0.1);
  border-color: #B79848;
  color: #B79848;
}

.nav-btn.active {
  background: #B79848;
  border-color: #B79848;
  color: #fff;
}

.nav-auth {
  display: flex;
  align-items: center;
}

/* Loading Screen */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(183, 152, 72, 0.2);
  border-top-color: #B79848;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-screen p {
  color: #999;
  font-weight: 300;
  letter-spacing: 1px;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-content {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
  }

  .nav-btn {
    flex: 1;
    text-align: center;
  }
}
</style>

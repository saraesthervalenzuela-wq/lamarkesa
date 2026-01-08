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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  min-height: 100vh;
  color: #fff;
}

#app {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
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
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
  color: #d4af37;
}

.nav-btn.active {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #d4af37;
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
  border: 4px solid rgba(212, 175, 55, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-screen p {
  color: rgba(255, 255, 255, 0.6);
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
  }
}
</style>

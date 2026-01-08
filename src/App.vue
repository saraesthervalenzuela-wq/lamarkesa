<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const goToCatalog = () => {
  router.push('/catalog')
}

const goToEdit = () => {
  router.push('/edit')
}

const goToAdmin = () => {
  router.push('/admin')
}
</script>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-brand">
          <span class="brand-icon">💎</span>
          <span class="brand-text">La Markesa</span>
        </div>

        <div class="nav-links">
          <button
            @click="goToCatalog"
            :class="{ active: route.path === '/catalog' || route.path === '/' }"
            class="nav-btn"
          >
            Catálogo
          </button>
          <button
            @click="goToEdit"
            :class="{ active: route.path === '/edit' }"
            class="nav-btn"
          >
            Editar
          </button>
          <button
            @click="goToAdmin"
            :class="{ active: route.path === '/admin' }"
            class="nav-btn nav-btn-admin"
          >
            Admin
          </button>
        </div>
      </div>
    </nav>

    <router-view />
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
  background: #F5F0EB;
  min-height: 100vh;
  color: #333;
}

#app {
  min-height: 100vh;
}

/* Navigation */
.navbar {
  background: #fff;
  border-bottom: 1px solid rgba(183, 152, 72, 0.15);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
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

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #B79848;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  gap: 12px;
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

.nav-btn-admin {
  border-color: rgba(183, 152, 72, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-content {
    padding: 12px 20px;
    flex-direction: column;
    gap: 12px;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
  }

  .nav-btn {
    flex: 1;
    text-align: center;
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .brand-text {
    font-size: 1.3rem;
  }
}
</style>

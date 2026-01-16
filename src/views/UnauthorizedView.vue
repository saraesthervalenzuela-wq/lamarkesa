<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, loginWithGoogle, logout } = useAuth()

const handleLogin = async () => {
  try {
    await loginWithGoogle()
    router.push('/catalog')
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
  }
}

const handleLogout = async () => {
  await logout()
  router.push('/catalog')
}

const goToCatalog = () => {
  router.push('/catalog')
}
</script>

<template>
  <div class="unauthorized-container">
    <div class="unauthorized-card">
      <div class="icon">🔒</div>
      <h1>Acceso Restringido</h1>
      <p v-if="!user">Necesitas iniciar sesión para acceder a esta sección.</p>
      <p v-else>No tienes permisos para acceder a esta sección.</p>

      <div class="actions">
        <button v-if="!user" @click="handleLogin" class="btn btn-primary">
          Iniciar sesión con Google
        </button>
        <template v-else>
          <p class="user-info">Conectado como: {{ user.email }}</p>
          <button @click="handleLogout" class="btn btn-secondary">
            Cerrar sesión
          </button>
        </template>
        <button @click="goToCatalog" class="btn btn-outline">
          Ver Catálogo
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unauthorized-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.unauthorized-card {
  background: #fff;
  border-radius: 16px;
  padding: 50px 40px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  color: #B79848;
  margin-bottom: 15px;
}

p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.user-info {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 15px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #B79848;
  color: #fff;
}

.btn-primary:hover {
  background: #a08540;
}

.btn-secondary {
  background: #666;
  color: #fff;
}

.btn-secondary:hover {
  background: #555;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(183, 152, 72, 0.4);
  color: #666;
}

.btn-outline:hover {
  border-color: #B79848;
  color: #B79848;
}
</style>

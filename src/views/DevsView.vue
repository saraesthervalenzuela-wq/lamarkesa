<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const router = useRouter()
const iframeRef = ref(null)

const logout = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem('userRole')
    router.push('/')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

onMounted(() => {
  // Verificar que el usuario tenga el rol correcto y esté autenticado
  const userRole = localStorage.getItem('userRole')
  const currentUser = auth.currentUser

  if (!currentUser || userRole !== 'devs') {
    router.push('/')
  }
})
</script>

<template>
  <div class="devs-container">
    <nav class="top-nav">
      <div class="nav-content">
        <h2>💎 Markesa - Panel de Desarrolladores</h2>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </nav>
    <iframe
      ref="iframeRef"
      src="/devs-legacy.html"
      class="legacy-iframe"
      title="Sistema completo de joyería"
    ></iframe>
  </div>
</template>

<style scoped>
.devs-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
}

.top-nav {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(10px);
  padding: 15px 30px;
  flex-shrink: 0;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1800px;
  margin: 0 auto;
}

.nav-content h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-logout {
  padding: 10px 20px;
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(220, 53, 69, 0.3);
  transform: translateY(-1px);
}

.legacy-iframe {
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
}

@media (max-width: 768px) {
  .nav-content h2 {
    font-size: 1rem;
  }

  .btn-logout {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>

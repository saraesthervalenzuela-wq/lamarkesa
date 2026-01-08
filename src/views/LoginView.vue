<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Mapeo de emails a roles y rutas
const USER_ROUTES = {
  'devs@markesa.com': '/devs',
  'admin@markesa.com': '/admin'
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    // Autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // Obtener el rol del usuario desde Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))

    let userRole = null
    let targetRoute = '/catalog'

    if (userDoc.exists()) {
      userRole = userDoc.data().role
      localStorage.setItem('userRole', userRole)

      // Determinar ruta según el rol
      if (userRole === 'devs') {
        targetRoute = '/devs'
      } else if (userRole === 'admin') {
        targetRoute = '/admin'
      }
    } else {
      // Si no existe en Firestore, intentar determinar por email
      const emailLower = user.email.toLowerCase()
      if (USER_ROUTES[emailLower]) {
        targetRoute = USER_ROUTES[emailLower]
        const role = emailLower.includes('devs') ? 'devs' : 'admin'
        localStorage.setItem('userRole', role)
      }
    }

    router.push(targetRoute)
  } catch (err) {
    console.error('Error de login:', err)

    // Mensajes de error más amigables
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      error.value = 'Email o contraseña incorrectos'
    } else if (err.code === 'auth/user-not-found') {
      error.value = 'Usuario no encontrado'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Email inválido'
    } else if (err.code === 'auth/too-many-requests') {
      error.value = 'Demasiados intentos. Intenta más tarde'
    } else {
      error.value = 'Error al iniciar sesión: ' + err.message
    }
  } finally {
    loading.value = false
  }
}

const goToCatalog = () => {
  router.push('/catalog')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <h1>💎 Markesa</h1>
        <p>Jewelry Management System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu-email@markesa.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Ingresando...</span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <div class="divider">
        <span>o</span>
      </div>

      <button @click="goToCatalog" class="btn-catalog">
        Ver Catálogo Público
      </button>

      <div class="login-info">
        <p><strong>devs@markesa.com:</strong> Acceso completo al sistema (versión completa)</p>
        <p><strong>admin@markesa.com:</strong> Panel de administración</p>
        <p><strong>Catálogo:</strong> Vista pública sin login</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
}

.login-box {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.logo {
  text-align: center;
  margin-bottom: 35px;
}

.logo h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.logo p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.login-form {
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(255, 255, 255, 0.12);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.error-message {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  border: none;
  border-radius: 10px;
  color: #1a1a2e;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  position: relative;
  margin: 25px 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: transparent;
  padding: 0 15px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

.btn-catalog {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-catalog:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(212, 175, 55, 0.5);
}

.login-info {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-info p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin-bottom: 8px;
  line-height: 1.5;
}

.login-info strong {
  color: #d4af37;
}

@media (max-width: 500px) {
  .login-box {
    padding: 30px 25px;
  }

  .logo h1 {
    font-size: 2rem;
  }
}
</style>

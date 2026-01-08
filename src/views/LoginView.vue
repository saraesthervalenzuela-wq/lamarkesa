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
  background: #F5F0EB;
}

.login-box {
  width: 100%;
  max-width: 450px;
  background: #fff;
  border: none;
  border-radius: 16px;
  padding: 50px 40px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.8rem;
  font-weight: 600;
  color: #B79848;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.logo p {
  color: #999;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.login-form {
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 14px 18px;
  background: #FAFAFA;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #B79848;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.form-group input::placeholder {
  color: #bbb;
}

.error-message {
  background: #FFF5F5;
  border: 1px solid #FED7D7;
  color: #C53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.btn-login {
  width: 100%;
  padding: 15px;
  background: #B79848;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(183, 152, 72, 0.25);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  position: relative;
  margin: 30px 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #E8E8E8;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: #fff;
  padding: 0 15px;
  color: #bbb;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-catalog {
  width: 100%;
  padding: 15px;
  background: transparent;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-catalog:hover {
  background: #FAFAFA;
  border-color: #B79848;
  color: #B79848;
}

.login-info {
  margin-top: 35px;
  padding-top: 25px;
  border-top: 1px solid #F0F0F0;
}

.login-info p {
  color: #999;
  font-size: 0.75rem;
  margin-bottom: 8px;
  line-height: 1.6;
}

.login-info strong {
  color: #B79848;
}

@media (max-width: 500px) {
  .login-box {
    padding: 35px 25px;
  }

  .logo h1 {
    font-size: 2.2rem;
  }
}
</style>

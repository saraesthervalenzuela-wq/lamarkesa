<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await login(email.value, password.value)
    router.push('/catalog')
  } catch (err) {
    console.error('Login error:', err)
    if (err.code === 'auth/user-not-found') {
      error.value = 'User not found'
    } else if (err.code === 'auth/wrong-password') {
      error.value = 'Incorrect password'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Invalid email'
    } else if (err.code === 'auth/invalid-credential') {
      error.value = 'Invalid credentials'
    } else {
      error.value = 'Login error'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <span class="brand-icon">💎</span>
        <h1>La Markesa</h1>
        <p>Sign In</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="email@example.com"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="isLoading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="login-footer">
        <router-link to="/catalog" class="back-link">
          Back to catalog
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 50px 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.brand-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.login-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  color: #B79848;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.login-header p {
  color: #999;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
}

.form-group input {
  padding: 14px 16px;
  border: 1px solid rgba(183, 152, 72, 0.3);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  outline: none;
}

.form-group input:focus {
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background: #fff5f5;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.btn-login {
  padding: 14px 24px;
  background: #B79848;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  background: #a08540;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 25px;
  text-align: center;
}

.back-link {
  color: #999;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #B79848;
}
</style>

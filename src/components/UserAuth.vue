<script setup>
import { useAuth } from '../composables/useAuth'

const { user, loading, loginWithGoogle, logout } = useAuth()

const handleLogin = async () => {
  try {
    await loginWithGoogle()
  } catch (error) {
    alert('Login failed: ' + error.message)
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    alert('Logout failed: ' + error.message)
  }
}
</script>

<template>
  <div class="user-auth">
    <div v-if="loading" class="auth-loading">
      <span class="spinner-small"></span>
    </div>

    <div v-else-if="user" class="user-info">
      <img
        v-if="user.photoURL"
        :src="user.photoURL"
        :alt="user.displayName"
        class="user-avatar"
      >
      <span class="user-name">{{ user.displayName || user.email }}</span>
      <button class="btn-logout" @click="handleLogout" title="Logout">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
      </button>
    </div>

    <button v-else class="btn-login" @click="handleLogin">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    </button>
  </div>
</template>

<style scoped>
.user-auth {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-loading {
  padding: 8px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 25px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.user-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-logout:hover {
  color: #ff6b6b;
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login:hover {
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .user-name {
    display: none;
  }
}
</style>

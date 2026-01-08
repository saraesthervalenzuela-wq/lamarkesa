<script setup>
import { useAuth } from '../composables/useAuth'

const { user, loading, logout } = useAuth()

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
  border: 2px solid rgba(183, 152, 72, 0.2);
  border-top-color: #B79848;
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
  background: #fff;
  padding: 6px 14px;
  border-radius: 25px;
  border: 1px solid rgba(183, 152, 72, 0.2);
  box-shadow: 0 2px 8px rgba(183, 152, 72, 0.08);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(183, 152, 72, 0.3);
}

.user-name {
  font-size: 0.85rem;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-logout:hover {
  color: #C53030;
}

@media (max-width: 600px) {
  .user-name {
    display: none;
  }
}
</style>

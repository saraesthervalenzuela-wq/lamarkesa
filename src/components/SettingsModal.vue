<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { userSettings, saveApiKey, user } = useAuth()

const emit = defineEmits(['close'])

const apiKey = ref('')
const isLoading = ref(false)
const statusText = ref('')
const showKey = ref(false)

// Load API key on mount
onMounted(() => {
  if (userSettings.value?.openaiApiKey) {
    apiKey.value = userSettings.value.openaiApiKey
  }
})

// Save API key to Firestore
const handleSave = async () => {
  if (!apiKey.value.trim()) {
    statusText.value = 'Please enter an API key'
    return
  }

  isLoading.value = true
  statusText.value = ''

  try {
    await saveApiKey(apiKey.value)
    statusText.value = 'API Key saved successfully!'
    setTimeout(() => {
      emit('close')
    }, 1500)
  } catch (error) {
    console.error('Error saving API key:', error)
    statusText.value = 'Error saving API Key: ' + error.message
  } finally {
    isLoading.value = false
  }
}

// Clear API key
const handleClear = async () => {
  if (!confirm('Remove your saved API key?')) return

  isLoading.value = true
  try {
    await saveApiKey('')
    apiKey.value = ''
    statusText.value = 'API Key removed'
  } catch (error) {
    statusText.value = 'Error removing API Key'
  } finally {
    isLoading.value = false
  }
}

const maskedKey = () => {
  if (!apiKey.value) return ''
  if (showKey.value) return apiKey.value
  return apiKey.value.slice(0, 7) + '...' + apiKey.value.slice(-4)
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>⚙️ Settings</h2>
        <button class="modal-close" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- User Info -->
        <div class="user-info" v-if="user">
          <div class="user-avatar">{{ user.email?.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <span class="user-email">{{ user.email }}</span>
            <span class="user-hint">Settings are saved to your account</span>
          </div>
        </div>

        <!-- API Key Section -->
        <div class="settings-section">
          <h3>🔑 OpenAI API Key</h3>
          <p class="section-description">
            Your API key is stored securely in Firebase and used for AI features like Photo Matching and Image Analysis.
          </p>

          <div class="api-key-input-group">
            <div class="input-wrapper">
              <input
                :type="showKey ? 'text' : 'password'"
                v-model="apiKey"
                placeholder="sk-proj-..."
                class="input-field mono"
              >
              <button
                class="toggle-visibility"
                @click="showKey = !showKey"
                type="button"
              >
                {{ showKey ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <div class="api-key-status" v-if="userSettings?.openaiApiKey">
            <span class="status-badge saved">✓ Key Saved</span>
            <span class="status-text">{{ maskedKey() }}</span>
          </div>

          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            class="get-key-link"
          >
            Don't have a key? Get one from OpenAI →
          </a>
        </div>

        <!-- Status Message -->
        <div
          v-if="statusText"
          class="status-message"
          :class="{ success: statusText.includes('success'), error: statusText.includes('Error') }"
        >
          {{ statusText }}
        </div>
      </div>

      <div class="modal-footer">
        <button
          v-if="userSettings?.openaiApiKey"
          class="btn btn-danger"
          @click="handleClear"
          :disabled="isLoading"
        >
          🗑️ Remove Key
        </button>
        <button class="btn btn-secondary" @click="emit('close')">
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click="handleSave"
          :disabled="isLoading || !apiKey.trim()"
        >
          <span v-if="isLoading" class="spinner-small"></span>
          {{ isLoading ? 'Saving...' : '💾 Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: linear-gradient(135deg, #1e1e3a 0%, #1a1a2e 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 28px;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a2e;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-email {
  color: #fff;
  font-weight: 500;
}

.user-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

/* Settings Section */
.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.section-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 16px;
  line-height: 1.5;
}

.api-key-input-group {
  margin-bottom: 12px;
}

.input-wrapper {
  position: relative;
  display: flex;
}

.input-field {
  width: 100%;
  padding: 16px 50px 16px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.input-field.mono {
  font-family: 'SF Mono', Monaco, monospace;
  letter-spacing: 0.5px;
}

.toggle-visibility {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-visibility:hover {
  opacity: 1;
}

.api-key-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.saved {
  background: rgba(16, 163, 127, 0.2);
  color: #10a37f;
}

.status-text {
  color: rgba(255, 255, 255, 0.5);
  font-family: monospace;
  font-size: 0.85rem;
}

.get-key-link {
  display: inline-block;
  color: #d4af37;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s;
}

.get-key-link:hover {
  color: #f4d03f;
  text-decoration: underline;
}

/* Status Message */
.status-message {
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 0.95rem;
  margin-top: 16px;
}

.status-message.success {
  background: rgba(16, 163, 127, 0.15);
  color: #10a37f;
  border: 1px solid rgba(16, 163, 127, 0.3);
}

.status-message.error {
  background: rgba(220, 53, 69, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

/* Footer */
.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: #1a1a2e;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: rgba(220, 53, 69, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.3);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(26, 26, 46, 0.3);
  border-top-color: #1a1a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

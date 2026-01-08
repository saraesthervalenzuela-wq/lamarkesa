<script setup>
import { ref } from 'vue'

const emit = defineEmits(['export-csv', 'export-json', 'clear-all', 'import-excel', 'ai-import', 'image-analyzer', 'photo-matcher'])

const fileInput = ref(null)

const handleImportClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('import-excel', file)
  }
  event.target.value = ''
}
</script>

<template>
  <div class="actions-bar">
    <button class="btn btn-ai" @click="emit('ai-import')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/>
      </svg>
      AI Import
    </button>

    <button class="btn btn-vision" @click="emit('image-analyzer')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      📷 Analyze Photos
    </button>

    <button class="btn btn-matcher" @click="emit('photo-matcher')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      </svg>
      🔗 Match Photos
    </button>

    <button class="btn btn-secondary" @click="handleImportClick">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
      </svg>
      Import Excel
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      class="hidden"
      @change="handleFileChange"
    >

    <button class="btn btn-secondary" @click="emit('export-csv')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
      Export CSV
    </button>

    <button class="btn btn-secondary" @click="emit('export-json')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6"/>
      </svg>
      Export JSON
    </button>

    <button class="btn btn-danger" @click="emit('clear-all')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
      </svg>
      Clear All
    </button>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}

.actions-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: rgba(220, 53, 69, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.btn-danger:hover {
  background: rgba(220, 53, 69, 0.3);
}

.btn-ai {
  background: linear-gradient(135deg, #10a37f 0%, #1a7f5a 100%);
  color: #fff;
  border: none;
}

.btn-ai:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}

.btn-vision {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: #fff;
  border: none;
}

.btn-vision:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.btn-matcher {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #fff;
  border: none;
}

.btn-matcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
}

@media (max-width: 600px) {
  .actions-bar {
    flex-direction: column;
  }
  .btn {
    justify-content: center;
  }
}
</style>

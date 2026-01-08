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
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.3px;
}

.btn-secondary {
  background: #fff;
  color: #666;
  border: 1px solid #E8E8E8;
}

.btn-secondary:hover {
  background: #FAFAFA;
  border-color: #B79848;
  color: #B79848;
}

.btn-danger {
  background: #FFF5F5;
  color: #C53030;
  border: 1px solid #FED7D7;
}

.btn-danger:hover {
  background: #FED7D7;
}

.btn-ai {
  background: #B79848;
  color: #fff;
  border: none;
}

.btn-ai:hover {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(183, 152, 72, 0.25);
}

.btn-vision {
  background: linear-gradient(135deg, #D4A5A5 0%, #C49A9A 100%);
  color: #fff;
  border: none;
}

.btn-vision:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 165, 165, 0.35);
}

.btn-matcher {
  background: linear-gradient(135deg, #9CB4A5 0%, #8AA599 100%);
  color: #fff;
  border: none;
}

.btn-matcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(156, 180, 165, 0.35);
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

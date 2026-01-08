<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

const emit = defineEmits(['close', 'import'])

const textInput = ref('')
const isLoading = ref(false)
const statusText = ref('')
const parsedItems = ref([])
const workbook = ref(null)
const selectedSheets = ref([])
const allSheets = ref([])

// Detectar si hay resultados
const hasResults = computed(() => parsedItems.value.length > 0)

// Manejar archivo subido
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()

  if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        workbook.value = XLSX.read(data, { type: 'array' })
        allSheets.value = workbook.value.SheetNames

        if (allSheets.value.length > 1) {
          // Multi-hoja: seleccionar todas por defecto
          selectedSheets.value = [...allSheets.value]
          updateTextFromSheets()
        } else {
          // Una sola hoja
          selectedSheets.value = allSheets.value
          textInput.value = XLSX.utils.sheet_to_csv(workbook.value.Sheets[allSheets.value[0]])
        }
      } catch (err) {
        alert('Error reading file: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  } else {
    reader.onload = (e) => {
      textInput.value = e.target.result
      allSheets.value = []
      selectedSheets.value = []
    }
    reader.readAsText(file)
  }
}

// Toggle selección de hoja
const toggleSheet = (sheetName) => {
  if (selectedSheets.value.includes(sheetName)) {
    selectedSheets.value = selectedSheets.value.filter(s => s !== sheetName)
  } else {
    selectedSheets.value.push(sheetName)
  }
  updateTextFromSheets()
}

// Actualizar texto desde hojas seleccionadas
const updateTextFromSheets = () => {
  if (!workbook.value || selectedSheets.value.length === 0) {
    textInput.value = ''
    return
  }

  let allData = ''
  selectedSheets.value.forEach(sheetName => {
    const worksheet = workbook.value.Sheets[sheetName]
    allData += `\n=== ${sheetName} ===\n${XLSX.utils.sheet_to_csv(worksheet)}\n`
  })
  textInput.value = allData.trim()
}

// Analizar con OpenAI (usando función serverless de Netlify)
const analyzeWithAI = async () => {
  if (!textInput.value.trim()) {
    alert('Please upload a file or paste data')
    return
  }

  isLoading.value = true
  statusText.value = 'Analyzing with GPT-4...'
  parsedItems.value = []

  try {
    // Usar función serverless de Netlify (en producción) o localhost (en desarrollo)
    const apiUrl = import.meta.env.DEV
      ? 'http://localhost:8888/.netlify/functions/openai'
      : '/.netlify/functions/openai'

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        textInput: textInput.value
      })
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('No items found')
    }

    parsedItems.value = data.items
    statusText.value = ''
  } catch (error) {
    statusText.value = `Error: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

// Remover item de la lista
const removeItem = (index) => {
  parsedItems.value.splice(index, 1)
}

// Importar items
const importItems = () => {
  if (parsedItems.value.length === 0) return
  emit('import', parsedItems.value)
  emit('close')
}

// Categorías para mostrar
const categoryLabels = {
  rings: 'Ring',
  necklaces: 'Necklace',
  earrings: 'Earrings',
  bracelets: 'Bracelet',
  watches: 'Watch',
  other: 'Other'
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>OpenAI Import</h2>
        <button class="modal-close" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="modal-description">
          Upload Excel with multiple sheets or paste text. AI will extract jewelry data automatically.
        </p>

        <!-- File Upload -->
        <div class="form-group">
          <label>Upload File</label>
          <div class="file-upload" @click="$refs.fileInput.click()">
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.json"
              @change="handleFileUpload"
              class="hidden"
            >
            <div class="upload-icon">📊</div>
            <p>Click to upload Excel, CSV, or text file</p>
          </div>
        </div>

        <!-- Sheet Selector (multi-hoja) -->
        <div v-if="allSheets.length > 1" class="form-group">
          <label>Select Sheets:</label>
          <div class="sheet-list">
            <label
              v-for="sheet in allSheets"
              :key="sheet"
              class="sheet-checkbox"
              :class="{ selected: selectedSheets.includes(sheet) }"
            >
              <input
                type="checkbox"
                :checked="selectedSheets.includes(sheet)"
                @change="toggleSheet(sheet)"
              >
              <span>{{ sheet }}</span>
            </label>
          </div>
        </div>

        <!-- Text Preview -->
        <div class="form-group">
          <label>Data Preview / Paste Text</label>
          <textarea
            v-model="textInput"
            placeholder="Paste data here or upload a file..."
            class="textarea-field"
          ></textarea>
        </div>

        <!-- Status -->
        <div v-if="isLoading || statusText" class="status-box" :class="{ error: statusText.includes('Error') }">
          <div v-if="isLoading" class="spinner"></div>
          <span>{{ isLoading ? 'Analyzing...' : statusText }}</span>
        </div>

        <!-- Results -->
        <div v-if="hasResults" class="results-section">
          <h3>Found {{ parsedItems.length }} Items:</h3>
          <div class="results-list">
            <div v-for="(item, index) in parsedItems" :key="index" class="result-item">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-details">
                  {{ categoryLabels[item.category] || 'Other' }}
                  <span v-if="item.sku"> • {{ item.sku }}</span>
                </div>
              </div>
              <div class="item-price">${{ (item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
              <button class="item-remove" @click="removeItem(index)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
        <button class="btn btn-ai" @click="analyzeWithAI" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-small"></span>
          Analyze with AI
        </button>
        <button v-if="hasResults" class="btn btn-primary" @click="importItems">
          Import {{ parsedItems.length }} Items
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: linear-gradient(135deg, #1e1e3a 0%, #1a1a2e 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #10a37f 0%, #1a7f5a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 25px;
}

.modal-description {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 18px;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.form-group a {
  color: #10a37f;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5);
}

.mono {
  font-family: monospace;
}

.textarea-field {
  height: 140px;
  font-family: monospace;
  font-size: 0.8rem;
  resize: vertical;
}

.hidden {
  display: none;
}

.file-upload {
  border: 2px dashed rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload:hover {
  border-color: rgba(212, 175, 55, 0.6);
  background: rgba(212, 175, 55, 0.05);
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.file-upload p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.sheet-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sheet-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  color: #fff;
}

.sheet-checkbox:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sheet-checkbox.selected {
  background: rgba(16, 163, 127, 0.2);
  border-color: #10a37f;
}

.sheet-checkbox input {
  accent-color: #10a37f;
}

.status-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 163, 127, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.status-box.error {
  background: rgba(220, 53, 69, 0.1);
  color: #ff6b6b;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(16, 163, 127, 0.3);
  border-top-color: #10a37f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-section {
  margin-top: 18px;
}

.results-section h3 {
  color: #d4af37;
  margin-bottom: 12px;
  font-size: 1rem;
}

.results-list {
  max-height: 250px;
  overflow-y: auto;
}

.result-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.item-info {
  flex: 1;
}

.item-name {
  color: #fff;
  font-weight: 500;
  margin-bottom: 3px;
  font-size: 0.9rem;
}

.item-details {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.item-price {
  color: #d4af37;
  font-weight: 600;
  font-size: 1rem;
  margin-right: 10px;
}

.item-remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 5px;
  font-size: 1rem;
}

.item-remove:hover {
  color: #ff6b6b;
}

/* Buttons */
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: #1a1a2e;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-ai {
  background: linear-gradient(135deg, #10a37f 0%, #1a7f5a 100%);
  color: #fff;
}

.btn-ai:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}
</style>

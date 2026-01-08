<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'import'])

const apiKey = ref(localStorage.getItem('openaiApiKey') || '')
const images = ref([])
const isLoading = ref(false)
const statusText = ref('')
const analyzedItems = ref([])
const lightboxImage = ref(null)

const hasResults = computed(() => analyzedItems.value.length > 0)
const hasImages = computed(() => images.value.length > 0)

// Convert image file to JPEG using canvas
const convertToJpeg = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const jpegFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
            resolve(jpegFile)
          } else {
            reject(new Error('Conversion failed'))
          }
        }, 'image/jpeg', 0.9)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const isDragging = ref(false)

// Process files (shared between upload and drag/drop)
const processFiles = async (files) => {
  const fileList = Array.from(files)

  for (const file of fileList) {
    // Accept image files
    if (!file.type.startsWith('image/') && !file.name.match(/\.(heic|heif|jpg|jpeg|png|gif|webp)$/i)) {
      continue
    }

    try {
      // Convert to JPEG for better compatibility
      statusText.value = `Processing ${file.name}...`
      const jpegFile = await convertToJpeg(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push({
          id: Date.now() + Math.random(),
          file: jpegFile,
          name: file.name,
          preview: e.target.result,
          analyzed: false,
          result: null
        })
      }
      reader.readAsDataURL(jpegFile)
    } catch (error) {
      console.error('Error processing', file.name, error)
    }
  }

  statusText.value = ''
}

// Handle file upload with conversion
const handleFileUpload = async (event) => {
  await processFiles(event.target.files)
  event.target.value = ''
}

// Drag and drop handlers
const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    await processFiles(files)
  }
}

// Open lightbox
const openLightbox = (imageSrc) => {
  lightboxImage.value = imageSrc
}

// Close lightbox
const closeLightbox = () => {
  lightboxImage.value = null
}

// Remove image
const removeImage = (id) => {
  images.value = images.value.filter(img => img.id !== id)
  analyzedItems.value = analyzedItems.value.filter(item => item.imageId !== id)
}

// Crop image using bounding box coordinates (percentages)
const cropImage = (imageDataUrl, bbox) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Convert percentages to pixels
        const x = (parseFloat(bbox.x) / 100) * img.width
        const y = (parseFloat(bbox.y) / 100) * img.height
        const w = (parseFloat(bbox.width) / 100) * img.width
        const h = (parseFloat(bbox.height) / 100) * img.height

        // Add padding (15%)
        const pad = 0.15
        const cropX = Math.max(0, x - w * pad)
        const cropY = Math.max(0, y - h * pad)
        const cropW = Math.min(img.width - cropX, w * (1 + pad * 2))
        const cropH = Math.min(img.height - cropY, h * (1 + pad * 2))

        // Minimum size check
        if (cropW < 10 || cropH < 10) {
          resolve(imageDataUrl) // Return original if crop too small
          return
        }

        canvas.width = cropW
        canvas.height = cropH

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (e) {
        console.error('Crop error:', e)
        resolve(imageDataUrl)
      }
    }
    img.onerror = () => resolve(imageDataUrl)
    img.src = imageDataUrl
  })
}

// Analyze all images with GPT-4 Vision
const analyzeImages = async () => {
  if (!apiKey.value.trim()) {
    alert('Please enter your OpenAI API Key')
    return
  }
  if (images.value.length === 0) {
    alert('Please upload at least one image')
    return
  }

  localStorage.setItem('openaiApiKey', apiKey.value)

  isLoading.value = true
  statusText.value = 'Analyzing images with GPT-4 Vision...'
  analyzedItems.value = []

  const systemPrompt = `Analyze this jewelry image. It may contain MULTIPLE items arranged in rows or grid.

For EACH jewelry item found, provide bounding box coordinates as PERCENTAGES (0-100).

Return ONLY valid JSON array:
[{"name":"item name from label or description","sku":"","category":"earrings","description":"gold hoops","estimatedPrice":0,"material":"gold","color":"gold","bbox":{"x":10,"y":5,"width":30,"height":12}}]

BBOX RULES:
- x: percentage from LEFT edge where item STARTS (0-100)
- y: percentage from TOP edge where item STARTS (0-100)
- width: percentage of image WIDTH the item occupies
- height: percentage of image HEIGHT the item occupies

Example: Item in top-left corner covering 1/4 of image = {"x":0,"y":0,"width":50,"height":25}

CRITICAL: Each product needs DIFFERENT bbox values based on its actual position in the image.
Categories: rings|necklaces|earrings|bracelets|watches|other`

  try {
    for (let i = 0; i < images.value.length; i++) {
      const img = images.value[i]
      statusText.value = `Analyzing image ${i + 1} of ${images.value.length}...`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.value}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: systemPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: img.preview,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 4000
        })
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error on image:', img.name, data.error)
        img.analyzed = true
        img.result = { error: data.error.message }
        continue
      }

      let resultText = data.choices[0].message.content
      resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      try {
        let parsed = JSON.parse(resultText)

        // Ensure it's an array
        if (!Array.isArray(parsed)) {
          parsed = [parsed]
        }

        img.analyzed = true
        img.result = parsed

        // Add each detected item with cropped image
        for (let j = 0; j < parsed.length; j++) {
          const item = parsed[j]
          statusText.value = `Image ${i + 1}: Cropping item ${j + 1} of ${parsed.length}...`

          // Crop image if bbox is provided, otherwise use full image
          let croppedImage = img.preview

          // Check if bbox exists and has valid values
          if (item.bbox &&
              typeof item.bbox.x === 'number' &&
              typeof item.bbox.y === 'number' &&
              typeof item.bbox.width === 'number' &&
              typeof item.bbox.height === 'number' &&
              item.bbox.width > 0 &&
              item.bbox.height > 0) {
            console.log(`Cropping item ${j + 1}:`, item.name, 'bbox:', item.bbox)
            try {
              croppedImage = await cropImage(img.preview, item.bbox)
              console.log(`Crop successful for item ${j + 1}`)
            } catch (e) {
              console.error('Crop failed:', e)
            }
          } else {
            console.log(`No valid bbox for item ${j + 1}:`, item.name, 'bbox:', item.bbox)
          }

          analyzedItems.value.push({
            imageId: img.id,
            imagePreview: croppedImage,
            name: item.name || 'Unnamed Jewelry',
            sku: item.sku || '',
            category: item.category || 'other',
            description: item.description || '',
            price: item.estimatedPrice || 0,
            material: item.material || '',
            color: item.color || ''
          })
        }

        statusText.value = `Image ${i + 1}: Found ${parsed.length} item(s)`
      } catch (parseError) {
        console.error('Error parsing:', resultText)
        img.analyzed = true
        img.result = { error: 'Could not analyze' }
      }
    }

    statusText.value = `Done! Found ${analyzedItems.value.length} items from ${images.value.length} image(s)`
  } catch (error) {
    statusText.value = `Error: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

// Edit functions
const updateItemName = (index, newName) => {
  analyzedItems.value[index].name = newName
}

const updateItemCategory = (index, newCategory) => {
  analyzedItems.value[index].category = newCategory
}

const updateItemPrice = (index, newPrice) => {
  analyzedItems.value[index].price = parseFloat(newPrice) || 0
}

const updateItemSku = (index, newSku) => {
  analyzedItems.value[index].sku = newSku
}

const removeAnalyzedItem = (index) => {
  const item = analyzedItems.value[index]
  images.value = images.value.filter(img => img.id !== item.imageId)
  analyzedItems.value.splice(index, 1)
}

// Import items
const importItems = () => {
  if (analyzedItems.value.length === 0) return

  const itemsToImport = analyzedItems.value.map(item => ({
    name: item.name,
    category: item.category,
    price: item.price,
    sku: item.sku || '',
    image: item.imagePreview
  }))

  emit('import', itemsToImport)
  emit('close')
}

const categories = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>📷 AI Image Analyzer</h2>
        <button class="modal-close" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="modal-description">
          Upload jewelry photos and AI will automatically detect and categorize them.<br>
          <strong>Supports bulk upload AND multiple products per image!</strong> (like catalog pages)
        </p>

        <!-- API Key -->
        <div class="form-group">
          <label>
            OpenAI API Key
            (<a href="https://platform.openai.com/api-keys" target="_blank">get one here</a>)
          </label>
          <input
            type="password"
            v-model="apiKey"
            placeholder="sk-..."
            class="input-field mono"
          >
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label>Upload Images (bulk upload supported)</label>
          <div
            class="file-upload"
            :class="{ 'dragging': isDragging }"
            @click="$refs.fileInput.click()"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileUpload"
              class="hidden"
            >
            <div class="upload-icon">{{ isDragging ? '📥' : '📸' }}</div>
            <p>{{ isDragging ? 'Drop images here!' : 'Click or drag to upload multiple images' }}</p>
            <small>JPG, PNG, HEIC - auto-converted to JPG</small>
          </div>
        </div>

        <!-- Image Preview Grid -->
        <div v-if="hasImages" class="images-preview">
          <div class="images-header">
            <label>Selected images ({{ images.length }})</label>
            <button class="btn-clear-all" @click="images = []; analyzedItems = []">
              🗑️ Clear All
            </button>
          </div>
          <div class="images-grid">
            <div v-for="img in images" :key="img.id" class="image-item" @click="openLightbox(img.preview)">
              <img :src="img.preview" :alt="img.name">
              <button class="image-remove" @click.stop="removeImage(img.id)" title="Remove">
                🗑️
              </button>
              <div v-if="img.analyzed" class="image-badge" :class="{ error: img.result?.error }">
                {{ img.result?.error ? '❌' : (Array.isArray(img.result) ? img.result.length : '✓') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div v-if="isLoading || statusText" class="status-box" :class="{ error: statusText.includes('Error') }">
          <div v-if="isLoading" class="spinner"></div>
          <span>{{ statusText }}</span>
        </div>

        <!-- Results -->
        <div v-if="hasResults" class="results-section">
          <h3>Analysis Results ({{ analyzedItems.length }})</h3>
          <div class="results-grid">
            <div v-for="(item, index) in analyzedItems" :key="item.imageId" class="result-card">
              <div class="result-image" @click="openLightbox(item.imagePreview)">
                <img :src="item.imagePreview" alt="Jewelry">
                <div class="zoom-hint">🔍</div>
              </div>
              <div class="result-details">
                <input
                  type="text"
                  class="result-name"
                  :value="item.name"
                  @input="updateItemName(index, $event.target.value)"
                  placeholder="Item name"
                >
                <div class="result-row">
                  <input
                    type="text"
                    class="result-sku"
                    :value="item.sku"
                    @input="updateItemSku(index, $event.target.value)"
                    placeholder="SKU"
                  >
                  <select
                    class="result-category"
                    :value="item.category"
                    @change="updateItemCategory(index, $event.target.value)"
                  >
                    <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                      {{ cat.label }}
                    </option>
                  </select>
                  <div class="price-input">
                    <span class="price-symbol">$</span>
                    <input
                      type="number"
                      class="result-price"
                      :value="item.price"
                      @input="updateItemPrice(index, $event.target.value)"
                      placeholder="0"
                    >
                  </div>
                </div>
                <div class="result-meta" v-if="item.material || item.color">
                  <span v-if="item.material">{{ item.material }}</span>
                  <span v-if="item.color"> • {{ item.color }}</span>
                </div>
              </div>
              <button class="result-remove" @click="removeAnalyzedItem(index)" title="Remove item">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
        <button
          class="btn btn-vision"
          @click="analyzeImages"
          :disabled="isLoading || !hasImages"
        >
          <span v-if="isLoading" class="spinner-small"></span>
          🔍 Analyze {{ images.length }} Image{{ images.length !== 1 ? 's' : '' }}
        </button>
        <button
          v-if="hasResults"
          class="btn btn-primary"
          @click="importItems"
        >
          ✓ Import {{ analyzedItems.length }} Items
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightboxImage" class="lightbox" @click="closeLightbox">
      <button class="lightbox-close">&times;</button>
      <img :src="lightboxImage" alt="Full size image" @click.stop>
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
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 15px;
}

.modal {
  background: linear-gradient(135deg, #1e1e3a 0%, #1a1a2e 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #1e1e3a 0%, #1a1a2e 100%);
  z-index: 10;
}

.modal-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
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
  padding: 0 10px;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 25px;
}

.modal-description {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
  font-size: 1rem;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  position: sticky;
  bottom: 0;
  background: linear-gradient(135deg, #1e1e3a 0%, #1a1a2e 100%);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 500;
}

.form-group a {
  color: #a855f7;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
}

.input-field:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.mono {
  font-family: monospace;
}

.hidden {
  display: none;
}

.file-upload {
  border: 2px dashed rgba(168, 85, 247, 0.5);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload:hover {
  border-color: rgba(168, 85, 247, 0.8);
  background: rgba(168, 85, 247, 0.08);
}

.file-upload.dragging {
  border-color: #10a37f;
  background: rgba(16, 163, 127, 0.15);
  border-width: 3px;
  transform: scale(1.02);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.file-upload p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 8px;
}

.file-upload small {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

/* Images Preview */
.images-preview {
  margin-bottom: 20px;
}

.images-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.images-header label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-clear-all {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.4);
  color: #ff6b6b;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-clear-all:hover {
  background: rgba(220, 53, 69, 0.3);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.image-item:hover {
  border-color: rgba(168, 85, 247, 0.5);
  transform: scale(1.02);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 53, 69, 0.95);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-remove {
  opacity: 1;
}

.image-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(16, 163, 127, 0.95);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-badge.error {
  background: rgba(220, 53, 69, 0.95);
}

/* Status */
.status-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(168, 85, 247, 0.15);
  border-radius: 10px;
  padding: 14px 16px;
  margin: 16px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

.status-box.error {
  background: rgba(220, 53, 69, 0.15);
  color: #ff6b6b;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Results */
.results-section {
  margin-top: 24px;
}

.results-section h3 {
  color: #a855f7;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.result-card {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px;
  align-items: flex-start;
}

.result-image {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.result-image:hover .zoom-hint {
  opacity: 1;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zoom-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 1.2rem;
}

.result-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.result-name {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

.result-name:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
}

.result-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.result-sku {
  width: 100px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-family: monospace;
}

.result-sku:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
}

.result-category {
  flex: 1;
  min-width: 100px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  font-size: 0.9rem;
}

.result-category option {
  background: #1a1a2e;
}

.price-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0 12px;
  min-width: 120px;
}

.price-symbol {
  color: #d4af37;
  font-weight: 600;
  margin-right: 4px;
}

.result-price {
  width: 80px;
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 0;
}

.result-price:focus {
  outline: none;
}

.result-meta {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.result-remove {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  cursor: pointer;
  padding: 8px 10px;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.result-remove:hover {
  background: rgba(220, 53, 69, 0.4);
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.lightbox-close:hover {
  opacity: 1;
}

/* Buttons */
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

.btn-vision {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  color: #fff;
}

.btn-vision:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-body {
    padding: 20px;
  }

  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .result-card {
    flex-direction: column;
    align-items: stretch;
  }

  .result-image {
    width: 100%;
    height: 200px;
  }

  .result-row {
    flex-direction: column;
    gap: 8px;
  }

  .price-input {
    width: 100%;
  }

  .result-remove {
    align-self: flex-end;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }

  .image-remove {
    opacity: 1;
  }
}
</style>

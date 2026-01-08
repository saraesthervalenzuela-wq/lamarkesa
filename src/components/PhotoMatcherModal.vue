<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'assign-photos'])

const apiKey = ref(localStorage.getItem('openaiApiKey') || '')
const photos = ref([])
const isLoading = ref(false)
const statusText = ref('')
const matches = ref([])
const lightboxImage = ref(null)

// Products without images
const productsWithoutPhotos = computed(() => {
  return props.products.filter(p => !p.image || p.image === '')
})

const hasPhotos = computed(() => photos.value.length > 0)
const hasMatches = computed(() => matches.value.length > 0)

// Convert image to JPEG using canvas
const convertToJpeg = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 1024
        let width = img.width
        let height = img.height

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              file: new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }),
              dataUrl: canvas.toDataURL('image/jpeg', 0.85)
            })
          } else {
            reject(new Error('Conversion failed'))
          }
        }, 'image/jpeg', 0.85)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Handle file upload
const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)

  for (const file of files) {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(heic|heif|jpg|jpeg|png|gif|webp)$/i)) {
      continue
    }

    try {
      statusText.value = `Processing ${file.name}...`
      const { file: jpegFile, dataUrl } = await convertToJpeg(file)

      photos.value.push({
        id: Date.now() + Math.random(),
        file: jpegFile,
        name: file.name,
        preview: dataUrl,
        matchedProduct: null,
        confidence: null
      })
    } catch (error) {
      console.error('Error processing', file.name, error)
    }
  }

  statusText.value = ''
  event.target.value = ''
}

// Remove photo
const removePhoto = (id) => {
  photos.value = photos.value.filter(p => p.id !== id)
  matches.value = matches.value.filter(m => m.photoId !== id)
}

// Open lightbox
const openLightbox = (imageSrc) => {
  lightboxImage.value = imageSrc
}

// Close lightbox
const closeLightbox = () => {
  lightboxImage.value = null
}

// Clear all
const clearAll = () => {
  photos.value = []
  matches.value = []
}

// AI Match photos to products
const matchPhotos = async () => {
  if (!apiKey.value.trim()) {
    alert('Please enter your OpenAI API Key')
    return
  }
  if (photos.value.length === 0) {
    alert('Please upload at least one photo')
    return
  }
  if (productsWithoutPhotos.value.length === 0) {
    alert('All products already have photos!')
    return
  }

  localStorage.setItem('openaiApiKey', apiKey.value)

  isLoading.value = true
  matches.value = []

  // Create product list for AI
  const productList = productsWithoutPhotos.value.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price
  }))

  const systemPrompt = `You are a jewelry matching expert. I will show you a photo of jewelry and a list of products.
Your task is to identify which product in the list best matches the photo.

Available products (without photos):
${productList.map(p => `- ID: ${p.id} | Name: "${p.name}" | Category: ${p.category} | Price: $${p.price}`).join('\n')}

Analyze the photo and respond ONLY with valid JSON (no markdown):
{
  "matchedProductId": "the ID of the best matching product or null if no good match",
  "confidence": "high", "medium", or "low",
  "reasoning": "brief explanation of why this matches",
  "detectedJewelry": "what type of jewelry you see in the photo"
}

If the photo doesn't match any product well, set matchedProductId to null.`

  try {
    for (let i = 0; i < photos.value.length; i++) {
      const photo = photos.value[i]
      statusText.value = `Analyzing photo ${i + 1} of ${photos.value.length}...`

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
                    url: photo.preview,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error on photo:', photo.name, data.error)
        continue
      }

      let resultText = data.choices[0].message.content
      resultText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      try {
        const parsed = JSON.parse(resultText)

        if (parsed.matchedProductId) {
          const matchedProduct = productsWithoutPhotos.value.find(p => p.id === parsed.matchedProductId)

          if (matchedProduct) {
            photo.matchedProduct = matchedProduct
            photo.confidence = parsed.confidence
            photo.reasoning = parsed.reasoning
            photo.detectedJewelry = parsed.detectedJewelry

            matches.value.push({
              photoId: photo.id,
              photoPreview: photo.preview,
              productId: matchedProduct.id,
              productName: matchedProduct.name,
              confidence: parsed.confidence,
              reasoning: parsed.reasoning,
              detectedJewelry: parsed.detectedJewelry,
              approved: parsed.confidence === 'high'
            })
          }
        } else {
          photo.matchedProduct = null
          photo.detectedJewelry = parsed.detectedJewelry
          photo.reasoning = parsed.reasoning || 'No matching product found'
        }
      } catch (parseError) {
        console.error('Error parsing:', resultText)
      }
    }

    statusText.value = `Done! Found ${matches.value.length} potential matches`
  } catch (error) {
    statusText.value = `Error: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

// Toggle match approval
const toggleApproval = (index) => {
  matches.value[index].approved = !matches.value[index].approved
}

// Change matched product manually
const changeMatchedProduct = (index, productId) => {
  const product = productsWithoutPhotos.value.find(p => p.id === productId)
  if (product) {
    matches.value[index].productId = product.id
    matches.value[index].productName = product.name
    matches.value[index].approved = true
  }
}

// Apply approved matches
const applyMatches = () => {
  const approvedMatches = matches.value.filter(m => m.approved)

  if (approvedMatches.length === 0) {
    alert('No matches approved. Check the boxes to approve matches.')
    return
  }

  const assignments = approvedMatches.map(m => ({
    productId: m.productId,
    photoDataUrl: m.photoPreview
  }))

  emit('assign-photos', assignments)
  emit('close')
}

const getConfidenceColor = (confidence) => {
  switch (confidence) {
    case 'high': return '#10a37f'
    case 'medium': return '#f59e0b'
    case 'low': return '#ef4444'
    default: return '#6b7280'
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>🔗 Photo Matcher</h2>
        <button class="modal-close" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="modal-description">
          Upload photos and AI will match them to your products that don't have images yet.
          <strong>{{ productsWithoutPhotos.length }} products</strong> are waiting for photos.
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

        <!-- Photo Upload -->
        <div class="form-group">
          <label>Upload Photos to Match</label>
          <div class="file-upload" @click="$refs.fileInput.click()">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileUpload"
              class="hidden"
            >
            <div class="upload-icon">📷</div>
            <p>Click to upload multiple photos</p>
            <small>AI will match each photo to a product</small>
          </div>
        </div>

        <!-- Photos Grid -->
        <div v-if="hasPhotos" class="photos-section">
          <div class="section-header">
            <label>Uploaded Photos ({{ photos.length }})</label>
            <button class="btn-clear" @click="clearAll">🗑️ Clear All</button>
          </div>
          <div class="photos-grid">
            <div
              v-for="photo in photos"
              :key="photo.id"
              class="photo-item"
              :class="{ matched: photo.matchedProduct }"
              @click="openLightbox(photo.preview)"
            >
              <img :src="photo.preview" :alt="photo.name">
              <button class="photo-remove" @click.stop="removePhoto(photo.id)">🗑️</button>
              <div v-if="photo.matchedProduct" class="photo-badge matched">✓</div>
              <div v-else-if="photo.detectedJewelry" class="photo-badge no-match">?</div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div v-if="isLoading || statusText" class="status-box" :class="{ error: statusText.includes('Error') }">
          <div v-if="isLoading" class="spinner"></div>
          <span>{{ statusText }}</span>
        </div>

        <!-- Matches Results -->
        <div v-if="hasMatches" class="matches-section">
          <h3>🎯 Suggested Matches ({{ matches.length }})</h3>
          <p class="matches-hint">Check the boxes to approve matches, then click "Apply Matches"</p>

          <div class="matches-list">
            <div v-for="(match, index) in matches" :key="match.photoId" class="match-card">
              <div class="match-photo" @click="openLightbox(match.photoPreview)">
                <img :src="match.photoPreview" alt="Photo">
                <div class="zoom-hint">🔍</div>
              </div>

              <div class="match-arrow">
                <span :style="{ color: getConfidenceColor(match.confidence) }">
                  {{ match.confidence === 'high' ? '✓✓' : match.confidence === 'medium' ? '✓' : '?' }}
                </span>
                →
              </div>

              <div class="match-details">
                <div class="match-product">
                  <select
                    :value="match.productId"
                    @change="changeMatchedProduct(index, $event.target.value)"
                    class="product-select"
                  >
                    <option v-for="p in productsWithoutPhotos" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </option>
                  </select>
                </div>
                <div class="match-confidence" :style="{ color: getConfidenceColor(match.confidence) }">
                  {{ match.confidence }} confidence
                </div>
                <div class="match-reasoning">{{ match.reasoning }}</div>
                <div class="match-detected">Detected: {{ match.detectedJewelry }}</div>
              </div>

              <label class="match-approve">
                <input
                  type="checkbox"
                  :checked="match.approved"
                  @change="toggleApproval(index)"
                >
                <span class="checkmark">{{ match.approved ? '✓' : '' }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Unmatched Photos Info -->
        <div v-if="!isLoading && photos.length > 0 && photos.some(p => !p.matchedProduct && p.detectedJewelry)" class="unmatched-section">
          <h4>⚠️ Unmatched Photos</h4>
          <div class="unmatched-list">
            <div v-for="photo in photos.filter(p => !p.matchedProduct && p.detectedJewelry)" :key="photo.id" class="unmatched-item">
              <img :src="photo.preview" @click="openLightbox(photo.preview)">
              <div class="unmatched-info">
                <span>Detected: {{ photo.detectedJewelry }}</span>
                <small>{{ photo.reasoning }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
        <button
          class="btn btn-match"
          @click="matchPhotos"
          :disabled="isLoading || !hasPhotos || productsWithoutPhotos.length === 0"
        >
          <span v-if="isLoading" class="spinner-small"></span>
          🔍 Match {{ photos.length }} Photo{{ photos.length !== 1 ? 's' : '' }}
        </button>
        <button
          v-if="hasMatches"
          class="btn btn-primary"
          @click="applyMatches"
          :disabled="!matches.some(m => m.approved)"
        >
          ✓ Apply {{ matches.filter(m => m.approved).length }} Match{{ matches.filter(m => m.approved).length !== 1 ? 'es' : '' }}
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
  max-width: 1100px;
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
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
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

.modal-description strong {
  color: #10a37f;
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
  color: #10a37f;
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
  border-color: rgba(16, 163, 127, 0.6);
}

.mono {
  font-family: monospace;
}

.hidden {
  display: none;
}

.file-upload {
  border: 2px dashed rgba(16, 163, 127, 0.5);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload:hover {
  border-color: rgba(16, 163, 127, 0.8);
  background: rgba(16, 163, 127, 0.08);
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
}

/* Photos Section */
.photos-section, .matches-section, .unmatched-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.btn-clear {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.4);
  color: #ff6b6b;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-clear:hover {
  background: rgba(220, 53, 69, 0.3);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.photo-item.matched {
  border-color: rgba(16, 163, 127, 0.5);
}

.photo-item:hover {
  transform: scale(1.03);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 53, 69, 0.95);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-item:hover .photo-remove {
  opacity: 1;
}

.photo-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.photo-badge.matched {
  background: rgba(16, 163, 127, 0.95);
}

.photo-badge.no-match {
  background: rgba(245, 158, 11, 0.95);
}

/* Status */
.status-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(16, 163, 127, 0.15);
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
  border: 2px solid rgba(16, 163, 127, 0.3);
  border-top-color: #10a37f;
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

/* Matches Section */
.matches-section h3 {
  color: #10a37f;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.matches-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.match-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
}

.match-photo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.match-photo:hover .zoom-hint {
  opacity: 1;
}

.match-photo img {
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
  padding: 6px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.match-arrow {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-details {
  flex: 1;
  min-width: 0;
}

.match-product {
  margin-bottom: 6px;
}

.product-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 8px 10px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
}

.product-select option {
  background: #1a1a2e;
}

.match-confidence {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.match-reasoning {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.match-detected {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.match-approve {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.match-approve input {
  display: none;
}

.checkmark {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(16, 163, 127, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #10a37f;
  transition: all 0.2s;
}

.match-approve input:checked + .checkmark {
  background: rgba(16, 163, 127, 0.3);
  border-color: #10a37f;
}

/* Unmatched Section */
.unmatched-section h4 {
  color: #f59e0b;
  margin-bottom: 12px;
}

.unmatched-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.unmatched-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 10px;
  padding: 10px;
}

.unmatched-item img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
  cursor: pointer;
}

.unmatched-info {
  display: flex;
  flex-direction: column;
}

.unmatched-info span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.unmatched-info small {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
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

.btn-match {
  background: linear-gradient(135deg, #10a37f 0%, #059669 100%);
  color: #fff;
}

.btn-match:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 163, 127, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .match-card {
    flex-direction: column;
    align-items: stretch;
  }

  .match-photo {
    width: 100%;
    height: 150px;
  }

  .match-arrow {
    justify-content: center;
    font-size: 1.2rem;
  }

  .match-approve {
    justify-content: flex-end;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }

  .photo-remove {
    opacity: 1;
  }
}
</style>

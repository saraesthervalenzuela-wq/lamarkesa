<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  itemName: {
    type: String,
    default: ''
  },
  itemSku: {
    type: String,
    default: ''
  },
  itemPrice: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: 'normal' // 'small', 'normal', 'large'
  }
})

const emit = defineEmits(['add-images', 'delete-image', 'click'])

const currentIndex = ref(0)
const showLightbox = ref(false)
const lightboxIndex = ref(0)
const fileInput = ref(null)

const hasImages = computed(() => props.images && props.images.length > 0)
const totalImages = computed(() => props.images?.length || 0)

const currentImage = computed(() => {
  if (!hasImages.value) return null
  return props.images[currentIndex.value]
})

const goToNext = (e) => {
  e?.stopPropagation()
  if (currentIndex.value < totalImages.value - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const goToPrev = (e) => {
  e?.stopPropagation()
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = totalImages.value - 1
  }
}

const goToIndex = (index, e) => {
  e?.stopPropagation()
  currentIndex.value = index
}

const openLightbox = (index = currentIndex.value) => {
  if (hasImages.value) {
    lightboxIndex.value = index
    showLightbox.value = true
  }
}

const closeLightbox = () => {
  showLightbox.value = false
}

const lightboxNext = () => {
  if (lightboxIndex.value < totalImages.value - 1) {
    lightboxIndex.value++
  } else {
    lightboxIndex.value = 0
  }
}

const lightboxPrev = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  } else {
    lightboxIndex.value = totalImages.value - 1
  }
}

const handleKeydown = (e) => {
  if (!showLightbox.value) return
  if (e.key === 'ArrowRight') lightboxNext()
  if (e.key === 'ArrowLeft') lightboxPrev()
  if (e.key === 'Escape') closeLightbox()
}

const openFilePicker = (e) => {
  e?.stopPropagation()
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  console.log('ImageCarousel handleFileChange:', files)
  if (files.length > 0) {
    emit('add-images', files)
    console.log('Emitted add-images event')
  }
  event.target.value = ''
}

const handleDeleteImage = (index, e) => {
  e?.stopPropagation()
  emit('delete-image', index)
  if (currentIndex.value >= totalImages.value - 1 && currentIndex.value > 0) {
    currentIndex.value--
  }
}

const handleClick = () => {
  if (hasImages.value) {
    openLightbox()
  } else {
    openFilePicker()
  }
  emit('click')
}

// Expose for keyboard events
defineExpose({ handleKeydown })
</script>

<template>
  <div :class="['carousel-container', `size-${size}`]" @click="handleClick">
    <!-- Main Image Display -->
    <div class="carousel-main">
      <img
        v-if="hasImages"
        :src="currentImage"
        :alt="itemName"
        class="carousel-image"
      />
      <div v-else class="carousel-placeholder">
        <span>💎</span>
        <small>Click to add photos</small>
      </div>

      <!-- Navigation Arrows (only if multiple images) -->
      <template v-if="totalImages > 1">
        <button class="carousel-arrow carousel-prev" @click="goToPrev" title="Previous">
          ‹
        </button>
        <button class="carousel-arrow carousel-next" @click="goToNext" title="Next">
          ›
        </button>
      </template>

      <!-- Image Counter -->
      <div v-if="totalImages > 1" class="carousel-counter">
        {{ currentIndex + 1 }} / {{ totalImages }}
      </div>

      <!-- Action Buttons -->
      <div class="carousel-actions">
        <button class="carousel-btn add-btn" @click="openFilePicker" title="Add photos">
          ➕
        </button>
        <button
          v-if="hasImages"
          class="carousel-btn delete-btn"
          @click="handleDeleteImage(currentIndex, $event)"
          title="Delete this photo"
        >
          🗑️
        </button>
      </div>

      <!-- Dot Indicators -->
      <div v-if="totalImages > 1" class="carousel-dots">
        <button
          v-for="(_, index) in images"
          :key="index"
          :class="['carousel-dot', { active: index === currentIndex }]"
          @click="goToIndex(index, $event)"
        />
      </div>
    </div>

    <!-- Hidden File Input (multiple) -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="showLightbox"
        class="lightbox-overlay"
        @click="closeLightbox"
        @keydown="handleKeydown"
        tabindex="0"
      >
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">&times;</button>

          <div class="lightbox-main">
            <button
              v-if="totalImages > 1"
              class="lightbox-arrow lightbox-prev"
              @click="lightboxPrev"
            >
              ‹
            </button>

            <img
              :src="images[lightboxIndex]"
              :alt="itemName"
              class="lightbox-image"
            />

            <button
              v-if="totalImages > 1"
              class="lightbox-arrow lightbox-next"
              @click="lightboxNext"
            >
              ›
            </button>
          </div>

          <!-- Lightbox Thumbnails -->
          <div v-if="totalImages > 1" class="lightbox-thumbnails">
            <button
              v-for="(img, index) in images"
              :key="index"
              :class="['lightbox-thumb', { active: index === lightboxIndex }]"
              @click="lightboxIndex = index"
            >
              <img :src="img" :alt="`Foto ${index + 1}`" />
            </button>
          </div>

          <div class="lightbox-info">
            <h3>{{ itemName }}</h3>
            <p v-if="itemSku">SKU: {{ itemSku }}</p>
            <p class="lightbox-price">${{ itemPrice?.toFixed(2) }}</p>
            <p class="lightbox-counter">{{ lightboxIndex + 1 }} of {{ totalImages }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.carousel-main {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: #F9F9F9;
  overflow: hidden;
  border: 1px solid #ECECEC;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #ccc;
}

.carousel-placeholder span {
  font-size: 1.5rem;
}

.carousel-placeholder small {
  font-size: 0.65rem;
  opacity: 0.7;
}

/* Size variants */
.size-small {
  width: 70px;
  height: 70px;
}

.size-normal {
  width: 100px;
  height: 100px;
}

.size-large {
  width: 100%;
  height: 150px;
}

/* Navigation Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.carousel-container:hover .carousel-arrow {
  opacity: 1;
}

.carousel-prev {
  left: 5px;
}

.carousel-next {
  right: 5px;
}

.carousel-arrow:hover {
  background: #B79848;
  color: #fff;
  transform: translateY(-50%) scale(1.1);
}

/* Counter */
.carousel-counter {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 500;
}

/* Action Buttons */
.carousel-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.carousel-container:hover .carousel-actions {
  opacity: 1;
}

.carousel-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.add-btn {
  background: #B79848;
  color: #fff;
}

.add-btn:hover {
  background: #A08640;
  transform: scale(1.1);
}

.delete-btn {
  background: #FFF5F5;
  color: #C53030;
}

.delete-btn:hover {
  background: #FED7D7;
  transform: scale(1.1);
}

/* Dot Indicators */
.carousel-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.carousel-dot.active {
  background: #B79848;
  transform: scale(1.2);
}

.carousel-dot:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.lightbox-content {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-close {
  position: absolute;
  top: -45px;
  right: -10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 2.5rem;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 2001;
}

.lightbox-close:hover {
  color: #B79848;
}

.lightbox-main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
}

.lightbox-image {
  max-width: 80vw;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
}

.lightbox-arrow {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.lightbox-arrow:hover {
  background: #B79848;
}

/* Thumbnails */
.lightbox-thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  max-width: 80vw;
  overflow-x: auto;
  padding: 10px 0;
}

.lightbox-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  opacity: 0.6;
}

.lightbox-thumb.active {
  border-color: #B79848;
  opacity: 1;
}

.lightbox-thumb:hover {
  opacity: 1;
}

.lightbox-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lightbox-info {
  margin-top: 20px;
  text-align: center;
  color: #fff;
}

.lightbox-info h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.lightbox-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
}

.lightbox-price {
  color: #B79848 !important;
  font-size: 1.3rem;
  font-weight: 600;
}

.lightbox-counter {
  font-size: 0.85rem;
  margin-top: 10px;
}

/* Size-specific adjustments */
.size-small .carousel-arrow {
  width: 22px;
  height: 22px;
  font-size: 1rem;
}

.size-small .carousel-counter {
  font-size: 0.55rem;
  padding: 2px 5px;
}

.size-small .carousel-btn {
  width: 22px;
  height: 22px;
  font-size: 0.65rem;
}

.size-small .carousel-dot {
  width: 5px;
  height: 5px;
}

.size-small .carousel-placeholder span {
  font-size: 1.2rem;
}

.size-small .carousel-placeholder small {
  display: none;
}

.size-large .carousel-arrow {
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
}

.size-large .carousel-placeholder span {
  font-size: 4rem;
}

.size-large .carousel-placeholder small {
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .lightbox-image {
    max-width: 95vw;
    max-height: 50vh;
  }

  .lightbox-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }

  .lightbox-thumbnails {
    max-width: 95vw;
  }

  .lightbox-thumb {
    width: 50px;
    height: 50px;
  }
}
</style>

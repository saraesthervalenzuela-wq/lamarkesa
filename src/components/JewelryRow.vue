<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'delete', 'upload-image'])

const fileInput = ref(null)
const showLightbox = ref(false)

const categories = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]

const handleImageClick = () => {
  // If image exists, show lightbox; otherwise open file picker
  if (props.item.image) {
    showLightbox.value = true
  } else {
    fileInput.value?.click()
  }
}

const openFilePicker = (event) => {
  event.stopPropagation()
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('upload-image', file)
  }
  event.target.value = ''
}

const confirmDelete = () => {
  if (confirm('Delete this item?')) {
    emit('delete')
  }
}
</script>

<template>
  <div class="table-row">
    <div class="row-image" @click="handleImageClick">
      <img v-if="item.image" :src="item.image" :alt="item.name">
      <span v-else class="row-image-placeholder">💎</span>
      <button v-if="item.image" class="change-photo-btn" @click="openFilePicker" title="Cambiar foto">📷</button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      >
    </div>

    <!-- Lightbox -->
    <div v-if="showLightbox" class="lightbox-overlay" @click="showLightbox = false">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="showLightbox = false">&times;</button>
        <img :src="item.image" :alt="item.name" class="lightbox-image">
        <div class="lightbox-info">
          <h3>{{ item.name }}</h3>
          <p v-if="item.sku">SKU: {{ item.sku }}</p>
          <p class="lightbox-price">${{ item.price?.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <input
      type="text"
      class="editable-field name-field"
      :value="item.name"
      @change="emit('update', 'name', $event.target.value)"
    >

    <select
      class="category-select"
      :value="item.category"
      @change="emit('update', 'category', $event.target.value)"
    >
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>

    <input
      type="text"
      class="editable-field sku-field"
      :value="item.sku || ''"
      placeholder="-"
      @change="emit('update', 'sku', $event.target.value)"
    >

    <input
      type="number"
      class="editable-field price-field"
      :value="item.price"
      step="0.01"
      @change="emit('update', 'price', parseFloat($event.target.value) || 0)"
    >

    <div class="row-actions">
      <button class="delete-btn" @click="confirmDelete" title="Delete">
        🗑️ Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}

.table-row {
  display: grid;
  grid-template-columns: 180px 1fr 180px 160px 140px 100px;
  gap: 15px;
  padding: 15px 25px;
  border-bottom: 1px solid #F0F0F0;
  align-items: center;
  transition: background 0.2s;
}

.table-row:hover {
  background: #FDFCFA;
}

.row-image {
  width: 170px;
  height: 170px;
  border-radius: 10px;
  background: #F9F9F9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 1px solid #ECECEC;
}

.row-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-image-placeholder {
  font-size: 1.5rem;
  color: #ccc;
}

.row-image:hover::after {
  content: '🔍';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  pointer-events: none;
}

.change-photo-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #B79848;
  cursor: pointer;
  font-size: 0.9rem;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: transform 0.2s;
}

.row-image:hover .change-photo-btn {
  display: flex;
}

.change-photo-btn:hover {
  transform: scale(1.1);
  background: #A08640;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: -10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 2.5rem;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1001;
}

.lightbox-close:hover {
  color: #B79848;
}

.lightbox-image {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
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

.editable-field {
  background: transparent;
  border: 1px solid transparent;
  padding: 10px 12px;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.2s;
}

.editable-field:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.editable-field:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.name-field {
  font-weight: 500;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
}

.price-field {
  color: #B79848;
  font-weight: 600;
  text-align: right;
}

.sku-field {
  font-family: monospace;
  font-size: 0.85rem;
  color: #999;
}

.category-select {
  background: transparent;
  border: 1px solid transparent;
  padding: 10px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-select:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.category-select:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.category-select option {
  background: #fff;
  color: #333;
}

.row-actions {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.delete-btn {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid #FED7D7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
  background: #FFF5F5;
  color: #C53030;
  font-size: 0.8rem;
  font-weight: 500;
}

.delete-btn:hover {
  background: #FED7D7;
}

@media (max-width: 900px) {
  .table-row {
    grid-template-columns: 100px 1fr 100px 80px;
  }
  .row-image {
    width: 90px;
    height: 90px;
  }
  .table-row > *:nth-child(4),
  .table-row > *:nth-child(5) {
    display: none;
  }
}

@media (max-width: 600px) {
  .table-row {
    grid-template-columns: 75px 1fr 90px 60px;
    padding: 10px 12px;
    gap: 8px;
  }
  .row-image {
    width: 70px;
    height: 70px;
  }
}
</style>

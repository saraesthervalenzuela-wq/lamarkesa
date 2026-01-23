<script setup>
import { ref, computed } from 'vue'
import JewelryRow from './JewelryRow.vue'
import NewItemRow from './NewItemRow.vue'
import ImageCarousel from './ImageCarousel.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add', 'update', 'delete', 'add-images', 'delete-image'])

// Helper para obtener imágenes de un item (compatibilidad)
const getItemImages = (item) => {
  if (item.images && item.images.length > 0) {
    return item.images
  }
  if (item.image) {
    return [item.image]
  }
  return []
}

const viewMode = ref('list') // 'list' or 'grid'

const categories = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'chains', label: 'Chains' },
  { value: 'pendants', label: 'Pendants' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]

const materials = [
  { value: '', label: 'No material' },
  { value: 'solid_gold', label: 'Solid Gold' },
  { value: 'hollow', label: 'Hollow Gold' },
  { value: 'vermeil', label: 'Vermeil' },
  { value: 'sterling_silver', label: '925 Sterling Silver' },
  { value: 'lab_grown', label: 'Lab Grown' }
]

const goldColors = [
  { value: '', label: '-' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'white', label: 'White' },
  { value: 'tri_tone', label: 'Tri-tone' }
]

const specialCollections = [
  { value: '', label: 'No collection' },
  { value: 'bridal_sets', label: 'Bridal Sets' },
  { value: 'engagement_rings', label: 'Engagement Rings' },
  { value: 'wedding_band', label: 'Wedding Band' },
  { value: 'religious', label: 'Religious' },
  { value: 'letters', label: 'Letters' }
]

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : 'Other'
}

const getMaterialLabel = (material) => {
  const mat = materials.find(m => m.value === material)
  return mat ? mat.label : '-'
}

const getGoldColorLabel = (color) => {
  const gc = goldColors.find(c => c.value === color)
  return gc ? gc.label : '-'
}

const getSpecialCollectionLabel = (collection) => {
  const col = specialCollections.find(c => c.value === collection)
  return col ? col.label : ''
}
</script>

<template>
  <div class="jewelry-container">
    <!-- View Toggle -->
    <div class="view-toggle-bar">
      <div class="view-toggle">
        <button
          :class="['toggle-btn', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
          title="List View"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
        <button
          :class="['toggle-btn', { active: viewMode === 'grid' }]"
          @click="viewMode = 'grid'"
          title="Grid View"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- List View (Table) -->
    <div v-if="viewMode === 'list'" class="jewelry-table">
      <div class="table-header">
        <div>Image</div>
        <div>Name</div>
        <div>Category</div>
        <div>Material</div>
        <div>Karat</div>
        <div>Color</div>
        <div>Rhodium</div>
        <div>Collection</div>
        <div>Size</div>
        <div>Price</div>
        <div>Actions</div>
      </div>

      <div class="jewelry-list">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading jewelry...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="items.length === 0" class="empty-state">
          <div class="empty-icon">💍</div>
          <h3>No jewelry yet</h3>
          <p>Start by adding items using the row below</p>
        </div>

        <!-- Jewelry rows -->
        <JewelryRow
          v-else
          v-for="item in items"
          :key="item.id"
          :item="item"
          @update="(field, value) => emit('update', item.id, field, value)"
          @delete="emit('delete', item.id, getItemImages(item))"
          @add-images="(files) => emit('add-images', item.id, files)"
          @delete-image="(index) => emit('delete-image', item.id, index)"
        />
      </div>

      <!-- New item row -->
      <NewItemRow @add="(item) => emit('add', item)" />
    </div>

    <!-- Grid View -->
    <div v-else class="jewelry-grid-view">
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading jewelry...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="items.length === 0" class="empty-state">
        <div class="empty-icon">💍</div>
        <h3>No jewelry yet</h3>
        <p>Start by adding items below</p>
      </div>

      <!-- Grid items -->
      <div v-else class="grid-container">
        <div
          v-for="item in items"
          :key="item.id"
          class="grid-card"
        >
          <div class="grid-image-wrapper">
            <ImageCarousel
              :images="getItemImages(item)"
              :item-name="item.name"
              :item-sku="item.sku"
              :item-price="item.price"
              size="large"
              @add-images="(files) => emit('add-images', item.id, files)"
              @delete-image="(index) => emit('delete-image', item.id, index)"
            />
            <div class="grid-category">{{ getCategoryLabel(item.category) }}</div>
          </div>

          <div class="grid-info">
            <input
              type="text"
              :value="item.name"
              class="grid-name-input"
              placeholder="Name"
              @blur="(e) => e.target.value !== item.name && emit('update', item.id, 'name', e.target.value)"
            />

            <div class="grid-row">
              <select
                :value="item.category"
                class="grid-category-select"
                @change="(e) => emit('update', item.id, 'category', e.target.value)"
              >
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
              <select
                :value="item.material || ''"
                class="grid-material-select"
                @change="(e) => emit('update', item.id, 'material', e.target.value)"
              >
                <option v-for="mat in materials" :key="mat.value" :value="mat.value">
                  {{ mat.label }}
                </option>
              </select>
            </div>

            <div class="grid-row">
              <span v-if="item.karat" class="grid-badge">{{ item.karat }}</span>
              <span v-if="item.goldColor" class="grid-badge gold-color">{{ getGoldColorLabel(item.goldColor) }}</span>
              <span v-if="item.size" class="grid-badge size-badge">{{ item.size }}</span>
            </div>

            <div class="grid-row" v-if="item.specialCollection">
              <span class="grid-collection-badge">{{ getSpecialCollectionLabel(item.specialCollection) }}</span>
            </div>

            <div class="grid-footer">
              <div class="grid-price-wrap">
                <span class="price-symbol">$</span>
                <input
                  type="number"
                  :value="item.price"
                  class="grid-price-input"
                  step="0.01"
                  @blur="(e) => parseFloat(e.target.value) !== item.price && emit('update', item.id, 'price', parseFloat(e.target.value) || 0)"
                />
              </div>
              <button
                class="grid-delete-btn"
                @click="() => { if (confirm('Delete this product?')) emit('delete', item.id, getItemImages(item)) }"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Add New Card -->
        <div class="grid-card grid-add-card">
          <NewItemRow @add="(item) => emit('add', item)" :grid-mode="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jewelry-container {
  width: 100%;
}

/* View Toggle */
.view-toggle-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.view-toggle {
  display: flex;
  gap: 5px;
  background: #fff;
  padding: 5px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.toggle-btn {
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  color: #B79848;
}

.toggle-btn.active {
  background: #B79848;
  color: #fff;
}

/* List View (Table) */
.jewelry-table {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  border: none;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
}

.table-header {
  display: grid;
  grid-template-columns: 110px minmax(150px, 1.5fr) 100px 120px 70px 100px 80px 120px 60px 80px 100px;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #FDFAF6 0%, #FAF7F2 100%);
  border-bottom: 1px solid rgba(183, 152, 72, 0.12);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999;
  font-weight: 600;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(183, 152, 72, 0.2);
  border-top-color: #B79848;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-state h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  margin-bottom: 8px;
  color: #666;
}

.empty-state p {
  color: #aaa;
  font-weight: 300;
}

/* Grid View */
.jewelry-grid-view {
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 15px;
}

.grid-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.grid-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(183, 152, 72, 0.12);
}

.grid-image-wrapper {
  position: relative;
  width: 100%;
  height: 150px;
}

.grid-category {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #B79848;
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 5;
  pointer-events: none;
}

.grid-info {
  padding: 10px;
}

.grid-name-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  padding: 6px;
  border-radius: 6px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  transition: all 0.2s;
}

.grid-name-input:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-name-input:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}

.grid-sku-input {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 10px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
  color: #999;
  transition: all 0.2s;
}

.grid-sku-input:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-sku-input:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-category-select {
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;
}

.grid-category-select:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-category-select:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-collection-select {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.grid-collection-select:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-collection-select:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-material-select {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.grid-material-select:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-material-select:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-badge {
  display: inline-block;
  background: #F5F5F5;
  color: #666;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 500;
}

.grid-badge.gold-color {
  background: #FFF8E1;
  color: #B79848;
}

.grid-badge.size-badge {
  background: #E3F2FD;
  color: #1976D2;
}

.grid-collection-badge {
  display: inline-block;
  background: linear-gradient(135deg, #B79848 0%, #D4AF37 100%);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grid-comment {
  margin-bottom: 10px;
}

.grid-comment-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
  transition: all 0.2s;
}

.grid-comment-input:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-comment-input:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-comment-input::placeholder {
  color: #bbb;
  font-style: italic;
}

.grid-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #F0F0F0;
}

.grid-price-wrap {
  display: flex;
  align-items: center;
  gap: 2px;
}

.price-symbol {
  color: #B79848;
  font-size: 1.2rem;
  font-weight: 600;
}

.grid-price-input {
  width: 100px;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px;
  border-radius: 6px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #B79848;
  transition: all 0.2s;
}

.grid-price-input:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.grid-price-input:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

/* Remove spinner from number input */
.grid-price-input::-webkit-outer-spin-button,
.grid-price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.grid-price-input[type=number] {
  -moz-appearance: textfield;
}

.grid-delete-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #FED7D7;
  background: #FFF5F5;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-delete-btn:hover {
  background: #FED7D7;
  transform: scale(1.1);
}

/* Add Card */
.grid-add-card {
  background: linear-gradient(135deg, #FDFAF6 0%, #FAF7F2 100%);
  border: 2px dashed rgba(183, 152, 72, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.grid-add-card:hover {
  border-color: #B79848;
  transform: none;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
}

/* Responsive */
@media (max-width: 900px) {
  .table-header {
    grid-template-columns: 100px 1fr 100px 80px;
  }
  .table-header > *:nth-child(4),
  .table-header > *:nth-child(5) {
    display: none;
  }
}

@media (max-width: 1600px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .table-header {
    grid-template-columns: 75px 1fr 90px 60px;
    padding: 10px 12px;
    gap: 8px;
  }

  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .grid-info {
    padding: 8px;
  }

  .grid-name-input {
    font-size: 0.85rem;
  }

  .grid-row {
    flex-direction: column;
    gap: 5px;
  }

  .grid-price-input {
    width: 80px;
    font-size: 1.1rem;
  }
}
</style>

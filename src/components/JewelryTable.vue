<script setup>
import { ref } from 'vue'
import JewelryRow from './JewelryRow.vue'
import NewItemRow from './NewItemRow.vue'

defineProps({
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add', 'update', 'delete', 'upload-image'])

const viewMode = ref('list') // 'list' or 'grid'

const categories = [
  { value: 'rings', label: 'Anillos' },
  { value: 'necklaces', label: 'Collares' },
  { value: 'bracelets', label: 'Pulseras' },
  { value: 'earrings', label: 'Aretes' },
  { value: 'watches', label: 'Relojes' },
  { value: 'other', label: 'Otros' }
]

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : 'Otro'
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
          title="Vista Lista"
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
          title="Vista Grid"
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
        <div>SKU</div>
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
          @delete="emit('delete', item.id, item.image)"
          @upload-image="(file) => emit('upload-image', item.id, file)"
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
          <div class="grid-image">
            <img v-if="item.image" :src="item.image" :alt="item.name" />
            <div v-else class="grid-no-image">💎</div>
            <div class="grid-category">{{ getCategoryLabel(item.category) }}</div>
            <label class="grid-change-photo">
              <input
                type="file"
                accept="image/*"
                @change="(e) => e.target.files[0] && emit('upload-image', item.id, e.target.files[0])"
                hidden
              />
              📷
            </label>
          </div>

          <div class="grid-info">
            <input
              type="text"
              :value="item.name"
              class="grid-name-input"
              placeholder="Nombre"
              @blur="(e) => e.target.value !== item.name && emit('update', item.id, 'name', e.target.value)"
            />

            <div class="grid-row">
              <input
                type="text"
                :value="item.sku"
                class="grid-sku-input"
                placeholder="SKU"
                @blur="(e) => e.target.value !== item.sku && emit('update', item.id, 'sku', e.target.value)"
              />
              <select
                :value="item.category"
                class="grid-category-select"
                @change="(e) => emit('update', item.id, 'category', e.target.value)"
              >
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
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
                @click="emit('delete', item.id, item.image)"
                title="Eliminar"
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
  grid-template-columns: 180px 1fr 180px 160px 140px 100px;
  gap: 15px;
  padding: 18px 25px;
  background: linear-gradient(135deg, #FDFAF6 0%, #FAF7F2 100%);
  border-bottom: 1px solid rgba(183, 152, 72, 0.12);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
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

.grid-image {
  position: relative;
  width: 100%;
  height: 250px;
  background: #F9F9F9;
  overflow: hidden;
}

.grid-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #ddd;
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
}

.grid-change-photo {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.grid-image:hover .grid-change-photo {
  opacity: 1;
}

.grid-change-photo:hover {
  background: #B79848;
  transform: scale(1.1);
}

.grid-info {
  padding: 20px;
}

.grid-name-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  padding: 10px;
  border-radius: 8px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
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
  gap: 10px;
  margin-bottom: 15px;
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
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
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

@media (max-width: 600px) {
  .table-header {
    grid-template-columns: 75px 1fr 90px 60px;
    padding: 10px 12px;
    gap: 8px;
  }

  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }

  .grid-image {
    height: 180px;
  }

  .grid-info {
    padding: 15px;
  }

  .grid-name-input {
    font-size: 1rem;
  }

  .grid-row {
    flex-direction: column;
    gap: 8px;
  }

  .grid-price-input {
    width: 80px;
    font-size: 1.1rem;
  }
}
</style>

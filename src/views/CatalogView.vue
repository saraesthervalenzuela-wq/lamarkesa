<script setup>
import { ref, onMounted } from 'vue'
import { useJewelry } from '../composables/useJewelry'

const {
  loading,
  filteredJewelry,
  initializeListener,
  searchQuery,
  categoryFilter,
  sortBy
} = useJewelry()

const viewMode = ref('grid') // 'grid' or 'list'
const showLightbox = ref(false)
const lightboxProduct = ref(null)

const openLightbox = (product) => {
  if (product.image) {
    lightboxProduct.value = product
    showLightbox.value = true
  }
}

const closeLightbox = () => {
  showLightbox.value = false
  lightboxProduct.value = null
}

onMounted(() => {
  initializeListener()
})

// Categorías para el filtro
const categories = [
  { value: '', label: 'Todas las categorías' },
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
  <div class="catalog-container">
    <!-- Filters -->
    <div class="filters">
      <div class="filter-group search-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <select v-model="categoryFilter" class="filter-select">
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <select v-model="sortBy" class="filter-select">
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="price-high">Precio: Mayor a Menor</option>
          <option value="price-low">Precio: Menor a Mayor</option>
          <option value="name">Nombre A-Z</option>
        </select>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
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
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <!-- Products Grid View -->
    <div v-else-if="filteredJewelry.length > 0 && viewMode === 'grid'" class="products-grid">
      <div
        v-for="item in filteredJewelry"
        :key="item.id"
        class="product-card"
        @click="openLightbox(item)"
      >
        <div class="product-image">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
            loading="lazy"
          />
          <div v-else class="no-image">
            <span>💎</span>
          </div>
          <div class="product-category">
            {{ getCategoryLabel(item.category) }}
          </div>
          <div v-if="item.image" class="zoom-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ item.name || 'Sin nombre' }}</h3>
          <p v-if="item.sku" class="product-sku">SKU: {{ item.sku }}</p>
          <div class="product-footer">
            <span class="product-price">${{ item.price?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Products List View -->
    <div v-else-if="filteredJewelry.length > 0 && viewMode === 'list'" class="products-list">
      <div
        v-for="item in filteredJewelry"
        :key="item.id"
        class="list-item"
        @click="openLightbox(item)"
      >
        <div class="list-image">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
            loading="lazy"
          />
          <div v-else class="no-image-list">
            <span>💎</span>
          </div>
        </div>

        <div class="list-info">
          <div class="list-header">
            <h3 class="list-name">{{ item.name || 'Sin nombre' }}</h3>
            <span class="list-category">{{ getCategoryLabel(item.category) }}</span>
          </div>
          <p v-if="item.sku" class="list-sku">SKU: {{ item.sku }}</p>
        </div>

        <div class="list-price">${{ item.price?.toFixed(2) || '0.00' }}</div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p>No se encontraron productos</p>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="showLightbox && lightboxProduct" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
        <img :src="lightboxProduct.image" :alt="lightboxProduct.name" class="lightbox-image">
        <div class="lightbox-info">
          <h3>{{ lightboxProduct.name }}</h3>
          <p v-if="lightboxProduct.sku">SKU: {{ lightboxProduct.sku }}</p>
          <p class="lightbox-price">${{ lightboxProduct.price?.toFixed(2) || '0.00' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-container {
  min-height: 100vh;
  background: #F5F0EB;
  padding: 30px 20px;
  color: #333;
}

/* Filters */
.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 0 20px;
  align-items: center;
}

.filter-group {
  min-width: 180px;
}

.search-group {
  flex: 1;
  max-width: 350px;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  color: #333;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: #bbb;
}

.search-input:focus,
.filter-select:focus {
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.filter-select option {
  background: #fff;
  color: #333;
}

/* View Toggle */
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

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(183, 152, 72, 0.2);
  border-top-color: #B79848;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #999;
  font-weight: 300;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-card {
  background: #fff;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(183, 152, 72, 0.12);
}

.product-image {
  position: relative;
  width: 100%;
  height: 300px;
  background: #F9F9F9;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #ddd;
}

.product-category {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #B79848;
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.zoom-icon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #B79848;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-image:hover .zoom-icon {
  opacity: 1;
}

.product-info {
  padding: 22px;
}

.product-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.product-sku {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 15px;
  letter-spacing: 0.5px;
}

.product-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #F0F0F0;
}

.product-price {
  font-size: 1.4rem;
  font-weight: 600;
  color: #B79848;
}

/* Products List */
.products-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 15px 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.list-item:hover {
  box-shadow: 0 8px 25px rgba(183, 152, 72, 0.12);
  transform: translateX(5px);
}

.list-image {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #F9F9F9;
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-list {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #ddd;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.list-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.list-category {
  background: #B79848;
  color: #fff;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.list-sku {
  font-size: 0.8rem;
  color: #aaa;
  letter-spacing: 0.5px;
}

.list-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #B79848;
  min-width: 120px;
  text-align: right;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 1.1rem;
  font-weight: 300;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
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
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1002;
  line-height: 1;
}

.lightbox-close:hover {
  color: #B79848;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
}

.lightbox-info {
  margin-top: 25px;
  text-align: center;
  color: #fff;
}

.lightbox-info h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.lightbox-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
  font-size: 0.9rem;
}

.lightbox-price {
  color: #B79848 !important;
  font-size: 1.5rem !important;
  font-weight: 600;
  margin-top: 10px !important;
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    gap: 10px;
  }

  .filter-group {
    min-width: 140px;
    flex: 1;
  }

  .search-group {
    width: 100%;
    max-width: none;
    order: -1;
  }

  .view-toggle {
    margin-left: auto;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }

  .product-image {
    height: 200px;
  }

  .product-info {
    padding: 15px;
  }

  .product-name {
    font-size: 1.1rem;
  }

  .product-price {
    font-size: 1.15rem;
  }

  /* List responsive */
  .list-item {
    flex-wrap: wrap;
    padding: 15px;
    gap: 15px;
  }

  .list-image {
    width: 80px;
    height: 80px;
  }

  .list-info {
    flex: 1 1 calc(100% - 100px);
  }

  .list-name {
    font-size: 1.1rem;
  }

  .list-price {
    font-size: 1.2rem;
    min-width: auto;
    flex: 1;
    text-align: left;
  }
}
</style>

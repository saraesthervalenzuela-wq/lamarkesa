<script setup>
import { ref, computed, onMounted } from 'vue'
import { useJewelry } from '../composables/useJewelry'

const {
  loading,
  filteredJewelry,
  initializeListener,
  searchQuery,
  categoryFilter,
  sortBy
} = useJewelry()

const showWhatsAppModal = ref(false)
const selectedProduct = ref(null)

onMounted(() => {
  initializeListener()
})

const openWhatsApp = (product) => {
  selectedProduct.value = product
  showWhatsAppModal.value = true
}

const sendWhatsApp = () => {
  if (!selectedProduct.value) return

  const message = `Hola! Me interesa este producto:\n\n${selectedProduct.value.name}\nPrecio: $${selectedProduct.value.price}\n\n¿Podrías darme más información?`

  // Reemplaza con tu número de WhatsApp (formato internacional sin +)
  const phoneNumber = '1234567890' // TODO: Configura tu número aquí

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')

  showWhatsAppModal.value = false
  selectedProduct.value = null
}

// Categorías para el filtro
const categories = [
  { value: '', label: 'Todas las categorías' },
  { value: 'ring', label: 'Anillos' },
  { value: 'necklace', label: 'Collares' },
  { value: 'bracelet', label: 'Pulseras' },
  { value: 'earring', label: 'Aretes' },
  { value: 'other', label: 'Otros' }
]

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : 'Otro'
}
</script>

<template>
  <div class="catalog-container">
    <!-- Header -->
    <header class="catalog-header">
      <h1>💎 Catálogo de Joyería</h1>
      <p>Encuentra la pieza perfecta para ti</p>
    </header>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
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
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <!-- Products Grid -->
    <div v-else-if="filteredJewelry.length > 0" class="products-grid">
      <div
        v-for="item in filteredJewelry"
        :key="item.id"
        class="product-card"
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
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ item.name || 'Sin nombre' }}</h3>
          <p v-if="item.sku" class="product-sku">SKU: {{ item.sku }}</p>
          <div class="product-footer">
            <span class="product-price">${{ item.price?.toFixed(2) || '0.00' }}</span>
            <button @click="openWhatsApp(item)" class="whatsapp-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Preguntar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p>No se encontraron productos</p>
    </div>

    <!-- WhatsApp Modal -->
    <div v-if="showWhatsAppModal" class="modal-overlay" @click="showWhatsAppModal = false">
      <div class="modal-content" @click.stop>
        <h3>Consultar por WhatsApp</h3>
        <p v-if="selectedProduct">
          ¿Deseas consultar sobre <strong>{{ selectedProduct.name }}</strong>?
        </p>
        <div class="modal-actions">
          <button @click="showWhatsAppModal = false" class="btn-cancel">
            Cancelar
          </button>
          <button @click="sendWhatsApp" class="btn-confirm">
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-container {
  min-height: 100vh;
  background: #F5F0EB;
  padding: 20px;
  color: #333;
}

.catalog-header {
  text-align: center;
  padding: 50px 20px;
  border-bottom: 1px solid rgba(183, 152, 72, 0.15);
  margin-bottom: 40px;
}

.catalog-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.8rem;
  font-weight: 600;
  color: #B79848;
  margin-bottom: 12px;
  letter-spacing: 3px;
}

.catalog-header p {
  color: #999;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 1px;
}

/* Filters */
.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  max-width: 1400px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #F0F0F0;
}

.product-price {
  font-size: 1.4rem;
  font-weight: 600;
  color: #B79848;
}

.whatsapp-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.whatsapp-btn:hover {
  background: #20bd5a;
  transform: scale(1.05);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 1.1rem;
  font-weight: 300;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 35px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  color: #333;
  margin-bottom: 15px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
}

.modal-content p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #F5F5F5;
  color: #666;
}

.btn-cancel:hover {
  background: #EBEBEB;
}

.btn-confirm {
  background: #25D366;
  color: white;
}

.btn-confirm:hover {
  background: #20bd5a;
}

/* Responsive */
@media (max-width: 768px) {
  .catalog-header h1 {
    font-size: 2rem;
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

  .whatsapp-btn {
    padding: 8px 14px;
    font-size: 0.8rem;
  }
}
</style>

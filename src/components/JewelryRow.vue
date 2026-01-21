<script setup>
import { ref, computed } from 'vue'
import ImageCarousel from './ImageCarousel.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'delete', 'add-images', 'delete-image'])

// Computed para obtener las imágenes (compatibilidad con campo antiguo 'image')
const itemImages = computed(() => {
  if (props.item.images && props.item.images.length > 0) {
    return props.item.images
  }
  if (props.item.image) {
    return [props.item.image]
  }
  return []
})

const categories = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'chains', label: 'Chains' },
  { value: 'pendants', label: 'Pendants' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]

// Materials
const materials = [
  { value: '', label: 'Sin material' },
  { value: 'solid_gold', label: 'Solid Gold' },
  { value: 'hollow', label: 'Hollow Gold' },
  { value: 'vermeil', label: 'Vermeil' },
  { value: 'sterling_silver', label: '925 Sterling Silver' },
  { value: 'lab_grown', label: 'Lab Grown' },
  { value: 'rhodium_plating', label: 'Rhodium Plating' }
]

// Karats based on material
const karatOptions = {
  solid_gold: [
    { value: '', label: 'Sin quilate' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' }
  ],
  hollow: [
    { value: '', label: 'Sin quilate' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' },
    { value: '18k', label: '18k' }
  ],
  vermeil: [
    { value: '', label: 'Sin quilate' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' },
    { value: '18k', label: '18k' }
  ],
  rhodium_plating: [
    { value: '', label: 'Sin quilate' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' },
    { value: '18k', label: '18k' }
  ]
}

// Gold colors (only for solid_gold)
const goldColors = [
  { value: '', label: 'Sin color' },
  { value: 'yellow', label: 'Yellow Gold' },
  { value: 'white', label: 'White Gold' },
  { value: 'tri_tone', label: 'Tri-tone Gold' }
]

// Special collections
const specialCollections = [
  { value: '', label: 'Sin colección' },
  { value: 'bridal_sets', label: 'Bridal Sets' },
  { value: 'engagement_rings', label: 'Engagement Rings' },
  { value: 'wedding_band', label: 'Wedding Band' },
  { value: 'religious', label: 'Religious' },
  { value: 'letters', label: 'Letters' }
]

// Stone types (for vermeil)
const stoneTypes = [
  { value: '', label: 'Sin piedra' },
  { value: 'cz', label: 'CZ' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'sapphire', label: 'Sapphire' },
  { value: 'amethyst', label: 'Amethyst' },
  { value: 'other', label: 'Other' }
]

// Computed properties for showing/hiding fields
const showKarat = computed(() => {
  const mat = props.item.material
  return mat === 'solid_gold' || mat === 'hollow' || mat === 'vermeil' || mat === 'rhodium_plating'
})

const showGoldColor = computed(() => {
  return props.item.material === 'solid_gold'
})

const showStoneType = computed(() => {
  return props.item.material === 'vermeil'
})

const availableKarats = computed(() => {
  return karatOptions[props.item.material] || []
})

const handleAddImages = (files) => {
  emit('add-images', files)
}

const handleDeleteImage = (index) => {
  emit('delete-image', index)
}

const confirmDelete = () => {
  if (confirm('Delete this item?')) {
    emit('delete')
  }
}
</script>

<template>
  <div class="table-row">
    <div class="row-image-container">
      <ImageCarousel
        :images="itemImages"
        :item-name="item.name"
        :item-sku="item.sku"
        :item-price="item.price"
        size="normal"
        @add-images="handleAddImages"
        @delete-image="handleDeleteImage"
      />
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

    <!-- Material -->
    <select
      class="material-select"
      :value="item.material || ''"
      @change="emit('update', 'material', $event.target.value)"
    >
      <option v-for="mat in materials" :key="mat.value" :value="mat.value">
        {{ mat.label }}
      </option>
    </select>

    <!-- Karat (conditional) -->
    <select
      v-if="showKarat"
      class="karat-select"
      :value="item.karat || ''"
      @change="emit('update', 'karat', $event.target.value)"
    >
      <option v-for="k in availableKarats" :key="k.value" :value="k.value">
        {{ k.label }}
      </option>
    </select>
    <div v-else class="placeholder-cell">-</div>

    <!-- Gold Color (conditional) -->
    <select
      v-if="showGoldColor"
      class="color-select"
      :value="item.goldColor || ''"
      @change="emit('update', 'goldColor', $event.target.value)"
    >
      <option v-for="gc in goldColors" :key="gc.value" :value="gc.value">
        {{ gc.label }}
      </option>
    </select>
    <!-- Stone Type (for Vermeil) -->
    <select
      v-else-if="showStoneType"
      class="stone-select"
      :value="item.stoneType || ''"
      @change="emit('update', 'stoneType', $event.target.value)"
    >
      <option v-for="st in stoneTypes" :key="st.value" :value="st.value">
        {{ st.label }}
      </option>
    </select>
    <div v-else class="placeholder-cell">-</div>

    <!-- Special Collection -->
    <select
      class="collection-select"
      :value="item.specialCollection || ''"
      @change="emit('update', 'specialCollection', $event.target.value)"
    >
      <option v-for="col in specialCollections" :key="col.value" :value="col.value">
        {{ col.label }}
      </option>
    </select>

    <!-- Size -->
    <input
      type="text"
      class="editable-field size-field"
      :value="item.size || ''"
      placeholder="Talla"
      @change="emit('update', 'size', $event.target.value)"
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
.table-row {
  display: grid;
  grid-template-columns: 120px minmax(180px, 1.5fr) 120px 130px 80px 110px 130px 70px 90px 90px;
  gap: 12px;
  padding: 15px 25px;
  border-bottom: 1px solid #F0F0F0;
  align-items: center;
  transition: background 0.2s;
}

.table-row:hover {
  background: #FDFCFA;
}

.row-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
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

.collection-select {
  background: transparent;
  border: 1px solid transparent;
  padding: 10px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.collection-select:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.collection-select:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.collection-select option {
  background: #fff;
  color: #333;
}

.material-select,
.karat-select,
.color-select,
.stone-select {
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 10px;
  border-radius: 8px;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.material-select:hover,
.karat-select:hover,
.color-select:hover,
.stone-select:hover {
  background: #FAFAFA;
  border-color: #E8E8E8;
}

.material-select:focus,
.karat-select:focus,
.color-select:focus,
.stone-select:focus {
  outline: none;
  background: #fff;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.material-select option,
.karat-select option,
.color-select option,
.stone-select option {
  background: #fff;
  color: #333;
}

.placeholder-cell {
  color: #ccc;
  text-align: center;
  font-size: 0.85rem;
}

.size-field {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

.comment-field {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.comment-field::placeholder {
  color: #bbb;
  font-style: italic;
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
}
</style>

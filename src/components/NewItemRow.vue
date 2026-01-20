<script setup>
import { ref } from 'vue'

defineProps({
  gridMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add'])

const name = ref('')
const category = ref('rings')
const collection = ref('')
const sku = ref('')
const price = ref('')
const comment = ref('')

const categories = [
  { value: 'rings', label: 'Anillos' },
  { value: 'necklaces', label: 'Collares' },
  { value: 'earrings', label: 'Aretes' },
  { value: 'bracelets', label: 'Pulseras' },
  { value: 'watches', label: 'Relojes' },
  { value: 'other', label: 'Otros' }
]

const collections = [
  { value: '', label: 'Sin colección' },
  { value: 'vermeil', label: 'Vermeil' },
  { value: 'solid_gold', label: 'Solid Gold' },
  { value: 'bridal_sets', label: 'Bridal Sets' },
  { value: 'engagement_rings', label: 'Engagement Rings' },
  { value: 'wedding_band', label: 'Wedding Band' }
]

const addItem = () => {
  if (!name.value.trim()) return

  emit('add', {
    name: name.value.trim(),
    category: category.value,
    collection: collection.value,
    sku: sku.value.trim(),
    price: parseFloat(price.value) || 0,
    comment: comment.value.trim(),
    image: ''
  })

  // Reset form
  name.value = ''
  collection.value = ''
  sku.value = ''
  price.value = ''
  comment.value = ''
}

const handleKeypress = (event) => {
  if (event.key === 'Enter') {
    addItem()
  }
}
</script>

<template>
  <!-- Grid Mode -->
  <div v-if="gridMode" class="grid-add-form">
    <div class="grid-add-icon">+</div>
    <h4>Agregar Producto</h4>

    <input
      type="text"
      class="grid-input"
      v-model="name"
      placeholder="Nombre del producto..."
      @keypress="handleKeypress"
    />

    <select class="grid-select" v-model="category">
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>

    <select class="grid-select" v-model="collection">
      <option v-for="col in collections" :key="col.value" :value="col.value">
        {{ col.label }}
      </option>
    </select>

    <input
      type="text"
      class="grid-input"
      v-model="sku"
      placeholder="SKU (opcional)"
    />

    <input
      type="number"
      class="grid-input grid-price"
      v-model="price"
      placeholder="Precio"
      step="0.01"
      @keypress="handleKeypress"
    />

    <input
      type="text"
      class="grid-input"
      v-model="comment"
      placeholder="Comentario (opcional)"
    />

    <button class="grid-add-btn" @click="addItem">
      Agregar
    </button>
  </div>

  <!-- List Mode (Table Row) -->
  <div v-else class="new-row">
    <button class="add-btn" @click="addItem" title="Add new item">+</button>

    <input
      type="text"
      class="editable-field name-field"
      v-model="name"
      placeholder="Nombre del producto..."
      @keypress="handleKeypress"
    >

    <select class="category-select" v-model="category">
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>

    <select class="collection-select" v-model="collection">
      <option v-for="col in collections" :key="col.value" :value="col.value">
        {{ col.label }}
      </option>
    </select>

    <input
      type="text"
      class="editable-field sku-field"
      v-model="sku"
      placeholder="SKU"
    >

    <input
      type="number"
      class="editable-field price-field"
      v-model="price"
      placeholder="0.00"
      step="0.01"
      @keypress="handleKeypress"
    >

    <input
      type="text"
      class="editable-field comment-field"
      v-model="comment"
      placeholder="Comentario..."
    >

    <button class="btn btn-primary btn-small" @click="addItem">Agregar</button>
  </div>
</template>

<style scoped>
/* Grid Mode Styles */
.grid-add-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 25px;
  gap: 12px;
  width: 100%;
}

.grid-add-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px dashed rgba(183, 152, 72, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #B79848;
  margin-bottom: 5px;
}

.grid-add-form h4 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.grid-input,
.grid-select {
  width: 100%;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s;
}

.grid-input:focus,
.grid-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-input::placeholder {
  color: #bbb;
}

.grid-price {
  color: #B79848;
  font-weight: 600;
}

.grid-add-btn {
  width: 100%;
  padding: 14px;
  background: #B79848;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.grid-add-btn:hover {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(183, 152, 72, 0.25);
}

/* List Mode (Table Row) Styles */
.new-row {
  display: grid;
  grid-template-columns: 120px minmax(150px, 1fr) 120px 130px 100px 80px 140px 80px;
  gap: 10px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #FDFAF6 0%, #FAF7F2 100%);
  border-top: 1px dashed rgba(183, 152, 72, 0.3);
  align-items: center;
}

.add-btn {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  border: 2px dashed rgba(183, 152, 72, 0.4);
  background: transparent;
  color: #B79848;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: rgba(183, 152, 72, 0.08);
  border-style: solid;
  border-color: #B79848;
}

.editable-field {
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 10px 12px;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.2s;
}

.editable-field:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.editable-field::placeholder {
  color: #bbb;
}

.name-field {
  font-weight: 500;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
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
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 10px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.category-select option {
  background: #fff;
  color: #333;
}

.collection-select {
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 10px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.collection-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.collection-select option {
  background: #fff;
  color: #333;
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

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: #B79848;
  color: #fff;
}

.btn-primary:hover {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(183, 152, 72, 0.25);
}

.btn-small {
  padding: 10px 18px;
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .new-row {
    grid-template-columns: 100px 1fr 100px 80px;
  }
  .add-btn {
    width: 90px;
    height: 90px;
  }
  .new-row > *:nth-child(4),
  .new-row > *:nth-child(5) {
    display: none;
  }
}

@media (max-width: 600px) {
  .new-row {
    grid-template-columns: 75px 1fr 90px 60px;
    padding: 10px 12px;
    gap: 8px;
  }
  .add-btn {
    width: 70px;
    height: 70px;
  }

  .grid-add-form {
    padding: 20px 15px;
  }
}
</style>

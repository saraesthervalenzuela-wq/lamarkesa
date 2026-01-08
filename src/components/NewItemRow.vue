<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])

const name = ref('')
const category = ref('rings')
const sku = ref('')
const price = ref('')

const categories = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]

const addItem = () => {
  if (!name.value.trim()) return

  emit('add', {
    name: name.value.trim(),
    category: category.value,
    sku: sku.value.trim(),
    price: parseFloat(price.value) || 0,
    image: ''
  })

  // Reset form
  name.value = ''
  sku.value = ''
  price.value = ''
}

const handleKeypress = (event) => {
  if (event.key === 'Enter') {
    addItem()
  }
}
</script>

<template>
  <div class="new-row">
    <button class="add-btn" @click="addItem" title="Add new item">+</button>

    <input
      type="text"
      class="editable-field name-field"
      v-model="name"
      placeholder="New jewelry name..."
      @keypress="handleKeypress"
    >

    <select class="category-select" v-model="category">
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
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

    <button class="btn btn-primary btn-small" @click="addItem">Add</button>
  </div>
</template>

<style scoped>
.new-row {
  display: grid;
  grid-template-columns: 180px 1fr 180px 160px 140px 100px;
  gap: 15px;
  padding: 18px 25px;
  background: rgba(212, 175, 55, 0.05);
  border-top: 1px dashed rgba(212, 175, 55, 0.3);
  align-items: center;
}

.add-btn {
  width: 170px;
  height: 170px;
  border-radius: 8px;
  border: 2px dashed rgba(212, 175, 55, 0.4);
  background: transparent;
  color: #d4af37;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-style: solid;
}

.editable-field {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 10px;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.2s;
}

.editable-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.5);
}

.name-field {
  font-weight: 500;
}

.price-field {
  color: #d4af37;
  font-weight: 600;
  text-align: right;
}

.sku-field {
  font-family: monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.category-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 10px;
  border-radius: 6px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
}

.category-select option {
  background: #1a1a2e;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: #1a1a2e;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

.btn-small {
  padding: 6px 12px;
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
}
</style>

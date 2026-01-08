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
  background: linear-gradient(135deg, #FDFAF6 0%, #FAF7F2 100%);
  border-top: 1px dashed rgba(183, 152, 72, 0.3);
  align-items: center;
}

.add-btn {
  width: 170px;
  height: 170px;
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
}
</style>

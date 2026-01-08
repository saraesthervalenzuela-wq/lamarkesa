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
</script>

<template>
  <div class="jewelry-table">
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
</template>

<style scoped>
.jewelry-table {
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: 30px;
}

.table-header {
  display: grid;
  grid-template-columns: 180px 1fr 180px 160px 140px 100px;
  gap: 15px;
  padding: 18px 25px;
  background: rgba(212, 175, 55, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top-color: #d4af37;
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
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.7);
}

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
}
</style>

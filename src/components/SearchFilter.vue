<script setup>
const searchQuery = defineModel('searchQuery', { type: String, default: '' })
const categoryFilter = defineModel('categoryFilter', { type: String, default: '' })
const sortBy = defineModel('sortBy', { type: String, default: 'newest' })

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'name', label: 'Name A-Z' }
]
</script>

<template>
  <div class="search-filter">
    <div class="search-box">
      <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by name or SKU..."
      >
    </div>
    <select class="filter-select" v-model="categoryFilter">
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>
    <select class="filter-select" v-model="sortBy">
      <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.search-filter {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 350px;
}

.search-box input {
  width: 100%;
  padding: 12px 18px 12px 45px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-box input:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
}

.filter-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select option {
  background: #1a1a2e;
}

.filter-select:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5);
}
</style>

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
  padding: 14px 18px 14px 45px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 25px;
  color: #333;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-box input::placeholder {
  color: #bbb;
}

.search-box input:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #bbb;
}

.filter-select {
  padding: 14px 20px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 25px;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select option {
  background: #fff;
  color: #333;
}

.filter-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.filter-select:hover {
  border-color: #B79848;
}
</style>

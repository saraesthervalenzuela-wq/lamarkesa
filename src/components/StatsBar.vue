<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const formatCurrency = (value) => {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0 })
}
</script>

<template>
  <div class="stats-bar">
    <div class="stat">
      <div class="stat-value">{{ stats.total }}</div>
      <div class="stat-label">Total Pieces</div>
    </div>
    <div class="stat">
      <div class="stat-value">{{ formatCurrency(stats.totalValue) }}</div>
      <div class="stat-label">Total Value</div>
    </div>
    <div class="stat">
      <div class="stat-value">{{ formatCurrency(stats.avgPrice) }}</div>
      <div class="stat-label">Average Price</div>
    </div>
  </div>
</template>

<style scoped>
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
  padding: 15px 25px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  color: #d4af37;
  font-weight: 600;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

@media (max-width: 600px) {
  .stats-bar {
    gap: 10px;
  }
  .stat {
    padding: 12px 18px;
  }
  .stat-value {
    font-size: 1.3rem;
  }
}
</style>

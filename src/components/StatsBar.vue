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
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
  padding: 20px 30px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(183, 152, 72, 0.15);
  box-shadow: 0 4px 15px rgba(183, 152, 72, 0.06);
}

.stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  color: #B79848;
  font-weight: 600;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .stats-bar {
    gap: 10px;
  }
  .stat {
    padding: 15px 20px;
    flex: 1;
    min-width: 100px;
  }
  .stat-value {
    font-size: 1.4rem;
  }
}
</style>

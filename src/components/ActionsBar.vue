<script setup>
import { ref } from 'vue'

const emit = defineEmits(['export-csv', 'export-json', 'export-shopify', 'clear-all', 'import-excel', 'ai-import', 'image-analyzer', 'photo-matcher'])

const fileInput = ref(null)

const handleImportClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('import-excel', file)
  }
  event.target.value = ''
}
</script>

<template>
  <div class="actions-bar">
    <button class="btn btn-ai" @click="emit('ai-import')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z"/>
      </svg>
      AI Import
    </button>

    <button class="btn btn-vision" @click="emit('image-analyzer')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      📷 Analyze Photos
    </button>

    <button class="btn btn-matcher" @click="emit('photo-matcher')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      </svg>
      🔗 Match Photos
    </button>

    <button class="btn btn-secondary" @click="handleImportClick">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
      </svg>
      Import Excel
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      class="hidden"
      @change="handleFileChange"
    >

    <button class="btn btn-secondary" @click="emit('export-csv')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
      Export CSV
    </button>

    <button class="btn btn-secondary" @click="emit('export-json')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6"/>
      </svg>
      Export JSON
    </button>

    <button class="btn btn-shopify" @click="emit('export-shopify')">
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-.637-.637-.781-.781c-.02-.021-.043-.039-.066-.054l-1.604 24.454zm-1.032-16.759c0-.08-.138-.122-.138-.122s-.291-1.161-1.076-1.781c-.785-.621-2.234-.494-2.234-.494-.098-.283-.224-.568-.368-.845 1.015-.317 1.786-.93 2.263-1.675.494-.77.689-1.756.548-2.774-.109-.787-.446-1.471-.945-1.989-.499-.518-1.175-.911-1.965-1.075-1.539-.32-3.191.238-4.376 1.354-.99.931-1.644 2.241-1.815 3.635-.145-.002-.29-.002-.436.001-1.334.031-2.441.597-3.182 1.482-.741.886-1.117 2.109-1.041 3.503.075 1.394.581 2.73 1.432 3.76.851 1.031 2.019 1.712 3.309 1.902.047.143.098.283.152.419-.021 0-.042.001-.063.001-1.202.021-2.189.464-2.867 1.227-.678.763-1.046 1.858-.968 3.028.077 1.171.516 2.265 1.217 3.079.7.814 1.64 1.379 2.647 1.515 1.156.156 2.326-.15 3.179-.883.731-.629 1.171-1.437 1.261-2.239.089-.804-.09-1.547-.503-2.125-.259-.36-.588-.688-.979-.976-.231.017-.423.025-.574.025-.107 0-.199-.003-.277-.01-.004.055-.009.11-.016.163-.132.993-.622 1.905-1.346 2.526-.724.621-1.667.974-2.579.927-.912-.048-1.757-.474-2.388-1.189-.63-.714-1.044-1.711-1.101-2.787-.056-1.076.259-2.089.856-2.869.597-.78 1.44-1.299 2.351-1.404.052-.006.103-.011.154-.014.219 1.038.782 1.777 1.627 2.149.809.355 1.802.354 2.785-.036.155-.061.311-.133.464-.216.098.189.169.391.212.602.062.302.068.62.017.951-.051.331-.159.677-.325 1.032-.165.355-.387.72-.668 1.09-.281.37-.62.745-1.021 1.121-.401.376-.864.752-1.392 1.122l1.463 1.561s1.197-.851 1.993-1.676c.796-.825 1.373-1.617 1.739-2.403.366-.786.521-1.566.475-2.329-.046-.763-.293-1.509-.741-2.23-.225-.361-.51-.702-.857-1.02.166-.082.334-.173.5-.274.645-.388 1.225-.902 1.645-1.484.42-.583.683-1.235.783-1.897.1-.662.037-1.335-.197-1.962-.234-.627-.635-1.208-1.189-1.698-.553-.489-1.26-.888-2.101-1.161-.201-.065-.411-.12-.628-.165.024-.097.041-.197.051-.298.072-.752-.107-1.491-.505-2.098-.398-.607-.976-1.081-1.675-1.322-.698-.241-1.517-.25-2.269-.026-.753.225-1.441.682-1.935 1.303-.494.62-.795 1.407-.842 2.214-.047.808.145 1.635.544 2.309.399.673.987 1.193 1.696 1.467-.03.032-.059.065-.087.1l-.001.001c-.344.418-.569.907-.663 1.425-.095.518-.059 1.064.114 1.584.04.12.088.237.142.351-.163-.015-.326-.023-.489-.023-1.417 0-2.694.567-3.624 1.488-.929.922-1.512 2.189-1.569 3.595-.057 1.406.411 2.844 1.315 3.987.904 1.143 2.245 1.992 3.721 2.286.249.05.499.082.748.095.128.387.324.736.578 1.039.591.704 1.398 1.161 2.27 1.265.872.104 1.809-.148 2.549-.732.741-.584 1.285-1.456 1.413-2.42"/>
      </svg>
      Shopify Export
    </button>

    <button class="btn btn-danger" @click="emit('clear-all')">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
      </svg>
      Clear All
    </button>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}

.actions-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.3px;
}

.btn-secondary {
  background: #fff;
  color: #666;
  border: 1px solid #E8E8E8;
}

.btn-secondary:hover {
  background: #FAFAFA;
  border-color: #B79848;
  color: #B79848;
}

.btn-danger {
  background: #FFF5F5;
  color: #C53030;
  border: 1px solid #FED7D7;
}

.btn-danger:hover {
  background: #FED7D7;
}

.btn-ai {
  background: #B79848;
  color: #fff;
  border: none;
}

.btn-ai:hover {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(183, 152, 72, 0.25);
}

.btn-vision {
  background: linear-gradient(135deg, #D4A5A5 0%, #C49A9A 100%);
  color: #fff;
  border: none;
}

.btn-vision:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 165, 165, 0.35);
}

.btn-matcher {
  background: linear-gradient(135deg, #9CB4A5 0%, #8AA599 100%);
  color: #fff;
  border: none;
}

.btn-matcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(156, 180, 165, 0.35);
}

.btn-shopify {
  background: linear-gradient(135deg, #95BF47 0%, #7AB55C 100%);
  color: #fff;
  border: none;
}

.btn-shopify:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(149, 191, 71, 0.35);
}

@media (max-width: 600px) {
  .actions-bar {
    flex-direction: column;
  }
  .btn {
    justify-content: center;
  }
}
</style>

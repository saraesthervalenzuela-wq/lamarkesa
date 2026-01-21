<script setup>
import { ref, onMounted } from 'vue'
import { useJewelry } from '../composables/useJewelry'
import StatsBar from '../components/StatsBar.vue'
import ActionsBar from '../components/ActionsBar.vue'
import SearchFilter from '../components/SearchFilter.vue'
import JewelryTable from '../components/JewelryTable.vue'
import AIImportModal from '../components/AIImportModal.vue'
import ImageAnalyzerModal from '../components/ImageAnalyzerModal.vue'
import PhotoMatcherModal from '../components/PhotoMatcherModal.vue'
import SettingsModal from '../components/SettingsModal.vue'
import CategoryManagerModal from '../components/CategoryManagerModal.vue'

const showAIModal = ref(false)
const showImageAnalyzer = ref(false)
const showPhotoMatcher = ref(false)
const showSettings = ref(false)
const showCategoryManager = ref(false)

const {
  loading,
  searchQuery,
  categoryFilter,
  sortBy,
  stats,
  filteredJewelry,
  initializeListener,
  addJewelry,
  updateJewelry,
  deleteJewelry,
  uploadImage,
  addImagesToJewelry,
  removeImageFromJewelry,
  getImages,
  clearAll,
  exportToCSV,
  exportToJSON,
  exportToShopify
} = useJewelry()

onMounted(() => {
  initializeListener()
})

// Handlers
const handleAdd = async (item) => {
  try {
    await addJewelry(item)
  } catch (error) {
    alert('Error adding item: ' + error.message)
  }
}

const handleUpdate = async (id, field, value) => {
  try {
    await updateJewelry(id, { [field]: value })
  } catch (error) {
    alert('Error updating item: ' + error.message)
  }
}

const handleDelete = async (id, images) => {
  try {
    await deleteJewelry(id, images)
  } catch (error) {
    alert('Error deleting item: ' + error.message)
  }
}

// Agregar múltiples imágenes a un producto
const handleAddImages = async (id, files) => {
  try {
    console.log('handleAddImages called:', id, files)
    // Obtener imágenes actuales del producto
    const item = filteredJewelry.value.find(j => j.id === id)
    if (!item) {
      console.error('Item not found:', id)
      return
    }
    const currentImages = getImages(item) || []
    console.log('Current images:', currentImages)
    await addImagesToJewelry(id, files, currentImages)
    console.log('Images added successfully')
  } catch (error) {
    console.error('Error in handleAddImages:', error)
    alert('Error uploading images: ' + error.message)
  }
}

// Eliminar una imagen específica de un producto
const handleDeleteImage = async (id, imageIndex) => {
  try {
    const item = filteredJewelry.value.find(j => j.id === id)
    const currentImages = getImages(item)
    await removeImageFromJewelry(id, imageIndex, currentImages)
  } catch (error) {
    alert('Error deleting image: ' + error.message)
  }
}

const handleClearAll = async () => {
  if (!confirm('Delete ALL items? This cannot be undone.')) return
  try {
    await clearAll()
  } catch (error) {
    alert('Error clearing items: ' + error.message)
  }
}

const handleExportCSV = () => {
  const csv = exportToCSV()
  if (!csv) {
    alert('No jewelry to export')
    return
  }
  downloadFile(csv, 'jewelry.csv', 'text/csv')
}

const handleExportJSON = () => {
  const json = exportToJSON()
  if (!json) {
    alert('No jewelry to export')
    return
  }
  downloadFile(json, 'jewelry.json', 'application/json')
}

const handleExportShopify = () => {
  const csv = exportToShopify()
  if (!csv) {
    alert('No jewelry to export')
    return
  }
  downloadFile(csv, 'shopify-products.csv', 'text/csv')
}

const handleImportExcel = async (file) => {
  try {
    const XLSX = (await import('xlsx')).default || (await import('xlsx'))
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        let imported = 0

        // Leer todas las hojas del Excel
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) continue

          const cols = Object.keys(jsonData[0])
          const nameCol = cols.find(c => /name|nombre|item|producto|description/i.test(c))
          const priceCol = cols.find(c => /price|precio|cost|costo|value/i.test(c))

          for (const row of jsonData) {
            const name = row[nameCol] || row[cols[0]]
            let price = row[priceCol] || 0
            if (typeof price === 'string') {
              price = parseFloat(price.replace(/[^0-9.-]/g, '')) || 0
            }

            if (name) {
              await addJewelry({
                name: String(name).trim(),
                category: 'other',
                price: price,
                sku: '',
                image: ''
              })
              imported++
            }
          }
        }

        if (imported === 0) {
          alert('No data found in file')
          return
        }

        alert(`Imported ${imported} items from ${workbook.SheetNames.length} sheet(s)!`)
      } catch (error) {
        alert('Error reading file: ' + error.message)
      }
    }

    reader.readAsArrayBuffer(file)
  } catch (error) {
    alert('Error importing file: ' + error.message)
  }
}

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// AI Import
const handleAIImport = async (items) => {
  try {
    let imported = 0
    for (const item of items) {
      await addJewelry({
        name: item.name || 'Unnamed',
        category: item.category || 'other',
        price: parseFloat(item.price) || 0,
        sku: item.sku || '',
        image: ''
      })
      imported++
    }
    alert(`Imported ${imported} items!`)
  } catch (error) {
    alert('Error importing items: ' + error.message)
  }
}

// Image Analyzer Import (con fotos)
const handleImageAnalyzerImport = async (items) => {
  try {
    let imported = 0
    for (const item of items) {
      // Si tiene imagen base64, subirla a Firebase Storage
      let images = []
      if (item.image && item.image.startsWith('data:')) {
        // Convertir base64 a blob y subir
        const response = await fetch(item.image)
        const blob = await response.blob()
        const file = new File([blob], `jewelry-${Date.now()}.jpg`, { type: 'image/jpeg' })
        const docId = Date.now().toString()
        const imageUrl = await uploadImage(file, docId)
        images = [imageUrl]
      }

      await addJewelry({
        name: item.name || 'Joya sin nombre',
        category: item.category || 'other',
        price: parseFloat(item.price) || 0,
        sku: item.sku || '',
        images: images
      })
      imported++
    }
    alert(`Imported ${imported} items with images!`)
  } catch (error) {
    alert('Error importing items: ' + error.message)
  }
}

// Photo Matcher - assign photos to existing products
const handleAssignPhotos = async (assignments) => {
  try {
    let assigned = 0
    for (const { productId, photoDataUrl } of assignments) {
      // Upload photo to Firebase Storage
      const response = await fetch(photoDataUrl)
      const blob = await response.blob()
      const file = new File([blob], `jewelry-${productId}-${Date.now()}.jpg`, { type: 'image/jpeg' })

      // Obtener imágenes actuales del producto
      const item = filteredJewelry.value.find(j => j.id === productId)
      const currentImages = getImages(item)

      // Agregar la nueva imagen al array existente
      await addImagesToJewelry(productId, [file], currentImages)
      assigned++
    }
    alert(`Assigned ${assigned} photos to products!`)
  } catch (error) {
    alert('Error assigning photos: ' + error.message)
  }
}
</script>

<template>
  <div class="admin-container">
    <StatsBar :stats="stats" />

    <ActionsBar
      @export-csv="handleExportCSV"
      @export-json="handleExportJSON"
      @export-shopify="handleExportShopify"
      @clear-all="handleClearAll"
      @import-excel="handleImportExcel"
      @ai-import="showAIModal = true"
      @image-analyzer="showImageAnalyzer = true"
      @photo-matcher="showPhotoMatcher = true"
    />

    <SearchFilter
      v-model:searchQuery="searchQuery"
      v-model:categoryFilter="categoryFilter"
      v-model:sortBy="sortBy"
    />

    <JewelryTable
      :items="filteredJewelry"
      :loading="loading"
      @add="handleAdd"
      @update="handleUpdate"
      @delete="handleDelete"
      @add-images="handleAddImages"
      @delete-image="handleDeleteImage"
    />

    <!-- AI Import Modal -->
    <AIImportModal
      v-if="showAIModal"
      @close="showAIModal = false"
      @import="handleAIImport"
    />

    <!-- Image Analyzer Modal -->
    <ImageAnalyzerModal
      v-if="showImageAnalyzer"
      @close="showImageAnalyzer = false"
      @import="handleImageAnalyzerImport"
    />

    <!-- Photo Matcher Modal -->
    <PhotoMatcherModal
      v-if="showPhotoMatcher"
      :products="filteredJewelry"
      @close="showPhotoMatcher = false"
      @assign-photos="handleAssignPhotos"
    />

    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
    />

    <!-- Category Manager Modal -->
    <CategoryManagerModal
      v-if="showCategoryManager"
      @close="showCategoryManager = false"
    />

    <!-- FAB Buttons -->
    <div class="fab-container">
      <button class="fab-btn categories-fab" @click="showCategoryManager = true" title="Manage Categories">
        📁
      </button>
      <button class="fab-btn settings-fab" @click="showSettings = true" title="Settings">
        ⚙️
      </button>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 30px 20px;
}

.fab-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-fab {
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
}

.settings-fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.6);
}

.categories-fab {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.categories-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}

@media (max-width: 600px) {
  .admin-container {
    padding: 20px 15px;
  }

  .fab-container {
    bottom: 20px;
    right: 20px;
    gap: 10px;
  }

  .fab-btn {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
}
</style>

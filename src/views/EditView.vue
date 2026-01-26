<script setup>
import { ref, onMounted } from 'vue'
import { useJewelry } from '../composables/useJewelry'
import SearchFilter from '../components/SearchFilter.vue'
import JewelryTable from '../components/JewelryTable.vue'

const {
  loading,
  searchQuery,
  categoryFilter,
  sortBy,
  filteredJewelry,
  initializeListener,
  addJewelry,
  updateJewelry,
  deleteJewelry,
  uploadImage,
  addImagesToJewelry,
  removeImageFromJewelry,
  getImages
} = useJewelry()

onMounted(() => {
  initializeListener()
})

const handleAdd = async (item) => {
  try {
    const pendingImage = item._pendingImage
    delete item._pendingImage // Remove before saving to DB

    const newId = await addJewelry(item)

    // If there's a pending image, upload it
    if (pendingImage && newId) {
      await addImagesToJewelry(newId, [pendingImage], [])
    }
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

const handleDelete = async (id, imageUrl) => {
  try {
    await deleteJewelry(id, imageUrl)
  } catch (error) {
    alert('Error deleting item: ' + error.message)
  }
}

const handleUploadImage = async (id, file) => {
  try {
    const url = await uploadImage(file, id)
    await updateJewelry(id, { image: url })
  } catch (error) {
    alert('Error uploading image: ' + error.message)
  }
}

const handleAddImages = async (id, files) => {
  try {
    const item = filteredJewelry.value.find(j => j.id === id)
    const currentImages = getImages(item) || []
    await addImagesToJewelry(id, files, currentImages)
  } catch (error) {
    alert('Error uploading images: ' + error.message)
  }
}

const handleDeleteImage = async (id, imageIndex) => {
  try {
    const item = filteredJewelry.value.find(j => j.id === id)
    const currentImages = getImages(item)
    await removeImageFromJewelry(id, imageIndex, currentImages)
  } catch (error) {
    alert('Error deleting image: ' + error.message)
  }
}
</script>

<template>
  <div class="edit-container">
    <header class="header">
      <h1>Edit Inventory</h1>
      <p>Add products, change photos and update prices</p>
    </header>

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
      @upload-image="handleUploadImage"
      @add-images="handleAddImages"
      @delete-image="handleDeleteImage"
    />
  </div>
</template>

<style scoped>
.edit-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px 20px;
}

.header {
  text-align: center;
  padding: 40px 20px;
  border-bottom: 1px solid rgba(183, 152, 72, 0.15);
  margin-bottom: 30px;
}

.header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: #B79848;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.header p {
  color: #999;
  font-size: 0.95rem;
  font-weight: 300;
  letter-spacing: 0.5px;
}

@media (max-width: 600px) {
  .header h1 {
    font-size: 1.8rem;
  }

  .edit-container {
    padding: 15px 20px;
  }
}
</style>

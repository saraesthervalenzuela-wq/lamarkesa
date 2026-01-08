import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { db, storage } from '../firebase'

const jewelry = ref([])
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('newest')

// Inicializar listener de Firestore
let unsubscribe = null

export function useJewelry() {

  const initializeListener = () => {
    if (unsubscribe) return

    const q = query(collection(db, 'jewelry'), orderBy('createdAt', 'desc'))

    unsubscribe = onSnapshot(q, (snapshot) => {
      jewelry.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      loading.value = false
    }, (error) => {
      console.error('Error fetching jewelry:', error)
      loading.value = false
    })
  }

  // Estadísticas
  const stats = computed(() => {
    const total = jewelry.value.length
    const totalValue = jewelry.value.reduce((sum, item) => sum + (item.price || 0), 0)
    const avgPrice = total > 0 ? totalValue / total : 0
    return { total, totalValue, avgPrice }
  })

  // Items filtrados y ordenados
  const filteredJewelry = computed(() => {
    let items = [...jewelry.value]

    // Filtro de búsqueda
    if (searchQuery.value) {
      const search = searchQuery.value.toLowerCase()
      items = items.filter(item =>
        item.name?.toLowerCase().includes(search) ||
        item.sku?.toLowerCase().includes(search)
      )
    }

    // Filtro de categoría
    if (categoryFilter.value) {
      items = items.filter(item => item.category === categoryFilter.value)
    }

    // Ordenamiento
    switch (sortBy.value) {
      case 'newest':
        items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        break
      case 'oldest':
        items.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0))
        break
      case 'price-high':
        items.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'price-low':
        items.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'name':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
    }

    return items
  })

  // Agregar joya
  const addJewelry = async (item) => {
    try {
      const docRef = await addDoc(collection(db, 'jewelry'), {
        ...item,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error adding jewelry:', error)
      throw error
    }
  }

  // Actualizar joya
  const updateJewelry = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'jewelry', id), updates)
    } catch (error) {
      console.error('Error updating jewelry:', error)
      throw error
    }
  }

  // Eliminar joya
  const deleteJewelry = async (id, imageUrl) => {
    try {
      // Eliminar imagen si existe
      if (imageUrl && imageUrl.includes('firebase')) {
        try {
          // Extraer el path de la URL de Firebase Storage
          const url = new URL(imageUrl)
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/)
          if (pathMatch) {
            const path = decodeURIComponent(pathMatch[1])
            const imageRef = storageRef(storage, path)
            await deleteObject(imageRef)
          }
        } catch (e) {
          console.log('Image not found or already deleted:', e.message)
        }
      }
      await deleteDoc(doc(db, 'jewelry', id))
    } catch (error) {
      console.error('Error deleting jewelry:', error)
      throw error
    }
  }

  // Subir imagen
  const uploadImage = async (file, jewelryId) => {
    try {
      const fileRef = storageRef(storage, `jewelry/${jewelryId}/${file.name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      return url
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Limpiar todo
  const clearAll = async () => {
    try {
      const promises = jewelry.value.map(item => deleteJewelry(item.id, item.image))
      await Promise.all(promises)
    } catch (error) {
      console.error('Error clearing all:', error)
      throw error
    }
  }

  // Exportar a CSV
  const exportToCSV = () => {
    if (jewelry.value.length === 0) return null

    const headers = ['Name', 'Category', 'Price', 'SKU', 'Date']
    const rows = jewelry.value.map(item => [
      `"${item.name || ''}"`,
      item.category || '',
      item.price || 0,
      item.sku || '',
      item.createdAt?.toDate?.()?.toLocaleDateString('en-US') || ''
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  // Exportar a JSON
  const exportToJSON = () => {
    if (jewelry.value.length === 0) return null

    const data = jewelry.value.map(({ id, ...rest }) => ({
      ...rest,
      createdAt: rest.createdAt?.toDate?.()?.toISOString() || null
    }))
    return JSON.stringify(data, null, 2)
  }

  return {
    jewelry,
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
    clearAll,
    exportToCSV,
    exportToJSON
  }
}

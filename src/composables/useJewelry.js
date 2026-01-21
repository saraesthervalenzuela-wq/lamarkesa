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
const materialFilter = ref('')
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

    // Filtro de material
    if (materialFilter.value) {
      items = items.filter(item => item.material === materialFilter.value)
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

  // Helper para eliminar una imagen de Firebase Storage
  const deleteImageFromStorage = async (imageUrl) => {
    if (imageUrl && imageUrl.includes('firebase')) {
      try {
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
  }

  // Eliminar joya
  const deleteJewelry = async (id, images) => {
    try {
      // Eliminar todas las imágenes si existen
      if (images) {
        // Soporta tanto array como string individual (compatibilidad)
        const imageArray = Array.isArray(images) ? images : [images]
        for (const imageUrl of imageArray) {
          await deleteImageFromStorage(imageUrl)
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
      // Agregar timestamp para evitar colisiones de nombre
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const fileRef = storageRef(storage, `jewelry/${jewelryId}/${fileName}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      return url
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Subir múltiples imágenes
  const uploadMultipleImages = async (files, jewelryId) => {
    try {
      const urls = []
      for (const file of files) {
        const url = await uploadImage(file, jewelryId)
        urls.push(url)
      }
      return urls
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw error
    }
  }

  // Agregar imágenes a un producto existente
  const addImagesToJewelry = async (id, files, currentImages = []) => {
    try {
      const newUrls = await uploadMultipleImages(files, id)
      const updatedImages = [...currentImages, ...newUrls]
      await updateJewelry(id, { images: updatedImages })
      return updatedImages
    } catch (error) {
      console.error('Error adding images:', error)
      throw error
    }
  }

  // Eliminar una imagen específica de un producto
  const removeImageFromJewelry = async (id, imageIndex, currentImages) => {
    try {
      const imageUrl = currentImages[imageIndex]
      await deleteImageFromStorage(imageUrl)
      const updatedImages = currentImages.filter((_, i) => i !== imageIndex)
      await updateJewelry(id, { images: updatedImages })
      return updatedImages
    } catch (error) {
      console.error('Error removing image:', error)
      throw error
    }
  }

  // Helper para obtener imágenes (compatibilidad con campo 'image' antiguo)
  const getImages = (item) => {
    if (item.images && item.images.length > 0) {
      return item.images
    }
    // Compatibilidad con campo 'image' singular
    if (item.image) {
      return [item.image]
    }
    return []
  }

  // Limpiar todo
  const clearAll = async () => {
    try {
      const promises = jewelry.value.map(item => {
        // Usar images array si existe, de lo contrario usar image
        const images = item.images || (item.image ? [item.image] : [])
        return deleteJewelry(item.id, images)
      })
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

  // Exportar a Shopify CSV format
  const exportToShopify = () => {
    if (jewelry.value.length === 0) return null

    // Shopify required headers
    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Product Category',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Tracker',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Variant Fulfillment Service',
      'Variant Price',
      'Variant Compare At Price',
      'Variant Requires Shipping',
      'Variant Taxable',
      'Image Src',
      'Image Position',
      'Image Alt Text',
      'Gift Card',
      'SEO Title',
      'SEO Description',
      'Status'
    ]

    const categoryToType = {
      'rings': 'Rings',
      'necklaces': 'Necklaces',
      'earrings': 'Earrings',
      'bracelets': 'Bracelets',
      'watches': 'Watches',
      'other': 'Jewelry'
    }

    const rows = jewelry.value.map(item => {
      // Generate handle from name (URL-friendly)
      const handle = (item.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const type = categoryToType[item.category] || 'Jewelry'

      return [
        handle,                                    // Handle
        `"${(item.name || '').replace(/"/g, '""')}"`, // Title
        `"${(item.description || '').replace(/"/g, '""')}"`, // Body (HTML)
        'La Markesa',                              // Vendor
        'Apparel & Accessories > Jewelry',         // Product Category
        type,                                      // Type
        item.category || '',                       // Tags
        'TRUE',                                    // Published
        'Title',                                   // Option1 Name
        'Default Title',                           // Option1 Value
        item.sku || '',                            // Variant SKU
        '0',                                       // Variant Grams
        'shopify',                                 // Variant Inventory Tracker
        '1',                                       // Variant Inventory Qty
        'deny',                                    // Variant Inventory Policy
        'manual',                                  // Variant Fulfillment Service
        item.price || 0,                           // Variant Price
        '',                                        // Variant Compare At Price
        'TRUE',                                    // Variant Requires Shipping
        'TRUE',                                    // Variant Taxable
        item.image || '',                          // Image Src
        '1',                                       // Image Position
        `"${(item.name || '').replace(/"/g, '""')}"`, // Image Alt Text
        'FALSE',                                   // Gift Card
        `"${(item.name || '').replace(/"/g, '""')}"`, // SEO Title
        `"${(item.description || item.name || '').replace(/"/g, '""')}"`, // SEO Description
        'active'                                   // Status
      ]
    })

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  return {
    jewelry,
    loading,
    searchQuery,
    categoryFilter,
    materialFilter,
    sortBy,
    stats,
    filteredJewelry,
    initializeListener,
    addJewelry,
    updateJewelry,
    deleteJewelry,
    uploadImage,
    uploadMultipleImages,
    addImagesToJewelry,
    removeImageFromJewelry,
    getImages,
    clearAll,
    exportToCSV,
    exportToJSON,
    exportToShopify
  }
}

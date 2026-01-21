import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Default categories
const defaultCategories = [
  { value: 'rings', label: 'Anillos' },
  { value: 'necklaces', label: 'Collares' },
  { value: 'earrings', label: 'Aretes' },
  { value: 'bracelets', label: 'Pulseras' },
  { value: 'chains', label: 'Chains' },
  { value: 'pendants', label: 'Pendants' },
  { value: 'watches', label: 'Relojes' },
  { value: 'other', label: 'Otros' }
]

// Shared state across components
const categories = ref([...defaultCategories])
const isLoaded = ref(false)

export function useCategories() {
  const loading = ref(false)
  const error = ref(null)

  // Load categories from Firestore
  const loadCategories = async () => {
    if (isLoaded.value) return categories.value

    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'settings', 'categories')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists() && docSnap.data().list?.length > 0) {
        categories.value = docSnap.data().list
      } else {
        // Initialize with defaults if no categories exist
        categories.value = [...defaultCategories]
        await saveCategories(categories.value)
      }

      isLoaded.value = true
      return categories.value
    } catch (err) {
      console.error('Error loading categories:', err)
      error.value = err.message
      categories.value = [...defaultCategories]
      return categories.value
    } finally {
      loading.value = false
    }
  }

  // Save categories to Firestore
  const saveCategories = async (newCategories) => {
    loading.value = true
    error.value = null

    try {
      const docRef = doc(db, 'settings', 'categories')
      await setDoc(docRef, {
        list: newCategories,
        updatedAt: new Date().toISOString()
      })
      categories.value = newCategories
      return true
    } catch (err) {
      console.error('Error saving categories:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add a new category
  const addCategory = async (label) => {
    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')

    // Check if already exists
    if (categories.value.some(c => c.value === value || c.label.toLowerCase() === label.toLowerCase())) {
      throw new Error('Esta categoria ya existe')
    }

    const newCategories = [...categories.value, { value, label }]
    await saveCategories(newCategories)
    return { value, label }
  }

  // Delete a category
  const deleteCategory = async (value) => {
    const newCategories = categories.value.filter(c => c.value !== value)
    await saveCategories(newCategories)
  }

  // Update a category label
  const updateCategory = async (value, newLabel) => {
    const newCategories = categories.value.map(c =>
      c.value === value ? { ...c, label: newLabel } : c
    )
    await saveCategories(newCategories)
  }

  // Get categories with "all" option for filters
  const getCategoriesForFilter = () => {
    return [
      { value: '', label: 'Todas las categorias' },
      ...categories.value
    ]
  }

  return {
    categories,
    loading,
    error,
    loadCategories,
    saveCategories,
    addCategory,
    deleteCategory,
    updateCategory,
    getCategoriesForFilter,
    defaultCategories
  }
}

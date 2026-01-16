import { ref, computed } from 'vue'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const user = ref(null)
const loading = ref(true)
const userRole = ref(null) // 'admin' | 'editor' | null (public)
const userSettings = ref({
  openaiApiKey: ''
})

// Lista de emails de desarrolladores (admin) - acceso total
const ADMIN_EMAILS = [
  'devs@markesa.com',
]

// Lista de emails de editores (clienta) - acceso a catálogo y editar
const EDITOR_EMAILS = [
  'admin@markesa.com',
]

// Determinar el rol del usuario basado en su email
const determineRole = (email) => {
  if (!email) return null
  if (ADMIN_EMAILS.includes(email)) return 'admin'
  if (EDITOR_EMAILS.includes(email)) return 'editor'
  return null
}

// Load user settings from Firestore
const loadUserSettings = async (uid) => {
  try {
    const docRef = doc(db, 'userSettings', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      userSettings.value = docSnap.data()
    } else {
      userSettings.value = { openaiApiKey: '' }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

// Inicializar listener de auth inmediatamente
onAuthStateChanged(auth, async (firebaseUser) => {
  user.value = firebaseUser
  loading.value = false

  if (firebaseUser) {
    userRole.value = determineRole(firebaseUser.email)
    await loadUserSettings(firebaseUser.uid)
  } else {
    userRole.value = null
    userSettings.value = { openaiApiKey: '' }
  }
})

export function useAuth() {
  // Computed para verificar permisos
  const isAdmin = computed(() => userRole.value === 'admin')
  const isEditor = computed(() => userRole.value === 'editor' || userRole.value === 'admin')
  const canEdit = computed(() => isEditor.value)
  const canAccessAdmin = computed(() => isAdmin.value)

  // Login con email y contraseña
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      userRole.value = determineRole(result.user.email)
      return result.user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      userRole.value = null
      userSettings.value = { openaiApiKey: '' }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Save user settings to Firestore
  const saveUserSettings = async (settings) => {
    if (!user.value) return

    try {
      const docRef = doc(db, 'userSettings', user.value.uid)
      await setDoc(docRef, settings, { merge: true })
      userSettings.value = { ...userSettings.value, ...settings }
    } catch (error) {
      console.error('Error saving settings:', error)
      throw error
    }
  }

  // Save OpenAI API key
  const saveApiKey = async (apiKey) => {
    await saveUserSettings({ openaiApiKey: apiKey })
  }

  return {
    user,
    loading,
    userRole,
    userSettings,
    isAdmin,
    isEditor,
    canEdit,
    canAccessAdmin,
    login,
    logout,
    saveApiKey
  }
}

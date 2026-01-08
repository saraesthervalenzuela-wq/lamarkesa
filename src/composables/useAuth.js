import { ref, onMounted } from 'vue'
import { auth, googleProvider, db } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const user = ref(null)
const loading = ref(true)
const userSettings = ref({
  openaiApiKey: ''
})

export function useAuth() {
  // Listen to auth state changes
  onMounted(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false

      if (firebaseUser) {
        // Load user settings from Firestore
        await loadUserSettings(firebaseUser.uid)
      } else {
        userSettings.value = { openaiApiKey: '' }
      }
    })
  })

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
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
      userSettings.value = { openaiApiKey: '' }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Load user settings from Firestore
  const loadUserSettings = async (uid) => {
    try {
      const docRef = doc(db, 'userSettings', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        userSettings.value = docSnap.data()
      } else {
        // Create default settings
        userSettings.value = { openaiApiKey: '' }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
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
    userSettings,
    loginWithGoogle,
    logout,
    saveApiKey
  }
}

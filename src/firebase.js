import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBpPx8c4NMCkM5hHDlJAeS5ErkHFLDyvxw",
  authDomain: "lamarkesa-b827f.firebaseapp.com",
  projectId: "lamarkesa-b827f",
  storageBucket: "lamarkesa-b827f.firebasestorage.app",
  messagingSenderId: "508916996192",
  appId: "1:508916996192:web:cc068e1515b71239978b05"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

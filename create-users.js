// Script para crear usuarios en Firebase
// Ejecutar: node create-users.js

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBpPx8c4NMCkM5hHDlJAeS5ErkHFLDyvxw",
  authDomain: "lamarkesa-b827f.firebaseapp.com",
  projectId: "lamarkesa-b827f",
  storageBucket: "lamarkesa-b827f.firebasestorage.app",
  messagingSenderId: "508916996192",
  appId: "1:508916996192:web:cc068e1515b71239978b05"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const users = [
  {
    email: 'devs@markesa.com',
    password: 'Calik@2026$',
    role: 'devs',
    displayName: 'Desarrolladores'
  },
  {
    email: 'admin@markesa.com',
    password: 'Lamarkesa@2026$',
    role: 'admin',
    displayName: 'Administrador'
  }
]

async function createUsers() {
  console.log('Creando usuarios en Firebase...\n')

  for (const userData of users) {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )
      const user = userCredential.user

      console.log(`✓ Usuario creado: ${userData.email}`)
      console.log(`  UID: ${user.uid}`)

      // Guardar rol en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName,
        createdAt: new Date().toISOString()
      })

      console.log(`✓ Rol guardado en Firestore: ${userData.role}\n`)
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠ El usuario ${userData.email} ya existe\n`)
      } else {
        console.error(`✗ Error creando ${userData.email}:`, error.message, '\n')
      }
    }
  }

  console.log('Proceso completado.')
  console.log('\nCredenciales creadas:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('DEVS:')
  console.log('  Email: devs@markesa.com')
  console.log('  Password: Calik@2026$')
  console.log('')
  console.log('ADMIN:')
  console.log('  Email: admin@markesa.com')
  console.log('  Password: Lamarkesa@2026$')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  process.exit(0)
}

createUsers()

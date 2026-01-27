#!/usr/bin/env node
/**
 * Firebase/Firestore Backup Script
 * Exporta todas las colecciones de Firestore a JSON comprimido
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createWriteStream, writeFileSync } from 'fs'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'

// Colecciones a respaldar
const COLLECTIONS = ['jewelry', 'userSettings', 'settings']

async function main() {
  const timestamp = process.env.BACKUP_TIMESTAMP || new Date().toISOString().replace(/[:.]/g, '-')

  console.log('==========================================')
  console.log(`Firebase Backup - ${timestamp}`)
  console.log('==========================================')

  // Inicializar Firebase Admin
  let serviceAccount
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  } else {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY not set')
    console.error('')
    console.error('To generate a service account key:')
    console.error('1. Go to Firebase Console → Project Settings → Service Accounts')
    console.error('2. Click "Generate new private key"')
    console.error('3. Add the JSON content as FIREBASE_SERVICE_ACCOUNT_KEY secret in GitHub')
    process.exit(1)
  }

  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  })

  const db = getFirestore()
  const backup = {
    metadata: {
      timestamp,
      projectId: serviceAccount.project_id,
      collections: COLLECTIONS,
      createdAt: new Date().toISOString()
    },
    data: {}
  }

  // Exportar cada colección
  for (const collectionName of COLLECTIONS) {
    console.log(`[${COLLECTIONS.indexOf(collectionName) + 1}/${COLLECTIONS.length}] Exporting ${collectionName}...`)

    try {
      const snapshot = await db.collection(collectionName).get()
      backup.data[collectionName] = {}

      snapshot.forEach(doc => {
        backup.data[collectionName][doc.id] = doc.data()
      })

      console.log(`      -> ${snapshot.size} documents`)
    } catch (error) {
      console.error(`      -> Error: ${error.message}`)
      backup.data[collectionName] = { _error: error.message }
    }
  }

  // Guardar backup
  const backupName = `backup_${timestamp}`
  const jsonContent = JSON.stringify(backup, null, 2)

  // Guardar JSON comprimido
  const gzipPath = `${backupName}_firestore.json.gz`
  await pipeline(
    async function* () { yield jsonContent },
    createGzip(),
    createWriteStream(gzipPath)
  )

  console.log('')
  console.log('==========================================')
  console.log('Backup completed successfully!')
  console.log('==========================================')
  console.log(`File: ${gzipPath}`)
  console.log(`Collections: ${COLLECTIONS.join(', ')}`)
  console.log(`Total documents: ${Object.values(backup.data).reduce((sum, col) =>
    sum + (col._error ? 0 : Object.keys(col).length), 0)}`)
  console.log('==========================================')
}

main().catch(err => {
  console.error('Backup failed:', err)
  process.exit(1)
})

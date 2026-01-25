#!/usr/bin/env node
/**
 * Firebase/Firestore Restore Script
 * Restaura un backup de Firestore desde un archivo JSON comprimido
 *
 * Uso: FIREBASE_SERVICE_ACCOUNT_KEY='...' node firebase-restore.mjs <backup_file.json.gz>
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { gunzipSync } from 'zlib'
import { createInterface } from 'readline'

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.toUpperCase() === 'SI' || answer.toUpperCase() === 'YES')
    })
  })
}

async function main() {
  const backupFile = process.argv[2]

  if (!backupFile) {
    console.log('Firebase Firestore Restore Script')
    console.log('')
    console.log('Uso: FIREBASE_SERVICE_ACCOUNT_KEY=\'...\' node firebase-restore.mjs <backup_file.json.gz>')
    console.log('')
    console.log('Ejemplo:')
    console.log('  node firebase-restore.mjs backup_2024-01-15_03-00-00_UTC_firestore.json.gz')
    console.log('')
    console.log('Para obtener un backup:')
    console.log('  git checkout backups')
    console.log('  ls -la backup_*.json.gz')
    process.exit(0)
  }

  console.log('==========================================')
  console.log('Firebase Restore')
  console.log('==========================================')

  // Verificar service account
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY not set')
    console.error('')
    console.error('Exporta la variable de entorno con la clave de servicio:')
    console.error('  export FIREBASE_SERVICE_ACCOUNT_KEY=\'{ ... }\'')
    process.exit(1)
  }

  // Leer y descomprimir backup
  console.log(`Reading: ${backupFile}`)
  let backup
  try {
    const compressed = readFileSync(backupFile)
    const json = gunzipSync(compressed).toString()
    backup = JSON.parse(json)
  } catch (err) {
    console.error(`ERROR: Could not read backup file: ${err.message}`)
    process.exit(1)
  }

  console.log('')
  console.log('Backup metadata:')
  console.log(`  Timestamp: ${backup.metadata.timestamp}`)
  console.log(`  Project: ${backup.metadata.projectId}`)
  console.log(`  Collections: ${backup.metadata.collections.join(', ')}`)
  console.log('')

  // Contar documentos
  let totalDocs = 0
  for (const [collName, docs] of Object.entries(backup.data)) {
    const count = docs._error ? 0 : Object.keys(docs).length
    console.log(`  ${collName}: ${count} documents`)
    totalDocs += count
  }
  console.log(`  Total: ${totalDocs} documents`)
  console.log('')

  // Confirmar
  console.log('ADVERTENCIA: Esto sobrescribirá los documentos existentes en Firestore.')
  const confirmed = await confirm('¿Continuar con la restauración? (escribe SI para confirmar): ')

  if (!confirmed) {
    console.log('Restauración cancelada.')
    process.exit(0)
  }

  // Inicializar Firebase Admin
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  })

  const db = getFirestore()

  // Restaurar cada colección
  console.log('')
  console.log('Restaurando...')

  for (const [collName, docs] of Object.entries(backup.data)) {
    if (docs._error) {
      console.log(`  Skipping ${collName} (had error in backup)`)
      continue
    }

    const docIds = Object.keys(docs)
    console.log(`  ${collName}: ${docIds.length} documents`)

    const batch = db.batch()
    let batchCount = 0

    for (const [docId, data] of Object.entries(docs)) {
      const docRef = db.collection(collName).doc(docId)
      batch.set(docRef, data, { merge: false })
      batchCount++

      // Firestore batches have a limit of 500
      if (batchCount >= 500) {
        await batch.commit()
        batchCount = 0
      }
    }

    if (batchCount > 0) {
      await batch.commit()
    }
  }

  console.log('')
  console.log('==========================================')
  console.log('Restauración completada exitosamente!')
  console.log('==========================================')
}

main().catch(err => {
  console.error('Restore failed:', err)
  process.exit(1)
})

#!/bin/bash
set -euo pipefail

# =============================================================================
# Railway PostgreSQL Backup Script
# =============================================================================
# Genera backups con timestamp completo para restauración a hora específica
# Formato: backup_YYYY-MM-DD_HH-MM-SS_UTC
# =============================================================================

TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M-%S_UTC")
BACKUP_DIR="backups"
BACKUP_NAME="backup_${TIMESTAMP}"
RETENTION_DAYS=14

echo "=========================================="
echo "Railway Backup - ${TIMESTAMP}"
echo "=========================================="

# Crear directorio de backups si no existe
mkdir -p "${BACKUP_DIR}"

# -----------------------------------------------------------------------------
# 1. PostgreSQL Dump (comprimido con gzip)
# -----------------------------------------------------------------------------
echo "[1/3] Creando dump de PostgreSQL..."

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL no está definida"
    exit 1
fi

pg_dump "${DATABASE_URL}" --no-owner --no-acl | gzip > "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql.gz"
echo "      -> ${BACKUP_NAME}_postgres.sql.gz creado"

# -----------------------------------------------------------------------------
# 2. Exportar Variables de Entorno de Railway
# -----------------------------------------------------------------------------
echo "[2/3] Exportando variables de entorno..."

# Crear archivo JSON con las variables (excluyendo tokens sensibles de CI)
cat > "${BACKUP_DIR}/${BACKUP_NAME}_env.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "railway_project": "${RAILWAY_PROJECT_NAME:-unknown}",
  "environment": "${RAILWAY_ENVIRONMENT:-production}",
  "variables": {
    "DATABASE_URL": "[REDACTED - usar railway variables]",
    "VITE_FIREBASE_API_KEY": "${VITE_FIREBASE_API_KEY:-}",
    "VITE_FIREBASE_AUTH_DOMAIN": "${VITE_FIREBASE_AUTH_DOMAIN:-}",
    "VITE_FIREBASE_PROJECT_ID": "${VITE_FIREBASE_PROJECT_ID:-}",
    "VITE_FIREBASE_STORAGE_BUCKET": "${VITE_FIREBASE_STORAGE_BUCKET:-}",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "${VITE_FIREBASE_MESSAGING_SENDER_ID:-}",
    "VITE_FIREBASE_APP_ID": "${VITE_FIREBASE_APP_ID:-}"
  }
}
EOF
echo "      -> ${BACKUP_NAME}_env.json creado"

# -----------------------------------------------------------------------------
# 3. Rotación - Eliminar backups mayores a 14 días
# -----------------------------------------------------------------------------
echo "[3/3] Aplicando rotación de backups (>${RETENTION_DAYS} días)..."

DELETED_COUNT=0
for file in "${BACKUP_DIR}"/backup_*.sql.gz "${BACKUP_DIR}"/backup_*.json; do
    if [ -f "$file" ]; then
        # Extraer fecha del nombre del archivo
        filename=$(basename "$file")
        file_date=$(echo "$filename" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)

        if [ -n "$file_date" ]; then
            file_epoch=$(date -d "$file_date" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$file_date" +%s 2>/dev/null || echo "0")
            current_epoch=$(date +%s)
            age_days=$(( (current_epoch - file_epoch) / 86400 ))

            if [ "$age_days" -gt "$RETENTION_DAYS" ]; then
                rm "$file"
                echo "      -> Eliminado: $filename (${age_days} días)"
                ((DELETED_COUNT++)) || true
            fi
        fi
    fi
done

if [ "$DELETED_COUNT" -eq 0 ]; then
    echo "      -> No hay backups antiguos para eliminar"
fi

# -----------------------------------------------------------------------------
# Resumen
# -----------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "Backup completado exitosamente"
echo "=========================================="
echo "Archivos creados:"
echo "  - ${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql.gz"
echo "  - ${BACKUP_DIR}/${BACKUP_NAME}_env.json"
echo ""
echo "Para restaurar este backup:"
echo "  gunzip -c ${BACKUP_NAME}_postgres.sql.gz | psql \$DATABASE_URL"
echo "=========================================="

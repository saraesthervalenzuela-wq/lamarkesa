#!/bin/bash
set -euo pipefail

# =============================================================================
# Railway PostgreSQL Restore Script
# =============================================================================
# Restaura un backup específico basado en timestamp
# Uso: ./restore.sh [TIMESTAMP]
# Ejemplo: ./restore.sh 2024-01-15_03-00-00_UTC
# =============================================================================

BACKUP_BRANCH="backups"

show_usage() {
    echo "Uso: $0 [TIMESTAMP]"
    echo ""
    echo "Ejemplos:"
    echo "  $0                           # Lista backups disponibles"
    echo "  $0 2024-01-15_03-00-00_UTC   # Restaura backup específico"
    echo "  $0 latest                    # Restaura el backup más reciente"
    echo ""
}

list_backups() {
    echo "=========================================="
    echo "Backups disponibles (branch: ${BACKUP_BRANCH})"
    echo "=========================================="
    echo ""

    # Obtener lista de backups del branch remoto
    git fetch origin ${BACKUP_BRANCH} 2>/dev/null || {
        echo "ERROR: No se encontró el branch '${BACKUP_BRANCH}'"
        echo "Ejecuta el workflow de backup primero."
        exit 1
    }

    # Listar archivos .sql.gz en el branch de backups
    git ls-tree -r --name-only origin/${BACKUP_BRANCH} | grep '_postgres.sql.gz$' | while read file; do
        timestamp=$(echo "$file" | sed 's/backup_\(.*\)_postgres.sql.gz/\1/')
        # Formatear para lectura humana
        date_part=$(echo "$timestamp" | cut -d'_' -f1)
        time_part=$(echo "$timestamp" | cut -d'_' -f2 | tr '-' ':')
        echo "  ${timestamp}  (${date_part} ${time_part})"
    done | sort -r | head -20

    echo ""
    echo "Mostrando los 20 backups más recientes."
    echo "Para restaurar: $0 <TIMESTAMP>"
    echo "=========================================="
}

restore_backup() {
    local TIMESTAMP="$1"
    local BACKUP_NAME="backup_${TIMESTAMP}"

    echo "=========================================="
    echo "Restaurando backup: ${TIMESTAMP}"
    echo "=========================================="

    # Verificar que DATABASE_URL está definida
    if [ -z "${DATABASE_URL:-}" ]; then
        echo "ERROR: DATABASE_URL no está definida"
        echo ""
        echo "Define la variable de entorno antes de restaurar:"
        echo "  export DATABASE_URL='postgresql://user:pass@host:port/db'"
        exit 1
    fi

    # Crear directorio temporal
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT

    # Obtener el archivo del branch de backups
    echo "[1/3] Descargando backup..."
    git fetch origin ${BACKUP_BRANCH}
    git show "origin/${BACKUP_BRANCH}:${BACKUP_NAME}_postgres.sql.gz" > "${TEMP_DIR}/${BACKUP_NAME}_postgres.sql.gz" 2>/dev/null || {
        echo "ERROR: No se encontró el backup '${BACKUP_NAME}'"
        echo "Usa '$0' sin argumentos para ver backups disponibles."
        exit 1
    }

    # Verificar integridad
    echo "[2/3] Verificando integridad..."
    if ! gzip -t "${TEMP_DIR}/${BACKUP_NAME}_postgres.sql.gz"; then
        echo "ERROR: El archivo de backup está corrupto"
        exit 1
    fi

    # Confirmar antes de restaurar
    echo ""
    echo "ADVERTENCIA: Esto sobrescribirá TODOS los datos actuales."
    echo "Base de datos: ${DATABASE_URL%@*}@****"
    echo ""
    read -p "¿Continuar con la restauración? (escribe 'SI' para confirmar): " confirm

    if [ "$confirm" != "SI" ]; then
        echo "Restauración cancelada."
        exit 0
    fi

    # Restaurar
    echo "[3/3] Restaurando base de datos..."
    gunzip -c "${TEMP_DIR}/${BACKUP_NAME}_postgres.sql.gz" | psql "${DATABASE_URL}" --quiet

    echo ""
    echo "=========================================="
    echo "Restauración completada exitosamente"
    echo "=========================================="
    echo "Backup restaurado: ${TIMESTAMP}"
    echo "=========================================="
}

get_latest_backup() {
    git fetch origin ${BACKUP_BRANCH} 2>/dev/null
    git ls-tree -r --name-only origin/${BACKUP_BRANCH} | grep '_postgres.sql.gz$' | sort -r | head -1 | sed 's/backup_\(.*\)_postgres.sql.gz/\1/'
}

# Main
case "${1:-}" in
    "")
        list_backups
        ;;
    "-h"|"--help")
        show_usage
        ;;
    "latest")
        LATEST=$(get_latest_backup)
        if [ -z "$LATEST" ]; then
            echo "ERROR: No hay backups disponibles"
            exit 1
        fi
        echo "Backup más reciente: ${LATEST}"
        restore_backup "$LATEST"
        ;;
    *)
        restore_backup "$1"
        ;;
esac

<script setup>
import { ref, onMounted } from 'vue'
import { useCategories } from '../composables/useCategories'

const emit = defineEmits(['close'])

const {
  categories,
  loading,
  error,
  loadCategories,
  addCategory,
  deleteCategory,
  updateCategory
} = useCategories()

const newCategoryName = ref('')
const editingCategory = ref(null)
const editValue = ref('')
const statusText = ref('')
const statusType = ref('')

onMounted(async () => {
  await loadCategories()
})

const handleAdd = async () => {
  if (!newCategoryName.value.trim()) {
    showStatus('Ingresa un nombre para la categoria', 'error')
    return
  }

  try {
    await addCategory(newCategoryName.value.trim())
    newCategoryName.value = ''
    showStatus('Categoria agregada', 'success')
  } catch (err) {
    showStatus(err.message, 'error')
  }
}

const handleDelete = async (value, label) => {
  if (!confirm(`Eliminar la categoria "${label}"?`)) return

  try {
    await deleteCategory(value)
    showStatus('Categoria eliminada', 'success')
  } catch (err) {
    showStatus('Error al eliminar: ' + err.message, 'error')
  }
}

const startEdit = (category) => {
  editingCategory.value = category.value
  editValue.value = category.label
}

const cancelEdit = () => {
  editingCategory.value = null
  editValue.value = ''
}

const saveEdit = async () => {
  if (!editValue.value.trim()) {
    showStatus('El nombre no puede estar vacio', 'error')
    return
  }

  try {
    await updateCategory(editingCategory.value, editValue.value.trim())
    editingCategory.value = null
    editValue.value = ''
    showStatus('Categoria actualizada', 'success')
  } catch (err) {
    showStatus('Error al actualizar: ' + err.message, 'error')
  }
}

const showStatus = (text, type) => {
  statusText.value = text
  statusType.value = type
  setTimeout(() => {
    statusText.value = ''
    statusType.value = ''
  }, 3000)
}

const handleKeypress = (event) => {
  if (event.key === 'Enter') {
    handleAdd()
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Gestionar Categorias</h2>
        <button class="modal-close" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Add New Category -->
        <div class="add-section">
          <h3>Agregar Nueva Categoria</h3>
          <div class="add-form">
            <input
              type="text"
              v-model="newCategoryName"
              placeholder="Nombre de la categoria..."
              class="input-field"
              @keypress="handleKeypress"
            />
            <button
              class="btn btn-primary"
              @click="handleAdd"
              :disabled="loading || !newCategoryName.trim()"
            >
              + Agregar
            </button>
          </div>
        </div>

        <!-- Status Message -->
        <div
          v-if="statusText"
          class="status-message"
          :class="statusType"
        >
          {{ statusText }}
        </div>

        <!-- Categories List -->
        <div class="categories-section">
          <h3>Categorias Existentes</h3>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando...</span>
          </div>

          <div v-else class="categories-list">
            <div
              v-for="category in categories"
              :key="category.value"
              class="category-item"
            >
              <!-- View Mode -->
              <template v-if="editingCategory !== category.value">
                <div class="category-info">
                  <span class="category-label">{{ category.label }}</span>
                  <span class="category-value">{{ category.value }}</span>
                </div>
                <div class="category-actions">
                  <button
                    class="btn-icon btn-edit"
                    @click="startEdit(category)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon btn-delete"
                    @click="handleDelete(category.value, category.label)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </template>

              <!-- Edit Mode -->
              <template v-else>
                <input
                  type="text"
                  v-model="editValue"
                  class="edit-input"
                  @keypress.enter="saveEdit"
                />
                <div class="category-actions">
                  <button
                    class="btn-icon btn-save"
                    @click="saveEdit"
                    title="Guardar"
                  >
                    ✓
                  </button>
                  <button
                    class="btn-icon btn-cancel"
                    @click="cancelEdit"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>
              </template>
            </div>

            <div v-if="categories.length === 0" class="empty-state">
              No hay categorias. Agrega una nueva.
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E8E8E8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #999;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Add Section */
.add-section {
  margin-bottom: 24px;
}

.add-section h3,
.categories-section h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #666;
  margin-bottom: 12px;
}

.add-form {
  display: flex;
  gap: 10px;
}

.input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.input-field::placeholder {
  color: #bbb;
}

/* Status Message */
.status-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.status-message.success {
  background: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #A5D6A7;
}

.status-message.error {
  background: #FFEBEE;
  color: #C62828;
  border: 1px solid #EF9A9A;
}

/* Categories List */
.categories-section {
  margin-top: 16px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F9F9F9;
  border-radius: 8px;
  transition: background 0.2s;
}

.category-item:hover {
  background: #F0F0F0;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-label {
  font-weight: 500;
  color: #333;
}

.category-value {
  font-size: 0.75rem;
  color: #999;
  font-family: monospace;
}

.category-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-edit {
  background: #FFF8E1;
}

.btn-edit:hover {
  background: #FFECB3;
}

.btn-delete {
  background: #FFEBEE;
}

.btn-delete:hover {
  background: #FFCDD2;
}

.btn-save {
  background: #E8F5E9;
  color: #2E7D32;
}

.btn-save:hover {
  background: #C8E6C9;
}

.btn-cancel {
  background: #F5F5F5;
  color: #666;
}

.btn-cancel:hover {
  background: #E0E0E0;
}

.edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #B79848;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-right: 10px;
}

.edit-input:focus {
  outline: none;
}

/* Loading & Empty State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 30px;
  color: #999;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(183, 152, 72, 0.2);
  border-top-color: #B79848;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #999;
}

/* Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E8E8E8;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* Buttons */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #B79848;
  color: #fff;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  background: #A08640;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #F5F5F5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background: #E8E8E8;
}

/* Responsive */
@media (max-width: 600px) {
  .modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
    height: 100vh;
  }

  .modal-body {
    padding: 16px;
  }

  .add-form {
    flex-direction: column;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .category-item {
    padding: 10px 12px;
  }

  .btn-icon {
    width: 36px;
    height: 36px;
  }
}
</style>

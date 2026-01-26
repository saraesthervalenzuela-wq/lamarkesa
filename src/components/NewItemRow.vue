<script setup>
import { ref, computed } from 'vue'

defineProps({
  gridMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add'])

// Image upload
const fileInput = ref(null)
const selectedImage = ref(null)
const imagePreview = ref('')

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate format
  if (!ACCEPTED_FORMATS.includes(file.type)) {
    alert('Formato no soportado. Usa: JPEG, PNG, WebP, GIF o HEIC')
    event.target.value = ''
    return
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    alert('La imagen es muy grande. Máximo 10MB')
    event.target.value = ''
    return
  }

  selectedImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const clearImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const name = ref('')
const category = ref('rings')
const material = ref('')
const karat = ref('')
const goldColor = ref('')
const stoneType = ref('')
const rhodiumPlating = ref('')
const specialCollection = ref('')
const size = ref('')
const price = ref('')

const categories = [
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'chains', label: 'Chains' },
  { value: 'pendants', label: 'Pendants' },
  { value: 'watches', label: 'Watches' },
  { value: 'other', label: 'Other' }
]

// Materials
const materials = [
  { value: '', label: 'No material' },
  { value: 'solid_gold', label: 'Solid Gold' },
  { value: 'hollow', label: 'Hollow Gold' },
  { value: 'vermeil', label: 'Vermeil' },
  { value: 'sterling_silver', label: '925 Sterling Silver' },
  { value: 'lab_grown', label: 'Lab Grown' }
]

// Karats based on material
const karatOptions = {
  solid_gold: [
    { value: '', label: 'Karat' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' }
  ],
  hollow: [
    { value: '', label: 'Karat' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' },
    { value: '18k', label: '18k' }
  ],
  vermeil: [
    { value: '', label: 'Karat' },
    { value: '10k', label: '10k' },
    { value: '14k', label: '14k' },
    { value: '18k', label: '18k' }
  ]
}

// Gold colors (only for solid_gold)
const goldColors = [
  { value: '', label: 'Color' },
  { value: 'yellow', label: 'Yellow Gold' },
  { value: 'white', label: 'White Gold' },
  { value: 'tri_tone', label: 'Tri-tone Gold' }
]

// Special collections
const specialCollections = [
  { value: '', label: 'No collection' },
  { value: 'bridal_sets', label: 'Bridal Sets' },
  { value: 'engagement_rings', label: 'Engagement Rings' },
  { value: 'wedding_band', label: 'Wedding Band' },
  { value: 'religious', label: 'Religious' },
  { value: 'letters', label: 'Letters' }
]

// Stone types (for vermeil)
const stoneTypes = [
  { value: '', label: 'No stone' },
  { value: 'cz', label: 'CZ' },
  { value: 'zirconia', label: 'Zirconia' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'sapphire', label: 'Sapphire' },
  { value: 'amethyst', label: 'Amethyst' },
  { value: 'other', label: 'Other' }
]

// Computed properties for showing/hiding fields
const showKarat = computed(() => {
  return material.value === 'solid_gold' || material.value === 'hollow' || material.value === 'vermeil'
})

const showGoldColor = computed(() => {
  return material.value === 'solid_gold'
})

const showStoneType = computed(() => {
  return material.value === 'vermeil' || material.value === 'sterling_silver'
})

const availableKarats = computed(() => {
  return karatOptions[material.value] || []
})

const addItem = () => {
  if (!name.value.trim()) return

  emit('add', {
    name: name.value.trim(),
    category: category.value,
    material: material.value,
    karat: karat.value,
    goldColor: goldColor.value,
    stoneType: stoneType.value,
    rhodiumPlating: rhodiumPlating.value,
    specialCollection: specialCollection.value,
    size: size.value.trim(),
    price: parseFloat(price.value) || 0,
    image: '',
    _pendingImage: selectedImage.value // Pass the file to upload after creation
  })

  // Reset form
  name.value = ''
  material.value = ''
  karat.value = ''
  goldColor.value = ''
  stoneType.value = ''
  rhodiumPlating.value = ''
  specialCollection.value = ''
  size.value = ''
  price.value = ''
  clearImage()
}

const handleKeypress = (event) => {
  if (event.key === 'Enter') {
    addItem()
  }
}
</script>

<template>
  <!-- Hidden file input (shared) -->
  <input
    ref="fileInput"
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
    class="hidden-input"
    @change="handleFileSelect"
  />

  <!-- Grid Mode -->
  <div v-if="gridMode" class="grid-add-form">
    <div class="grid-image-upload" @click="openFilePicker" title="Click para agregar imagen">
      <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="grid-image-preview" />
      <template v-else>
        <div class="grid-add-icon">+</div>
        <span class="grid-upload-hint">Agregar foto</span>
      </template>
      <button v-if="imagePreview" class="grid-clear-btn" @click.stop="clearImage" title="Quitar imagen">×</button>
    </div>
    <h4>Add Product</h4>

    <input
      type="text"
      class="grid-input"
      v-model="name"
      placeholder="Product name..."
      @keypress="handleKeypress"
    />

    <select class="grid-select" v-model="category">
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>

    <select class="grid-select" v-model="material">
      <option v-for="mat in materials" :key="mat.value" :value="mat.value">
        {{ mat.label }}
      </option>
    </select>

    <select class="grid-select" v-model="karat">
      <option value="">-</option>
      <option v-for="k in availableKarats" :key="k.value" :value="k.value">
        {{ k.label }}
      </option>
    </select>

    <select v-if="showGoldColor" class="grid-select" v-model="goldColor">
      <option v-for="gc in goldColors" :key="gc.value" :value="gc.value">
        {{ gc.label }}
      </option>
    </select>
    <select v-else class="grid-select" v-model="stoneType">
      <option value="">-</option>
      <option v-for="st in stoneTypes" :key="st.value" :value="st.value">
        {{ st.label }}
      </option>
    </select>

    <select class="grid-select" v-model="rhodiumPlating">
      <option value="">-</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <select class="grid-select" v-model="specialCollection">
      <option v-for="col in specialCollections" :key="col.value" :value="col.value">
        {{ col.label }}
      </option>
    </select>

    <input
      type="text"
      class="grid-input"
      v-model="size"
      placeholder="Size (optional)"
    />

    <input
      type="number"
      class="grid-input grid-price"
      v-model="price"
      placeholder="Price"
      step="0.01"
      @keypress="handleKeypress"
    />

    <button class="grid-add-btn" @click="addItem">
      Add
    </button>
  </div>

  <!-- List Mode (Table Row) -->
  <div v-else class="new-row">
    <div class="image-upload-area" @click="openFilePicker" title="Click para agregar imagen">
      <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="image-preview" />
      <span v-else class="upload-icon">+</span>
      <button v-if="imagePreview" class="clear-image-btn" @click.stop="clearImage" title="Quitar imagen">×</button>
    </div>

    <input
      type="text"
      class="editable-field name-field"
      v-model="name"
      placeholder="Product name..."
      @keypress="handleKeypress"
    >

    <select class="category-select" v-model="category">
      <option v-for="cat in categories" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>

    <!-- Material -->
    <select class="material-select" v-model="material">
      <option v-for="mat in materials" :key="mat.value" :value="mat.value">
        {{ mat.label }}
      </option>
    </select>

    <!-- Karat -->
    <select class="karat-select" v-model="karat">
      <option value="">-</option>
      <option v-for="k in availableKarats" :key="k.value" :value="k.value">
        {{ k.label }}
      </option>
    </select>

    <!-- Gold Color / Stone Type -->
    <select v-if="showGoldColor" class="color-select" v-model="goldColor">
      <option v-for="gc in goldColors" :key="gc.value" :value="gc.value">
        {{ gc.label }}
      </option>
    </select>
    <select v-else class="stone-select" v-model="stoneType">
      <option value="">-</option>
      <option v-for="st in stoneTypes" :key="st.value" :value="st.value">
        {{ st.label }}
      </option>
    </select>

    <!-- Rhodium Plating -->
    <select class="rhodium-select" v-model="rhodiumPlating">
      <option value="">-</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <!-- Special Collection -->
    <select class="collection-select" v-model="specialCollection">
      <option v-for="col in specialCollections" :key="col.value" :value="col.value">
        {{ col.label }}
      </option>
    </select>

    <!-- Size -->
    <input
      type="text"
      class="editable-field size-field"
      v-model="size"
      placeholder="Size"
    >

    <input
      type="number"
      class="editable-field price-field"
      v-model="price"
      placeholder="0.00"
      step="0.01"
      @keypress="handleKeypress"
    >

    <button class="btn btn-primary btn-small" @click="addItem">Add</button>
  </div>
</template>

<style scoped>
/* Grid Mode Styles */
.grid-add-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 25px;
  gap: 12px;
  width: 100%;
}

.grid-add-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px dashed rgba(183, 152, 72, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #B79848;
  margin-bottom: 5px;
}

.grid-add-form h4 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.grid-input,
.grid-select {
  width: 100%;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s;
}

.grid-input:focus,
.grid-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.grid-input::placeholder {
  color: #bbb;
}

.grid-price {
  color: #B79848;
  font-weight: 600;
}

.grid-add-btn {
  width: 100%;
  padding: 14px;
  background: #B79848;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.grid-add-btn:hover {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(183, 152, 72, 0.25);
}

/* List Mode (Table Row) Styles */
.new-row {
  display: grid;
  grid-template-columns: 120px minmax(180px, 1.5fr) 120px 130px 80px 110px 80px 130px 70px 90px 90px;
  gap: 12px;
  padding: 18px 25px;
  background: linear-gradient(135deg, #FDFAF6 0%, #FAF7F2 100%);
  border-top: 1px dashed rgba(183, 152, 72, 0.3);
  align-items: center;
}

.add-btn {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  border: 2px dashed rgba(183, 152, 72, 0.4);
  background: transparent;
  color: #B79848;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: rgba(183, 152, 72, 0.08);
  border-style: solid;
  border-color: #B79848;
}

.editable-field {
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 10px 12px;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.2s;
}

.editable-field:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.editable-field::placeholder {
  color: #bbb;
}

.name-field {
  font-weight: 500;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
}

.price-field {
  color: #B79848;
  font-weight: 600;
  text-align: right;
}

.sku-field {
  font-family: monospace;
  font-size: 0.85rem;
  color: #999;
}

.category-select {
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 10px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.category-select option {
  background: #fff;
  color: #333;
}

.collection-select {
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 10px 12px;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.collection-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.collection-select option {
  background: #fff;
  color: #333;
}

.material-select,
.karat-select,
.color-select,
.stone-select,
.rhodium-select {
  background: #fff;
  border: 1px solid #E8E8E8;
  padding: 8px 10px;
  border-radius: 8px;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.material-select:focus,
.karat-select:focus,
.color-select:focus,
.stone-select:focus {
  outline: none;
  border-color: #B79848;
  box-shadow: 0 0 0 3px rgba(183, 152, 72, 0.1);
}

.material-select option,
.karat-select option,
.color-select option,
.stone-select option {
  background: #fff;
  color: #333;
}

.placeholder-cell {
  color: #ccc;
  text-align: center;
  font-size: 0.85rem;
}

.size-field {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}

.comment-field {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.comment-field::placeholder {
  color: #bbb;
  font-style: italic;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: #B79848;
  color: #fff;
}

.btn-primary:hover {
  background: #A08640;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(183, 152, 72, 0.25);
}

.btn-small {
  padding: 10px 18px;
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .new-row {
    grid-template-columns: 100px 1fr 100px 80px;
  }
  .add-btn {
    width: 90px;
    height: 90px;
  }
  .new-row > *:nth-child(4),
  .new-row > *:nth-child(5) {
    display: none;
  }
}

@media (max-width: 600px) {
  .new-row {
    grid-template-columns: 75px 1fr 90px 60px;
    padding: 10px 12px;
    gap: 8px;
  }
  .add-btn {
    width: 70px;
    height: 70px;
  }

  .grid-add-form {
    padding: 20px 15px;
  }

  .image-upload-area {
    width: 70px;
    height: 70px;
  }
}

/* Hidden file input */
.hidden-input {
  display: none;
}

/* Image upload area - List mode */
.image-upload-area {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 10px;
  border: 2px dashed rgba(183, 152, 72, 0.4);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-upload-area:hover {
  background: rgba(183, 152, 72, 0.08);
  border-style: solid;
  border-color: #B79848;
}

.upload-icon {
  font-size: 2rem;
  color: #B79848;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.clear-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-image-btn:hover {
  background: #dc3545;
  transform: scale(1.1);
}

/* Grid mode image upload */
.grid-image-upload {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  border: 2px dashed rgba(183, 152, 72, 0.4);
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 10px;
}

.grid-image-upload:hover {
  background: rgba(183, 152, 72, 0.08);
  border-color: #B79848;
}

.grid-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-upload-hint {
  font-size: 0.7rem;
  color: #999;
  margin-top: 4px;
}

.grid-clear-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-clear-btn:hover {
  background: #dc3545;
}
</style>

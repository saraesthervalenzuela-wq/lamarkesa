# Configuración del Catálogo Público

## Cambios Realizados

Se ha habilitado un sistema de rutas con dos vistas:

1. **`/catalog`** - Vista pública del catálogo (accesible para todos)
2. **`/admin`** - Vista de administración (requiere autenticación con Google)

## Características del Catálogo Público

- ✅ Vista de productos en formato de grid elegante
- ✅ Búsqueda por nombre o SKU
- ✅ Filtros por categoría
- ✅ Ordenamiento (más recientes, precio, nombre, etc.)
- ✅ Botón de WhatsApp para consultar por cada producto
- ✅ Diseño responsive (móvil y desktop)
- ✅ Sin opciones de edición (solo lectura)

## Características del Panel Admin

- ✅ Todas las funcionalidades anteriores (agregar, editar, eliminar)
- ✅ Import/Export Excel, CSV, JSON
- ✅ Módulos de AI (más simples)
- ✅ Protegido por autenticación
- ✅ Botón para ver el catálogo público

## Configuración Requerida

### 1. Configurar Número de WhatsApp

Edita el archivo `/src/views/CatalogView.vue` en la línea 22:

```javascript
// Reemplaza con tu número de WhatsApp (formato internacional sin +)
const phoneNumber = '1234567890' // TODO: Configura tu número aquí
```

**Ejemplo:**
- Si tu número es +52 1 999 123 4567, usa: `'5219991234567'`
- Si tu número es +1 234 567 8900, usa: `'12345678900'`

### 2. Desplegar en Netlify

El archivo `netlify.toml` ya está configurado correctamente para manejar las rutas SPA.

#### Pasos para desplegar:

1. Sube tu código a GitHub/GitLab
2. En Netlify, conecta tu repositorio
3. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Despliega

### 3. URLs Resultantes

Una vez desplegado en Netlify (ejemplo: `https://tu-sitio.netlify.app`):

- **Catálogo público:** `https://tu-sitio.netlify.app/catalog`
- **Panel admin:** `https://tu-sitio.netlify.app/admin`
- **Raíz (/):** Redirige automáticamente a `/catalog`

## Navegación

- La barra de navegación superior permite cambiar entre Catálogo y Admin
- El botón "Admin" solo aparece cuando estás autenticado
- El componente de autenticación (Login/Logout) está siempre visible en la esquina superior derecha

## Flujo de Usuarios

### Clientes Finales (Sin autenticación)
1. Acceden a `/catalog`
2. Buscan y filtran productos
3. Hacen clic en "Preguntar" para abrir WhatsApp con un mensaje pre-llenado
4. No pueden editar nada

### Tú (Administrador)
1. Inicias sesión con Google en cualquier página
2. Accedes a `/admin` para gestionar el inventario
3. Agregas, editas, eliminas productos
4. Puedes ver el catálogo público en cualquier momento

## Personalización Adicional

### Cambiar categorías
Edita las categorías en `/src/views/CatalogView.vue` línea 32-39

### Cambiar estilos
Los estilos están en la sección `<style scoped>` de cada archivo `.vue`

### Mensaje de WhatsApp personalizado
Edita la línea 25 en `/src/views/CatalogView.vue`:

```javascript
const message = `Hola! Me interesa este producto:\n\n${selectedProduct.value.name}\nPrecio: $${selectedProduct.value.price}\n\n¿Podrías darme más información?`
```

## Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Archivos Importantes

- `/src/router/index.js` - Configuración de rutas
- `/src/views/CatalogView.vue` - Vista pública del catálogo
- `/src/views/AdminView.vue` - Panel de administración
- `/src/App.vue` - Layout principal con navegación
- `/netlify.toml` - Configuración de Netlify

## Notas

- La autenticación se maneja mediante Firebase Authentication (Google)
- Los productos se sincronizan en tiempo real desde Firestore
- El catálogo público es de solo lectura
- No se necesitan cambios en las reglas de seguridad de Firebase ya que los datos de productos son públicos para lectura

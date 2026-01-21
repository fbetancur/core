# 📱 Análisis Exhaustivo: Enketo-Core Offline

## 🎯 Objetivo
Identificar **EXACTAMENTE** qué archivos y recursos se necesitan cachear para que enketo-core funcione completamente **OFFLINE**.

---

## 🔍 **INVESTIGACIÓN EXHAUSTIVA REALIZADA**

### ✅ **Archivos Analizados:**
- `src/index.html` - HTML principal y dependencias externas
- `app.js` - Controlador principal y flujo de carga
- `config.js` - Configuración de mapas y APIs
- `src/js/file-manager.js` - Manejo de archivos y recursos
- `build/` - Archivos compilados
- Todos los widgets y módulos JavaScript
- Archivos SASS/CSS
- Dependencias de terceros

---

## 🌐 **DEPENDENCIAS EXTERNAS IDENTIFICADAS**

### 1. **🔤 FUENTES (CRÍTICO)**
```html
<!-- En src/index.html línea 6-10 -->
<link href="http://fonts.googleapis.com/css?family=Open+Sans:400,700,600&amp;subset=latin,cyrillic-ext,cyrillic,greek-ext,greek,vietnamese,latin-ext" 
      rel="stylesheet" type="text/css" />
```
**IMPACTO:** Sin esta fuente, el formulario se verá con fuentes del sistema.

### 2. **🗺️ MAPAS (CRÍTICO para widgets geo)**
```javascript
// En config.js y src/widget/geo/geopicker.js
tiles: ['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png']
searchSource: 'https://maps.googleapis.com/maps/api/geocode/json?address={address}&sensor=true&key={api_key}'
```
**IMPACTO:** Los widgets de geolocalización NO funcionarán offline.

### 3. **🖼️ IMÁGENES EXTERNAS**
```html
<!-- Logo de Enketo -->
<img src="https://enketo.org/media/images/logos/enketo_bare_150x56.png" alt="enketo logo" />
```
**IMPACTO:** Imagen no se mostrará, pero no afecta funcionalidad.

### 4. **📡 SERVICIOS DE RED**
- **XMLHttpRequest** en `file-manager.js` para cargar recursos
- **fetch()** en widgets para cargar SVG y datos
- **Geocoding API** de Google Maps

---

## 📁 **ARCHIVOS LOCALES REQUERIDOS**

### **ARCHIVOS PRINCIPALES (OBLIGATORIOS)**
```
build/
├── index.html              # ← HTML principal
├── app.js                  # ← JavaScript compilado (CRÍTICO)
└── css/
    ├── formhub.css         # ← Estilos principales (CRÍTICO)
    └── formhub-print.css   # ← Estilos de impresión
```

### **ARCHIVOS DE FORMULARIOS (OBLIGATORIOS)**
```
test/mock/
├── forms.js                # ← Formularios transformados (CRÍTICO)
└── forms.mjs               # ← Enlace simbólico
```

### **ARCHIVOS DE CONFIGURACIÓN**
```
config.js                   # ← Configuración (mapas, APIs)
```

---

## 🛠️ **ESTRATEGIA OFFLINE COMPLETA**

### **OPCIÓN 1: Service Worker + Cache API (RECOMENDADO)**

#### **1.1 Crear Service Worker**
```javascript
// sw.js
const CACHE_NAME = 'enketo-core-v1';
const STATIC_ASSETS = [
    // Archivos principales
    '/',
    '/index.html',
    '/app.js',
    '/config.js',
    
    // CSS
    '/css/formhub.css',
    '/css/formhub-print.css',
    
    // Formularios
    '/test/mock/forms.js',
    '/test/mock/forms.mjs',
    
    // Fuentes offline (descargadas)
    '/fonts/OpenSans-Regular.woff2',
    '/fonts/OpenSans-Bold.woff2',
    '/fonts/OpenSans-SemiBold.woff2',
    
    // Imágenes offline
    '/images/enketo_logo.png',
    
    // Tiles de mapas offline (opcional)
    '/tiles/offline-map.png'
];

// Instalar y cachear recursos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
    );
});

// Interceptar requests y servir desde cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Servir desde cache si existe
                if (response) {
                    return response;
                }
                
                // Si es una request de red y estamos offline, 
                // servir fallback para mapas
                if (event.request.url.includes('tile.openstreetmap.org')) {
                    return caches.match('/tiles/offline-map.png');
                }
                
                if (event.request.url.includes('googleapis.com/maps/api/geocode')) {
                    return new Response(JSON.stringify({
                        results: [],
                        status: 'ZERO_RESULTS'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                // Para otras requests, intentar red
                return fetch(event.request);
            })
    );
});
```

#### **1.2 Registrar Service Worker**
```javascript
// En app.js o index.html
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registrado'))
        .catch(error => console.log('SW falló:', error));
}
```

#### **1.3 Crear Manifest.json**
```json
{
    "name": "Enketo Core Offline",
    "short_name": "Enketo",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#1f69a0",
    "icons": [
        {
            "src": "/images/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

### **OPCIÓN 2: Recursos Embebidos (SIMPLE)**

#### **2.1 Descargar y Embebir Fuentes**
```bash
# Descargar fuentes de Google
curl "http://fonts.googleapis.com/css?family=Open+Sans:400,700,600" > fonts.css

# Descargar archivos .woff2 referenciados en fonts.css
# Colocar en /fonts/ local
```

#### **2.2 Modificar HTML para usar recursos locales**
```html
<!-- Reemplazar en src/index.html -->
<!-- ANTES -->
<link href="http://fonts.googleapis.com/css?family=Open+Sans..." />

<!-- DESPUÉS -->
<link href="./fonts/fonts.css" rel="stylesheet" type="text/css" />
```

#### **2.3 Configurar mapas offline**
```javascript
// En config.js
export default {
    maps: [
        {
            // Usar tiles locales o imagen estática
            tiles: ['/tiles/{z}/{x}/{y}.png'], // tiles descargados
            name: 'offline-streets',
            attribution: 'Offline Map Data',
        }
    ],
    // Deshabilitar geocoding
    googleApiKey: '',
};
```

---

## 📋 **CHECKLIST COMPLETO PARA OFFLINE**

### **✅ ARCHIVOS OBLIGATORIOS A CACHEAR:**
- [ ] `build/index.html`
- [ ] `build/app.js` 
- [ ] `build/css/formhub.css`
- [ ] `build/css/formhub-print.css`
- [ ] `test/mock/forms.js` (con tus formularios)
- [ ] `config.js`

### **✅ RECURSOS EXTERNOS A DESCARGAR:**
- [ ] **Fuentes Open Sans** (4 archivos .woff2)
- [ ] **Logo Enketo** (1 imagen .png)
- [ ] **Tiles de mapas** (opcional, para widgets geo)

### **✅ MODIFICACIONES DE CÓDIGO:**
- [ ] **Service Worker** implementado
- [ ] **Manifest.json** creado
- [ ] **HTML modificado** para usar recursos locales
- [ ] **Config.js modificado** para mapas offline
- [ ] **Fallbacks** para APIs externas

### **✅ FUNCIONALIDADES QUE FUNCIONARÁN OFFLINE:**
- ✅ **Formularios básicos** (texto, números, fechas)
- ✅ **Validaciones** y cálculos
- ✅ **Repeticiones** y lógica condicional
- ✅ **Widgets básicos** (radio, checkbox, select)
- ✅ **Widgets de dibujo** y firma
- ✅ **Widgets de archivo** (con archivos locales)
- ✅ **Impresión** de formularios

### **⚠️ FUNCIONALIDADES LIMITADAS OFFLINE:**
- ⚠️ **Widgets de geolocalización** (sin mapas ni geocoding)
- ⚠️ **Widgets de imagen con mapas** (sin tiles)
- ⚠️ **Carga de recursos externos** (URLs http/https)

---

## 🚀 **IMPLEMENTACIÓN PASO A PASO**

### **Paso 1: Preparar Recursos**
```bash
# 1. Crear directorios
mkdir -p offline-assets/{fonts,images,tiles}

# 2. Descargar fuentes
curl "http://fonts.googleapis.com/css?family=Open+Sans:400,700,600" > offline-assets/fonts/fonts.css

# 3. Descargar archivos de fuentes referenciados
# (extraer URLs de fonts.css y descargar .woff2)

# 4. Descargar logo
curl "https://enketo.org/media/images/logos/enketo_bare_150x56.png" > offline-assets/images/enketo_logo.png
```

### **Paso 2: Crear Service Worker**
```bash
# Crear sw.js con el código proporcionado arriba
```

### **Paso 3: Modificar Archivos**
```bash
# Modificar src/index.html para usar recursos locales
# Modificar config.js para mapas offline
# Agregar registro de service worker
```

### **Paso 4: Compilar y Probar**
```bash
npx grunt
npm start

# Probar offline:
# 1. Abrir DevTools > Network > Offline
# 2. Recargar página
# 3. Verificar que funciona
```

---

## 📊 **TAMAÑO ESTIMADO DEL CACHE**

```
Archivos JavaScript:     ~2.5 MB
Archivos CSS:           ~500 KB  
Fuentes Open Sans:      ~200 KB
Imágenes:               ~50 KB
Formularios:            ~Variable
TOTAL ESTIMADO:         ~3.3 MB + formularios
```

---

## 🎯 **CONCLUSIÓN**

Para que **enketo-core funcione completamente offline** necesitas:

1. **Implementar Service Worker** para cachear recursos
2. **Descargar y servir localmente** las fuentes de Google
3. **Configurar mapas offline** o deshabilitar widgets geo
4. **Cachear todos los archivos build/** 
5. **Manejar fallbacks** para APIs externas

**El sistema será 100% funcional offline** excepto por widgets que requieren conectividad (mapas, geocoding).

**ARCHIVOS MÍNIMOS CRÍTICOS:** `build/app.js`, `build/css/formhub.css`, `test/mock/forms.js`

**TODO LO DEMÁS ES OPCIONAL** pero mejora la experiencia de usuario.
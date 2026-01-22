# DOCUMENTACIÓN DETALLADA DE MÓDULOS ENKETO CORE

## Análisis Completo de la Carpeta `/module`

Esta documentación proporciona un análisis exhaustivo de cada módulo en la carpeta `module` de Enketo Core, explicando su funcionalidad, propósito, dependencias y cómo interactúa con el resto del sistema.

---

## ÍNDICE DE MÓDULOS

1. [APPLICATION-CACHE.JS](#1-application-cachejs) - Gestión de Service Workers
2. [CLIENT-CONFIG.JS](#2-client-configjs) - Configuración del cliente
3. [CONNECTION.JS](#3-connectionjs) - Comunicación con servidor
4. [CONTROLLER-WEBFORM.JS](#4-controller-webformjs) - Controlador principal
5. [CORE-WIDGETS.JSON](#5-core-widgetsjson) - Mapeo de widgets
6. [ENCRYPTOR.JS](#6-encryptorjs) - Encriptación end-to-end
7. [EVENT.JS](#7-eventjs) - Sistema de eventos
8. [EXPONENTIAL-BACKOFF.JS](#8-exponential-backoffjs) - Reintentos inteligentes
9. [EXPORTER.JS](#9-exporterjs) - Exportación de datos
10. [FEEDBACK-BAR.JS](#10-feedback-barjs) - Retroalimentación visual
11. [FILE-MANAGER.JS](#11-file-managerjs) - Gestión de archivos
12. [FORM-CACHE.JS](#12-form-cachejs) - Caché de formularios
13. [GEOJSON.JS](#13-geojsonjs) - Procesamiento GeoJSON
14. [GUI.JS](#14-guijs) - Interfaz gráfica principal
15. [LAST-SAVED.JS](#15-last-savedjs) - Funcionalidad "último guardado"
16. [MEDIA.JS](#16-mediajs) - Gestión de recursos multimedia
17. [OFFLINE-APP-WORKER-PARTIAL.JS](#17-offline-app-worker-partialjs) - Service Worker
18. [PLUGIN.JS](#18-pluginjs) - Plugins de jQuery
19. [RECORDS-QUEUE.JS](#19-records-queuejs) - Cola de registros
20. [SETTINGS.JS](#20-settingsjs) - Configuración central
21. [SNIFFER.JS](#21-snifferjs) - Detección de navegador/OS
22. [STORE.JS](#22-storejs) - Almacenamiento persistente
23. [TRANSLATOR.JS](#23-translatorjs) - Internacionalización
24. [UTILS.JS](#24-utilsjs) - Utilidades generales

---

## 1. APPLICATION-CACHE.JS

### **Propósito Principal**
Gestiona el almacenamiento de la aplicación utilizando Service Workers para habilitar funcionalidades offline.

### **Funcionalidades Detalladas**

#### **Inicialización del Service Worker**
- **Función `init(survey)`**: Registra el service worker para capacidades offline
- **Ruta del Worker**: `${settings.basePath}/x/offline-app-worker.js`
- **Verificación de Soporte**: Comprueba si `'serviceWorker' in navigator`
- **Manejo de Errores**: Diferencia entre navegadores no compatibles y URLs inseguras (HTTP)

#### **Gestión de Actualizaciones**
- **Intervalo de Verificación**: Cada 60 minutos (60 * 60 * 1000 ms)
- **Detección de Actualizaciones**: Escucha el evento `updatefound`
- **Notificación**: Dispara evento `ApplicationUpdated` cuando hay nueva versión

#### **Eventos Personalizados**
- **`OfflineLaunchCapable`**: Indica si la aplicación puede funcionar offline
- **`ApplicationUpdated`**: Notifica cuando hay una nueva versión disponible

### **Dependencias**
- `./event`: Para eventos personalizados
- `./settings`: Para configuración de rutas base

### **Casos de Uso**
- Aplicaciones web progresivas (PWA)
- Funcionalidad offline completa
- Actualizaciones automáticas de la aplicación

---

## 2. CLIENT-CONFIG.JS

### **Propósito Principal**
Gestiona la configuración del cliente, incluyendo optimizaciones experimentales y parámetros de URL.

### **Funcionalidades Detalladas**

#### **Configuración Base**
- **Fuente**: `window.env` (variables de entorno del navegador)
- **Fallback**: Objeto vacío si no existe `window.env`

#### **Optimizaciones Experimentales**
- **`computeAsync`**: Habilitación de cálculos asíncronos
  - Se activa por configuración o parámetro URL `?computeAsync`
  - Mejora el rendimiento en formularios complejos
  - Evita bloqueos de la interfaz de usuario

### **Patrón de Configuración**
```javascript
config.experimentalOptimizations = {
    ...config.experimentalOptimizations,
    computeAsync: config.experimentalOptimizations?.computeAsync || 
                  /[?&]computeAsync\b/.test(window.location.search)
}
```

### **Casos de Uso**
- Configuración dinámica basada en URL
- Habilitación de características experimentales
- Optimización de rendimiento condicional

---

## 3. CONNECTION.JS

### **Propósito Principal**
Maneja toda la comunicación con el servidor, incluyendo transformación de formularios, carga de datos externos y envío de registros.

### **Funcionalidades Detalladas**

#### **Gestión de Estado de Conexión**
- **`getOnlineStatus()`**: Verifica conectividad mediante fetch a `/connection`
- **Validación de Respuesta**: Busca texto "connected" para confirmar estado
- **Manejo de Service Worker**: Detecta páginas fallback offline

#### **Transformación de Formularios**
- **`getFormParts(props)`**: Obtiene HTML, modelo XML e instancias externas
- **Soporte para Vista Previa**: Maneja URLs de XForm directamente
- **Transformación Local**: Usa enketo-transformer para vistas previas
- **Caché de Hash**: Verifica versiones para actualizaciones

#### **Carga de Datos Externos**
- **`getExternalData(survey, model, options)`**: Procesa instancias externas
- **Tipos Soportados**: CSV, XML, GeoJSON
- **Instancia Last-Saved**: Manejo especial para `jr://instance/last-saved`
- **Mapeo de Idiomas**: Conversión de CSV con soporte multiidioma

#### **Envío de Registros**
- **`uploadRecord(survey, record)`**: Envía registros completos
- **Procesamiento por Lotes**: Divide archivos grandes en múltiples envíos
- **Límites de Tamaño**: Respeta `maxSize` del servidor
- **Encriptación**: Soporte para registros encriptados
- **Reintentos**: Manejo de errores y reconexión

#### **Gestión de Archivos Multimedia**
- **`getMediaFile(url)`**: Descarga archivos multimedia
- **`getDataFile(url, languageMap)`**: Procesa archivos de datos
- **Detección de Tipo**: Basada en Content-Type y extensión
- **Conversión Automática**: CSV a XML cuando es necesario

### **Configuración de URLs**
```javascript
const CONNECTION_URL = `${settings.basePath}/connection`
const TRANSFORM_HASH_URL = `${settings.basePath}/transform/xform/hash/${settings.enketoId}`
const INSTANCE_URL = `${settings.basePath}/submission/${settings.enketoId}`
```

### **Dependencias Principales**
- `./encryptor`: Para encriptación de registros
- `./settings`: Configuración de rutas y parámetros
- `./last-saved`: Gestión de registros guardados
- `./media`: Reemplazo de fuentes multimedia

### **Casos de Uso Críticos**
- Carga inicial de formularios
- Sincronización de datos offline/online
- Envío de formularios completados
- Gestión de archivos multimedia grandes

---

## 4. CONTROLLER-WEBFORM.JS

### **Propósito Principal**
Controlador principal de alto nivel para formularios web, manejando guardado, envío, validación y ciclo de vida del formulario.

### **Funcionalidades Detalladas**

#### **Inicialización del Formulario**
- **`init(formEl, data, loadErrors)`**: Inicializa formulario completo
- **Gestión de Medios**: Reemplaza fuentes multimedia para modo offline
- **Configuración de Idioma**: Determina idioma basado en navegador/configuración
- **Manejo de Encriptación**: Desactiva guardado de borradores si está encriptado
- **Navegación GoTo**: Soporte para enlaces directos a secciones

#### **Gestión de Registros**
- **`_saveRecord(survey, draft, recordName, confirmed)`**: Guarda registros localmente
- **`_submitRecord(survey)`**: Envía registros al servidor
- **`_loadRecord(survey, instanceId, confirmed)`**: Carga registros desde almacenamiento
- **`_resetForm(survey, options)`**: Reinicia formulario al estado inicial

#### **Auto-guardado**
- **`_autoSaveRecord()`**: Guardado automático en segundo plano
- **Condiciones**: No se ejecuta si el registro fue cargado o está encriptado
- **Frecuencia**: Activado por eventos `XFormsValueChanged`
- **Gestión de Promesas**: Evita conflictos con múltiples operaciones

#### **Validación y Envío**
- **Validación Completa**: Antes de guardado final o envío
- **Manejo de Errores**: Retroalimentación específica por tipo de error
- **Estados de Botones**: Indicadores visuales de progreso
- **Redirección**: Manejo post-envío según tipo de formulario

#### **Gestión de Eventos**
- **Eventos de Formulario**: Submit, validate, close, save-draft
- **Eventos de Lista**: Carga y gestión de registros guardados
- **Eventos de Progreso**: Actualización de barras de progreso
- **Comunicación con Padre**: PostMessage para iframes

#### **Funcionalidades Especiales**
- **Detección de iframe**: `inIframe()` para contextos embebidos
- **Exportación**: Generación de archivos ZIP con registros
- **Carga de Registros**: Interfaz para registros guardados localmente
- **Gestión de Idiomas**: Cambio dinámico de idioma de interfaz

### **Estados del Formulario**
1. **Carga Inicial**: Procesamiento de datos y configuración
2. **Edición Activa**: Usuario interactuando con formulario
3. **Validación**: Verificación de datos antes de guardado
4. **Guardado**: Almacenamiento local o envío al servidor
5. **Completado**: Estado final con opciones de redirección

### **Dependencias Críticas**
- `enketo-core/Form`: Clase principal del formulario
- `./gui`: Interfaz de usuario y diálogos
- `./connection`: Comunicación con servidor
- `./records-queue`: Gestión de cola de registros
- `./file-manager`: Manejo de archivos adjuntos
---

## 5. CORE-WIDGETS.JSON

### **Propósito Principal**
Mapeo de configuración que define las rutas a todos los widgets (componentes de interfaz) disponibles en Enketo Core.

### **Widgets Incluidos**

#### **Widgets de Entrada Básicos**
- **`note`**: Elementos informativos sin entrada
- **`textarea`**: Áreas de texto multilínea
- **`radio`**: Botones de opción única
- **`file`**: Cargador de archivos

#### **Widgets de Selección**
- **`select-desktop`**: Selectores para escritorio
- **`select-mobile`**: Selectores optimizados para móvil
- **`autocomplete`**: Selección con autocompletado
- **`select-media`**: Selección con contenido multimedia
- **`likert`**: Escalas de Likert
- **`rank`**: Ordenamiento por ranking

#### **Widgets de Fecha y Hora**
- **`date`**: Selector de fecha extendido
- **`time`**: Selector de hora extendido
- **`datetime`**: Combinación fecha/hora
- **`date-native`**: Selector nativo del navegador
- **`date-native-ios`**: Optimizado para iOS
- **`date-mobile`**: Optimizado para móviles

#### **Widgets Especializados**
- **`geo`**: Selector de coordenadas geográficas
- **`draw`**: Widget de dibujo/firma
- **`image-view`**: Visualizador de imágenes grandes
- **`image-map`**: Mapas de imagen interactivos
- **`range`**: Controles deslizantes
- **`rating`**: Sistemas de calificación

#### **Widgets de Entrada Numérica**
- **`integer`**: Números enteros
- **`decimal`**: Números decimales
- **`thousands-sep`**: Números con separadores de miles

#### **Widgets de Presentación**
- **`table`**: Tablas de datos
- **`columns`**: Diseño en columnas
- **`comment`**: Comentarios y anotaciones
- **`text-print`**: Texto optimizado para impresión
- **`text-max`**: Texto con límite de caracteres
- **`url`**: Enlaces y URLs

### **Estructura de Configuración**
```json
{
    "widget-name": "ruta/relativa/al/widget",
    "otro-widget": "../../../node_modules/enketo-core/src/widget/..."
}
```

### **Casos de Uso**
- Carga dinámica de widgets según necesidades del formulario
- Personalización de componentes de interfaz
- Optimización de carga (solo widgets necesarios)
- Extensibilidad para widgets personalizados

---

## 6. ENCRYPTOR.JS

### **Propósito Principal**
Maneja la encriptación end-to-end de registros de formularios, compatible con ODK Briefcase y otros sistemas ODK.

### **Funcionalidades Detalladas**

#### **Verificación de Soporte**
- **`isSupported()`**: Verifica capacidades del navegador
- **Requisitos**: ArrayBuffer y Uint8Array
- **Compatibilidad**: Navegadores modernos únicamente

#### **Gestión de Estado de Encriptación**
- **`isEncryptionEnabled(survey)`**: Verifica si encriptación está activa
- **`setEncryptionEnabled(survey)`**: Activa encriptación para survey
- **Serialización**: Conversión para Web Workers y almacenamiento

#### **Proceso de Encriptación**
- **Algoritmo Simétrico**: AES-CFB (equivalente a "AES/CFB/PKCS5Padding")
- **Algoritmo Asimétrico**: RSA-OAEP con SHA256 y MGF1
- **Generación de Claves**: Claves simétricas de 256 bits (32 bytes)

#### **Encriptación de Registros**
- **`encryptRecord(form, record)`**: Proceso completo de encriptación
- **Componentes Encriptados**:
  1. XML de envío
  2. Archivos multimedia adjuntos
  3. Metadatos del formulario

#### **Gestión de Archivos**
- **Procesamiento Secuencial**: Evita problemas con incremento de seed
- **Conversión a DataURI**: Para compatibilidad con navegadores
- **Cálculo MD5**: Para verificación de integridad
- **Extensión .enc**: Archivos encriptados marcados claramente

#### **Manifest XML**
- **Estructura ODK**: Compatible con especificación OpenRosa
- **Elementos Incluidos**:
  - `base64EncryptedKey`: Clave simétrica encriptada
  - `base64EncryptedElementSignature`: Firma digital
  - `encryptedXmlFile`: Referencia al XML encriptado
  - `media`: Referencias a archivos multimedia

#### **Seguridad**
- **Seed Incremental**: Previene ataques de patrón
- **Firma Digital**: Verificación de integridad con RSA
- **Compatibilidad ODK**: Totalmente compatible con Briefcase

### **Algoritmos Utilizados**
```javascript
const SYMMETRIC_ALGORITHM = 'AES-CFB'
const ASYMMETRIC_ALGORITHM = 'RSA-OAEP'
const ASYMMETRIC_OPTIONS = {
    md: forge.md.sha256.create(),
    mgf: forge.mgf.mgf1.create(forge.md.sha1.create())
}
```

### **Dependencias**
- `node-forge`: Biblioteca criptográfica
- `./utils`: Utilidades para conversión de datos

### **Casos de Uso Críticos**
- Formularios con datos sensibles
- Cumplimiento de regulaciones de privacidad
- Entornos con requisitos de seguridad estrictos
- Compatibilidad con ecosistema ODK
---

## 7. EVENT.JS

### **Propósito Principal**
Extiende el sistema de eventos de Enketo Core con eventos específicos de la aplicación web.

### **Eventos Personalizados**

#### **Eventos de Envío**
- **`QueueSubmissionSuccess(detail)`**: Envío exitoso a cola
- **`SubmissionSuccess()`**: Envío exitoso al servidor
- **Parámetros**: Detalles opcionales del envío
- **Propagación**: Todos los eventos hacen bubble

#### **Eventos de Aplicación**
- **`Close()`**: Cierre de formulario o aplicación
- **`OfflineLaunchCapable(detail)`**: Capacidad de funcionamiento offline
- **`ApplicationUpdated()`**: Nueva versión de aplicación disponible
- **`FormUpdated()`**: Formulario actualizado en caché
- **`FormReset()`**: Formulario reiniciado a estado inicial

### **Integración con Enketo Core**
- **Herencia**: Extiende eventos base de `enketo-core/src/js/event`
- **Compatibilidad**: Mantiene todos los eventos originales
- **Extensibilidad**: Permite agregar eventos personalizados

### **Patrón de Uso**
```javascript
// Disparar evento
document.dispatchEvent(events.SubmissionSuccess())

// Escuchar evento
document.addEventListener('submissionsuccess', handler)
```

### **Casos de Uso**
- Comunicación entre componentes
- Notificaciones de estado de aplicación
- Integración con sistemas externos
- Manejo de ciclo de vida de formularios

---

## 8. EXPONENTIAL-BACKOFF.JS

### **Propósito Principal**
Implementa estrategia de reintento con backoff exponencial para operaciones de red fallidas.

### **Funcionalidades Detalladas**

#### **Algoritmo de Backoff**
- **Fórmula**: `Math.min(2^iteration, 5 * 60) * 1000` ms
- **Límite Máximo**: 5 minutos (300 segundos)
- **Progresión**: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s...

#### **Gestión de Estado**
- **`state.iteration`**: Contador de intentos
- **`state.timeoutID`**: ID del timeout activo
- **Reinicio**: `cancelBackoff()` resetea el estado

#### **Funciones Principales**
- **`backoff(uploadQueue)`**: Inicia reintento con delay
- **`cancelBackoff()`**: Cancela reintentos pendientes
- **Parámetro**: Función de cola de envío como callback

### **Casos de Uso**
- Envío de formularios con conectividad intermitente
- Recuperación automática de errores de red
- Optimización de uso de ancho de banda
- Mejora de experiencia de usuario en condiciones adversas

### **Integración**
```javascript
// En caso de fallo de red
backoff(uploadQueue)

// En caso de éxito o cancelación manual
cancelBackoff()
```

---

## 9. EXPORTER.JS

### **Propósito Principal**
Genera archivos ZIP con todos los registros guardados localmente, incluyendo XML y archivos multimedia.

### **Funcionalidades Detalladas**

#### **Generación de ZIP**
- **`recordsToZip(enketoId, formTitle)`**: Función principal de exportación
- **Estructura**: Una carpeta por registro con timestamp
- **Contenido por Carpeta**:
  - `submission.xml`: Datos del formulario
  - Archivos multimedia originales
  - Metadatos en `meta.json`

#### **Gestión de Archivos**
- **Conversión de Blobs**: ArrayBuffer para compatibilidad con JSZip
- **Manejo de Errores**: Archivos faltantes no impiden exportación
- **Preservación de Fechas**: Timestamps originales mantenidos
- **Nombres Únicos**: Formato `formName_YYYY-MM-DD_HH-MM-SS`

#### **Metadatos Incluidos**
```json
{
    "folder": "nombre_carpeta",
    "draft": true/false,
    "local name": "nombre_local",
    "instanceID": "id_instancia",
    "failed files": ["archivo1.jpg", "archivo2.pdf"]
}
```

#### **Manejo de Errores**
- **Archivos Faltantes**: Listados en metadatos
- **Exportación Parcial**: ZIP generado incluso con fallos
- **Reporte de Errores**: Lista detallada de problemas

### **Dependencias**
- `jszip`: Generación de archivos ZIP
- `./store`: Acceso a registros almacenados
- `./utils`: Conversión de datos

### **Casos de Uso**
- Backup de datos locales
- Transferencia de datos entre dispositivos
- Análisis offline de datos recolectados
- Cumplimiento de políticas de retención de datos

---

## 10. FEEDBACK-BAR.JS

### **Propósito Principal**
Gestiona la barra de retroalimentación no intrusiva para mostrar mensajes temporales al usuario.

### **Funcionalidades Detalladas**

#### **Gestión de Mensajes**
- **`show(message, duration)`**: Muestra mensaje con duración opcional
- **Límite**: Máximo 2 mensajes simultáneos
- **Deduplicación**: Evita mensajes idénticos repetidos
- **Auto-eliminación**: Basada en duración especificada

#### **Interfaz de Usuario**
- **Selector**: `#feedback-bar` en el DOM
- **Clases CSS**: `feedback-bar--show` para visibilidad
- **Estructura HTML**: Párrafos (`<p>`) para cada mensaje
- **Botón de Cierre**: Permite cierre manual

#### **Gestión de Estado**
- **`hide()`**: Oculta y limpia todos los mensajes
- **`setCloseHandler()`**: Configura manejador de cierre
- **Propiedades Lazy**: `feedbackBar` y `messages` cargados bajo demanda

### **Patrón de Uso**
```javascript
// Mostrar mensaje temporal
feedbackBar.show('Operación completada', 5) // 5 segundos

// Ocultar manualmente
feedbackBar.hide()
```

### **Casos de Uso**
- Confirmaciones de acciones
- Notificaciones de estado
- Mensajes informativos temporales
- Retroalimentación no intrusiva
---

## 11. FILE-MANAGER.JS

### **Propósito Principal**
Gestiona archivos adjuntos en formularios, incluyendo carga, almacenamiento, recuperación y validación de archivos.

### **Funcionalidades Detalladas**

#### **Gestión de URLs de Archivos**
- **`getFileUrl(subject)`**: Obtiene URL para mostrar archivo
- **Tipos Soportados**: File objects, nombres de archivo, URLs
- **Fuentes**: Almacenamiento local, attachments de instancia, URLs remotas
- **Validación de Tamaño**: Rechaza archivos demasiado grandes

#### **Attachments de Instancia**
- **`setInstanceAttachments(attachments)`**: Configura archivos de registro cargado
- **Mapeo**: filename → URL para archivos existentes
- **Uso**: Edición de registros con archivos adjuntos

#### **Gestión de Archivos Actuales**
- **`getCurrentFiles()`**: Obtiene archivos de inputs del formulario
- **Tipos de Input**: `input[type="file"]` y canvas de dibujo
- **Procesamiento**: Renombrado único, redimensionamiento, conversión
- **Optimización**: Manejo de DataURI y Blobs

#### **Validación y Límites**
- **`isTooLarge(file)`**: Verifica límites de tamaño
- **`getMaxSizeReadable()`**: Formato legible del límite
- **Configuración**: Basada en `settings.maxSize`
- **Retroalimentación**: Mensajes de error específicos

#### **Soporte Offline**
- **Almacenamiento Local**: Integración con `store` para modo offline
- **URLs de Objeto**: Creación de URLs temporales para visualización
- **Caché**: Optimización para archivos frecuentemente accedidos

### **Flujo de Trabajo**
1. **Carga**: Usuario selecciona/crea archivo
2. **Validación**: Verificación de tamaño y tipo
3. **Procesamiento**: Renombrado y optimización
4. **Almacenamiento**: Guardado local o temporal
5. **Recuperación**: Obtención para visualización/envío

### **Dependencias**
- `./store`: Almacenamiento persistente
- `./settings`: Configuración de límites
- `./connection`: Descarga de archivos remotos
- `enketo-core/utils`: Utilidades de archivos

### **Casos de Uso**
- Formularios con fotos/documentos
- Firmas digitales
- Dibujos y anotaciones
- Archivos multimedia diversos

---

## 12. FORM-CACHE.JS

### **Propósito Principal**
Gestiona el almacenamiento en caché de formularios para funcionalidad offline, incluyendo recursos multimedia y actualizaciones automáticas.

### **Funcionalidades Detalladas**

#### **Inicialización de Caché**
- **`init(survey)`**: Inicializa sistema de caché
- **Verificación**: Comprueba si formulario existe en caché
- **Decisión**: Carga desde caché o descarga nueva versión
- **Configuración**: Establece intervalos de actualización

#### **Gestión de Formularios**
- **`get({enketoId})`**: Recupera formulario desde caché
- **`set(survey)`**: Almacena nuevo formulario en caché
- **`remove(survey)`**: Elimina formulario del caché
- **Integración**: Manejo de registros last-saved

#### **Preparación Offline**
- **`prepareOfflineSurvey(survey)`**: Adapta formulario para uso offline
- **Intercambio de Fuentes**: Cambia `src` por `data-offline-src`
- **Binarios por Defecto**: Carga archivos predeterminados
- **Optimización**: Reduce dependencias de red

#### **Actualización Automática**
- **Intervalo Inicial**: 3 segundos después de carga
- **Intervalo Regular**: Cada 20 minutos
- **Verificación de Hash**: Compara versiones para detectar cambios
- **Actualización Transparente**: Sin interrumpir uso actual

#### **Gestión de Recursos Multimedia**
- **`updateMedia(survey)`**: Carga recursos multimedia
- **Carga Bajo Demanda**: Solo recursos visibles inicialmente
- **Almacenamiento**: Persistencia en IndexedDB
- **Optimización**: Evita descargas duplicadas

#### **Datos Dinámicos**
- **Parámetros de Envío**: Gestión de parámetros dinámicos
- **Origen de Ventana Padre**: Para formularios embebidos
- **Persistencia**: Mantiene configuración entre sesiones

### **Intervalos de Actualización**
```javascript
const CACHE_UPDATE_INITIAL_DELAY = 3 * 1000      // 3 segundos
const CACHE_UPDATE_INTERVAL = 20 * 60 * 1000     // 20 minutos
```

### **Dependencias Críticas**
- `./store`: Almacenamiento persistente
- `./connection`: Comunicación con servidor
- `./last-saved`: Gestión de registros guardados
- `./media`: Reemplazo de fuentes multimedia

### **Casos de Uso**
- Aplicaciones offline-first
- Reducción de tiempo de carga
- Sincronización automática
- Gestión de recursos multimedia grandes

---

## 13. GEOJSON.JS

### **Propósito Principal**
Convierte datos GeoJSON en instancias XML compatibles con XForms para uso en formularios ODK.

### **Funcionalidades Detalladas**

#### **Tipos de Geometría Soportados**
- **Point**: Coordenadas de punto único
- **LineString**: Secuencia de puntos formando línea
- **Polygon**: Área cerrada definida por coordenadas
- **Validación**: Verificación estricta de tipos soportados

#### **Conversión de Coordenadas**
- **Formato de Entrada**: `[longitude, latitude]` (GeoJSON estándar)
- **Formato de Salida**: `"latitude longitude 0 0"` (formato ODK)
- **Validación**: Verificación de coordenadas numéricas válidas

#### **Procesamiento de Features**
- **FeatureCollection**: Procesamiento de colecciones completas
- **Propiedades**: Extracción de metadatos de features
- **IDs**: Manejo de identificadores de feature y propiedades
- **Estructura XML**: Conversión a elementos `<item>` con `<geometry>`

#### **Validación Estricta**
- **Tipos de Geometría**: Solo Point, LineString, Polygon
- **Coordenadas**: Validación de formato [lng, lat]
- **Estructura**: Verificación de FeatureCollection válida
- **Errores Descriptivos**: Mensajes específicos para cada tipo de error

### **Estructura de Salida XML**
```xml
<root>
    <item>
        <geometry>lat1 lng1 0 0; lat2 lng2 0 0</geometry>
        <property1>valor1</property1>
        <property2>valor2</property2>
        <id>feature_id</id>
    </item>
</root>
```

### **Casos de Uso**
- Formularios con datos geoespaciales
- Integración con servicios de mapas
- Análisis geográfico en formularios
- Compatibilidad con estándares GIS

### **Limitaciones**
- Solo geometrías básicas (no MultiPoint, etc.)
- Coordenadas deben ser longitude/latitude
- No soporte para sistemas de coordenadas personalizados
---

## 14. GUI.JS

### **Propósito Principal**
Gestiona elementos principales de la interfaz gráfica, incluyendo diálogos, alertas, impresión y retroalimentación visual.

### **Funcionalidades Detalladas**

#### **Sistema de Diálogos**
- **`alert(message, heading, level, duration)`**: Alertas modales
- **`confirm(content, choices)`**: Diálogos de confirmación
- **`prompt(content, choices, inputs)`**: Diálogos con entrada de datos
- **Personalización**: Niveles de alerta (error, warning, info, success)
- **Auto-cierre**: Duración configurable para diálogos temporales

#### **Gestión de Temas**
- **`swapTheme(formParts)`**: Cambio dinámico de temas CSS
- **Temas Soportados**: Configurables en `settings.themesSupported`
- **Carga Asíncrona**: Intercambio sin bloquear interfaz
- **Detección**: Extracción automática de tema desde formulario

#### **Sistema de Impresión**
- **`printForm()`**: Impresión de formularios
- **Configuración Grid**: Diálogos para formato de papel y orientación
- **Preparación**: Apertura de detalles y aplicación de estilos
- **Optimización**: Manejo especial para tema Grid

#### **Retroalimentación al Usuario**
- **`feedback(message, duration, heading)`**: Mensajes no intrusivos
- **Adaptación**: Barra de feedback en desktop, alertas en móvil
- **Duración**: Control automático de visibilidad
- **Contexto**: Diferentes tipos según dispositivo

#### **Manejo de Errores**
- **`alertLoadErrors(loadErrors, advice, options)`**: Errores de carga
- **`getErrorResponseMsg(statusCode)`**: Mensajes por código HTTP
- **Soporte Técnico**: Enlaces automáticos a email de soporte
- **Contexto**: Información detallada para debugging

#### **Funcionalidades Especiales**
- **Guía de Pantalla de Inicio**: Instrucciones específicas por navegador/OS
- **Detección de Navegador**: Usando `sniffer` para optimizaciones
- **Confirmación de Login**: Redirección automática con parámetros
- **Soporte Offline**: Alertas para navegadores no compatibles

### **Configuración de Vex Dialog**
```javascript
vex.registerPlugin(vexEnketoDialog)
vex.defaultOptions.className = 'vex-theme-plain'
```

### **Estados de Aplicación**
- **`updateStatus.offlineCapable(capable)`**: Estado de capacidad offline
- **`updateStatus.applicationVersion(version)`**: Versión de aplicación

### **Dependencias**
- `vex-js`: Sistema de diálogos modales
- `./feedback-bar`: Retroalimentación no intrusiva
- `./sniffer`: Detección de navegador/OS
- `enketo-core/print`: Utilidades de impresión

### **Casos de Uso Críticos**
- Confirmaciones de acciones importantes
- Manejo de errores de usuario
- Configuración de impresión
- Retroalimentación de estado de aplicación

---

## 15. LAST-SAVED.JS

### **Propósito Principal**
Gestiona la funcionalidad "last-saved" que permite a los usuarios continuar desde su último punto de guardado en formularios.

### **Funcionalidades Detalladas**

#### **Detección de Soporte**
- **`isLastSaveEnabled(survey)`**: Verifica si funcionalidad está disponible
- **Condiciones Requeridas**:
  - Tipo de formulario: 'other' (no single/edit/view)
  - Store disponible (IndexedDB)
  - Instancia last-saved en formulario
  - Sin encriptación activa

#### **Gestión de Registros**
- **`getLastSavedRecord(enketoId)`**: Recupera último registro guardado
- **`setLastSavedRecord(survey, record)`**: Establece nuevo registro guardado
- **`removeLastSavedRecord(enketoId)`**: Elimina registro guardado
- **Limpieza**: Eliminación automática de propiedades internas

#### **Integración con Formularios**
- **`populateLastSavedInstances(survey, lastSavedRecord)`**: Pobla instancias
- **Endpoint Virtual**: `jr://instance/last-saved`
- **Fallback**: Datos por defecto si no hay registro guardado
- **Actualización**: Reemplazo dinámico de datos externos

#### **Procesamiento de Documentos**
- **Parser DOM**: Conversión entre XML string y Document
- **Clonación**: Preservación de estructura original del modelo
- **Namespace**: Manejo correcto de documentos XML
- **Serialización**: Conversión bidireccional según necesidades

### **Flujo de Trabajo**
1. **Verificación**: Comprobar si last-save está habilitado
2. **Recuperación**: Obtener último registro si existe
3. **Población**: Integrar datos en instancias externas
4. **Actualización**: Mantener sincronizado con cambios
5. **Limpieza**: Remover cuando ya no es necesario

### **Endpoint Virtual**
```javascript
export const LAST_SAVED_VIRTUAL_ENDPOINT = 'jr://instance/last-saved'
```

### **Dependencias**
- `./encryptor`: Verificación de estado de encriptación
- `./settings`: Configuración de tipo de formulario
- `./store`: Almacenamiento persistente

### **Casos de Uso**
- Formularios largos con múltiples sesiones
- Recuperación después de cierre accidental
- Continuación en diferentes dispositivos
- Mejora de experiencia de usuario

---

## 16. MEDIA.JS

### **Propósito Principal**
Gestiona el reemplazo de fuentes multimedia (imágenes, audio, video) para compatibilidad offline y optimización de carga.

### **Funcionalidades Detalladas**

#### **Reemplazo de Fuentes Multimedia**
- **`replaceMediaSources(rootElement, media, options)`**: Función principal
- **Selectores**: `[href^="jr:"], [src^="jr:"], [data-offline-src^="jr:"]`
- **Atributos**: Manejo de `href`, `src`, y `data-offline-src`
- **Mapeo**: Conversión de nombres de archivo a URLs reales

#### **Soporte para Diferentes Contextos**
- **HTML Elements**: Elementos DOM en navegador
- **XML Documents**: Documentos XML para procesamiento
- **Modo Offline**: Configuración especial para `data-offline-src`
- **Detección Automática**: Basada en tipo de elemento

#### **Logo de Formulario**
- **Archivo Especial**: `form_logo.png`
- **Contenedor**: `.form-logo`
- **Creación Dinámica**: Elemento `<img>` si no existe
- **Configuración**: Atributos apropiados según modo

#### **Integración con Modelo de Formulario**
- **`replaceModelMediaSources(form, media)`**: Hook para FormModel
- **Interceptación**: Captura asignaciones a `modelRoot`
- **Automatización**: Reemplazo automático en cambios de modelo
- **Compatibilidad**: Funciona con carga inicial y edición

### **Patrón de Uso**
```javascript
// Para elementos HTML
replaceMediaSources(formElement, survey.media, { isOffline: true })

// Para modelo de formulario
replaceModelMediaSources(form, survey.media)
```

### **Casos de Uso**
- Formularios con imágenes de referencia
- Logos y branding personalizado
- Contenido multimedia offline
- Optimización de carga de recursos

### **Limitaciones**
- Solo archivos con prefijo `jr:`
- Mapeo basado en nombre de archivo
- Requiere configuración previa de media object
---

## 17. OFFLINE-APP-WORKER-PARTIAL.JS

### **Propósito Principal**
Implementación parcial de Service Worker para capacidades offline de la aplicación web.

### **Funcionalidades Detalladas**

#### **Gestión de Caché**
- **Nombre de Caché**: `enketo-common_${version}`
- **Estrategia**: Cache-first con fallback a red
- **Recursos**: Lista dinámica prepended por controlador
- **Actualización**: Bypass de caché HTTP con `cache: 'reload'`

#### **Eventos del Service Worker**

##### **Install Event**
- **`skipWaiting()`**: Activación inmediata sin esperar
- **Apertura de Caché**: Creación de caché versionado
- **Carga de Recursos**: Adición de todos los recursos necesarios
- **Manejo de Errores**: Logging detallado de fallos

##### **Activate Event**
- **Limpieza**: Eliminación de cachés obsoletos
- **Verificación**: Solo mantiene cachés de versión actual
- **Confirmación**: Logging de activación exitosa

##### **Fetch Event**
- **Estrategia Cache-First**: Prioriza recursos en caché
- **Fallback a Red**: Descarga si no está en caché
- **Caché Dinámico**: Almacena recursos adicionales automáticamente
- **Filtrado**: Solo recursos con scope `/x/` y traducciones

#### **Gestión de Recursos**
- **Recursos Estáticos**: Definidos en lista de recursos
- **Traducciones**: Carga dinámica de idiomas
- **Auto-sanación**: Caché dinámico para recursos faltantes
- **Exclusiones**: Service worker script y recursos fuera de scope

### **Configuración de Caché**
```javascript
const CACHES = [`enketo-common_${version}`]
```

### **Casos de Uso**
- Aplicaciones web progresivas (PWA)
- Funcionalidad offline completa
- Optimización de carga de recursos
- Actualización automática de aplicación

### **Limitaciones**
- Requiere HTTPS (excepto localhost)
- Solo recursos con scope específico
- Dependiente de lista de recursos prepended

---

## 18. PLUGIN.JS

### **Propósito Principal**
Extiende jQuery con plugins personalizados para funcionalidades específicas de Enketo.

### **Plugins Incluidos**

#### **capitalizeStart**
- **Propósito**: Capitaliza las primeras palabras de un texto
- **Parámetros**: `numWords` (número de palabras a capitalizar)
- **Implementación**: Manipulación de nodos de texto DOM
- **Uso**: Estilización automática de títulos y encabezados

#### **btnBusyState**
- **Propósito**: Gestiona estado de "ocupado" en botones
- **Estados**: Activo (con progress) e inactivo (contenido original)
- **Preservación**: Guarda contenido original en elemento temporal
- **Accesibilidad**: Desactiva botón durante operaciones

#### **btnText**
- **Propósito**: Cambia texto de botón independientemente de su estado
- **Compatibilidad**: Funciona con botones en estado ocupado
- **Implementación**: Modifica último nodo de texto

### **Implementación Técnica**
```javascript
// Ejemplo de uso
$('.my-button').btnBusyState(true)  // Activar estado ocupado
$('.my-button').btnText('Nuevo texto')  // Cambiar texto
$('.my-button').btnBusyState(false) // Desactivar estado ocupado
```

### **Casos de Uso**
- Indicadores visuales de progreso
- Prevención de doble-click en formularios
- Estilización automática de texto
- Mejora de experiencia de usuario

### **Dependencias**
- jQuery: Biblioteca base para plugins

---

## 19. RECORDS-QUEUE.JS

### **Propósito Principal**
Gestiona la cola de registros para envío, incluyendo almacenamiento local, auto-guardado, exportación y sincronización con servidor.

### **Funcionalidades Detalladas**

#### **Gestión de Registros**
- **`get(instanceId)`**: Recupera registro específico
- **`set(record)`**: Almacena nuevo registro
- **`save(action, record)`**: Crea o actualiza registro
- **`remove(instanceId)`**: Elimina registro del almacenamiento
- **Integración**: Actualización automática de lista de interfaz

#### **Auto-guardado**
- **`getAutoSavedRecord()`**: Recupera registro auto-guardado
- **`updateAutoSavedRecord(record)`**: Actualiza auto-guardado
- **`removeAutoSavedRecord()`**: Elimina auto-guardado
- **Clave Especial**: `__autoSave_${settings.enketoId}`
- **Prevención**: No se envía automáticamente (marcado como draft)

#### **Cola de Envío**
- **`uploadQueue(options)`**: Envía todos los registros finales
- **Procesamiento Secuencial**: Evita problemas de conectividad
- **Manejo de Errores**: Reintentos con backoff exponencial
- **Progreso Visual**: Actualización de estado en interfaz
- **Autenticación**: Manejo especial de errores 401

#### **Exportación**
- **`exportToZip(formTitle)`**: Genera archivo ZIP
- **Contenido**: Todos los registros con archivos multimedia
- **Formato**: Estructura organizada por carpetas
- **Metadatos**: Información detallada en JSON

#### **Gestión de Interfaz**
- **Lista de Registros**: Actualización automática de UI
- **Indicadores de Estado**: Progreso de envío visual
- **Botones de Acción**: Habilitación/deshabilitación dinámica
- **Contador**: Número de registros pendientes

#### **Estados de Registro**
1. **Draft**: Borrador, no listo para envío
2. **Final**: Completado, listo para envío
3. **Ongoing**: En proceso de envío
4. **Success**: Enviado exitosamente
5. **Error**: Error en envío

### **Progreso de Envío**
```javascript
uploadProgress = {
    update(instanceId, status, msg) {
        // Actualiza estado visual del registro
        // Estados: 'ongoing', 'success', 'error'
    }
}
```

### **Dependencias Críticas**
- `./store`: Almacenamiento persistente
- `./connection`: Comunicación con servidor
- `./exporter`: Generación de archivos ZIP
- `./exponential-backoff`: Estrategia de reintentos

### **Casos de Uso**
- Formularios offline con sincronización posterior
- Backup y exportación de datos
- Manejo de conectividad intermitente
- Gestión de cola de envíos pendientes
---

## 20. SETTINGS.JS

### **Propósito Principal**
Centraliza toda la configuración de la aplicación, procesando parámetros de URL, configuración del servidor y variables de entorno.

### **Funcionalidades Detalladas**

#### **Procesamiento de Parámetros URL**
- **Mapeo de Parámetros**: Conversión de query string a configuración
- **Parámetros Soportados**:
  - `return_url` → `returnUrl`
  - `form`/`xform` → `xformUrl`
  - `instance_id` → `instanceId`
  - `parent_window_origin` → `parentWindowOrigin`
  - `print`, `format`, `landscape`, `margin`, `touch`

#### **Configuración de Defaults**
- **Extracción**: Parámetros con formato `d[fieldName]=value`
- **Decodificación**: Manejo de URLs encoded y no-encoded
- **Almacenamiento**: Objeto `settings.defaults` para valores predeterminados

#### **Configuración de Aplicación**
- **URLs por Defecto**:
  - `loginUrl`: `${basePath}/login`
  - `defaultReturnUrl`: `${basePath}/thanks`
- **Límites**: `maxSize` = 5MB por defecto
- **Herencia**: Todas las propiedades de `config` base

#### **Detección de Tipo de Vista**
- **`preview`**: URLs con `/preview/` o terminadas en `/preview`
- **`single`**: URLs con `/single/`
- **`edit`**: URLs con `/edit/`
- **`view`**: URLs con `/view/`
- **`other`**: Cualquier otro tipo

#### **Configuración Offline**
- **Detección**: URLs que contienen `/x/`
- **Path Offline**: `/x` si está habilitado, vacío si no
- **Capacidades**: Determina funcionalidades disponibles

#### **Extracción de ID**
- **Enketo ID**: Último segmento de URL (excluyendo casos especiales)
- **Casos Especiales**: `preview` e `i` no son IDs válidos
- **Validación**: IDs de 32+ caracteres no permiten múltiples envíos

#### **Configuración Dinámica**
- **Parámetros de Envío**: Valores dinámicos desde URL
- **Override de Idioma**: Parámetro `lang` para forzar idioma
- **Origen de Ventana Padre**: Para formularios embebidos

### **Configuración de Funcionalidades**
```javascript
// Ejemplos de configuración automática
settings.goTo = settings.type === 'edit' || settings.type === 'preview' || settings.type === 'view'
settings.printRelevantOnly = !!settings.instanceId
settings.multipleAllowed = settings.type === 'single' && settings.enketoId.length < 32
```

### **Dependencias**
- `enketo/config`: Configuración base de la aplicación
- `./utils`: Utilidades para extracción de ID

### **Casos de Uso Críticos**
- Configuración inicial de aplicación
- Personalización por parámetros URL
- Detección de contexto de ejecución
- Configuración de funcionalidades específicas

---

## 21. SNIFFER.JS

### **Propósito Principal**
Detecta características del navegador y sistema operativo para optimizaciones y compatibilidad específica.

### **Funcionalidades Detalladas**

#### **Detección de Navegador**
- **Chrome**: Detección excluyendo Edge que se hace pasar por Chrome
- **Safari**: Safari real (no Chrome en iOS)
- **Firefox**: Incluyendo Firefox para iOS (fxios)
- **Exclusiones**: Navegadores que se hacen pasar por otros

#### **Detección de Sistema Operativo**
- **Herencia**: Utiliza detección de `enketo-core/src/js/sniffer`
- **Sistemas Soportados**: iOS, Android, Windows, macOS, Linux
- **Precisión**: Basada en User Agent string

#### **Casos de Uso Específicos**
- **Widgets de Fecha**: Diferentes implementaciones por navegador
- **Capacidades Touch**: Optimizaciones para dispositivos táctiles
- **Funcionalidades Específicas**: Service Workers, IndexedDB, etc.
- **Guías de Usuario**: Instrucciones específicas por plataforma

### **Implementación**
```javascript
const ua = navigator.userAgent

export default {
    browser: {
        chrome: !matchedEdge && matchedChrome,
        safari: /^((?!chrome|android|fxios|crios|ucbrowser).)*safari/i.test(ua),
        firefox: /firefox|fxios/i.test(ua)
    },
    os // Heredado de enketo-core
}
```

### **Dependencias**
- `enketo-core/src/js/sniffer`: Detección base de OS

### **Casos de Uso**
- Selección de widgets apropiados
- Optimizaciones específicas de navegador
- Guías de instalación personalizadas
- Manejo de incompatibilidades

---

## 22. STORE.JS

### **Propósito Principal**
Gestiona todo el almacenamiento persistente usando IndexedDB, incluyendo formularios, registros, archivos y configuración.

### **Funcionalidades Detalladas**

#### **Inicialización de Base de Datos**
- **Nombre**: `enketo`
- **Versión**: 4 (con migración especial para índices únicos)
- **Esquema**: Múltiples tablas especializadas
- **Migración**: Manejo de actualizaciones de esquema

#### **Tablas de Base de Datos**

##### **Surveys (Formularios)**
- **Clave**: `enketoId`
- **Contenido**: HTML, modelo XML, tema, hash, recursos
- **Índices**: `enketoId` único
- **Funciones**: `get()`, `set()`, `update()`, `remove()`

##### **Records (Registros)**
- **Clave**: `instanceId`
- **Contenido**: XML de datos, metadatos, referencias a archivos
- **Índices**: `instanceId`, `enketoId`, `['enketoId', 'name']`
- **Funciones**: CRUD completo con archivos asociados

##### **Files (Archivos)**
- **Clave**: Compuesta `${instanceId}:${fileName}`
- **Contenido**: Blobs o DataURIs (según soporte del navegador)
- **Gestión**: Asociados a registros específicos

##### **Resources (Recursos)**
- **Clave**: Compuesta `${enketoId}:${url}`
- **Contenido**: Archivos multimedia de formularios
- **Uso**: Imágenes, audio, video para formularios

##### **Properties (Propiedades)**
- **Clave**: `name`
- **Contenido**: Configuración global, estadísticas
- **Funciones**: Contadores, configuración persistente

##### **Data (Datos Dinámicos)**
- **Clave**: `enketoId`
- **Contenido**: Parámetros dinámicos, configuración temporal
- **Uso**: Datos que cambian entre sesiones

##### **LastSavedRecords**
- **Clave**: `_enketoId`
- **Contenido**: Registros de último guardado
- **Propósito**: Funcionalidad "continuar donde dejé"

#### **Gestión de Archivos**
- **Detección de Soporte**: Verificación de capacidad de Blob storage
- **Fallback**: Codificación Base64 para navegadores antiguos
- **Optimización**: Almacenamiento directo de Blobs cuando es posible

#### **Funciones de Utilidad**
- **Serialización**: Conversión de XMLDocument a string para almacenamiento
- **Deserialización**: Restauración de XMLDocument desde string
- **Encriptación**: Integración con sistema de encriptación
- **Limpieza**: Funciones para flush completo de datos

#### **Manejo de Errores**
- **Verificación de Soporte**: IndexedDB disponible
- **Mensajes Específicos**: Diferentes errores para iOS Safari vs otros
- **Modo Silencioso**: Opción para fallar sin mostrar errores
- **Recuperación**: Estrategias para problemas de almacenamiento

### **Esquema de Migración**
```javascript
// Versión 4: Eliminación de índice único en 'name'
// Reemplazo por índice compuesto ['enketoId', 'name']
```

### **Dependencias Críticas**
- `db.js`: Biblioteca de abstracción de IndexedDB
- `./encryptor`: Serialización de surveys encriptados
- `./utils`: Conversión de datos y utilidades

### **Casos de Uso**
- Almacenamiento offline de formularios completos
- Gestión de registros con archivos multimedia
- Caché de recursos para rendimiento
- Configuración persistente de aplicación
---

## 23. TRANSLATOR.JS

### **Propósito Principal**
Gestiona la internacionalización (i18n) de la aplicación, incluyendo carga de traducciones, detección de idioma y localización de elementos DOM.

### **Funcionalidades Detalladas**

#### **Inicialización de i18next**
- **Backend**: Carga de archivos de traducción via HTTP
- **Detección**: Automática basada en query string y navegador
- **Fallback**: Inglés como idioma por defecto
- **Whitelist**: Solo idiomas soportados por configuración

#### **Configuración de Carga**
- **Ruta**: `${basePath}${offlinePath}/locales/build/__lng__/translation-combined.json`
- **Estrategia**: Solo código de idioma (no región)
- **Caché**: Configuración para uso offline
- **Detección**: Query parameter `lang` tiene prioridad

#### **Post-procesamiento**
- **HTML Paragraphs**: Convierte saltos de línea en párrafos HTML
- **Arrays**: Une arrays con saltos de línea
- **Interpolación**: Prefijos y sufijos personalizados (`__variable__`)

#### **Funciones Principales**

##### **`t(key, options)`**
- **Traducción**: Función principal de traducción
- **Opciones**: Interpolación de variables
- **Contexto**: Soporte para contextos específicos

##### **`localize(container, lng)`**
- **Localización DOM**: Traduce elementos con `data-i18n`
- **Caché**: Optimización para traducciones repetidas
- **Elementos Especiales**: Placeholders, iconos, números
- **Dirección**: Retorna dirección de texto (LTR/RTL)

##### **`loadTranslation(lang)`**
- **Precarga**: Carga archivos para uso offline
- **Caché**: Almacenamiento en caché del navegador
- **Optimización**: Solo carga si es necesario

#### **Detección de Idioma**
- **`getCurrentUiLanguage()`**: Idioma actual de interfaz
- **`getBrowserLanguage()`**: Idioma preferido del navegador
- **Extracción**: Códigos de 2-3 caracteres IANA

### **Configuración i18next**
```javascript
{
    whitelist: settings.languagesSupported,
    fallbackLng: 'en',
    joinArrays: '\n',
    load: 'languageOnly',
    lowerCaseLng: true,
    detection: {
        order: ['querystring', 'navigator'],
        lookupQuerystring: 'lang',
        caches: false
    }
}
```

### **Optimizaciones de Rendimiento**
- **Caché de Traducciones**: Evita re-traducir elementos
- **Fragmentos de Documento**: Para inserción eficiente de HTML
- **Detección Inteligente**: Solo elementos con `data-i18n`

### **Dependencias**
- `i18next`: Biblioteca principal de i18n
- `i18next-http-backend`: Carga de archivos de traducción
- `i18next-browser-languagedetector`: Detección automática de idioma

### **Casos de Uso**
- Aplicaciones multiidioma
- Localización automática basada en navegador
- Carga offline de traducciones
- Cambio dinámico de idioma

---

## 24. UTILS.JS

### **Propósito Principal**
Proporciona utilidades generales para conversión de datos, manipulación de archivos, procesamiento CSV/XML y extracción de información.

### **Funcionalidades Detalladas**

#### **Conversión de Archivos**

##### **Blob ↔ DataURI**
- **`blobToDataUri(blob, filename)`**: Convierte Blob a Base64 DataURI
- **`dataUriToBlob(dataURI)`**: Convierte DataURI de vuelta a Blob
- **Caché**: Optimización para archivos frecuentemente convertidos
- **Manejo de Errores**: Validación de tipos y formato

##### **Blob ↔ ArrayBuffer**
- **`blobToArrayBuffer(blob)`**: Para compatibilidad con APIs nativas
- **Uso**: Procesamiento de archivos binarios
- **Validación**: Verificación de tipo Blob

#### **Procesamiento CSV/XML**

##### **Conversión CSV**
- **`csvToArray(csv)`**: Parsea CSV a array bidimensional
- **`csvToXml(csv, langMap)`**: Convierte CSV a documento XML
- **`arrayToXml(rows, langMap)`**: Convierte array a XML
- **Detección Automática**: Delimitadores y formato
- **Soporte Multiidioma**: Headers con `::lang` suffix

##### **Validación XML**
- **Nombres de Elementos**: Verificación de nombres XML válidos
- **Patrón Unicode**: Soporte completo para caracteres internacionales
- **Restricciones**: No permite prefijos de namespace (limitación CSV)

#### **Extracción de Información**

##### **Formularios**
- **`getThemeFromFormStr(formStr)`**: Extrae tema de HTML del formulario
- **`getTitleFromFormStr(formStr)`**: Extrae título del formulario
- **Expresiones Regulares**: Patrones optimizados para extracción

##### **URLs**
- **`getEnketoId(path)`**: Extrae ID de Enketo desde pathname
- **Casos Especiales**: Manejo de `/preview` y `/i`
- **Normalización**: Eliminación de trailing slashes

#### **Generación de Query Strings**
- **`getQueryString(obj)`**: Convierte objetos a query string
- **Soporte**: Arrays y objetos anidados
- **Codificación**: URL encoding automático
- **Filtrado**: Omite valores vacíos o null

### **Patrones de Validación XML**
```javascript
const XML_LOCAL_NAME_PATTERN = (() => {
    // Implementación completa de especificación W3C XML
    // Optimizada para JavaScript con Unicode escapes
    // Excluye ':' para nombres locales únicamente
})()
```

### **Manejo de Idiomas en CSV**
```javascript
// Formato: "field::es" para español
// Mapeo: langMap['es'] = 'spa' (código IANA)
// Resultado: <field lang="spa">valor</field>
```

### **Dependencias**
- `papaparse`: Biblioteca robusta para parsing CSV
- `enketo-core/utils`: Utilidades base (dataUriToBlobSync)

### **Casos de Uso Críticos**
- Importación de datos desde CSV
- Procesamiento de archivos multimedia
- Extracción de metadatos de formularios
- Generación de URLs con parámetros
- Validación de datos de entrada

---

## RESUMEN EJECUTIVO

### **Arquitectura Modular**
Enketo Core utiliza una arquitectura modular bien definida donde cada módulo tiene responsabilidades específicas:

1. **Capa de Datos**: `store.js`, `records-queue.js`, `form-cache.js`
2. **Capa de Comunicación**: `connection.js`, `exponential-backoff.js`
3. **Capa de Interfaz**: `gui.js`, `feedback-bar.js`, `controller-webform.js`
4. **Capa de Utilidades**: `utils.js`, `translator.js`, `sniffer.js`
5. **Capa de Seguridad**: `encryptor.js`
6. **Capa de Configuración**: `settings.js`, `client-config.js`

### **Funcionalidades Clave**
- **Modo Offline Completo**: Service Workers + IndexedDB
- **Encriptación End-to-End**: Compatible con ODK Briefcase
- **Gestión de Archivos**: Multimedia con validación de tamaño
- **Internacionalización**: Soporte multiidioma completo
- **Sincronización Inteligente**: Backoff exponencial y manejo de errores
- **Interfaz Adaptativa**: Optimizada para desktop y móvil

### **Patrones de Diseño**
- **Promises/Async**: Manejo asíncrono consistente
- **Event-Driven**: Comunicación mediante eventos personalizados
- **Modular**: Separación clara de responsabilidades
- **Progressive Enhancement**: Funcionalidades adicionales según capacidades
- **Offline-First**: Diseño que prioriza funcionamiento sin conexión

### **Flujo de Datos Principal**
1. **Inicialización**: `settings.js` → `client-config.js` → `application-cache.js`
2. **Carga de Formulario**: `connection.js` → `form-cache.js` → `store.js`
3. **Interfaz de Usuario**: `controller-webform.js` → `gui.js` → `translator.js`
4. **Gestión de Datos**: `file-manager.js` → `records-queue.js` → `store.js`
5. **Sincronización**: `connection.js` → `exponential-backoff.js` → `encryptor.js`

### **Casos de Uso Principales**
- **Formularios Offline**: Recolección de datos sin conexión
- **Aplicaciones PWA**: Experiencia nativa en navegadores
- **Datos Sensibles**: Encriptación end-to-end para privacidad
- **Multiidioma**: Soporte internacional completo
- **Multimedia**: Gestión de archivos grandes y diversos tipos

Esta arquitectura permite que Enketo Core sea una solución robusta, escalable y mantenible para formularios web complejos con capacidades offline avanzadas, cumpliendo con estándares internacionales de seguridad y accesibilidad.

---

## CONCLUSIÓN

La documentación presentada proporciona una visión completa y detallada de todos los módulos que componen la carpeta `/module` de Enketo Core. Cada módulo ha sido analizado en profundidad, explicando:

- **Propósito y funcionalidad principal**
- **Implementación técnica detallada**
- **Dependencias y relaciones con otros módulos**
- **Casos de uso específicos**
- **Patrones de diseño utilizados**

Esta información es fundamental para:
- **Desarrolladores**: Entender la arquitectura y contribuir al proyecto
- **Administradores**: Configurar y mantener instalaciones de Enketo
- **Arquitectos**: Diseñar integraciones y extensiones
- **Auditores**: Evaluar seguridad y cumplimiento normativo

La modularidad y separación de responsabilidades demostrada en esta documentación evidencia la madurez y calidad del diseño de Enketo Core como plataforma para formularios web empresariales.
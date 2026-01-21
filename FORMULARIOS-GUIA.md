# 📋 Guía Completa para Agregar Formularios Transformados

## 🎯 Resumen

Este proyecto ha sido modificado para funcionar **SIN enketo-transformer local**. En su lugar, puedes agregar formularios que ya han sido transformados externamente.

## 🔄 Proceso Completo

### 1. **Transformar tu formulario XForm**

En otra instancia con enketo-transformer:
```bash
# Transforma tu formulario XForm
curl -X POST http://localhost:8085/transform \
  -H "Content-Type: application/json" \
  -d '{"xform": "tu-formulario-xform-aqui"}' \
  > resultado.json
```

Esto te dará un JSON con:
- `form`: HTML del formulario
- `model`: XML del modelo

### 2. **Agregar al proyecto**

#### Opción A: Script Automático (Recomendado)
```bash
# Guarda el HTML y XML en archivos separados
echo "HTML_CONTENT" > form.html
echo "XML_CONTENT" > model.xml

# Usa el script para agregar
node add-form.js "mi-formulario.xml" "./form.html" "./model.xml"
```

#### Opción B: Manual
Edita `test/mock/forms.js`:

```javascript
export default {
  "mi-formulario.xml": {
    "html_form": `<!-- Tu HTML aquí -->`,
    "xml_model": `<!-- Tu XML aquí -->`,
    "modifiedTime": 1642781234567
  },
  "otro-formulario.xml": {
    "html_form": `<!-- Otro HTML -->`,
    "xml_model": `<!-- Otro XML -->`,
    "modifiedTime": 1642781234568
  }
};
```

### 3. **Acceder al formulario**

```
http://localhost:8005?xform=mi-formulario.xml
```

## 📁 Estructura de Archivos

```
enketo-core/
├── test/mock/
│   ├── forms.js      # ← Aquí van tus formularios
│   └── forms.mjs     # ← Enlace simbólico a forms.js
├── add-form.js       # ← Script helper
└── FORMULARIOS-GUIA.md # ← Esta guía
```

## 🛠️ Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Agregar formulario
node add-form.js "nombre.xml" "form.html" "model.xml"

# Verificar formularios cargados
# Abre: http://localhost:8005 y verás los enlaces
```

## ⚠️ Puntos Importantes

1. **Nombres de archivo**: Usa el formato "nombre.xml" para consistencia
2. **HTML válido**: El HTML debe tener `<form class="or">` como elemento raíz
3. **XML válido**: El XML debe ser un modelo XForms válido
4. **Encoding**: Asegúrate de que los archivos estén en UTF-8
5. **Escape**: Si tu HTML/XML contiene backticks (\`), escápalos como \\\`

## 🔍 Debugging

Si algo no funciona:

1. **Verifica la consola del navegador** para errores JavaScript
2. **Revisa la consola del servidor** (donde ejecutaste `npm start`)
3. **Valida el JSON** en `test/mock/forms.js`
4. **Comprueba que el HTML tenga** `<form class="or">`

## 📝 Ejemplo Completo

```javascript
// En test/mock/forms.js
export default {
  "ejemplo-simple.xml": {
    "html_form": \`<form class="or">
      <h3>Mi Formulario</h3>
      <label class="question">
        <span class="question-label">Nombre:</span>
        <input type="text" name="/data/nombre" />
      </label>
      <label class="question">
        <span class="question-label">Edad:</span>
        <input type="number" name="/data/edad" />
      </label>
    </form>\`,
    "xml_model": \`<?xml version="1.0"?>
    <model>
      <instance>
        <data id="ejemplo">
          <nombre/>
          <edad/>
        </data>
      </instance>
    </model>\`,
    "modifiedTime": ${Date.now()}
  }
};
```

Acceso: `http://localhost:8005?xform=ejemplo-simple.xml`

## 🚀 ¡Listo!

Tu sistema está configurado para funcionar sin enketo-transformer local. Solo necesitas agregar tus formularios transformados y acceder via URL.
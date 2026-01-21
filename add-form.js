#!/usr/bin/env node

/**
 * Script para agregar formularios transformados al sistema
 * 
 * Uso:
 * node add-form.js <nombre-formulario> <archivo-html> <archivo-xml>
 * 
 * Ejemplo:
 * node add-form.js "mi-formulario.xml" "./form.html" "./model.xml"
 */

const fs = require('fs');
const path = require('path');

function addForm(formName, htmlFile, xmlFile) {
    try {
        // Leer archivos
        const htmlContent = fs.readFileSync(htmlFile, 'utf8');
        const xmlContent = fs.readFileSync(xmlFile, 'utf8');
        
        // Leer forms.js actual
        const formsPath = './test/mock/forms.js';
        let formsContent = fs.readFileSync(formsPath, 'utf8');
        
        // Extraer el objeto actual
        const exportMatch = formsContent.match(/export default\s*({[\s\S]*});/);
        if (!exportMatch) {
            throw new Error('No se pudo parsear el archivo forms.js');
        }
        
        let formsObj;
        try {
            // Evaluar el objeto (cuidado: solo para desarrollo)
            formsObj = eval(`(${exportMatch[1]})`);
        } catch (e) {
            console.log('Creando nuevo objeto de formularios...');
            formsObj = {};
        }
        
        // Agregar nuevo formulario
        formsObj[formName] = {
            html_form: htmlContent,
            xml_model: xmlContent,
            modifiedTime: Date.now()
        };
        
        // Generar nuevo contenido
        const newContent = `// Formularios transformados
export default ${JSON.stringify(formsObj, null, 2)};`;
        
        // Escribir archivo
        fs.writeFileSync(formsPath, newContent);
        
        console.log(`✅ Formulario "${formName}" agregado exitosamente`);
        console.log(`📁 Archivos procesados:`);
        console.log(`   - HTML: ${htmlFile}`);
        console.log(`   - XML: ${xmlFile}`);
        console.log(`🌐 Accede con: http://localhost:8005?xform=${formName}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length !== 3) {
    console.log(`
📋 Script para agregar formularios transformados

Uso:
  node add-form.js <nombre-formulario> <archivo-html> <archivo-xml>

Ejemplo:
  node add-form.js "mi-formulario.xml" "./form.html" "./model.xml"

Parámetros:
  nombre-formulario  Nombre del formulario (ej: "mi-formulario.xml")
  archivo-html       Ruta al archivo HTML generado por enketo-transformer
  archivo-xml        Ruta al archivo XML del modelo generado por enketo-transformer
`);
    process.exit(1);
}

const [formName, htmlFile, xmlFile] = args;

// Verificar que los archivos existen
if (!fs.existsSync(htmlFile)) {
    console.error(`❌ Error: No se encuentra el archivo HTML: ${htmlFile}`);
    process.exit(1);
}

if (!fs.existsSync(xmlFile)) {
    console.error(`❌ Error: No se encuentra el archivo XML: ${xmlFile}`);
    process.exit(1);
}

addForm(formName, htmlFile, xmlFile);
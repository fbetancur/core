// Script simplificado para transformar formulario XForm
// Uso: node add-form.js

import { execSync } from 'child_process';

console.log('🚀 Transformando formulario XForm...');

try {
    // Ejecutar el script batch
    execSync('Transformer\\transform.bat', { 
        stdio: 'inherit',
        cwd: process.cwd()
    });
} catch (error) {
    console.error('❌ Error:', error.message);
}
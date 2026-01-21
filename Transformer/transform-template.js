import { transform } from '/root/enketo/packages/enketo-transformer/dist/enketo-transformer/transformer.js';
import fs from 'fs';

async function transformForm() {
    try {
        const xform = fs.readFileSync('/root/form.xml', 'utf8');
        console.log('Iniciando transformación...');

        const result = await transform({
            xform: xform,
            theme: 'grid',
            markdown: true
        });

        console.log('Transformación exitosa!');
        console.log('Versión del transformer:', result.transformerVersion);
        console.log('Idiomas disponibles:', JSON.stringify(result.languageMap || {}));

        // La ruta será reemplazada por el script batch
        fs.writeFileSync('TARGET_PATH/public/form.html', result.form);
        fs.writeFileSync('TARGET_PATH/public/model.xml', result.model);

        console.log('Archivos guardados:');
        console.log('- public/form.html (HTML del formulario)');
        console.log('- public/model.xml (Modelo de datos)');
    } catch (error) {
        console.error('❌ Error en la transformación:', error.message);
        process.exit(1);
    }
}

transformForm();